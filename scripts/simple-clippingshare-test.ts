#!/usr/bin/env -S deno run --allow-read --allow-write

import { extractULikeOfLinksFromHtml } from './html-parser.ts';

async function simpleTest() {
  try {
    console.log('=== Simple Clippingshare Test ===');
    
    const html = await Deno.readTextFile('_site/clippingshare/index.html');
    console.log(`HTML読み込み完了: ${html.length} 文字`);
    
    const entries = extractULikeOfLinksFromHtml(html);
    console.log(`u-like-ofリンク抽出結果: ${entries.length} 件`);
    
    // 結果をファイルに出力
    const results = entries.map((entry, i) => {
      return `${i+1}. ${entry.title}\n   URL: ${entry.url}${entry.comment ? `\n   Comment: ${entry.comment}` : ''}\n`;
    }).join('\n');
    
    await Deno.writeTextFile('clippingshare-test-results.txt', results);
    console.log('結果をclippingshare-test-results.txtに出力しました');
    
    // 最初の3件をコンソールにも表示
    entries.slice(0, 3).forEach((entry, i) => {
      console.log(`${i+1}. ${entry.title}`);
      console.log(`   URL: ${entry.url}`);
      if (entry.comment) console.log(`   Comment: ${entry.comment}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

if (import.meta.main) {
  await simpleTest();
}
