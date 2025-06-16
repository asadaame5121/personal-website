import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import getBlueskyPosts from "./_archive/get-bluesky-posts.js";
import autoprefixer from "npm:autoprefixer";
import nesting from "npm:postcss-nesting";
import cssnano from "npm:cssnano";
import wikilinks from "https://deno.land/x/lume_markdown_plugins@v0.9.0/wikilinks.ts";
import callout from "npm:markdown-it-obsidian-callouts";

// import backlinks from "./plugins/backlinks.js";
import date from "lume/plugins/date.ts";
// import obsidian from "./plugins/obsidian.js";

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
site.filter("getBlueskyPosts", getBlueskyPosts);

// 特定のフォルダを除外する設定
site.ignore((path) => {
  const excludePaths = [
    "/.git/",
    "/_archive/",
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

// TailwindCSSとPostCSSの設定
site.use(date());
site.use(nunjucks());
site.use(jsx());
site.use(wikilinks());
// site.use(backlinks());
// site.use(obsidian());
site.use(tailwindcss({
  extensions: [".html", ".jsx", ".njk"],
  options: {
    theme: {
      colors: {
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

// PostCSSプラグインの設定
site.use(postcss({
  // 処理対象の拡張子
  extensions: [".css"],
  // インクルードパス（@importで参照するディレクトリ）
  includes: "assets/styles.css",
  // 使用するプラグイン
  plugins: [
    autoprefixer(), // ベンダープレフィックスを自動追加
    nesting(),      // CSSネスト記法のサポート
    cssnano({       // CSS最小化（本番環境用）
      preset: 'default',
    }),
  ],
}));
// assetsディレクトリ内のファイルを個別にコピー
site.copy("assets/css");
site.copy("assets/images");
site.copy("assets/styles.css");
site.copy("assets/js");
site.data("components", {
  header: "_components/header.njk",
  footer: "_components/footer.njk",
  readinglist: "_components/readinglist.njk",
  dailylog: "_components/dailylog.njk",
});

// Blueskyポスト取得フィルターを登録
site.filter("getBlueskyPosts", getBlueskyPosts().getBlueskyPosts);

site.ignore((path) => path.endsWith('.jsx') || path.endsWith('.tsx'));

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
