// plugin/link_graph.ts
import {Page} from "lume/core/file.ts";
import type Site from "lume/core/site.ts";

export interface LinkGraphOptions {
  // 将来拡張用: 除外パターンや深度など
}

type LinkMap = { [page: string]: string[] };
type TwoHopMap = { [page: string]: string[] };
type GraphData = {
  nodes: { id: string, title?: string }[],
  edges: { from: string, to: string }[]
};

function extractOutboundLinks(pages: Page[]): LinkMap {
    const linkMap: LinkMap = {};
    for (const page of pages) {
      const links: string[] = [];
      if (page.document) {
        for (const a of page.document.querySelectorAll("a[data-wikilink]")) {
          const id = a.getAttribute("data-wikilink");
          if (id) links.push(id);
        }
      }
      linkMap[page.data.url || page.src.path] = links;
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

function generateTwoHopLinks(linkMap: LinkMap): TwoHopMap {
  const twoHop: TwoHopMap = {};
  for (const [from, tos] of Object.entries(linkMap)) {
    const secondHop = new Set<string>();
    for (const to of tos) {
      (linkMap[to] || []).forEach((t) => secondHop.add(t));
    }
    twoHop[from] = Array.from(secondHop);
  }
  return twoHop;
}

function buildGraphData(linkMap: LinkMap, inboundMap: LinkMap): GraphData {
  const nodes = Array.from(new Set([
    ...Object.keys(linkMap),
    ...Object.keys(inboundMap),
  ])).map((id) => ({ id }));
  const edges = [];
  for (const [from, tos] of Object.entries(linkMap)) {
    for (const to of tos) {
      edges.push({ from, to });
    }
  }
  return { nodes, edges };
}

export default function linkGraphPlugin(options: Partial<LinkGraphOptions> = {}) {
  return (site: Site) => {
    site.process([".md", ".html"], (pages) => {
      const linkMap = extractOutboundLinks(pages);
      const inboundMap = buildInboundIndex(linkMap);
      const twoHopMap = generateTwoHopLinks(linkMap);
      const graphData = buildGraphData(linkMap, inboundMap);

      // サイト全体データとして格納
      site.data("linkGraph", {
        linkMap,
        inboundMap,
        twoHopMap,
        graphData,
      });

      // デバッグ用
      console.log("[link-graph] linkMap:", linkMap);
      console.log("[link-graph] inboundMap:", inboundMap);
      console.log("[link-graph] twoHopMap:", twoHopMap);
    });
  };
}