// clipping-list.jsx: ObsidianのClippingsフォルダ内の各mdファイルから「ファイル名」とフロントマターのsourceプロパティを抽出し、data/clippingshare.mdに保存（Deno用）
// Markdown→HTML変換（必要ならnpm:marked等に差し替え可）
function md2html(md) {
  // 超簡易変換（必要に応じて拡張）
  return md.replace(/\n/g, '<br>');
}

export default async function ClippingList() {
  // dailylog.mdのパスをLumeのdataディレクトリに合わせて調整
  let raw = "";
  try {
    raw = await Deno.readTextFile("./data/clippingshare.md");
  } catch (e) {
    return <div>clippingshare.mdが読めません: {e.message}</div>;
  }
  // 文頭のYYYY-MM-DDをdatetimeとして抽出 
  const blocks = raw.split(/^\s*(\d{4}-\d{2}-\d{2})\s*$/m).slice(1);
  const entries = [];
  for (let i = 0; i < blocks.length; i += 2) {
    // blocks[i] = 日付, blocks[i+1] = 本文
    entries.push({ date: blocks[i], body: blocks[i + 1]?.trim() ?? "" });
  }
  // datetimeでソートし、最新10件を表示
  const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
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
  const show = sorted.filter(e => e.date === todayStr || e.date === yestStr);

  return <div class="clipping-list">
    <div class="clippings">
      {show.length === 0 ? <div>きょう・きのうのメモはありません</div> :
        show.map(e => <div class="clipping" key={e.date}>
          <div class="clipping-date">{e.date}</div>
          <div class="clipping-content" dangerouslySetInnerHTML={{ __html: md2html(e.body) }}></div>
        </div>)}
    </div>
  </div>;
}
