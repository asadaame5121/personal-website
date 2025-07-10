import Server from "lume/core/server.ts";
import notFound from "lume/middlewares/not_found.ts";
import redirectAS2, { bridgyFed } from "lume/middlewares/redirect_as2.ts";
import precompress from "lume/middlewares/precompress.ts";

const server = new Server({
  port: 8000,
  root: `${Deno.cwd()}/_site`,
  // Deno Deployではport指定不要
});

const rewriteUrl = bridgyFed();
server.use(redirectAS2({ rewriteUrl }));
server.use(notFound({ page: "/404.html" }));
server.use(precompress());

server.start();

console.log("Listening on http://localhost:8000");