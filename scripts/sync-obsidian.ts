// Obsidianリポジトリから特定ディレクトリのみ同期コピーするDenoスクリプト
import { parse } from "jsr:@std/yaml";

// 設定
const OBSIDIAN_REPO_URL = "https://github.com/asadaame5121/Obsidianbackup.git";
const TARGET_DIRS = ["Article", "Book", "Glossary", "People"];
const DEST_ROOT = "./src";
const ERROR_LOG = "./scripts/sync-obsidian-error.log";

// 必要なDeno権限: --allow-read --allow-write --allow-run

async function run(cmd: string[], cwd?: string) {
  const command = new Deno.Command(cmd[0], { args: cmd.slice(1), cwd });
  const { code, stdout, stderr } = await command.output();
  if (code !== 0) {
    throw new Error(new TextDecoder().decode(stderr));
  }
  return new TextDecoder().decode(stdout);
}

async function copyMarkdownIfDraftFalse(srcDir: string, destDir: string, errorLog: string[]): Promise<void> {
  for await (const entry of Deno.readDir(srcDir)) {
    const srcPath = `${srcDir}/${entry.name}`;
    const destPath = `${destDir}/${entry.name}`;
    if (entry.isDirectory) {
      await copyMarkdownIfDraftFalse(srcPath, destPath, errorLog);
    } else if (entry.isFile && entry.name.endsWith(".md")) {
      try {
        const text = await Deno.readTextFile(srcPath);
        const match = text.match(/^---([\s\S]+?)---/);
        if (!match) {
          errorLog.push(srcPath);
          continue;
        }
        const frontmatter = parse(match[1]);
        if (frontmatter && typeof frontmatter === "object" && frontmatter.draft === false) {
          await Deno.mkdir(destDir, { recursive: true });
          await Deno.copyFile(srcPath, destPath);
        }
      } catch (_) {
        errorLog.push(srcPath);
      }
    }
  }
}

async function main() {
  const tmpDir = await Deno.makeTempDir();
  console.log(`Cloning Obsidian repo into ${tmpDir}...`);
  await run(["git", "clone", "--depth=1", OBSIDIAN_REPO_URL, tmpDir]);

  const errorLog: string[] = [];
  for (const dir of TARGET_DIRS) {
    const src = `${tmpDir}/${dir}`;
    const dest = `${DEST_ROOT}/${dir}`;
    console.log(`Syncing ${dir}...`);
    await copyMarkdownIfDraftFalse(src, dest, errorLog);
  }
  if (errorLog.length > 0) {
    await Deno.writeTextFile(ERROR_LOG, errorLog.join("\n"));
    console.log(`Some files skipped or errored. See ${ERROR_LOG}`);
  }

  // 一時ディレクトリ削除
  await Deno.remove(tmpDir, { recursive: true });
  console.log("Sync complete.");
}

if (import.meta.main) {
  main().catch(e => {
    console.error(e);
    Deno.exit(1);
  });
}
