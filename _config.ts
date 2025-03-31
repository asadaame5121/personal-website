import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";

const site = lume({
  src: ".",
  dest: "_site",
});

// JSXプラグインを追加（コンポーネントで使用）
site.use(jsx());

// TailwindCSSとPostCSSプラグインを追加
site.use(tailwindcss());
site.use(postcss());

// 静的ファイルのコピー設定
site.copy("assets");

// コンポーネントパスの設定
site.data("components", {
  header: "_components/header.tsx",
  footer: "_components/footer.tsx",
});

export default site;
