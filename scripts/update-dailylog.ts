// Deno用: GitHub API経由でObsidianのデイリーノートから「## きょうのメモ」以降を抽出し、external_data/dailylog.jsonに書き出すスクリプト
// 2025-11仕様

import { decodeBase64 } from "@std/encoding/base64";
import { load } from "@std/dotenv";

await load({ export: true });

// GitHub API設定
const GITHUB_API_BASE = Deno.env.get("GITHUB_API_BASE") ?? "https://api.github.com";
const GITHUB_OWNER = Deno.env.get("GITHUB_OWNER") ?? "asadaame5121";
const GITHUB_REPO = Deno.env.get("GITHUB_REPO") ?? "Obsidianbackup";
const GITHUB_BRANCH = Deno.env.get("GITHUB_BRANCH") ?? "main";
const OBSIDIAN_LOG_DIR = Deno.env.get("OBSIDIAN_LOG_DIR") ?? "log";
const ObsidianIntegrationGithubToken = Deno.env.get("ObsidianIntegrationGithubToken");

// 出力先設定
const DAILYLOG_JSON = Deno.env.get("DAILYLOG_JSON") ?? "C:/Users/Yudai/personal-website/external_data/dailylog.json";

const textDecoder = new TextDecoder();
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
  const logPath = buildRepoPath(`${OBSIDIAN_LOG_DIR}/${date}.md`);

  const md = await readGitHubFile(logPath);
  if (!md) {
    // ファイルが存在しない、または取得できない場合は終了
    return;
  }
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

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

function buildRepoPath(path: string): string {
  const normalized = normalizePath(path);
  return normalized.split("/").filter(Boolean).join("/");
}

function buildFileUrl(path: string): string {
  const normalized = buildRepoPath(path);
  const base = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;
  const url = new URL(`${base}/${normalized.split("/").map(encodeURIComponent).join("/")}`);
  url.searchParams.set("ref", GITHUB_BRANCH);
  return url.toString();
}

async function githubFetch(url: string): Promise<Response> {
  const headers = new Headers({
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "update-dailylog-script",
  });
  if (ObsidianIntegrationGithubToken) {
    headers.set("Authorization", `Bearer ${ObsidianIntegrationGithubToken}`);
  }
  const response = await fetch(url, { headers });
  if (response.status === 403 && response.headers.get("X-RateLimit-Remaining") === "0") {
    const resetUnix = response.headers.get("X-RateLimit-Reset");
    const resetTime = resetUnix ? new Date(Number(resetUnix) * 1000).toISOString() : "unknown";
    console.error(`[update-dailylog] GitHub API rate limit exceeded. Resets at ${resetTime}.`);
  }
  return response;
}

async function readGitHubFile(path: string): Promise<string | null> {
  const url = buildFileUrl(path);
  const response = await githubFetch(url);
  if (response.status === 404) {
    console.warn(`[update-dailylog] ファイルが見つかりません: ${path}`);
    return null;
  }
  if (!response.ok) {
    console.warn(`[update-dailylog] ファイル取得失敗 (${response.status}): ${path}`);
    return null;
  }
  const json = await response.json() as { content?: string; encoding?: string };
  if (typeof json.content !== "string") {
    console.warn(`[update-dailylog] content フィールドが文字列ではありません: ${path}`);
    return null;
  }
  const encoding = typeof json.encoding === "string" ? json.encoding : "base64";
  if (encoding !== "base64") {
    console.warn(`[update-dailylog] 未対応のエンコードです (${encoding}): ${path}`);
    return null;
  }
  const bytes = decodeBase64(json.content.replace(/\n/g, ""));
  return textDecoder.decode(bytes);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    Deno.exit(1);
  });
}
