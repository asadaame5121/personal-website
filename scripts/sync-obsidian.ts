// Obsidianリポジトリから特定ディレクトリのみ同期コピーするDenoスクリプト
import { parse, stringify } from "jsr:@std/yaml";

// 設定
const OBSIDIAN_REPO_URL = Deno.env.get("OBSIDIAN_REPO_URL") ?? "https://github.com/asadaame5121/Obsidianbackup.git";
const TARGET_DIRS = (Deno.env.get("TARGET_DIRS")?.split(",") ?? ["Article", "Book", "Glossary", "People"]);
const DEST_ROOT = Deno.env.get("DEST_ROOT") ?? "./src";
const ERROR_LOG = Deno.env.get("ERROR_LOG") ?? "./scripts/sync-obsidian-error.log";

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
          errorLog.push(`${srcPath} | フロントマター無し`);
          continue;
        }
        try {
          const frontmatter: any = parse(match[1]);
          const body = text.replace(match[0], "").trim();
          if (frontmatter && typeof frontmatter === "object" && frontmatter.draft === false) {
            // metas自動付与・更新処理
            frontmatter.metas = frontmatter.metas || {};

            // title補完
            if (!frontmatter.metas.title && frontmatter.title) {
              frontmatter.metas.title = frontmatter.title;
            }
            // description補完
            if (!frontmatter.metas.description || frontmatter.metas.description === null || frontmatter.metas.description === "") {
              if (frontmatter.title) {
                frontmatter.metas.description = `${frontmatter.title}についてのページです。`;
              }
            }
            // keywords補完
            if (!frontmatter.metas.keywords && frontmatter.keywords) {
              frontmatter.metas.keywords = frontmatter.keywords;
            }
            // image補完
            if (!frontmatter.metas.image) {
              // frontmatterにimageフィールドがあれば優先
              if (frontmatter.image) {
                frontmatter.metas.image = frontmatter.image;
              } else {
                // ファイル名から .png を生成
                const pngName = entry.name.replace(/\.md$/, ".png");
                frontmatter.metas.image = pngName;
              }
            }
            // 既存のmetas値は保持し、上書きはしない
            const { metas, ...rest } = frontmatter;
            const newYaml = stringify({ ...rest, metas });
            const newText = `---\n${newYaml}---\n${body}\n`;
            await Deno.mkdir(destDir, { recursive: true });
            await Deno.writeTextFile(destPath, newText);
          }
        } catch (e) {
          errorLog.push(`${srcPath} | YAMLパースエラー: ${e}`);
        }
      } catch (e) {
        errorLog.push(`${srcPath} | ${e}`);
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
