// scripts/extract-clippingshare.ts
// GitHub API経由でObsidianのClippingsフォルダからメタデータを抽出し、external_data/clippingshare.jsonに保存するDenoスクリプト
import { decodeBase64 } from "@std/encoding/base64";
import { extract } from "@std/front-matter/yaml";
import { load } from "@std/dotenv";

await load({ export: true });

const GITHUB_API_BASE = Deno.env.get("GITHUB_API_BASE") ?? "https://api.github.com";
const GITHUB_OWNER = Deno.env.get("GITHUB_OWNER") ?? "asadaame5121";
const GITHUB_REPO = Deno.env.get("GITHUB_REPO") ?? "Obsidianbackup";
const GITHUB_BRANCH = Deno.env.get("GITHUB_BRANCH") ?? "main";
const CLIPPINGS_DIR = Deno.env.get("CLIPPINGS_DIR") ?? "Clippings";
const ObsidianIntegrationGithubToken = Deno.env.get("ObsidianIntegrationGithubToken");
const OUTPUT_PATH = Deno.env.get("CLIPPINGS_OUTPUT_PATH") ?? "C:/Users/Yudai/personal-website-refactoring/external_data/clippingshare.json";

const textDecoder = new TextDecoder();

interface GitHubContentItem {
  type: string;
  name: string;
  path: string;
}

interface GitHubFileResponse {
  content?: string;
  encoding?: string;
  path: string;
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

function buildContentsUrl(path: string): string {
  const normalized = normalizePath(path);
  const base = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;
  const url = new URL(normalized ? `${base}/${normalized.split("/").map(encodeURIComponent).join("/")}` : base);
  url.searchParams.set("ref", GITHUB_BRANCH);
  return url.toString();
}

async function githubFetch(url: string): Promise<Response> {
  const headers = new Headers({
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "extract-clippingshare-script",
  });
  if (ObsidianIntegrationGithubToken) {
    headers.set("Authorization", `Bearer ${ObsidianIntegrationGithubToken}`);
  }
  const response = await fetch(url, { headers });
  if (response.status === 403 && response.headers.get("X-RateLimit-Remaining") === "0") {
    const resetUnix = response.headers.get("X-RateLimit-Reset");
    const resetTime = resetUnix ? new Date(Number(resetUnix) * 1000).toISOString() : "unknown";
    console.error(`[extract-clippingshare] GitHub API rate limit exceeded. Resets at ${resetTime}.`);
  }
  return response;
}

async function listDirectory(path: string): Promise<GitHubContentItem[]> {
  const url = buildContentsUrl(path);
  const response = await githubFetch(url);
  if (response.status === 404) {
    console.warn(`[extract-clippingshare] ディレクトリが見つかりません: ${path || "(root)"}`);
    return [];
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`[extract-clippingshare] ディレクトリ取得失敗 (${response.status}): ${message}`);
  }
  const json = await response.json();
  if (!Array.isArray(json)) {
    throw new Error("[extract-clippingshare] GitHub APIレスポンスが配列ではありません。");
  }
  return json as GitHubContentItem[];
}

async function collectMarkdownFiles(root: string): Promise<GitHubContentItem[]> {
  const files: GitHubContentItem[] = [];
  const queue: string[] = [normalizePath(root)];
  while (queue.length > 0) {
    const current = queue.shift() ?? "";
    const entries = await listDirectory(current);
    for (const entry of entries) {
      if (entry.type === "file" && entry.name.endsWith(".md")) {
        files.push(entry);
      } else if (entry.type === "dir") {
        queue.push(entry.path);
      }
    }
  }
  return files;
}

async function readGitHubFile(path: string): Promise<string | null> {
  const url = buildContentsUrl(path);
  const response = await githubFetch(url);
  if (response.status === 404) {
    console.warn(`[extract-clippingshare] ファイルが見つかりません: ${path}`);
    return null;
  }
  if (!response.ok) {
    console.warn(`[extract-clippingshare] ファイル取得失敗 (${response.status}): ${path}`);
    return null;
  }
  const json = await response.json() as GitHubFileResponse;
  if (typeof json.content !== "string") {
    console.warn(`[extract-clippingshare] content フィールドが文字列ではありません: ${path}`);
    return null;
  }
  const encoding = typeof json.encoding === "string" ? json.encoding : "base64";
  if (encoding !== "base64") {
    console.warn(`[extract-clippingshare] 未対応のエンコードです (${encoding}): ${path}`);
    return null;
  }
  const bytes = decodeBase64(json.content.replace(/\n/g, ""));
  return textDecoder.decode(bytes);
}

async function main() {
  const markdownFiles = await collectMarkdownFiles(CLIPPINGS_DIR);
  if (markdownFiles.length === 0) {
    console.warn("[extract-clippingshare] 取得対象のMarkdownファイルが見つかりませんでした。");
  }

  const clippings: Array<{ filename: string; source?: string; created?: string; sitename?: string; comment?: string }> = [];

  for (const item of markdownFiles) {
    const text = await readGitHubFile(item.path);
    if (!text) {
      continue;
    }
    let attrs: Record<string, unknown> = {};
    try {
      const result = extract(text);
      attrs = result.attrs as Record<string, unknown>;
    } catch (e) {
      console.warn(`[extract-clippingshare] フロントマター抽出失敗: ${item.path} (${e instanceof Error ? e.message : e})`);
      continue;
    }
    clippings.push({
      filename: typeof attrs.title === "string" ? attrs.title : item.name,
      source: typeof attrs.source === "string" ? attrs.source : undefined,
      created: typeof attrs.created === "string" ? attrs.created : undefined,
      sitename: typeof attrs.sitename === "string" ? attrs.sitename : undefined,
      comment: typeof attrs.comment === "string" ? attrs.comment : undefined,
    });
  }

  try {
    await Deno.mkdir("data", { recursive: true });
  } catch (_) {}

  clippings.sort((a, b) => {
    if (!a.created) return 1;
    if (!b.created) return -1;
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });

  let prevEntries: any[] = [];
  try {
    const prevJson = await Deno.readTextFile(OUTPUT_PATH);
    prevEntries = JSON.parse(prevJson);
  } catch (_) {}

  const mapped = clippings.map((c) => {
    const prev = prevEntries.find((e: any) => e.title === c.filename && e.url === (c.source || ""));
    const id = prev ? prev.id : crypto.randomUUID();
    const sitename = typeof c.sitename === "string" && c.sitename !== "unidentified" ? c.sitename : "";
    const comment = typeof c.comment === "string" && c.comment !== "unidentified" ? c.comment : "";
    return {
      id,
      title: c.filename,
      url: c.source || "",
      source: sitename,
      comment: comment,
    };
  });

  await Deno.writeTextFile(
    OUTPUT_PATH,
    JSON.stringify(mapped, null, 2),
  );
  console.log(`Extracted ${clippings.length} clippings to ${OUTPUT_PATH}`);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    Deno.exit(1);
  });
}
