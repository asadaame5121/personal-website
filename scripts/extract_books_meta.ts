import { walk } from "https://deno.land/std@0.203.0/fs/walk.ts";
import { parse } from "https://deno.land/std@0.203.0/yaml/mod.ts";
import { printf } from "jsr:@std/fmt/printf";


type BookMeta = {
  title: string;
  amazonUrl: string;
  calilUrl: string;
  image: string;
};

const booksDir = "./src/Book";
const outputPath = "./_data/books.json";
const books: Record<string, BookMeta> = {};

function isValidCalilUrl(url: string): boolean {
  if (!url) return false;
  if (url.endsWith("isbn=")) return false;
  if (/isbn=PKEY:/i.test(url)) return false;
  return true;
}

for await (const entry of walk(booksDir, { exts: [".md"], includeFiles: true, maxDepth: 1 })) {
  const raw = await Deno.readTextFile(entry.path);
  const m = raw.match(/^---([\s\S]+?)---/);
  if (!m) continue;
  const frontmatter = parse(m[1]);
  const key = frontmatter.ISBN ?? entry.name.replace(/\.md$/, "");
  const calilCandidates = Array.isArray(frontmatter["カーリル"]) ? frontmatter["カーリル"] : [frontmatter["カーリル"]];
  const calilUrl = (calilCandidates.find(isValidCalilUrl)) ?? "";
  books[key] = {
    title: frontmatter.title ?? "",
    amazonUrl: frontmatter.amazonUrl ?? "",
    calilUrl,
    image: frontmatter.metas?.image ?? "",
  };
}

await Deno.mkdir("_data", { recursive: true });
await Deno.writeTextFile(outputPath, JSON.stringify(books, null, 2));
await printf(`書誌データを出力しました: ${outputPath}\n`);