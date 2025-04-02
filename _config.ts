import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import autoprefixer from "npm:autoprefixer";
import nesting from "npm:postcss-nesting";
import cssnano from "npm:cssnano";
import wikilinks from "https://deno.land/x/lume_markdown_plugins@v0.9.0/wikilinks.ts";
import backlinks from "./plugins/backlinks.js";
// import obsidian from "./plugins/obsidian.js";


const site = lume({
  src: ".",
  dest: "_site",
});

site.use(nunjucks());
site.use(jsx());
site.use(wikilinks());
site.use(backlinks());
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
  includes: "_includes",
  // 使用するプラグイン
  plugins: [
    autoprefixer(), // ベンダープレフィックスを自動追加
    nesting(),      // CSSネスト記法のサポート
    cssnano({       // CSS最小化（本番環境用）
      preset: 'default',
    }),
  ],
}));

site.copy("assets");

site.data("components", {
  header: "_components/header.njk",
  footer: "_components/footer.njk",
});

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
                 (p.data.title && p.data.title.toLowerCase() === filename) ||
                 (p.data.id && p.data.id.toLowerCase() === filename);
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
