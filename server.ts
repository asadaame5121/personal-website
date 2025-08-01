import Server from "lume/core/server.ts";
import notFound from "lume/middlewares/not_found.ts";
import precompress from "lume/middlewares/precompress.ts";

const server = new Server({
  port: 8000,
  root: `${Deno.cwd()}/_site`,
  // Deno Deployではport指定不要
});

server.use(notFound({ page404: "/404.html" }));
server.use(precompress());

server.start();

console.log("Listening on http://localhost:8000");