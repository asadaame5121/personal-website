#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

// Clippingshare単体テスト送信スクリプト

import type {
  WebmentionHistory,
  WebmentionConfig,
  ClippingWebmention
} from './webmention-types.ts';

import {
  loadWebmentionHistory,
  saveWebmentionHistory,
  loadWebmentionConfig,
  detectNewClippingEntries,
  sendWebmention
} from './webmention-utils.ts';
import { logger } from './webmention-logger.ts';

const HISTORY_FILE = 'data/webmention-history.json';
const CONFIG_FILE = 'data/webmention-config.json';

/**
 * 単体テスト送信
 */
async function singleTest() {
  const isDryRun = Deno.args.includes('--dry-run');
  
  await logger.info('🧪 Clippingshare単体テスト開始');
  await logger.info(`モード: ${isDryRun ? 'DRY RUN (テスト)' : '本番送信'}`);
  
  try {
    const config = await loadWebmentionConfig(CONFIG_FILE);
    const history = await loadWebmentionHistory(HISTORY_FILE);
    
    await logger.info('設定・履歴読み込み完了');
    
    // clippingshareエントリを1件だけ取得
    const clippingEntries = await detectNewClippingEntries(
      'data/clippingshare.json',
      history,
      config.sources.clippingshare.base_url,
      1 // 1件のみ
    );
    
    await logger.info(`検出されたエントリ: ${clippingEntries.length}件`);
    
    if (clippingEntries.length === 0) {
      await logger.info('送信対象のエントリがありません');
      return;
    }
    
    const entry = clippingEntries[0];
    const sourceUrl = `${config.sources.clippingshare.base_url}${entry.id}`;
    const targetUrl = entry.like_url!;
    
    await logger.info(`📤 送信準備: ${entry.id}`);
    await logger.info(`   ソース: ${sourceUrl}`);
    await logger.info(`   ターゲット: ${targetUrl}`);
    
    if (!isDryRun) {
      await logger.info('🚀 実際の送信を開始...');
      
      const result = await sendWebmention(sourceUrl, targetUrl, config);
      
      const webmention: ClippingWebmention = {
        clip_id: entry.id,
        source_url: sourceUrl,
        target_url: targetUrl,
        sent_at: result.sent_at,
        status: result.success ? 'success' : 'failed',
        response_code: result.response_code,
        error_message: result.error_message
      };
      
      history.sent_webmentions.clippingshare.push(webmention);
      await saveWebmentionHistory(HISTORY_FILE, history);
      
      if (result.success) {
        await logger.success(`✅ 送信成功: ${entry.id}`);
        await logger.info(`   レスポンスコード: ${result.response_code}`);
      } else {
        await logger.failure(`❌ 送信失敗: ${entry.id}`, result.error_message);
      }
    } else {
      await logger.info('🔍 [DRY RUN] 送信予定のエントリ');
    }
    
    await logger.info('🧪 テスト完了');
    
  } catch (error) {
    await logger.error('テスト中にエラーが発生', error.message);
  }
}

if (import.meta.main) {
  await singleTest();
}
