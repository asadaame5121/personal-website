// dailylog.jsx: Obsidianデイリーノートの「きょうのメモ」一覧をJSXで表示
let mdParser = null;

async function md2html(md) {
  if (!mdParser) {
    const mdmod = (await import("https://esm.sh/markdown-it@13.0.1?bundle"));
    const MarkdownIt = mdmod.default;
    
    // 簡易wikilinkプラグイン
    function wikilinkPlugin(md) {
      md.inline.ruler.before('emphasis', 'wikilink', function wikilink(state, silent) {
        const start = state.pos;
        if (state.src.slice(start, start + 2) !== '[[') return false;
        
        const end = state.src.indexOf(']]', start + 2);
        if (end === -1) return false;
        
        if (!silent) {
          const content = state.src.slice(start + 2, end);
          const [page, alias] = content.split('|');
          
          const token = state.push('link_open', 'a', 1);
          token.attrs = [['data-wikilink', encodeURIComponent(page.trim())]];
          
          const textToken = state.push('text', '', 0);
          textToken.content = alias ? alias.trim() : page.trim();
          
          state.push('link_close', 'a', -1);
        }
        
        state.pos = end + 2;
        return true;
      });
    }
    
    mdParser = new MarkdownIt();
    mdParser.use(wikilinkPlugin);
  }
  return mdParser.render(md);
}

export default async function Dailylog({ showAll = false } = {}) {
  // データ読み込み
  let entries = [];
  try {
    const raw = await Deno.readTextFile("./external_data/dailylog.json");
    entries = JSON.parse(raw);
  } catch (_e) {
    return <div class="alert alert-error">データの読み込みに失敗しました</div>;
  }

  // エントリをフィルタリング
  let filteredEntries;
  
  if (showAll) {
    // 全件表示の場合
    filteredEntries = entries
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  } else {
    // 今日・昨日のエントリのみ表示
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yestStr = yesterday.toISOString().split('T')[0];
    
    filteredEntries = entries
      .filter(e => {
        const entryDate = e.datetime.split('T')[0];
        return entryDate === todayStr || entryDate === yestStr;
      })
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  }

  // HTML変換
  const htmlEntries = await Promise.all(
    filteredEntries.map(async (e) => ({
      ...e,
      html: await md2html(e.content),
      displayDate: new Date(e.datetime).toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))
  );

  return (
    <div class="p-4 max-w-xl mx-auto">
      <div class="text-lg font-bold mb-2 badge badge-primary">Daily Log</div>
      <div class="space-y-4">
        {htmlEntries.length === 0 ? (
          <div class="alert alert-info">きょう・きのうのメモはありません</div>
        ) : (
          htmlEntries.map(e => (
            <article class="h-entry card bg-base-100 shadow-md" key={e.id} id={`entry-${e.id}`}>
              <div class="card-body p-4">
                <time class="card-title text-base-content/80 text-sm mb-1" 
                      datetime={e.datetime}>
                  {e.displayDate}
                </time>
                <div class="e-content prose max-w-none" 
                     dangerouslySetInnerHTML={{ __html: e.html }}></div>
                <a href="https://fed.brid.gy/" hidden="from-humans"></a>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
