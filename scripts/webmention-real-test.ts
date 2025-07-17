#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write
// Webmention対応サイトでの実送信テスト

import { 
  loadWebmentionConfig, 
  discoverWebmentionEndpoint, 
  sendWebmention 
} from './webmention-utils.ts';

async function testWebmentionToSupportedSite() {
  console.log('🧪 Webmention対応サイトでの実送信テスト開始');
  
  try {
    // 設定読み込み
    const config = await loadWebmentionConfig('./data/webmention-config.json');
    
    // テスト対象
    const sourceUrl = 'https://asadaame5121.net/clippingshare'; // clippingshareページ（Like投稿）
    const targetUrl = 'https://aboutmonica.com/blog/fetch-webmentions-automatically-with-github-actions'; // Webmention対応サイト
    
    console.log(`📤 送信元: ${sourceUrl}`);
    console.log(`📥 送信先: ${targetUrl}`);
    
    // 1. Webmentionエンドポイント発見テスト
    console.log('\n🔍 Webmentionエンドポイント発見テスト');
    const discovery = await discoverWebmentionEndpoint(targetUrl);
    
    if (!discovery.endpoint) {
      console.error('❌ Webmentionエンドポイントが見つかりませんでした');
      console.error(`エラー: ${discovery.error}`);
      return;
    }
    
    console.log(`✅ エンドポイント発見成功:`);
    console.log(`   URL: ${discovery.endpoint}`);
    console.log(`   方法: ${discovery.method}`);
    
    // 2. 実際のWebmention送信テスト
    console.log('\n📤 実際のWebmention送信テスト');
    console.log('⚠️  これは実際にWebmentionを送信します！');
    
    // 確認プロンプト（実際の送信前）
    console.log('続行しますか？ (このスクリプトを実行した時点で送信されます)');
    
    const result = await sendWebmention(sourceUrl, targetUrl, config);
    
    console.log('\n📊 送信結果:');
    console.log(`成功: ${result.success}`);
    console.log(`レスポンスコード: ${result.response_code || 'N/A'}`);
    console.log(`送信時刻: ${result.sent_at}`);
    
    if (result.error_message) {
      console.log(`エラー: ${result.error_message}`);
    }
    
    if (result.success) {
      console.log('\n🎉 Webmention送信成功！');
      console.log('相手サイトでWebmentionが処理され、Likeとして表示される可能性があります。');
      console.log(`確認URL: ${targetUrl}`);
    } else {
      console.log('\n❌ Webmention送信失敗');
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
  }
}

// メイン実行
if (import.meta.main) {
  await testWebmentionToSupportedSite();
}
