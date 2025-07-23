// HTML解析ユーティリティ - h-entryリンク抽出用

/**
 * HTMLからh-entryエントリを抽出
 */
export interface HEntryData {
  id: string;
  datetime: string;
  content: string;
  links: string[];
  sourceUrl: string;
}

/**
 * HTMLコンテンツからh-entryを抽出
 */
export function extractHEntriesFromHtml(html: string, baseUrl: string): HEntryData[] {
  const entries: HEntryData[] = [];
  
  // 簡易的なHTML解析（正規表現ベース）
  const hEntryPattern = /<article[^>]*class="[^"]*h-entry[^"]*"[^>]*id=([^\s>]+)[^>]*>(.*?)<\/article>/gs;
  
  let match;
  while ((match = hEntryPattern.exec(html)) !== null) {
    const [, id, entryHtml] = match;
    
    // dt-publishedから日時を抽出
    const datetimeMatch = entryHtml.match(/<time[^>]*class="[^"]*dt-published[^"]*"[^>]*datetime="([^"]*)"[^>]*>/);
    const datetime = datetimeMatch ? datetimeMatch[1] : '';
    
    // e-contentからコンテンツを抽出（より柔軟なパターン）
    const contentMatch = entryHtml.match(/<div[^>]*class="[^"]*e-content[^"]*"[^>]*>(.*?)(?=<\/div>|$)/s);
    const contentHtml = contentMatch ? contentMatch[1] : entryHtml;
    
    // HTMLからプレーンテキストを抽出
    const content = stripHtmlTags(contentHtml);
    
    // リンクを抽出
    const links = extractLinksFromHtml(contentHtml);
    
    // エントリIDからソースURLを構築
    const sourceUrl = `${baseUrl}#${id}`;
    
    if (id && datetime) {
      entries.push({
        id,
        datetime,
        content,
        links,
        sourceUrl
      });
    }
  }
  
  return entries;
}

/**
 * clippingshareページからu-like-ofリンクを抽出する関数
 */
/**
 * Articleページから外部リンクを抽出する
 * @param html HTMLコンテンツ
 * @returns 外部リンクの配列
 */
export function extractExternalLinksFromArticle(html: string): Array<{
  url: string;
  title: string;
  context?: string;
}> {
  const entries: Array<{
    url: string;
    title: string;
    context?: string;
  }> = [];

  try {
    // article要素内のe-content部分を抽出
    const articleMatch = html.match(/<article[^>]*class="[^"]*h-entry[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
    if (!articleMatch) {
      return entries;
    }

    const articleContent = articleMatch[1];
    
    // e-content部分を抽出
    const contentMatch = articleContent.match(/<div[^>]*class="[^"]*e-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (!contentMatch) {
      return entries;
    }

    const eContent = contentMatch[1];
    
    // 外部リンクを抽出（http/httpsで始まるリンク）
    const linkRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]*)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(eContent)) !== null) {
      const url = match[1];
      const title = match[2].trim() || url;
      
      // 内部リンクを除外（自サイトのドメインを含む場合）
      if (!url.includes('localhost') && !url.includes('asadaame5121.net')) {
        entries.push({
          url,
          title,
          context: 'article-content'
        });
      }
    }
    
  } catch (error) {
    console.error('Articleページの外部リンク抽出でエラー:', error);
  }

  return entries;
}

/**
 * clippingshareページからu-like-ofリンクを抽出する関数
 */
export function extractULikeOfLinksFromHtml(html: string): Array<{
  url: string;
  title: string;
  comment?: string;
}> {
  const entries: Array<{ url: string; title: string; comment?: string }> = [];
  
  // u-like-ofクラスを持つリンクを抽出
  const likeOfPattern = /<a[^>]*class="[^"]*u-like-of[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let match;
  
  while ((match = likeOfPattern.exec(html)) !== null) {
    const [fullMatch, url, title] = match;
    
    // このリンクを含むliタグ全体を取得してコメントを探す
    const liStartIndex = html.lastIndexOf('<li class="not-prose card', match.index);
    const liEndIndex = html.indexOf('</li>', match.index);
    
    if (liStartIndex !== -1 && liEndIndex !== -1) {
      const liContent = html.substring(liStartIndex, liEndIndex);
      
      // コメント部分を抽出（prose max-w-noneクラスを持つdiv）
      const commentMatch = liContent.match(/<div class="prose max-w-none">([^<]+)<\/div>/);
      const comment = commentMatch ? commentMatch[1].trim() : undefined;
      
      entries.push({ url, title: title.trim(), comment });
    } else {
      // liタグが見つからない場合でも基本情報は保存
      entries.push({ url, title: title.trim() });
    }
  }
  
  return entries;
}

/**
 * HTMLからリンクを抽出
 */
function extractLinksFromHtml(html: string): string[] {
  const links: string[] = [];
  
  // <a href="...">タグからリンクを抽出
  const linkPattern = /<a[^>]*href="([^"]*)"[^>]*>/g;
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
 * HTMLタグを除去してプレーンテキストを取得
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // HTMLタグを除去
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // 連続する空白を1つにまとめる
    .trim();
}

/**
 * URLからHTMLコンテンツを取得
 */
export async function fetchHtmlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`HTML取得エラー: ${url} - ${error.message}`);
    throw error;
  }
}

/**
 * ローカルHTMLファイルからh-entryを抽出
 */
export async function extractHEntriesFromLocalFile(filePath: string, baseUrl: string): Promise<HEntryData[]> {
  try {
    const html = await Deno.readTextFile(filePath);
    return extractHEntriesFromHtml(html, baseUrl);
  } catch (error) {
    console.error(`ローカルファイル読み込みエラー: ${filePath} - ${error.message}`);
    return [];
  }
}
