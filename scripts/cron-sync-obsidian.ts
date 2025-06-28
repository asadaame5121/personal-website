// deno run --allow-read --allow-write --allow-run --unstable scripts/cron-sync-obsidian.ts
import { cron } from "jsr:@deno/cron";

cron("0 3 * * *", async () => {
  console.log("[cron] 3:00にsync-obsidian.tsを実行");
  const command = new Deno.Command("deno", {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-run",
      "scripts/sync-obsidian.ts"
    ],
  });
  const { code, stdout, stderr } = await command.output();
  if (code === 0) {
    console.log(new TextDecoder().decode(stdout));
  } else {
    console.error(new TextDecoder().decode(stderr));
  }
});

// メインスレッドが終了しないようにする
setInterval(() => {}, 60 * 60 * 1000);
