// HTML解析機能の単体テスト

import { extractHEntriesFromLocalFile, fetchHtmlContent, extractHEntriesFromHtml } from './html-parser.ts';
import { WebmentionLogger } from './webmention-logger.ts';

async function testHtmlParser() {
  const logger = new WebmentionLogger();
  
  try {
    logger.info('🧪 HTML解析機能テスト開始');
    
    // 1. ローカルサーバーURLテスト
    const localhostUrl = 'http://localhost:3002/dailylog/';
    const baseUrl = 'http://localhost:3002/dailylog';
    
    logger.info(`テスト対象URL: ${localhostUrl}`);
    logger.info(`ベースURL: ${baseUrl}`);
    
    // ローカルサーバーからHTML取得
    logger.info('ローカルサーバーからHTML取得中...');
    const html = await fetchHtmlContent(localhostUrl);
    logger.info(`HTML取得完了: ${html.length}文字`);
    
    // 2. HTML解析実行
    logger.info('HTML解析実行中...');
    const entries = extractHEntriesFromHtml(html, baseUrl);
    
    logger.success(`HTML解析完了: ${entries.length}件のh-entry検出`);
    
    if (entries.length === 0) {
      logger.warn('h-entryが検出されませんでした。HTMLファイルの構造を確認してください。');
      
      // HTMLコンテンツの内容を確認
      const hasHEntry = html.includes('h-entry');
      const hasArticle = html.includes('<article');
      const hasHEntryClass = html.includes('class="h-entry"') || html.includes("class='h-entry'");
      const hasHEntryInClass = html.includes('h-entry');
      
      logger.debug('HTMLコンテンツ内容確認:', {
        hasHEntry,
        hasArticle,
        hasHEntryClass,
        hasHEntryInClass,
        contentLength: html.length,
        firstHEntryIndex: html.indexOf('h-entry'),
        firstArticleIndex: html.indexOf('<article')
      });
      
      // HTMLの最初の100文字をログ出力
      logger.debug('HTML開始部分:', html.substring(0, 200));
      
      // h-entryを含む行を抽出
      const lines = html.split('\n');
      const hEntryLines = lines.filter(line => line.includes('h-entry')).slice(0, 3);
      if (hEntryLines.length > 0) {
        logger.debug('h-entryを含む行:', hEntryLines);
      }
    } else {
      // 各エントリの詳細情報をログ出力
      entries.forEach((entry, index) => {
        logger.info(`エントリ ${index + 1}:`, {
          id: entry.id,
          datetime: entry.datetime,
          linkCount: entry.links.length,
          sourceUrl: entry.sourceUrl,
          firstLink: entry.links.length > 0 ? entry.links[0] : 'なし',
          content: entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : ''),
          allLinks: entry.links
        });
      });
    }
    
    logger.info('HTML解析テスト完了');
    
  } catch (error) {
    logger.error(`HTML解析テストエラー: ${error.message}`);
    logger.error(`エラースタック: ${error.stack}`);
  }
  
  // 2. リモートHTMLページのテスト
  logger.info('\n2. リモートHTMLページテスト');
  try {
    const dailylogUrl = `${baseUrl}/dailylog/`;
    logger.info(`取得URL: ${dailylogUrl}`);
    
    const html = await fetchHtmlContent(dailylogUrl);
    logger.info(`HTML取得完了: ${html.length}文字`);
    
    const remoteEntries = extractHEntriesFromHtml(html, baseUrl);
    logger.success(`リモート解析完了: ${remoteEntries.length}件のh-entry検出`);
    
    if (remoteEntries.length > 0) {
      logger.info('最初のエントリ詳細:');
      const first = remoteEntries[0];
      logger.info(`  ID: ${first.id}`);
      logger.info(`  日時: ${first.datetime}`);
      logger.info(`  リンク数: ${first.links.length}`);
      logger.info(`  ソースURL: ${first.sourceUrl}`);
      
      if (first.links.length > 0) {
        logger.info(`  リンク: ${first.links.slice(0, 3).join(', ')}${first.links.length > 3 ? '...' : ''}`);
      }
    }
    
  } catch (error) {
    logger.error(`リモート取得失敗: ${error.message}`);
  }
  
  logger.info('\n🧪 HTML解析機能テスト完了');
}

if (import.meta.main) {
  await testHtmlParser();
}
