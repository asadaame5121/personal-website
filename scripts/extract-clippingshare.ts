// scripts/extract-clippingshare.ts
// ObsidianのClippingsフォルダ内の各mdファイルから「ファイル名」とフロントマターのsourceプロパティを抽出し、data/clippingshare.jsonに保存（Deno用）
import { walk } from "@std/fs";

const SOURCE_DIR = "C:/Users/Yudai/Documents/Obsidian/Clippings";
const OUTPUT_PATH = "./data/clippingshare.md";

function extractFrontmatter(text: string): Record<string, unknown> {
  // YAMLフロントマター抽出
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const obj: Record<string, unknown> = {};
  for (const line of yaml.split(/\r?\n/)) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length > 0) obj[key.trim()] = rest.join(":").trim();
  }
  return obj;
}

const clippings: Array<{ filename: string; source?: string; created?: string }> = [];

for await (const entry of walk(SOURCE_DIR, { exts: [".md"], includeDirs: false })) {
  const text = await Deno.readTextFile(entry.path);
  const frontmatter = extractFrontmatter(text);
  clippings.push({
    filename: entry.name,
    source: typeof frontmatter.source === "string" ? frontmatter.source : undefined,
    created: typeof frontmatter.created === "string" ? frontmatter.created : undefined
  });
}

// dataディレクトリ作成
try { await Deno.mkdir("data", { recursive: true }); } catch (_) {}

await Deno.writeTextFile(OUTPUT_PATH, clippings.map(clipping => `[${clipping.filename}](${clipping.source})\n${clipping.created}\n\n`).join("\n"));
console.log(`Extracted ${clippings.length} clippings to ${OUTPUT_PATH}`);
