import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import nav from "lume/plugins/nav.ts";
import pagefind from "lume/plugins/pagefind.ts";
import mdx from "lume/plugins/mdx.ts";
import wikilinks from "https://deno.land/x/lume_markdown_plugins@v0.9.0/wikilinks.ts";
import callout from "npm:markdown-it-obsidian-callouts";
import ogImages from "lume/plugins/og_images.ts";
import metas from "lume/plugins/metas.ts";
import date from "lume/plugins/date.ts";
import decodeURIComponentFilter from "./_filters/decodeURIComponent.js";
import Server from "lume/core/server.ts";
import redirectAS2, { bridgyFed } from "lume/middlewares/redirect_as2.ts";
import sitemap from "lume/plugins/sitemap.ts";
import transformImages from "lume/plugins/transform_images.ts";
import feed from "lume/plugins/feed.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.9.0/toc.ts";
import footnotes from "https://deno.land/x/lume_markdown_plugins@v0.9.0/footnotes.ts";
import references from "https://raw.githubusercontent.com/lumeland/markdown-plugins/main/references.ts";
import esbuild from "lume/plugins/esbuild.ts";
import brotli from "lume/plugins/brotli.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import precompress from "lume/middlewares/precompress.ts";



const markdown = {
  plugins: [callout, references]
}

const site = lume({
  src: ".",
  dest: "_site",
  location: new URL("https://asadaame5121.net"),
  prettyUrls: false, // 特殊文字を含むURLの問題を回避するために無効化
  server: {
    middlewares: [precompress()],
  },
}, { markdown });



// --- JSONデータを静的ファイルとして出力に含める ---
site.add("_data/clippingshare.json");
site.add("_data/dailylog.json");

// --- RSS/JSONフィード生成 ---
// 投稿記事（type:postやcategory:blog等）に合わせてqueryやoutputパスを調整してください
site.use(feed({
  output: ["/feed.rss", "/feed.json"], // RSSとJSON両方生成
  sort: "updated=desc",
  query: "url^=/Book/|/Article/|/Glossary/|/People/", // 投稿記事のみ対象。必要に応じて"category=blog"等に変更可
  info: {
    title: "=site.title",           // サイトタイトルを自動取得
    description: "=site.description", // サイト説明を自動取得
    lang: "ja",                       // 日本語サイトの場合
  },
  items: {
    title: "=title",
    description: "=excerpt", // または"=description"。記事の要約プロパティ名に合わせて調整
    published: "=date",
    content: "=children"
  },
  limit: 20, // 最新20件を出力
}));


// Bluesky投稿取得フィルターを登録
site.filter("getBlueskyPosts", () => []); // ★ダミー実装（ビルド通過用）
site.filter("decodeURIComponent", decodeURIComponentFilter);

// 特定のフォルダを除外する設定
site.ignore((path) => {
  const excludePaths = [
    "/.git/",
    "/_archive/",
    "/_archive/get-bluesky-posts.js", // 一時的に除外するファイル
    "/.gitmodules",
    "/attachments/",
    "README.md",
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
// site.addEventListener("beforeBuild", () => {
//   // obsidianディレクトリをクリーンアップ時に無視するための設定
//   site.ignore("/obsidian/**/*");
// });

// 基本プラグインの設定
site.use(toc());
site.use(footnotes());
site.use(date());
site.use(nunjucks());
site.use(jsx());
site.use(wikilinks());
site.use(nav());
site.use(pagefind());
site.use(mdx());
site.use(esbuild({
  extensions: [".ts", ".js", ".tsx", ".jsx"]
}));

// --- JS/TS バンドル & 最適化 ---


await (async () => {
  site.use(ogImages({
    options: {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Shippori Mincho B1",
          data: (await Deno.readFile("assets/fonts/ShipporiMinchoB1-ExtraBold.ttf")).buffer,
          weight: 800,
          style: "normal",
        },
      ],
    },
  }));
})();
site.use(metas());
site.use(sitemap());
site.use(feed({
  output: ["/posts.rss", "/posts.json"],
  query: "type=post",
  info: {
    title: "=site.title",
    description: "=site.description",
  },
  items: {
    title: "=title",
    description: "=excerpt",
  },
}));
const server = new Server();

const rewriteUrl = bridgyFed();

server.use(redirectAS2({ rewriteUrl }));


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



// TailwindCSS 設定（詳細は tailwind.config.js と CSS に記述）
site.use(tailwindcss({
  minify: false,
}));
site.use(transformImages());



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

site.ignore("README.md", "obsidian/template", "obsidian/template/*", "obsidian/Workinprogress", "obsidian/Clippings/*", "obsidian/.obsidian", "obsidian/Extra", "obsidian/forpixel8", "obsidian/Omnivore");
site.script("extract-log-content", "./_filters/extract-log-content.js");

// LinkGraph をここにつくる

site.process([".html"], (pages) => {
  for (const page of pages) {
    // Search all wikilinks in the page
    for (const link of page.document!.querySelectorAll("a[data-wikilink]")) {
  // --- alias対応追加: [[ページ名|エイリアス]]形式の処理 ---
  // 元のリンクテキストを取得
  let originalText = link.textContent || "";
  // [[...]] の場合は外側を除去
  if (originalText.startsWith("[[") && originalText.endsWith("]]")) {
    originalText = originalText.slice(2, -2);
  }
  // パイプの分割（エスケープ\|対応）
  let pageName = originalText;
  let alias = "";
  let splitIndex = -1;
  let inEscape = false;
  for (let i = 0; i < originalText.length; i++) {
    if (originalText[i] === "\\" && originalText[i+1] === "|") {
      inEscape = true;
      i++; // skip next
      continue;
    }
    if (originalText[i] === "|" && !inEscape) {
      splitIndex = i;
      break;
    }
    inEscape = false;
  }
  if (splitIndex !== -1) {
    pageName = originalText.slice(0, splitIndex);
    alias = originalText.slice(splitIndex + 1);
  }
  // エスケープ解除: \\| → |
  pageName = pageName.replace(/\\\|/g, "|");
  alias = alias.replace(/\\\|/g, "|"); 
  // エイリアスがあればリンクテキストを書き換え
  if (alias) {
    link.textContent = alias;
  }
  // --- ここまで alias対応追加 ---

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
site.use(references());
site.use(minifyHTML({
  options: {
    keep_html_and_head_opening_tags: true,
  },
}));
site.use(brotli({
  extensions: [".html"] 
}));


export default site;
