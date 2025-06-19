import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import nav from "lume/plugins/nav.ts";
import autoprefixer from "npm:autoprefixer";
import nesting from "npm:postcss-nesting";
import cssnano from "npm:cssnano";
import wikilinks from "https://deno.land/x/lume_markdown_plugins@v0.9.0/wikilinks.ts";
import callout from "npm:markdown-it-obsidian-callouts";

import date from "lume/plugins/date.ts";

const markdown = {
  plugin: [callout]
}

const site = lume({
  src: ".",
  dest: "_site",
  location: new URL("https://asadaame5121.github.io/personal-website/"),
  prettyUrls: false, // 特殊文字を含むURLの問題を回避するために無効化
}, { markdown });

// Bluesky投稿取得フィルターを登録
site.filter("getBlueskyPosts", () => []); // ★ダミー実装（ビルド通過用）

// 特定のフォルダを除外する設定
site.ignore((path) => {
  const excludePaths = [
    "/.git/",
    "/_archive/",
    "/_archive/get-bluesky-posts.js", // 一時的に除外するファイル
    "/.gitmodules",
    "/attachments/",
    "/Extra/",
    "/forpixel8/",
    "/.obsidian/",
    "/Omnivore/",
    "/Publish/",
    "/scripts/",
    "/template/",
    "/Workinprogress/",
    // obsidianフォルダ直下のmarkdownファイルを除外
    "/obsidian/*.md",
  ];
  
  // 特殊文字を含むファイル名を除外
  const problematicFiles = [
    "ＮＨＫ「100分ｄｅ名著」",  // 部分一致でフィルタリング
    "名著"
  ];
  
  return excludePaths.some(prefix => path.startsWith(prefix)) || 
         problematicFiles.some(keyword => path.includes(keyword));
});

// obsidianディレクトリを削除対象から除外
// site.clean()の動作を調整
site.addEventListener("beforeBuild", () => {
  // obsidianディレクトリをクリーンアップ時に無視するための設定
  site.ignore("/obsidian/**/*");
});

// 基本プラグインの設定
site.use(date());
site.use(nunjucks());
site.use(jsx());
site.use(wikilinks());
site.use(nav());

// TailwindCSSとPostCSSの設定
// CSS処理のエントリーポイントを明示的に設定
// 注意: ファイルが存在しない場合は作成する
site.page({
  url: "/assets/styles.css",
  content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
  draft: false
});

// 本番環境かどうかの判定
const _isProduction = Deno.env.get("LUME_MODE") === "production";

// TailwindCSS設定
site.use(tailwindcss({
  extensions: [".html", ".jsx", ".njk"],
  // JITモードを有効化して効率化
  options: {
    mode: "jit",
    theme: {
      colors: {
        // モノトーンカラーパレット（デジタル庁デザインシステム参考）
        'mono-black': '#1A1A1A',    // 最も濃い黒（見出しなど）
        'mono-darkgray': '#333333', // 濃い灰色（本文テキストなど）
        'mono-gray': '#666666',     // 中間の灰色（補助テキストなど）
        'mono-lightgray': '#999999',// 薄い灰色（境界線など）
        'mono-silver': '#CCCCCC',   // シルバー（無効状態など）
        'mono-white': '#F8F8F8',    // オフホワイト（背景色）
        'mono-accent': '#4A5568',   // アクセントカラー
        
        // 既存のカラーパレット（参照用に残す）
        'garden-green': '#2E5A30',
        'garden-lavender': '#A991C5',
        'garden-ivory': '#F2EFE2',
        'garden-rose': '#D6798E',
        'garden-brown': '#785E49',
        'medieval-gray': '#7D8491',
        'medieval-blue': '#4C6F8A',
        'medieval-brown': '#8B6E4F',
        'medieval-red': '#8A3033',
        'medieval-gold': '#C5A84C',
        'neon-navy': '#0D1B2A',
        'neon-gray': '#2C363F',
        'neon-blue-dark': '#354F60',
        'neon-pink': '#FF2A6D',
        'neon-blue': '#01C8EE',
        'neon-purple': '#D159D8',
      },
      fontFamily: {
        sans: ["Noto Sans JP", "sans-serif"],
        serif: ["Noto Serif JP", "serif"],
      },
    },
  },
}));


// 静的ファイルのコピー設定
// ディレクトリ単位でコピーするように整理
site.add("assets/css");
site.add("assets/images");
site.add("assets/js");

// コンポーネント設定
// _componentsフォルダ内のコンポーネントは自動的に読み込まれるため、
// 個別に登録する必要はありません。

// コンポーネントのCSSとJSの出力設定
site.options.components = {
  cssFile: "/assets/components.css",
  jsFile: "/assets/components.js"
};

// Blueskyポスト取得フィルターを登録
site.filter("getBlueskyPosts", () => []); // ★ダミー実装（ビルド通過用）

// JSXファイルをプライマリーテンプレートとして使用するため、下記の行をコメントアウト
// site.ignore((path) => path.endsWith('.jsx') || path.endsWith('.tsx'));
site.ignore((path) => {
  // /obsidian/example.mdのようなパスに一致し、さらに深いディレクトリ構造を持たないものを除外
  return /^\/obsidian\/[^\/]+\.md$/.test(path);
});

site.ignore("obsidian/template", "obsidian/template/*", "obsidian/Workinprogress", "obsidian/Clippings/*", "obsidian/.obsidian", "obsidian/Extra", "obsidian/forpixel8", "obsidian/Omnivore");

site.process([".html"], (pages) => {
  for (const page of pages) {
    // Search all wikilinks in the page
    for (const link of page.document!.querySelectorAll("a[data-wikilink]")) {
      // Get the link id and remove the attribute
      const encodedId = link.getAttribute("data-wikilink");
      
      if (encodedId) {
        // URLデコードしてIDを取得
        const id = decodeURIComponent(encodedId);
        link.removeAttribute("data-wikilink");
        
        // 拡張子を除去し、小文字に変換
        const normalizedId = id.replace(/\.(md|html?)$/i, "").toLowerCase();
        
        // パスとファイル名を分離
        let path = "";
        let filename = normalizedId;
        
        if (normalizedId.includes("/")) {
          const parts = normalizedId.split("/");
          filename = parts.pop() || "";
          path = parts.join("/");
        }
        
        // 複数の方法でページを検索
        const found = pages.find((p) => {
          // ページのパスとファイル名を取得
          const pagePath = p.src.path.split("/").slice(0, -1).join("/").toLowerCase();
          const pageFilename = p.src.path.split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase() || "";
          
          // パスが一致しない場合はスキップ
          if (path && pagePath !== path) {
            return false;
          }
          
          // ファイル名の比較（大文字小文字を無視）
          return pageFilename === filename || 
                 (p.data.title && typeof p.data.title === 'string' && p.data.title.toLowerCase() === filename) ||
                 (p.data.id && typeof p.data.id === 'string' && p.data.id.toLowerCase() === filename);
        });
        
        if (found) {
          link.setAttribute("href", found.data.url);
        } else {
          link.setAttribute("title", "This page does not exist");
          link.classList.add("wiki-link-missing");
        }
      }
    }
  }
});

export default site;
