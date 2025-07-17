#!/usr/bin/env -S deno run --allow-net --allow-read
// Webmentionエンドポイント発見機能のテスト（送信なし）

import { discoverWebmentionEndpoint } from './webmention-utils.ts';

async function testEndpointDiscovery() {
  console.log('🔍 Webmentionエンドポイント発見テスト');
  
  const testUrls = [
    'https://aboutmonica.com/blog/fetch-webmentions-automatically-with-github-actions',
    'https://wirelesswire.jp/2025/07/88919/', // 非対応サイトの例
  ];
  
  for (const url of testUrls) {
    console.log(`\n📍 テスト対象: ${url}`);
    console.log('─'.repeat(80));
    
    try {
      const result = await discoverWebmentionEndpoint(url);
      
      console.log(`結果: ${result.method}`);
      if (result.endpoint) {
        console.log(`✅ エンドポイント発見: ${result.endpoint}`);
      } else {
        console.log(`❌ エンドポイント未発見: ${result.error || 'エンドポイント未対応'}`);
      }
      
    } catch (error) {
      console.error(`❌ エラー: ${error.message}`);
    }
  }
  
  console.log('\n🏁 テスト完了');
}

// メイン実行
if (import.meta.main) {
  await testEndpointDiscovery();
}
