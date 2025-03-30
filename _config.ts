import lume from "lume/mod.ts";
import nunjucks from "lume/plugins/nunjucks.ts";

const site = lume({
  src: ".",
  dest: "_site",
});

// Nunjucksプラグインを追加（レイアウトで使用）
site.use(nunjucks());

// 静的ファイルのコピー設定
site.copy("assets");

// コンポーネントパスの設定
site.data("components", {
  header: "_components/header.html",
  footer: "_components/footer.html",
});

export default site;
