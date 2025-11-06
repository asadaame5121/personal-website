import { walk } from "@std/fs";
import { parse } from "@std/yaml";
import { printf } from "@std/fmt/printf";


type BookMeta = {
  title: string;
  amazonUrl: string;
  calilUrl: string;
  image: string;
  openbdBookCover: string;
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

  const parsed = parse(m[1]);
  if (!parsed || typeof parsed !== "object") {
    continue;
  }

  const frontmatter = parsed as Record<string, unknown>;

  const isbn = typeof frontmatter.ISBN === "string" ? frontmatter.ISBN : entry.name.replace(/\.md$/, "");

  const calilField = frontmatter["カーリル"];
  const calilCandidates = Array.isArray(calilField)
    ? calilField.filter((value): value is string => typeof value === "string")
    : (typeof calilField === "string" ? [calilField] : []);
  const calilUrl = (calilCandidates.find(isValidCalilUrl)) ?? "";

  const metas = frontmatter.metas && typeof frontmatter.metas === "object"
    ? frontmatter.metas as Record<string, unknown>
    : undefined;

  books[isbn] = {
    title: typeof frontmatter.title === "string" ? frontmatter.title : "",
    amazonUrl: typeof frontmatter.amazonUrl === "string" ? frontmatter.amazonUrl : "",
    calilUrl,
    image: typeof metas?.image === "string" ? metas.image : "",
    openbdBookCover: typeof frontmatter.OPENBDBookCover === "string" ? frontmatter.OPENBDBookCover : "",
  };
}

await Deno.mkdir("_data", { recursive: true });
await Deno.writeTextFile(outputPath, JSON.stringify(books, null, 2));
await printf(`書誌データを出力しました: ${outputPath}\n`);