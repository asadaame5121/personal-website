// scripts/extract-dailylog.ts
// Obsidian日報フォルダから日報エントリを抽出し、data/dailylog.jsonに保存（Deno用）
import { walk } from "https://deno.land/std@0.210.0/fs/mod.ts";

const SOURCE_DIR = "C:\\Users\\Yudai\\Documents\\Obsidian\\log"; // デイリーノートのディレクトリ
const OUTPUT_PATH = "./data/dailylog.json";

// 日報エントリ抽出用の正規表現
const ENTRY_REGEX = /^###### (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\n([\s\S]*?)(?=\n###### |\n*$)/gm;

const PUBLIC_MARK = "🌐";

const entries: Array<{ datetime: string; content: string; file: string }> = [];

for await (const entry of walk(SOURCE_DIR, { exts: [".md"], includeDirs: false })) {
  const text = await Deno.readTextFile(entry.path);

  let match;
  while ((match = ENTRY_REGEX.exec(text)) !== null) {
    const [_, datetime, content] = match;
    if (content.includes(PUBLIC_MARK)) {
      entries.push({
        datetime,
        content: content.trim(),
        file: entry.path
      });
    }
  }
}

// 日付降順でソート
entries.sort((a, b) => b.datetime.localeCompare(a.datetime));

// dataディレクトリがなければ作成
const outputDir = OUTPUT_PATH.split("/").slice(0, -1).join("/");
try {
  await Deno.mkdir(outputDir, { recursive: true });
} catch (_) {
  // すでに存在していれば何もしない
}

// 保存
await Deno.writeTextFile(OUTPUT_PATH, JSON.stringify(entries, null, 2));

console.log(`Extracted ${entries.length} entries to ${OUTPUT_PATH}`);
