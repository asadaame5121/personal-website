#!/usr/bin/env -S deno run --allow-read --allow-net
// dailylogページのh-entry抽出テスト

import { detectNewDailylogEntries, loadWebmentionHistory } from './webmention-utils.ts';

async function main() {
  const historyPath = './data/webmention-history.json';
  const baseUrl = 'https://asadaame5121.net/dailylog/';
  const history = await loadWebmentionHistory(historyPath);

  const entries = await detectNewDailylogEntries('./external_data/dailylog.json', history, baseUrl);
  console.log(`h-entry抽出結果: ${entries.length}件`);
  for (const entry of entries) {
    console.log(`--- id: ${entry.id}`);
    console.log(`    content: ${entry.content?.substring(0, 40)}...`);
    console.log(`    timestamp: ${entry.timestamp}`);
    if (entry.links?.length) {
      console.log(`    links: ${entry.links.join(', ')}`);
    }
  }
}

if (import.meta.main) {
  main();
}
