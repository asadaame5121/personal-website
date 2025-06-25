// dailylog.jsx: Obsidianデイリーノートの「きょうのメモ」一覧をJSXで表示
// Markdown→HTML変換（必要ならnpm:marked等に差し替え可）
// markdown-itでMarkdown→HTML変換（リンク・太字等対応）
let mdParser = null;
async function md2html(md) {
  if (!mdParser) {
    const mdmod = (await import("https://esm.sh/markdown-it@13.0.1?bundle"));
    mdParser = new mdmod.default();
  }
  return mdParser.render(md);
}

export default async function Dailylog() {
  // dailylog.mdのパスをLumeのdataディレクトリに合わせて調整
  let raw = "";
  try {
    raw = await Deno.readTextFile("./data/dailylog.md");
  } catch (e) {
    return <div>dailylog.mdが読めません: {e.message}</div>;
  }
  // "## YYYY-MM-DDのメモ" で分割し、各ブロックの先頭行から日付を抽出
  const blocks = raw.split(/^##\s*(\d{4}-\d{2}-\d{2})のメモ.*$/m).slice(1);
  const entries = [];
  for (let i = 0; i < blocks.length; i += 2) {
    // blocks[i] = 日付, blocks[i+1] = 本文
    entries.push({ date: blocks[i], body: blocks[i + 1]?.trim() ?? "" });
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

  // JSX内でawaitを使わず、事前にHTML化
  const htmlEntries = await Promise.all(
    show.map(async (e) => ({
      ...e,
      html: await md2html(e.body)
    }))
  );

  return (
    <div class="daily-log">
      <div class="current-date">{todayStr}</div>
      <div class="obsidian-logs">
        {htmlEntries.length === 0 ? (
          <div>きょう・きのうのメモはありません</div>
        ) : (
          htmlEntries.map(e => (
            <div class="log-entry" key={e.date}>
              <div class="log-date">{e.date}</div>
              <div class="log-content" dangerouslySetInnerHTML={{ __html: e.html }}></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
