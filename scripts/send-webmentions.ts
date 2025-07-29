#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

// Webmention送信メインスクリプト

import type {
  WebmentionHistory,
  WebmentionConfig,
  DailylogWebmention,
  ClippingWebmention,
  BlogUpdateWebmention
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
  console.log('send-webmentions start');
  const isDryRun = Deno.args.includes('--dry-run');
  
  logger.info('Webmention送信スクリプト開始');
  logger.info(`モード: ${isDryRun ? 'DRY RUN (テスト)' : '本番送信'}`);
  
  try {
    const config = await loadWebmentionConfig(CONFIG_FILE);
    const history = await loadWebmentionHistory(HISTORY_FILE);
    
    logger.info(`設定読み込み完了 - dailylog:${config.sources.dailylog.enabled ? 'ON' : 'OFF'}, clipping:${config.sources.clippingshare.enabled ? 'ON' : 'OFF'}`);
    logger.info(`履歴: dailylog=${history.sent_webmentions.dailylog.length}, clipping=${history.sent_webmentions.clippingshare.length}, blog=${history.sent_webmentions.blog_updates.length}`);
    
    let totalSent = 0;
    
    // ブログ更新の処理（feed.jsonからの記事抽出）
    if (config.sources.blog_updates?.enabled) {
      const blogUpdatesSent = await _processBlogUpdates(config, history, isDryRun);
      totalSent += blogUpdatesSent;
    }
    
    // dailylogエントリの処理
    if (config.sources.dailylog.enabled) {
      logger.info('📅 dailylog処理中...');
      
      const newDailylogEntries = await detectNewDailylogEntries(
        config.sources.dailylog.data_file,
        history,
        config.sources.dailylog.base_url
      );
      
      logger.info(`dailylog: ${newDailylogEntries.length}件の新エントリ`);
      console.log(`[debug] dailylog: ${newDailylogEntries.length}件の新エントリ`);
      console.log('[debug] newDailylogEntries:', JSON.stringify(newDailylogEntries, null, 2));
      
      for (const entry of newDailylogEntries) {
        const sourceUrl = `${config.sources.dailylog.base_url}#entry-${entry.id}`;
        const targetUrl = config.endpoints.bridgy_fed;
        
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
        config.sources.clippingshare.data_file,
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
/**
 * feed.jsonから新着記事を抽出し、Webmention送信
 */
async function _processBlogUpdates(
  config: WebmentionConfig,
  history: WebmentionHistory,
  isDryRun: boolean
): Promise<number> {
  logger.info('📰 ブログ更新処理中...');
  
  // feed.jsonの公開URLから取得
  const feedUrl = config.sources.blog_updates?.feed_url || 'https://asadaame5121.net/feed.json';
  logger.info(`フィードURL: ${feedUrl}`);
  
  try {
    // feed.jsonを取得
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`フィード取得エラー: ${response.status} ${response.statusText}`);
    }
    
    const feedData = await response.json();
    if (!feedData.items || !Array.isArray(feedData.items)) {
      throw new Error('フィードの形式が不正です');
    }
    
    logger.info(`フィード取得成功: ${feedData.items.length}件の記事`);
    
    // 送信先（bridgy_fed）
    const targetUrl = config.endpoints.bridgy_fed;
    
    // 送信済み記事を確認するための関数
    const isAlreadySentBlogUpdate = (sourceUrl: string, title: string): boolean => {
      const encodedSourceUrl = sourceUrl;
      const encodedTitle = title;
      
      return history.sent_webmentions.blog_updates.some(item => {
        return item.source_url === encodedSourceUrl && 
               item.title === encodedTitle && 
               item.target_url === targetUrl;
      });
    };
    
    // 処理する記事数を制限（設定またはデフォルト10件）
    const maxEntries = config.sources.blog_updates?.max_entries || 10;
    let processedCount = 0;
    let sentCount = 0;
    
    // 先頭から順に処理（新しい記事順）
    for (const item of feedData.items) {
      if (processedCount >= maxEntries) break;
      
      const sourceUrl = item.url;
      const title = item.title;
      
      if (!sourceUrl || !title) {
        logger.warn('URLまたはタイトルがない記事をスキップ');
        continue;
      }
      
      processedCount++;
      
      // 既に送信済みかチェック
      if (isAlreadySentBlogUpdate(sourceUrl, title)) {
        logger.info(`[スキップ] 送信済み: ${title}`);
        continue;
      }
      
      logger.info(`📤 送信準備: ${title}`);
      logger.debug(`   ソース: ${sourceUrl}`);
      logger.debug(`   ターゲット: ${targetUrl}`);
      
      if (!isDryRun) {
        // レート制限チェック
        const rateLimitCheck = checkRateLimit(history, config);
        if (!rateLimitCheck.canSend) {
          logger.warn(`⏳ レート制限のため${rateLimitCheck.waitTime}秒待機中...`);
          await sleep(rateLimitCheck.waitTime!);
        }
        
        // Webmention送信
        const result = await sendWebmention(sourceUrl, targetUrl, config);
        
        // 履歴に追加
        const webmention: BlogUpdateWebmention = {
          entry_id: `blog-${new Date().getTime()}`,
          source_url: sourceUrl,
          title: title,
          target_url: targetUrl,
          sent_at: new Date().toISOString(),
          status: result.success ? 'success' : 'failed',
          error_message: result.error_message
        };
        
        history.sent_webmentions.blog_updates.push(webmention);
        sentCount++;
        
        if (result.success) {
          logger.success(`ブログ記事 ${title}`);
        } else {
          logger.failure(`ブログ記事 ${title}`, result.error_message);
        }
      } else {
        logger.info(`[DRY RUN] ブログ記事: ${title}`);
        sentCount++; // DRY RUNでもカウント
      }
    }
    
    logger.info(`ブログ更新処理完了: ${processedCount}件処理, ${sentCount}件送信`);
    return sentCount;
  } catch (error) {
    logger.error(`ブログ更新処理エラー: ${error.message}`);
    return 0;
  }
}

// スクリプト実行
if (import.meta.main) {
  main();
}
