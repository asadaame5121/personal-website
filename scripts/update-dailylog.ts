// Deno用: Obsidianのデイリーノートから「## きょうのメモ」以降を抽出し、_data/dailylog.mdの先頭に追記するスクリプト
// 2025-06-24仕様

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

// 設定
const OBSIDIAN_LOG_DIR = join("./obsidian/log");
const DAILYLOG_PATH = join("./src/dailylog.md");
// 日付取得（コマンドライン引数 or 今日）
function getTargetDate(): string {
  const arg = Deno.args[0];
  if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) return arg;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function extractMemoSection(md: string): Promise<string | null> {
  const lines = md.split("\n");
  const idx = lines.findIndex(l => l.trim().startsWith("## きょうのメモ"));
  if (idx === -1) return null;
  // idx行以降の1行目（見出し）を除外し、本文のみ返す
  return lines.slice(idx + 1).join("\n").trim();
}

async function main() {
  const date = getTargetDate();
  const logFile = join(OBSIDIAN_LOG_DIR, `${date}.md`);

  // ファイル存在確認
  try {
    await Deno.stat(logFile);
  } catch (_) {
    // ファイルがなければ何もしない
    return;
  }

  const md = await Deno.readTextFile(logFile);
  const memo = await extractMemoSection(md);
  if (!memo) return;

  // 新規分を整形
  const newEntry = `## ${date}のメモ\n${memo}\n\n`;

  // 既存dailylog.mdを読み込み
  let prev = "";
  try {
    prev = await Deno.readTextFile(DAILYLOG_PATH);
  } catch (_) {}

  // 先頭に追加して保存
  await Deno.writeTextFile(DAILYLOG_PATH, newEntry + prev);
}

if (import.meta.main) {
  main();
}
