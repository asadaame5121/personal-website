// deno run --allow-read --allow-write --allow-run --unstable scripts/cron-local-automation.ts
// Deno 2.x公式unstable API Deno.cronでローカル自動化
// 実行例: deno run --allow-read --allow-write --allow-run --unstable-cron scripts/cron-local-automation.ts

// 3:00 JST = 18:00 UTC
Deno.cron("sync-obsidian", "0 * * * *", async () => {
  console.log("[cron] 毎時0分 sync-obsidian.ts 実行");
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

// 3:10 JST = 18:10 UTC
Deno.cron("extract-clippingshare", "10 * * * *", async () => {
  console.log("[cron] 毎時10分 extract-clippingshare.ts 実行");
  const command = new Deno.Command("deno", {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      "scripts/extract-clippingshare.ts"
    ],
  });
  const { code, stdout, stderr } = await command.output();
  if (code === 0) {
    console.log(new TextDecoder().decode(stdout));
  } else {
    console.error(new TextDecoder().decode(stderr));
  }
});

// 3:15 JST = 18:15 UTC
Deno.cron("update-dailylog", "15 * * * *", async () => {
  console.log("[cron] 毎時15分 update-dailylog.ts 実行");
  const command = new Deno.Command("deno", {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      "scripts/update-dailylog.ts"
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
