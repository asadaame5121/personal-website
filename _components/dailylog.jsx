// dailylog.jsx: Obsidianデイリーノートの「きょうのメモ」一覧をJSXで表示
// Markdown→HTML変換（必要ならnpm:marked等に差し替え可）
function md2html(md) {
  // 超簡易変換（必要に応じて拡張）
  return md.replace(/\n/g, '<br>');
}

export default async function Dailylog() {
  // dailylog.mdのパスをLumeのdataディレクトリに合わせて調整
  let raw = "";
  try {
    raw = await Deno.readTextFile("./data/dailylog.md");
  } catch (_) {
    return <div class="daily-log-error">No dailylog found.</div>;
  }
  // ## YYYY-MM-DDのメモ で分割
  const regex = /##\s(\d{4}-\d{2}-\d{2})のメモ[\r\n]+([\s\S]*?)(?=^##\s\d{4}-\d{2}-\d{2}のメモ|\Z)/gm;
  const entries = [];
  let match;
  while ((match = regex.exec(raw)) !== null) {
    entries.push({ date: match[1], body: match[2].trim() });
  }
  // 今日・昨日のみ表示
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  const yyy = yest.getFullYear();
  const mmm = String(yest.getMonth() + 1).padStart(2, '0');
  const ddd = String(yest.getDate()).padStart(2, '0');
  const yestStr = `${yyy}-${mmm}-${ddd}`;
  const show = entries.filter(e => e.date === todayStr || e.date === yestStr);
  return <div class="daily-log">
    <div class="current-date">{todayStr}</div>
    <div class="obsidian-logs">
      {show.length === 0 ? <div>きょう・きのうのメモはありません</div> :
        show.map(e => <div class="log-entry" key={e.date}>
          <div class="log-date">{e.date}</div>
          <div class="log-content" dangerouslySetInnerHTML={{ __html: md2html(e.body) }}></div>
        </div>)}
    </div>
  </div>;
}
