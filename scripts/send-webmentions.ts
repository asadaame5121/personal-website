#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

// Webmention送信メインスクリプト

import type {
  WebmentionHistory,
  WebmentionConfig,
  DailylogWebmention,
  ClippingWebmention,
  BlogUpdateWebmention as _BlogUpdateWebmention
} from './webmention-types.ts';

import {
  loadWebmentionHistory,
  saveWebmentionHistory,
  loadWebmentionConfig,
  detectNewDailylogEntries,
  detectNewClippingEntries,
  sendWebmention,
  checkRateLimit,
  sleep
} from './webmention-utils.ts';
import { logger } from './webmention-logger.ts';

const HISTORY_FILE = 'data/webmention-history.json';
const CONFIG_FILE = 'data/webmention-config.json';

/**
 * メイン処理
 */
async function main() {
  const isDryRun = Deno.args.includes('--dry-run');
  
  logger.info('Webmention送信スクリプト開始');
  logger.info(`モード: ${isDryRun ? 'DRY RUN (テスト)' : '本番送信'}`);
  
  try {
    const config = await loadWebmentionConfig(CONFIG_FILE);
    const history = await loadWebmentionHistory(HISTORY_FILE);
    
    logger.info(`設定読み込み完了 - dailylog:${config.sources.dailylog.enabled ? 'ON' : 'OFF'}, clipping:${config.sources.clippingshare.enabled ? 'ON' : 'OFF'}`);
    logger.info(`履歴: dailylog=${history.sent_webmentions.dailylog.length}, clipping=${history.sent_webmentions.clippingshare.length}, blog=${history.sent_webmentions.blog_updates.length}`);
    
    let totalSent = 0;
    
    // dailylogエントリの処理
    if (config.sources.dailylog.enabled) {
      logger.info('📅 dailylog処理中...');
      
      const newDailylogEntries = await detectNewDailylogEntries(
        config.sources.dailylog.data_file,
        history,
        config.sources.dailylog.base_url
      );
      
      logger.info(`dailylog: ${newDailylogEntries.length}件の新エントリ`);
      
      for (const entry of newDailylogEntries) {
        const sourceUrl = `${config.sources.dailylog.base_url}#${entry.id}`;
        const targetUrl = config.endpoints.bridgy_bluesky;
        
        if (!isDryRun) {
          const result = await sendWebmention(sourceUrl, targetUrl, config);
          
          const webmention: DailylogWebmention = {
            entry_id: entry.id,
            source_url: sourceUrl,
            target_url: targetUrl,
            sent_at: new Date().toISOString(),
            status: result.success ? 'success' : 'failed',
            error_message: result.error_message
          };
          
          history.sent_webmentions.dailylog.push(webmention);
          totalSent++;
          
          if (result.success) {
            logger.success(`dailylog ${entry.id}`);
          } else {
            logger.failure(`dailylog ${entry.id}`, result.error_message);
          }
        } else {
          logger.info(`[DRY RUN] dailylog: ${entry.id}`);
        }
      }
    }
    
    // clippingshareエントリの処理
    if (config.sources.clippingshare.enabled) {
      await logger.info('🔍 clippingshareエントリを検出中...');
      const clippingEntries = await detectNewClippingEntries(
        'data/clippingshare.json',
        history,
        config.sources.clippingshare.base_url,
        isDryRun ? 10 : undefined // ドライラン時は10件までに制限
      );
      
      await logger.info(`🔍 新しいclippingshareエントリ: ${clippingEntries.length}件`);
      
      for (const entry of clippingEntries) {
        // レート制限チェック
        const rateLimitCheck = checkRateLimit(history, config);
        if (!rateLimitCheck.canSend) {
          await logger.warn(`⏳ レート制限のため${rateLimitCheck.waitTime}秒待機中...`);
          await sleep(rateLimitCheck.waitTime!);
        }
        
        const sourceUrl = `${config.sources.clippingshare.base_url}${entry.id}`;
        const targetUrl = entry.like_url!;
        
        await logger.info(`📤 clipping送信準備: ${entry.id}`);
        await logger.debug(`   ソース: ${sourceUrl}`);
        await logger.debug(`   ターゲット: ${targetUrl}`);
        
        if (!isDryRun) {
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
          
          if (result.success) {
            totalSent++;
            await logger.success(`clippingshareエントリ送信成功: ${entry.id}`);
          } else {
            await logger.failure(`clippingshareエントリ送信失敗: ${entry.id}`, result.error_message);
          }
        } else {
          await logger.info(`🔍 [DRY RUN] clippingshareエントリ送信予定: ${entry.id}`);
          await logger.debug(`   [DRY RUN] ソース: ${sourceUrl}`);
          await logger.debug(`   [DRY RUN] ターゲット: ${targetUrl}`);
        }
        
        // レート制限対応の待機
        await sleep(60 / config.rate_limit.requests_per_minute);
      }
    }
    
    // 履歴を保存
    if (!isDryRun) {
      await saveWebmentionHistory(HISTORY_FILE, history);
      await logger.info(`💾 履歴保存完了`);
    }
    
    await logger.info(`🎉 Webmention送信完了: ${totalSent}件送信`);
    
  } catch (error) {
    await logger.error(`エラーが発生しました: ${error.message}`);
    await logger.debug(`スタックトレース: ${error.stack}`);
    Deno.exit(1);
  }
}

/**
 * ブログ更新告知の処理（将来の拡張用）
 */
function _processBlogUpdates(
  _config: WebmentionConfig,
  _history: WebmentionHistory,
  _isDryRun: boolean
): Promise<number> {
  // TODO: ブログ更新の検出ロジックを実装
  // 現在はプレースホルダー
  return Promise.resolve(0);
}

// スクリプト実行
if (import.meta.main) {
  main();
}
