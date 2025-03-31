import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import nunjucks from "lume/plugins/nunjucks.ts";

const site = lume({
  src: ".",
  dest: "_site",
});

// Nunjucksプラグインを追加（レイアウトで使用）
site.use(nunjucks());

// JSXプラグインを追加（コンポーネントで使用）
site.use(jsx());

// TailwindCSSとPostCSSプラグインを追加
site.use(tailwindcss());
site.use(postcss());

// 静的ファイルのコピー設定
site.copy("assets");

// コンポーネントパスの設定
site.data("components", {
  header: "_components/header.njk",
  footer: "_components/footer.njk",
});

// JSXファイルを除外（Nunjucksに移行したため）
site.ignore((path) => path.endsWith('.jsx') || path.endsWith('.tsx'));

export default site;
