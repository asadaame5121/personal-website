#!/usr/bin/env -S deno run --allow-read
// dailylog.jsonのidからURLを直接生成するテスト

import dailylog from '../external_data/dailylog.json' with { type: 'json' };

const baseUrl = 'https://asadaame5121.net/dailylog/#entry-';

for (const entry of dailylog) {
  const url = baseUrl + entry.id;
  console.log(`id: ${entry.id}\n  url: ${url}\n  content: ${entry.content?.substring(0, 40)}...`);
}
