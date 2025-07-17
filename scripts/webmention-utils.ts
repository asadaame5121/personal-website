// Webmention送信ユーティリティ関数

import type {
  WebmentionHistory,
  WebmentionConfig,
  WebmentionSendResult,
  DailylogEntry,
  ClippingEntry,
  BlogPost as _BlogPost,
  DailylogWebmention as _DailylogWebmention,
  ClippingWebmention as _ClippingWebmention,
  BlogUpdateWebmention as _BlogUpdateWebmention
} from './webmention-types.ts';

import { extractHEntriesFromLocalFile, fetchHtmlContent, extractHEntriesFromHtml } from './html-parser.ts';

/**
 * Webmention履歴JSONファイルを読み込み
 */
export async function loadWebmentionHistory(filePath: string): Promise<WebmentionHistory> {
  try {
    const content = await Deno.readTextFile(filePath);
    return JSON.parse(content);
  } catch (error) {
    console.warn(`履歴ファイルの読み込みに失敗: ${error.message}`);
    // デフォルト履歴を返す
    return {
      version: "1.0",
      last_updated: new Date().toISOString(),
      sent_webmentions: {
        dailylog: [],
        clippingshare: [],
        blog_updates: []
      }
    };
  }
}

/**
 * Webmention履歴JSONファイルを保存
 */
export async function saveWebmentionHistory(filePath: string, history: WebmentionHistory): Promise<void> {
  history.last_updated = new Date().toISOString();
  await Deno.writeTextFile(filePath, JSON.stringify(history, null, 2));
}

/**
 * 設定ファイルを読み込み
 */
export async function loadWebmentionConfig(filePath: string): Promise<WebmentionConfig> {
  const content = await Deno.readTextFile(filePath);
  return JSON.parse(content);
}

/**
 * 指定した秒数待機
 */
export async function sleep(seconds: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * レート制限を考慮したWebmention送信
 */
export async function sendWebmention(
  sourceUrl: string,
  targetUrl: string,
  config: WebmentionConfig
): Promise<WebmentionSendResult> {
  const startTime = new Date().toISOString();
  
  for (let attempt = 1; attempt <= config.rate_limit.retry_attempts; attempt++) {
    try {
      console.log(`Webmention送信試行 ${attempt}/${config.rate_limit.retry_attempts}: ${sourceUrl} -> ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          source: sourceUrl,
          target: targetUrl
        })
      });

      const result: WebmentionSendResult = {
        success: response.ok,
        response_code: response.status,
        sent_at: startTime
      };

      if (response.ok) {
        console.log(`✅ Webmention送信成功: ${response.status}`);
        return result;
      } else {
        const errorText = await response.text();
        result.error_message = `HTTP ${response.status}: ${errorText}`;
        console.warn(`❌ Webmention送信失敗: ${result.error_message}`);
        
        if (attempt < config.rate_limit.retry_attempts) {
          console.log(`${config.rate_limit.retry_delay_seconds}秒後にリトライします...`);
          await sleep(config.rate_limit.retry_delay_seconds);
        } else {
          return result;
        }
      }
    } catch (error) {
      const result: WebmentionSendResult = {
        success: false,
        error_message: error.message,
        sent_at: startTime
      };
      
      console.error(`❌ Webmention送信エラー: ${error.message}`);
      
      if (attempt < config.rate_limit.retry_attempts) {
        console.log(`${config.rate_limit.retry_delay_seconds}秒後にリトライします...`);
        await sleep(config.rate_limit.retry_delay_seconds);
      } else {
        return result;
      }
    }
  }

  return {
    success: false,
    error_message: "最大リトライ回数に達しました",
    sent_at: startTime
  };
}

/**
 * Bridgy向けWebmention送信
 */
export async function sendToBridgy(
  sourceUrl: string,
  bridgyEndpoint: string,
  config: WebmentionConfig
): Promise<WebmentionSendResult> {
  return await sendWebmention(sourceUrl, bridgyEndpoint, config);
}

/**
 * 新しいdailylogエントリを検出（HTML解析版）
 */
export async function detectNewDailylogEntries(
  _dataFilePath: string,
  history: WebmentionHistory,
  baseUrl: string
): Promise<DailylogEntry[]> {
  try {
    console.log('🔍 dailylogページからh-entryを抽出中...');
    
    const sentEntryIds = new Set(history.sent_webmentions.dailylog.map(w => w.entry_id));
    const newEntries: DailylogEntry[] = [];
    
    // 方法1: ローカルの生成済みHTMLファイルから抽出
    const localHtmlPath = '_site/dailylog/index.html';
    let hEntries = await extractHEntriesFromLocalFile(localHtmlPath, baseUrl);
    
    // ローカルファイルがない場合はリモートから取得
    if (hEntries.length === 0) {
      console.log('🌐 リモートからdailylogページを取得中...');
      const dailylogUrl = `${baseUrl.replace(/\/$/, '')}/dailylog/`;
      const html = await fetchHtmlContent(dailylogUrl);
      hEntries = extractHEntriesFromHtml(html, baseUrl);
    }
    
    console.log(`📊 検出したh-entry数: ${hEntries.length}件`);
    
    // 未送信かつリンクを含むエントリをフィルタリング
    for (const hEntry of hEntries) {
      const entryId = hEntry.id;
      
      if (!sentEntryIds.has(entryId) && hEntry.links.length > 0) {
        console.log(`✅ 新しいエントリ検出: ${entryId}`);
        console.log(`   コンテンツ: ${hEntry.content.substring(0, 100)}...`);
        console.log(`   リンク数: ${hEntry.links.length}`);
        console.log(`   リンク: ${hEntry.links.join(', ')}`);
        
        newEntries.push({
          id: entryId,
          content: hEntry.content,
          timestamp: hEntry.datetime,
          links: hEntry.links
        });
      } else if (sentEntryIds.has(entryId)) {
        console.log(`⏭️ 送信済みエントリをスキップ: ${entryId}`);
      } else if (hEntry.links.length === 0) {
        console.log(`⏭️ リンクなしエントリをスキップ: ${entryId}`);
      }
    }
    
    return newEntries;
  } catch (error) {
    console.error(`dailylogエントリ検出エラー: ${error.message}`);
    return [];
  }
}

/**
 * 新しいclippingshareエントリを検出
 */
export async function detectNewClippingEntries(
  dataFilePath: string,
  history: WebmentionHistory,
  _baseUrl: string,
  maxEntries?: number
): Promise<ClippingEntry[]> {
  try {
    const content = await Deno.readTextFile(dataFilePath);
    const clippingData = JSON.parse(content);
    
    const sentClipIds = new Set(history.sent_webmentions.clippingshare.map(w => w.clip_id));
    const newEntries: ClippingEntry[] = [];
    
    // 実際のclippingshare.json構造: [{filename, source, created}]
    if (Array.isArray(clippingData)) {
      console.log(`📊 clippingshareデータ総数: ${clippingData.length}件`);
      if (maxEntries) {
        console.log(`🔢 テストモード: 最大${maxEntries}件まで処理`);
      }
      
      let processedCount = 0;
      let addedCount = 0;
      
      for (const entry of clippingData) {
        // 件数制限チェック
        if (maxEntries && addedCount >= maxEntries) {
          console.log(`🔢 最大件数(${maxEntries})に達したため処理を終了`);
          break;
        }
        
        // filenameをIDとして使用
        const entryId = entry.filename;
        if (entryId && !sentClipIds.has(entryId)) {
          // sourceからURLを抽出（引用符を除去）
          const sourceUrl = entry.source ? entry.source.replace(/"/g, '') : '';
          
          if (sourceUrl) {
            console.log(`✅ 新しいclipping検出: ${entryId}`);
            console.log(`   URL: ${sourceUrl}`);
            
            newEntries.push({
              id: entryId,
              title: entry.filename.replace('.md', ''), // .mdを除去してタイトルとする
              url: sourceUrl,
              like_url: sourceUrl, // clippingshareの場合、元URLがlike対象
              timestamp: entry.created || new Date().toISOString()
            });
            addedCount++;
          }
          processedCount++;
        } else if (sentClipIds.has(entryId)) {
          // 送信済みのログは最初の数件のみ表示
          if (processedCount < 5) {
            console.log(`⏭️ 送信済みclippingをスキップ: ${entryId}`);
          }
          processedCount++;
        }
      }
      
      console.log(`📊 処理対象clippingエントリ: ${addedCount}件 (確認数: ${processedCount}件)`);
    }
    
    return newEntries;
  } catch (error) {
    console.error(`clippingshareエントリ検出エラー: ${error.message}`);
    return [];
  }
}

/**
 * ブログ更新告知用のh-entry HTMLを生成
 */
export function generateUpdateEntryHtml(
  postUrl: string,
  postTitle: string,
  comment: string,
  updateId: string
): string {
  const timestamp = new Date().toISOString();
  const displayTime = new Date().toLocaleString('ja-JP');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ブログ記事更新</title>
</head>
<body>
  <article class="h-entry" id="${updateId}">
    <div class="p-content">
      ${escapeHtml(comment)}
      <a href="${postUrl}">${escapeHtml(postTitle)}</a>
    </div>
    <time class="dt-published" datetime="${timestamp}">${displayTime}</time>
    <a class="p-author h-card" href="https://asadaame5121.net">Yudai Asada</a>
  </article>
</body>
</html>`;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * HTMLからリンクを抽出
 */
function _extractLinksFromHtml(html: string): string[] {
  const links: string[] = [];
  
  // <a href="...">タグからリンクを抽出
  const linkPattern = /<a[^>]*href="([^"]*)"/g;
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    // HTTPリンクのみを対象とする
    if (href.startsWith('http://') || href.startsWith('https://')) {
      links.push(href);
    }
  }
  
  return [...new Set(links)]; // 重複を除去
}

/**
 * コンテンツからリンクを抽出
 */
function _extractLinksFromContent(content: string): string[] {
  const links: string[] = [];
  
  // URLパターンをマッチ
  const urlPattern = /https?:\/\/[^\s]+/g;
  const matches = content.match(urlPattern);
  
  if (matches) {
    links.push(...matches);
  }
  
  return links;
}

/**
 * レート制限遅延
 */
export async function rateLimitDelay(seconds: number): Promise<void> {
  console.log(`⏳ ${seconds}秒待機中...`);
  await sleep(seconds);
}

/**
 * 一意な更新IDを生成
 */
export function generateUpdateId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 3);
  return `update-${date}-${random}`;
}

/**
 * 送信済みかどうかをチェック
 */
export function isAlreadySent(
  entryId: string,
  type: 'dailylog' | 'clippingshare' | 'blog_updates',
  history: WebmentionHistory
): boolean {
  const sentList = history.sent_webmentions[type];
  return sentList.some((entry: { entry_id?: string; clip_id?: string; update_id?: string }) => 
    entry.entry_id === entryId || 
    entry.clip_id === entryId || 
    entry.update_id === entryId
  );
}

/**
 * レート制限チェック
 */
export function checkRateLimit(
  history: WebmentionHistory,
  config: WebmentionConfig
): { canSend: boolean; waitTime?: number } {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  
  const recentSends = [
    ...history.sent_webmentions.dailylog,
    ...history.sent_webmentions.clippingshare,
    ...history.sent_webmentions.blog_updates
  ].filter(entry => new Date(entry.sent_at) > oneMinuteAgo);
  
  if (recentSends.length >= config.rate_limit.requests_per_minute) {
    const oldestRecent = recentSends.reduce((oldest, current) => 
      new Date(current.sent_at) < new Date(oldest.sent_at) ? current : oldest
    );
    const waitTime = Math.ceil((new Date(oldestRecent.sent_at).getTime() + 60 * 1000 - now.getTime()) / 1000);
    return { canSend: false, waitTime };
  }
  
  return { canSend: true };
}
