#!/usr/bin/env -S deno run --allow-read --allow-net --allow-write

import { extractULikeOfLinksFromHtml } from './html-parser.ts';
import { WebmentionLogger } from './webmention-logger.ts';

const logger = new WebmentionLogger();

async function testClippingshareParser() {
  logger.info('=== Clippingshare Parser Test ===');
  
  try {
    // ローカルファイルをテスト
    const localFilePath = 'c:\\Users\\Yudai\\personal-website\\_site\\clippingshare\\index.html';
    logger.info(`ローカルファイルをテスト: ${localFilePath}`);
    
    const localHtml = await Deno.readTextFile(localFilePath);
    logger.info(`HTML読み込み完了: ${localHtml.length} 文字`);
    
    const uLikeOfEntries = extractULikeOfLinksFromHtml(localHtml);
    logger.info(`u-like-ofリンク抽出結果: ${uLikeOfEntries.length} 件`);
    
    // 結果を詳細表示
    uLikeOfEntries.forEach((entry, index) => {
      logger.info(`--- Entry ${index + 1} ---`);
      logger.info(`URL: ${entry.url}`);
      logger.info(`Title: ${entry.title}`);
      if (entry.comment) {
        logger.info(`Comment: ${entry.comment}`);
      }
      logger.info('');
    });
    
    // リモートURLもテスト
    logger.info('--- リモートURLテスト ---');
    const remoteUrl = 'http://localhost:3002/clippingshare/';
    logger.info(`リモートURL: ${remoteUrl}`);
    
    try {
      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const remoteHtml = await response.text();
      logger.info(`リモートHTML読み込み完了: ${remoteHtml.length} 文字`);
      
      const remoteEntries = extractULikeOfLinksFromHtml(remoteHtml);
      logger.info(`リモートu-like-ofリンク抽出結果: ${remoteEntries.length} 件`);
      
      // ローカルとリモートの結果比較
      if (uLikeOfEntries.length === remoteEntries.length) {
        logger.info('✓ ローカルとリモートの結果件数が一致');
      } else {
        logger.warning(`⚠ 結果件数が異なります: ローカル=${uLikeOfEntries.length}, リモート=${remoteEntries.length}`);
      }
      
    } catch (error) {
      logger.error(`リモートURL取得エラー: ${error.message}`);
    }
    
  } catch (error) {
    logger.error(`テスト実行エラー: ${error.message}`);
  }
  
  logger.info('=== テスト完了 ===');
}

if (import.meta.main) {
  await testClippingshareParser();
}
