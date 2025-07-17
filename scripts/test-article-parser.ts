#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

import { extractExternalLinksFromArticle } from './html-parser.ts';
import { WebmentionLogger } from './webmention-logger.ts';

async function testArticleParser() {
  const logger = new WebmentionLogger();
  
  try {
    logger.info('=== Article外部リンク抽出テスト開始 ===');
    
    // テスト対象のArticleファイル
    const testFiles = [
      '_site/Article/なにを記録するのか？.html',
      '_site/Article/ロギング仕事術の要点.html',
      '_site/Article/トインビー・ブーム.html'
    ];
    
    for (const filePath of testFiles) {
      logger.info(`\n--- ${filePath} のテスト ---`);
      
      try {
        const html = await Deno.readTextFile(filePath);
        logger.info(`HTML読み込み完了: ${html.length} 文字`);
        
        const externalLinks = extractExternalLinksFromArticle(html);
        logger.info(`外部リンク抽出結果: ${externalLinks.length} 件`);
        
        if (externalLinks.length > 0) {
          logger.info('抽出された外部リンク:');
          externalLinks.forEach((link, index) => {
            logger.info(`  ${index + 1}. ${link.title}`);
            logger.info(`     URL: ${link.url}`);
            logger.info(`     Context: ${link.context}`);
          });
        } else {
          logger.info('外部リンクは見つかりませんでした');
        }
        
        // 結果をファイルに出力
        const outputFileName = `article-links-${filePath.split('/').pop()?.replace('.html', '')}.txt`;
        const results = externalLinks.map((link, i) => {
          return `${i+1}. ${link.title}\n   URL: ${link.url}\n   Context: ${link.context}\n`;
        }).join('\n');
        
        await Deno.writeTextFile(outputFileName, results);
        logger.info(`結果を${outputFileName}に出力しました`);
        
      } catch (error) {
        logger.error(`${filePath}の処理でエラー: ${error.message}`);
      }
    }
    
    logger.info('\n=== Article外部リンク抽出テスト完了 ===');
    
  } catch (error) {
    logger.error(`テスト実行エラー: ${error.message}`);
  }
}

if (import.meta.main) {
  await testArticleParser();
}
