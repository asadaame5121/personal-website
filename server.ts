import Server from "lume/core/server.ts";
import notFound from "lume/middlewares/not_found.ts";
import redirectAS2, { bridgyFed } from "lume/middlewares/redirect_as2.ts";

const server = new Server({
  root: `${Deno.cwd()}/_site`,
  // Deno Deployではport指定不要
});

const rewriteUrl = bridgyFed();
server.use(redirectAS2({ rewriteUrl }));
server.use(notFound({ page: "/404.html" }));

server.start();
