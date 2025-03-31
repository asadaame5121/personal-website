import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import nunjucks from "lume/plugins/nunjucks.ts";

const site = lume({
  src: ".",
  dest: "_site",
});

site.use(nunjucks());
site.use(jsx());
site.use(tailwindcss({
  extensions: [".html", ".jsx"],
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
site.use(postcss());

site.copy("assets");

site.data("components", {
  header: "_components/header.njk",
  footer: "_components/footer.njk",
});

site.ignore((path) => path.endsWith('.jsx') || path.endsWith('.tsx'));

export default site;
