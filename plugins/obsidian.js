/**
 * Obsidianスタイルのウィキリンクとコールアウトをサポートするプラグイン
 */

// ウィキリンクの正規表現
const wikiLinkRegex = /\[\[(.*?)(?:\|(.*?))?\]\]/g;

/**
 * ウィキリンクをHTMLリンクに変換する
 * @param {string} content マークダウンコンテンツ
 * @returns {string} 変換後のコンテンツ
 */
function processWikiLinks(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }
  return content.replace(wikiLinkRegex, (_match, link, text) => {
    const displayText = text || link;
    // スペースをハイフンに変換し、.htmlを追加
    const url = link.replace(/\s+/g, '-').toLowerCase() + '.html';
    return `<a href="/${url}" class="wiki-link">${displayText}</a>`;
  });
}

/**
 * コールアウトをHTMLに変換する
 * @param {string} content マークダウンコンテンツ
 * @returns {string} 変換後のコンテンツ
 */
function processCallouts(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }
  
  // 正規表現を改善
  const calloutPattern = /^>\s*\[!(\w+)\](.*)(?:\r?\n>\s*(.*))*$/gm;
  
  // コールアウトを検出して処理
  let result = content;
  let match;
  const matches = [];
  
  // すべてのマッチを見つける
  while ((match = calloutPattern.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      type: match[1],
      title: match[2] ? match[2].trim() : '',
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }
  
  // 後ろから処理して置換（インデックスがずれないように）
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    
    // コールアウトの内容を抽出
    const lines = content.substring(m.startIndex, m.endIndex).split('\n');
    
    // 各行から > を削除
    const contentLines = lines.slice(1).map(line => line.replace(/^\s*>\s*/, '')).join('\n');
    
    // コールアウトのHTMLを生成
    const html = `<div class="callout callout-${m.type.toLowerCase()}">
      <div class="callout-title">
        ${m.title || m.type}
      </div>
      <div class="callout-content">
        ${contentLines}
      </div>
    </div>`;
    
    // 元のコンテンツを置換
    result = result.substring(0, m.startIndex) + html + result.substring(m.endIndex);
  }
  
  return result;
}

/**
 * Lumeプラグイン
 */
export default function() {
  return (site) => {
    // マークダウンファイルの処理前にフック
    site.preprocess([".md"], (pages) => {
      pages.forEach(page => {
        // コンテンツを取得
        let content = page.content;
        
        // コンテンツが存在する場合のみ処理
        if (content && typeof content === 'string') {
          // ウィキリンクの処理
          content = processWikiLinks(content);
          
          // コールアウトの処理
          content = processCallouts(content);
          
          // 処理後のコンテンツを設定
          page.content = content;
        }
      });
    });
    
    // スタイルシートの追加
    site.addEventListener("beforeBuild", () => {
      // レイアウトにスタイルシートを追加
      site.data.obsidianStyles = true;
    });
  };
}
