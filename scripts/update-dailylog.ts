// Deno用: Obsidianのデイリーノートから「## きょうのメモ」以降を抽出し、_data/dailylog.mdの先頭に追記するスクリプト
// 2025-06-24仕様

import { join } from "jsr:@std/path";

// 設定
const OBSIDIAN_LOG_DIR = join(Deno.env.get("OBSIDIAN_LOG_DIR") ?? "C:/Users/Yudai/Documents/Obsidian/log");
// DAILYLOG_PATHは不要（md出力廃止）
const DAILYLOG_JSON = join(Deno.env.get("DAILYLOG_JSON") ?? "C:/Users/Yudai/personal-website/external_data/dailylog.json");
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

// 「## きょうのメモ」以降の本文を取得
function extractMemoSection(md: string): string | null {
  const lines = md.split("\n");
  const idx = lines.findIndex(l => l.trim().startsWith("## きょうのメモ"));
  if (idx === -1) return null;
  return lines.slice(idx + 1).join("\n").trim();
}

// 「###### YYYY-MM-DDTHH:mm:ss...」ごとに分割してエントリ配列を返す
function splitDailylogEntries(memo: string): { datetime: string; content: string }[] {
  const result: { datetime: string; content: string }[] = [];
  const regex = /^######\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:?\d{2})?)/gm;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let prevDatetime = "";
  while ((match = regex.exec(memo)) !== null) {
    if (prevDatetime) {
      // 直前のdatetimeから今回のmatch.indexまでをcontentとして抽出
      const content = memo.slice(lastIndex, match.index).trim();
      if (content) result.push({ datetime: prevDatetime, content });
    }
    prevDatetime = match[1];
    lastIndex = regex.lastIndex;
  }
  // 最後のエントリ
  if (prevDatetime && lastIndex < memo.length) {
    const content = memo.slice(lastIndex).trim();
    if (content) result.push({ datetime: prevDatetime, content });
  }
  return result;
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
  const memo = extractMemoSection(md);
  if (!memo) return;

  // --- JSON出力処理 ---
  const newBody = memo.trim();
// 既存JSON読み込み
let jsonArr: { id: string; datetime: string; content: string }[] = [];
try {
  const jsonText = await Deno.readTextFile(DAILYLOG_JSON);
  jsonArr = JSON.parse(jsonText);
} catch (_) {}

// 「きょうのメモ」本文からエントリを分割
const entriesJson = splitDailylogEntries(newBody);
for (const entry of entriesJson) {
  // 重複判定（datetime, content両方一致ならスキップ）
  const existsJson = jsonArr.some(e => e.datetime === entry.datetime && e.content.trim() === entry.content.trim());
  if (!existsJson) {
    jsonArr.unshift({ id: crypto.randomUUID(), datetime: entry.datetime, content: entry.content });
  }
}
await Deno.writeTextFile(
  DAILYLOG_JSON,
  JSON.stringify(jsonArr, null, 2)
);
}

if (import.meta.main) {
  main();
}
