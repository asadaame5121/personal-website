// Deno用: Obsidianのデイリーノートから「## きょうのメモ」以降を抽出し、_data/dailylog.mdの先頭に追記するスクリプト
// 2025-06-24仕様

import { join } from "jsr:@std/path";

// 設定
const OBSIDIAN_LOG_DIR = join(Deno.env.get("OBSIDIAN_LOG_DIR") ?? "C:/Users/Yudai/Documents/Obsidian/log");
const DAILYLOG_PATH = join("C:/Users/Yudai/personal-website/src/dailylog.md");
const DAILYLOG_JSON = join("C:/Users/Yudai/personal-website/external_data/dailylog.json");
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

  // 既存dailylog.mdを読み込み
  let prev = "";
  try {
    prev = await Deno.readTextFile(DAILYLOG_PATH);
  } catch (_) {}

  // 既存エントリを配列化
  const entries = prev.split(/^## .+のメモ$/m)
    .map(e => e.trim())
    .filter(e => e.length > 0);

  // 新規エントリが既存と重複しない場合のみ追加
  const newBody = memo.trim();
  const newHeading = `## ${date}のメモ`;
  const newEntryBlock = `${newHeading}\n${newBody}\n\n`;
  const exists = entries.some(e => e === newBody);
  const result = exists ? prev : newEntryBlock + prev;

  await Deno.writeTextFile(DAILYLOG_PATH, result);

  // --- JSON出力処理 ---
  // 既存JSON読み込み
  let jsonArr: { id: string; date: string; content: string }[] = [];
  try {
    const jsonText = await Deno.readTextFile(DAILYLOG_JSON);
    jsonArr = JSON.parse(jsonText);
  } catch (_) {}

    // idはUUIDで一意に生成
  const id = crypto.randomUUID();

  // datetime抽出（見出しからISO8601形式を抽出、なければ現在時刻）
  const lines = newBody.split("\n");
  const headingLine = lines.find(l => l.trim().startsWith("###### "));
  let datetime = "";
  if (headingLine) {
    // 例: "###### 2025-07-08T14:58:11.031+09:00"
    const m = headingLine.match(/^######\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:?\d{2})?)/);
    if (m) {
      datetime = m[1];
    }
  }
  if (!datetime) {
    datetime = new Date().toISOString();
  }

  // contentから見出し行（###### ...）を除去
  let contentBody = newBody;
  if (headingLine) {
    const idx = lines.indexOf(headingLine);
    if (idx !== -1) {
      contentBody = lines.slice(idx + 1).join("\n").trim();
    }
  }

  // 重複判定（datetime, content両方一致ならスキップ）
  const existsJson = jsonArr.some(e => e.datetime === datetime && e.content.trim() === contentBody);
  if (!existsJson) {
    jsonArr.unshift({ id, datetime, content: contentBody });
    await Deno.writeTextFile(
      DAILYLOG_JSON,
      JSON.stringify(jsonArr, null, 2)
    );
  }
}

if (import.meta.main) {
  main();
}
