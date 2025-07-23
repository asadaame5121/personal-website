// scripts/extract-clippingshare.ts
// ObsidianのClippingsフォルダ内の各mdファイルから「ファイル名」とフロントマターのsourceプロパティを抽出し、data/clippingshare.jsonに保存（Deno用）
import { walk } from "@std/fs";
import { extract } from "@std/front-matter/yaml";


const SOURCE_DIR = Deno.env.get("CLIPPINGS_SOURCE_DIR") ?? "C:/Users/Yudai/Documents/Obsidian/Clippings";
const OUTPUT_PATH = Deno.env.get("CLIPPINGS_OUTPUT_PATH") ?? "C:/Users/Yudai/personal-website/external_data/clippingshare.json";



const clippings: Array<{ filename: string; source?: string; created?: string; sitename?: string; comment?: string }> = [];

for await (const entry of walk(SOURCE_DIR, { exts: [".md"], includeDirs: false })) {
  let text: string;
  try {
    text = await Deno.readTextFile(entry.path);
  } catch (e) {
    console.warn(`[extract-clippingshare] ファイル読み込み失敗: ${entry.path}`);
    continue;
  }
  let attrs: Record<string, unknown> = {};
  try {
    const result = extract(text);
    attrs = result.attrs as Record<string, unknown>;
  } catch (e) {
    console.warn(`[extract-clippingshare] フロントマター抽出失敗: ${entry.path}`);
    continue;
  }
  clippings.push({
    filename: typeof attrs.title === "string" ? attrs.title : entry.name,
    source: typeof attrs.source === "string" ? attrs.source : undefined,
    created: typeof attrs.created === "string" ? attrs.created : undefined,
    sitename: typeof attrs.sitename === "string" ? attrs.sitename : undefined,
    comment: typeof attrs.comment === "string" ? attrs.comment : undefined
  });
}

// dataディレクトリ作成
try { await Deno.mkdir("data", { recursive: true }); } catch (_) {}

// created（日付）降順でソート（新しいものが上）
clippings.sort((a, b) => {
  if (!a.created) return 1;
  if (!b.created) return -1;
  return new Date(b.created).getTime() - new Date(a.created).getTime();
});

// 既存clippingshare.jsonのIDを引き継ぐ
let prevEntries: any[] = [];
try {
  const prevJson = await Deno.readTextFile(OUTPUT_PATH);
  prevEntries = JSON.parse(prevJson);
} catch (_) {}
const mapped = clippings.map(c => {
  // titleとurlが一致する既存エントリがあればidを引き継ぐ
  const prev = prevEntries.find((e) => e.title === c.filename && e.url === (c.source || ""));
  const id = prev ? prev.id : crypto.randomUUID();
  const sitename = (typeof c.sitename === "string" && c.sitename !== "unidentified") ? c.sitename : "";
  const comment = (typeof c.comment === "string" && c.comment !== "unidentified") ? c.comment : "";
  return {
    id,
    title: c.filename,
    url: c.source || "",
    source: sitename,
    comment: comment
  };
});
await Deno.writeTextFile(
  OUTPUT_PATH,
  JSON.stringify(mapped, null, 2)
);
console.log(`Extracted ${clippings.length} clippings to ${OUTPUT_PATH}`);
