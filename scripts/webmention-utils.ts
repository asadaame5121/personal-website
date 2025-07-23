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
 * Webmentionエンドポイント発見結果
 */
export interface WebmentionEndpointDiscoveryResult {
  endpoints: string[]; // 複数候補
  methods: string[];   // 検出方法（"http-header"/"html-link"/"html-a"）
  errors?: string[];
}

/**
 * W3C仕様に基づいてWebmentionエンドポイントを発見
 * https://www.w3.org/TR/2017/REC-webmention-20170112/#sender-discovers-receiver-webmention-endpoint
 */
export async function discoverWebmentionEndpoint(targetUrl: string): Promise<WebmentionEndpointDiscoveryResult> {
  try {
    console.log(`Webmentionエンドポイント発見開始: ${targetUrl}`);
    const endpoints: string[] = [];
    const methods: string[] = [];
    const errors: string[] = [];
    // ターゲットURLをフェッチ（リダイレクト追従）
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Webmention Discovery Bot (https://asadaame5121.net/)'
      },
      redirect: 'follow'
    });
    if (!response.ok) {
      return {
        endpoints: [],
        methods: [],
        errors: [`HTTP ${response.status}: ${response.statusText}`]
      };
    }
    // 1. HTTPヘッダーを厳密に全候補抽出
    const linkHeader = response.headers.get('Link');
    if (linkHeader) {
      const headerEndpoints = parseAllLinkHeadersForWebmention(linkHeader);
      for (const ep of headerEndpoints) {
        endpoints.push(resolveUrl(ep, response.url));
        methods.push('http-header');
      }
    }
    // 2. HTMLコンテンツを厳密に全候補抽出
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      const html = await response.text();
      // <link rel="webmention">複数候補
      const linkEndpoints = extractAllWebmentionFromHtmlLink(html);
      for (const ep of linkEndpoints) {
        endpoints.push(resolveUrl(ep, response.url));
        methods.push('html-link');
      }
      // <a rel="webmention">複数候補
      const aEndpoints = extractAllWebmentionFromHtmlA(html);
      for (const ep of aEndpoints) {
        endpoints.push(resolveUrl(ep, response.url));
        methods.push('html-a');
      }
    }
    if (endpoints.length > 0) {
      console.log(`Webmentionエンドポイント候補: ${endpoints.join(', ')} (methods: ${methods.join(', ')})`);
      return { endpoints, methods };
    }
    console.log(`Webmentionエンドポイントが見つかりませんでした: ${targetUrl}`);
    return {
      endpoints: [],
      methods: [],
      errors: ['not-found']
    };
  } catch (error) {
    console.error(`Webmentionエンドポイント発見エラー: ${error.message}`);
    return {
      endpoints: [],
      methods: [],
      errors: [error.message]
    };
  }
}

/**
 * HTTPのLinkヘッダーからWebmentionエンドポイントを抽出
 */
// 複数候補を厳格に抽出（rel="webmention"完全一致のみ）
function parseAllLinkHeadersForWebmention(linkHeader: string): string[] {
  // Link: <https://example.com/webmention>; rel="webmention"
  // 複数のリンクがある場合: Link: <url1>; rel="foo", <url2>; rel="webmention"
  const result: string[] = [];
  const links = linkHeader.split(',');
  for (const link of links) {
    const trimmedLink = link.trim();
    // rel属性が完全にwebmentionのみ、またはスペース区切りでwebmentionを含む場合
    const match = trimmedLink.match(/^<([^>]+)>;\s*rel=("|')?([^"';]+)("|')?/i);
    if (match) {
      const url = match[1];
      const rels = match[3].split(/\s+/);
      if (rels.includes('webmention')) {
        result.push(url);
      }
    }
  }
  return result;
}

function parseLinkHeaderForWebmention(linkHeader: string): string | null {
  // Link: <https://example.com/webmention>; rel="webmention"
  // Link: <https://example.com/webmention>; rel=webmention
  // 複数のリンクがある場合: Link: <url1>; rel="foo", <url2>; rel="webmention"
  
  const links = linkHeader.split(',');
  for (const link of links) {
    const trimmedLink = link.trim();
    // <URL>; rel="webmention" または <URL>; rel=webmention の形式をチェック
    const match = trimmedLink.match(/^<([^>]+)>;\s*rel=["']?webmention["']?/i);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * HTMLの<link>要素からWebmentionエンドポイントを抽出
 */
// <link rel="webmention">をすべて厳格に抽出
function extractAllWebmentionFromHtmlLink(html: string): string[] {
  const results: string[] = [];
  // rel属性がwebmentionを含む<link>すべてを抽出
  const linkRegex = /<link[^>]*rel=["']([^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html))) {
    const rels = match[1].split(/\s+/);
    if (rels.includes('webmention')) {
      results.push(match[2]);
    }
  }
  // hrefが先に来る場合も考慮
  const linkRegex2 = /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']([^"']*)["'][^>]*>/gi;
  while ((match = linkRegex2.exec(html))) {
    const rels = match[2].split(/\s+/);
    if (rels.includes('webmention')) {
      results.push(match[1]);
    }
  }
  return results;
}

function extractWebmentionFromHtmlLink(html: string): string | null {
  // <link rel="webmention" href="https://example.com/webmention">
  const linkRegex = /<link[^>]+rel=["']?[^"']*webmention[^"']*["']?[^>]*href=["']([^"']+)["'][^>]*>/i;
  const match = html.match(linkRegex);
  if (match) {
    return match[1];
  }
  
  // href が先に来る場合も考慮
  const linkRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']?[^"']*webmention[^"']*["']?[^>]*>/i;
  const match2 = html.match(linkRegex2);
  if (match2) {
    return match2[1];
  }
  
  return null;
}

/**
 * HTMLの<a>要素からWebmentionエンドポイントを抽出
 */
// <a rel="webmention">をすべて厳格に抽出
function extractAllWebmentionFromHtmlA(html: string): string[] {
  const results: string[] = [];
  // rel属性がwebmentionを含む<a>すべてを抽出
  const aRegex = /<a[^>]*rel=["']([^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = aRegex.exec(html))) {
    const rels = match[1].split(/\s+/);
    if (rels.includes('webmention')) {
      results.push(match[2]);
    }
  }
  // hrefが先に来る場合も考慮
  const aRegex2 = /<a[^>]*href=["']([^"']+)["'][^>]*rel=["']([^"']*)["'][^>]*>/gi;
  while ((match = aRegex2.exec(html))) {
    const rels = match[2].split(/\s+/);
    if (rels.includes('webmention')) {
      results.push(match[1]);
    }
  }
  return results;
}

function extractWebmentionFromHtmlA(html: string): string | null {
  // <a rel="webmention" href="https://example.com/webmention">Webmention</a>
  const aRegex = /<a[^>]+rel=["']?[^"']*webmention[^"']*["']?[^>]*href=["']([^"']+)["'][^>]*>/i;
  const match = html.match(aRegex);
  if (match) {
    return match[1];
  }
  
  // href が先に来る場合も考慮
  const aRegex2 = /<a[^>]+href=["']([^"']+)["'][^>]*rel=["']?[^"']*webmention[^"']*["']?[^>]*>/i;
  const match2 = html.match(aRegex2);
  if (match2) {
    return match2[1];
  }
  
  return null;
}

/**
 * 相対URLを絶対URLに変換
 */
function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch (error) {
    console.warn(`URL解決エラー: ${url} (base: ${baseUrl}) - ${error.message}`);
    return url; // フォールバック
  }
}

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
 * W3C仕様に準拠したWebmention送信（エンドポイント発見機能付き）
 */
export async function sendWebmention(
  sourceUrl: string,
  targetUrl: string,
  config: WebmentionConfig,
  history?: WebmentionHistory,
  historyType?: 'dailylog' | 'clippingshare' | 'blog_updates',
  entryId?: string
): Promise<WebmentionSendResult> {
  // 複数エンドポイント順次試行対応

  const startTime = new Date().toISOString();
  
  // まずWebmentionエンドポイントを発見
  console.log(`Webmention送信開始: ${sourceUrl} -> ${targetUrl}`);
  const discovery = await discoverWebmentionEndpoint(targetUrl);
  if (!discovery.endpoints || discovery.endpoints.length === 0) {
    const errorMessage = `Webmentionエンドポイントが見つかりません: ${targetUrl} (${discovery.errors?.join(',') || 'エンドポイント未対応'})`;
    console.warn(`❌ ${errorMessage}`);
    if (history && historyType && entryId) {
      appendWebmentionHistory(history, historyType, {
        id: entryId,
        source: sourceUrl,
        target: targetUrl,
        result: {
          success: false,
          error_message: errorMessage,
          sent_at: startTime
        }
      });
    }
    return {
      success: false,
      error_message: errorMessage,
      sent_at: startTime
    };
  }
  // 複数候補順次試行
  for (let i = 0; i < discovery.endpoints.length; i++) {
    const endpoint = discovery.endpoints[i];
    const method = discovery.methods[i] || '';
    for (let attempt = 1; attempt <= config.rate_limit.retry_attempts; attempt++) {
      try {
        console.log(`Webmention送信試行 ${attempt}/${config.rate_limit.retry_attempts}: ${sourceUrl} -> ${targetUrl} (endpoint: ${endpoint}, method: ${method})`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Webmention Sender (https://asadaame5121.net/)'
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
          console.log(`✅ Webmention送信成功: ${response.status} (endpoint: ${endpoint})`);
          if (history && historyType && entryId) {
            appendWebmentionHistory(history, historyType, {
              id: entryId,
              source: sourceUrl,
              target: targetUrl,
              result
            });
          }
          return result;
        } else {
          const errorText = await response.text();
          result.error_message = `HTTP ${response.status}: ${errorText}`;
          console.warn(`❌ Webmention送信失敗: ${result.error_message}`);
          if (attempt < config.rate_limit.retry_attempts) {
            console.log(`${config.rate_limit.retry_delay_seconds}秒後にリトライします...`);
            await sleep(config.rate_limit.retry_delay_seconds);
          } else if (i === discovery.endpoints.length - 1) {
            if (history && historyType && entryId) {
              appendWebmentionHistory(history, historyType, {
                id: entryId,
                source: sourceUrl,
                target: targetUrl,
                result
              });
            }
            return result;
          } else {
            // 次のエンドポイントへ
            break;
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
        } else if (i === discovery.endpoints.length - 1) {
          if (history && historyType && entryId) {
            appendWebmentionHistory(history, historyType, {
              id: entryId,
              source: sourceUrl,
              target: targetUrl,
              result
            });
          }
          return result;
        } else {
          // 次のエンドポイントへ
          break;
        }
      }
    }
  }
  // すべて失敗
  const finalResult: WebmentionSendResult = {
    success: false,
    error_message: "すべてのWebmentionエンドポイントで送信失敗",
    sent_at: startTime
  };
  if (history && historyType && entryId) {
    appendWebmentionHistory(history, historyType, {
      id: entryId,
      source: sourceUrl,
      target: targetUrl,
      result: finalResult
    });
  }
  return finalResult;
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
 * Webmention履歴にエントリを追加
 */
function appendWebmentionHistory(
  history: WebmentionHistory,
  type: 'dailylog' | 'clippingshare' | 'blog_updates',
  data: { id: string; source: string; target: string; result: WebmentionSendResult }
) {
  const { id, source, target, result } = data;
  const base = {
    source_url: source,
    target_url: target,
    sent_at: result.sent_at,
    status: result.success ? 'success' : 'failed',
    response_code: result.response_code,
    error_message: result.error_message
  } as const;

  switch (type) {
    case 'dailylog':
      history.sent_webmentions.dailylog.push({
        entry_id: id,
        ...base
      });
      break;
    case 'clippingshare':
      history.sent_webmentions.clippingshare.push({
        clip_id: id,
        ...base
      });
      break;
    case 'blog_updates':
      history.sent_webmentions.blog_updates.push({
        update_id: id,
        ...base,
        bridgy_url: '', // placeholder if needed
        post_url: '',
        post_title: '',
        update_comment: '',
        format: 'note'
      } as any);
      break;
  }
}

/**
 * 新しいdailylogエントリを検出（HTML解析版）
 */
export async function detectNewDailylogEntries(
  dataFilePath: string,
  history: WebmentionHistory,
  baseUrl: string
): Promise<DailylogEntry[]> {
  try {
    console.log(`[detectNewDailylogEntries] (json版) called with dataFilePath: ${dataFilePath}, baseUrl: ${baseUrl}`);
    const content = await Deno.readTextFile(dataFilePath);
    const dailylogData = JSON.parse(content);
    const sentEntryIds = new Set(history.sent_webmentions.dailylog.map(w => w.entry_id));
    const newEntries: DailylogEntry[] = [];

    for (const entry of dailylogData) {
      const entryId = entry.id;
      if (!entryId) {
        console.warn(`⚠️ id未定義のエントリをスキップ: ${JSON.stringify(entry)}`);
        continue;
      }
      if (!sentEntryIds.has(entryId)) {
        // URL生成仕様: https://asadaame5121.net/dailylog/#entry-${id}
        const entryUrl = `${baseUrl.replace(/\/$/, '')}/#entry-${entryId}`;
        newEntries.push({
          id: entryId,
          content: entry.content,
          timestamp: entry.datetime,
          links: [entryUrl]
        });
        console.log(`✅ 新規dailylogエントリ: ${entryId} → ${entryUrl}`);
      } else {
        console.log(`⏭️ 送信済みdailylogエントリをスキップ: ${entryId}`);
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
        
        // UUIDベースの新形式（id）を使用
        const entryId = entry.id || entry.filename;
        if (entryId && !sentClipIds.has(entryId)) {
          // urlまたはsourceからURLを抽出
          const sourceUrl = entry.url || entry.source || '';
          if (sourceUrl) {
            console.log(`✅ 新しいclipping検出: ${entryId}`);
            console.log(`   URL: ${sourceUrl}`);
            newEntries.push({
              id: entryId,
              title: entry.title || (entry.filename ? entry.filename.replace('.md', '') : ''),
              url: sourceUrl,
              like_url: sourceUrl,
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
