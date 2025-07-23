// Deno script: Book配下の.mdファイルのfrontmatterにOpenBD APIから書影画像URL(image)を自動付与
// 使い方: deno run --allow-read --allow-write --allow-net scripts/add-book-cover-to-frontmatter.ts

import { join } from "jsr:@std/path";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml";

const BOOK_SRC_DIR = join(Deno.cwd(), "src", "Book");

// frontmatterのISBNキーを利用する（正規表現抽出は廃止）

async function getCoverUrl(ISBN: string): Promise<string | undefined> {
  const apiUrl = `https://api.openbd.jp/v1/get?isbn=${ISBN}`;
  console.log(`[DEBUG] getCoverUrl | ISBN:`, ISBN);
  console.log(`[DEBUG] getCoverUrl | APIリクエスト:`, apiUrl);
  const res = await fetch(apiUrl);
  if (!res.ok) {
    console.log(`[DEBUG] getCoverUrl | レスポンスNG`);
    return undefined;
  }
  const text = await res.clone().text();
  console.log(`[DEBUG] getCoverUrl | APIレスポンス先頭:`, text.slice(0, 100));
  const data = await res.json();
  if (Array.isArray(data) && data[0]) {
    // summary.cover優先
    if (data[0].summary && data[0].summary.cover) {
      console.log('[DEBUG] getCoverUrl | summary.cover利用:', data[0].summary.cover);
      return data[0].summary.cover;
    }
    // なければ従来通りSupportingResourceを探す
    if (data[0].onix) {
      const resources = data[0].onix.CollateralDetail?.SupportingResource || [];
      console.log('[DEBUG] getCoverUrl | SupportingResource:', JSON.stringify(resources, null, 2));
      const cover = resources.find((r: any) => r.ResourceContentType === "01" && r.ResourceLink);
      if (cover && cover.ResourceLink) return cover.ResourceLink;
      if (resources.length === 0) {
        console.log('[DEBUG] getCoverUrl | SupportingResource配列が空（画像情報なし）');
      } else {
        console.log('[DEBUG] getCoverUrl | type:01（カバー画像）該当なし');
      }
    }
  }
  return undefined;
}

// frontmatter抽出・再構成
function parseFrontmatter(content: string): { front: string; body: string; fm: Record<string, unknown> } {
  const match = content.match(/---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { front: '', body: content, fm: {} };
  const front = match[1];
  const body = content.slice(match[0].length);
  // YAMLパーサーで解析
  const fm = parseYaml(front) as Record<string, unknown>;
  return { front, body, fm };
}

// ISBN取得用の新関数
function getIsbnFromFrontmatter(fm: Record<string, unknown>): string | undefined {
  // デバッグ: frontmatterの全キーを出力
  console.log('[DEBUG] frontmatter keys:', Object.keys(fm));
  for (const [k, v] of Object.entries(fm)) {
    console.log(`[DEBUG] frontmatter: ${k} =`, v);
  }
  // isbn, ISBN, permalinkなどのキーを許容
  for (const key of Object.keys(fm)) {
    const norm = key.toLowerCase();
    if (["isbn", "permalink"].includes(norm)) {
      const val = fm[key];
      if (typeof val === "string" && val.match(/[0-9xX]{9,}/)) return val.replace(/[^0-9Xx]/g, '');
      if (typeof val === "number") return String(val);
    }
  }
  return undefined;
}

function buildFrontmatter(fm: Record<string, unknown>): string {
  return ["---", ...Object.entries(fm).map(([k, v]) => `${k}: ${v}`), "---"].join("\n");
}

for await (const entry of Deno.readDir(BOOK_SRC_DIR)) {
  if (!entry.isFile || !entry.name.endsWith(".md")) continue;
  const filePath = join(BOOK_SRC_DIR, entry.name);
  const raw = await Deno.readTextFile(filePath);
  const { front, body, fm } = parseFrontmatter(raw);
  // 既にimageがあればスキップ
  if (fm["image"]) continue;
  // frontmatterからISBNを取得
  const ISBN = getIsbnFromFrontmatter(fm);
  console.log(`[DEBUG] ${entry.name} | ISBN:`, ISBN);
  if (!ISBN) {
    console.log(`[DEBUG] ${entry.name} | ISBN未取得、スキップ`);
    continue;
  }
  const apiUrl = `https://api.openbd.jp/v1/get?isbn=${ISBN}`;
  console.log(`[DEBUG] ${entry.name} | APIリクエスト:`, apiUrl);
  const image = await getCoverUrl(ISBN);
  if (!image) {
    console.log(`[DEBUG] ${entry.name} | 書影画像なし`);
    continue;
  }
  console.log(`[DEBUG] ${entry.name} | image取得:`, image);
  fm["image"] = image;
  const newFront = buildFrontmatter(fm);
  await Deno.writeTextFile(filePath, `${newFront}\n${body}`);
  console.log(`✅ image付与: ${entry.name}`);
}
