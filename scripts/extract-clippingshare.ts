// scripts/extract-clippingshare.ts
// ObsidianのClippingsフォルダ内の各mdファイルから「ファイル名」とフロントマターのsourceプロパティを抽出し、data/clippingshare.jsonに保存（Deno用）
import { walk } from "@std/fs";
import { extract } from "@std/front-matter/yaml";


const SOURCE_DIR = "./obsidian/Clippings";
const OUTPUT_PATH = "./data/clippingshare.md";



const clippings: Array<{ filename: string; source?: string; created?: string }> = [];

for await (const entry of walk(SOURCE_DIR, { exts: [".md"], includeDirs: false })) {
  const text = await Deno.readTextFile(entry.path);
  const { attrs } = extract(text);
  const fm = attrs as Record<string, unknown>;
  clippings.push({
    filename: entry.name,
    source: typeof fm.source === "string" ? fm.source : undefined,
    created: typeof fm.created === "string" ? fm.created : undefined
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

await Deno.writeTextFile(
  OUTPUT_PATH,
  clippings.map(clipping => `${clipping.created}[${clipping.filename}](${clipping.source})\n\n`).join("\n")
);
console.log(`Extracted ${clippings.length} clippings to ${OUTPUT_PATH}`);
