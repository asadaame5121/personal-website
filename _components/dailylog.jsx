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
    raw = await Deno.readTextFile("./src/dailylog.md");
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

  // 同じ日付のセクションが複数ある場合は最初のものだけ採用
  const uniqMap = new Map();
  for (const e of entries) {
    if (!uniqMap.has(e.date)) {
      uniqMap.set(e.date, e);
    }
  }
  const uniqEntries = Array.from(uniqMap.values());

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
  const show = uniqEntries.filter(e => e.date === todayStr || e.date === yestStr);

  // JSX内でawaitを使わず、事前にHTML化
  const htmlEntries = await Promise.all(
    show.map(async (e) => ({
      ...e,
      html: await md2html(e.body)
    }))
  );

  return (
    <div class="p-4 max-w-xl mx-auto">
  <div class="text-lg font-bold mb-2 badge badge-primary">{todayStr}</div>
  <div class="space-y-4">
    {htmlEntries.length === 0 ? (
      <div class="alert alert-info">きょう・きのうのメモはありません</div>
    ) : (
      htmlEntries.map(e => (
        <div class="card bg-base-100 shadow-md" key={e.date}>
          <div class="card-body p-4">
            <div class="card-title text-base-content/80 text-sm mb-1">{e.date}</div>
            <div class="prose max-w-none" dangerouslySetInnerHTML={{ __html: e.html }}></div>
          </div>
        </div>
      ))
    )}
  </div>
</div>
  );
}
