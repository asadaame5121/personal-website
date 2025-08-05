// plugin/link_graph.ts
import { Page } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";

import { ensureDir } from "jsr:@std/fs";


// ログとデバッグ出力用ユーティリティ
const LOG_DIR = "logs";
const LINK_GRAPH_JSON = `${LOG_DIR}/link_graph.json`;



async function writeLinkGraphJsonOut(data: unknown) {
  await ensureDir(LOG_DIR);
  await Deno.writeTextFile(LINK_GRAPH_JSON, JSON.stringify(data, null, 2));
}

export interface LinkGraphOptions {
  // 将来拡張用: 除外パターンや深度など
}

type LinkMap = { [page: string]: string[] };
type TwoHopMap = { [page: string]: string[] };
type GraphData = {
  nodes: { id: string, title?: string }[],
  edges: { from: string, to: string }[]
};

function extractOutboundLinks(
  pages: Page[],
  includeCategories?: string[],
  excludeCategories?: string[]
): LinkMap {
  const linkMap: LinkMap = {};
  for (const page of pages) {
    const links: string[] = [];
    const extractLinks = (root: Document | null) => {
      if (!root) return;
      const article = root.querySelector('article');
      if (!article) return;
      for (const a of article.querySelectorAll('a[href^="/"]')) {
        const href = a.getAttribute('href');
        // 外部リンク・画像・アンカー等を除外
        if (
          href &&
          !href.startsWith('/assets/') &&
          !href.startsWith('/static/') &&
          !href.startsWith('/favicon') &&
          !href.startsWith('/images/') &&
          !href.startsWith('/icons/') &&
          !href.startsWith('//') &&
          !href.startsWith('/#') &&
          !href.startsWith('/?') &&
          !href.match(/^\/\w+\.(png|jpg|jpeg|gif|svg)$/i)
        ) {
          links.push(href.split(/[?#]/)[0]); // ?や#以降は除去
        }
      }
    };

    // カテゴリフィルタ: ページ自身が対象カテゴリでなければスキップ
    const pageUrl = page.data.url || page.src.path;
    if (includeCategories && !includeCategories.some((cat) => pageUrl.startsWith(cat))) {
      continue;
    }
    // 除外カテゴリ: ページ自身が除外カテゴリに一致したらスキップ
    if (excludeCategories && excludeCategories.some((cat) => pageUrl.startsWith(cat))) {
      continue;
    }
    if (page.document) {
      extractLinks(page.document);
    } else if (typeof page.content === 'string') {
      try {
        const dom = new DOMParser().parseFromString(page.content, 'text/html');
        extractLinks(dom);
      } catch (e) {
        console.error(`[content-parse-error] ${page.src.path}: ${e}`);
      }
    } else {
    }
    // カテゴリフィルタ: リンク先も対象カテゴリのみ抽出
    // セルフリンク（自ページへのリンク）を除外
    let filteredLinks = links.filter((href) => href !== pageUrl);
    if (includeCategories) {
      filteredLinks = filteredLinks.filter((href) => includeCategories.some((cat) => href.startsWith(cat)));
    }
    if (excludeCategories) {
      filteredLinks = filteredLinks.filter((href) => !excludeCategories.some((cat) => href.startsWith(cat)));
    }
    linkMap[pageUrl] = filteredLinks;
  }
  return linkMap;
}

function buildInboundIndex(linkMap: LinkMap): LinkMap {
  const inbound: LinkMap = {};
  for (const [from, tos] of Object.entries(linkMap)) {
    for (const to of tos) {
      if (!inbound[to]) inbound[to] = [];
      inbound[to].push(from);
    }
  }

  return inbound;
}

function generateTwoHopLinks(linkMap: LinkMap, inboundMap: LinkMap): TwoHopMap {
  const twoHop: TwoHopMap = {};
  for (const [from, tos] of Object.entries(linkMap)) {
    const secondHop = new Set<string>();
    for (const to of tos) {
      (linkMap[to] || []).forEach((t) => secondHop.add(t));
      (inboundMap[to] || []).forEach((t) => secondHop.add(t));
    }
    twoHop[from] = Array.from(secondHop);
  }

  return twoHop;
}

function buildGraphData(linkMap: LinkMap, inboundMap: LinkMap, twoHopMap: TwoHopMap): GraphData {
  const nodes = Array.from(new Set([
    ...Object.keys(linkMap),
    ...Object.keys(inboundMap),
    ...Object.keys(twoHopMap),
  ])).map((id) => ({ id }));
  const edges = [];
  for (const [from, tos] of Object.entries(linkMap)) {
    for (const to of tos) {
      edges.push({ from, to });
    }
  }
  return { nodes, edges };
}

export default function linkGraphPlugin(_options: Partial<LinkGraphOptions> = {}) {
  return async (site: Site) => {
    site.process([".md", ".html"], async (pages) => {
      const linkMap = extractOutboundLinks(pages);
      const inboundMap = buildInboundIndex(linkMap);
      const twoHopMap = generateTwoHopLinks(linkMap, inboundMap);
      const graphData = buildGraphData(linkMap, inboundMap, twoHopMap);

      // サイト全体データとして格納
      site.data("linkGraph", {
        linkMap,
        inboundMap,
        twoHopMap,
        graphData,
      });

      // /tags/を除外してリンク抽出
      const filteredLinkMap = extractOutboundLinks(pages, undefined, ["/tags/"]);

      // 以降はfilteredLinkMapを使ってinboundMap等を生成
      const filteredInboundMap = buildInboundIndex(filteredLinkMap);
      const filteredTwoHopMap = generateTwoHopLinks(filteredLinkMap, filteredInboundMap);
      const filteredGraphData = buildGraphData(filteredLinkMap, filteredInboundMap, filteredTwoHopMap);

      await writeLinkGraphJsonOut({
        linkMap: filteredLinkMap,
        inboundMap: filteredInboundMap,
        twoHopMap: filteredTwoHopMap,
        graphData: filteredGraphData,
      });

    });
  };
}