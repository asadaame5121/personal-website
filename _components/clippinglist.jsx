// clipping-list.jsx: ObsidianのClippingsフォルダ内の各mdファイルから「ファイル名」とフロントマターのsourceプロパティを抽出し、data/clippingshare.mdに保存（Deno用）
// このコンポーネントはWebサイト上でクリッピング一覧を表示するためのもの。
// clippingshare.mdは事前に外部スクリプトで生成されている前提。

// Markdown→HTML変換用の関数。
// 現状は改行のみ<br>タグに変換する超簡易実装。
// 必要に応じてnpm:marked等の本格的なMarkdownパーサに置き換え可能。
function md2html(md) {
  // Markdownの改行をHTMLの<br>に変換するだけ。
  // 太字やリンク等は未対応なので、必要なら拡張すること。
  return md.replace(/\n/g, '<br>');
}

export default async function ClippingList() {
  // dailylog.mdのパスをLumeのdataディレクトリに合わせて調整
  let raw = "";
  try {
    raw = await Deno.readTextFile("./src/clippingshare.md");
  } catch (e) {
    return <div>clippingshare.mdが読めません: {e.message}</div>;
  }
  
    // clippingshare.mdの内容を「日付＋本文」のペアで抽出する。
  // 例: 2025-03-27 16:49\n本文...\n\n2025-03-28 10:12\n本文...
  // 正規表現で日付部分(YYYY-MM-DD hh:mm)をキャプチャし、splitで分割。
  // splitの結果は [日付1, 本文1, 日付2, 本文2, ...] のような配列になる。
  // slice(1)で最初の空要素を除去。
  const lines = raw.split('\n').filter(line => line.trim() !== "");
  const entries = lines.map(line => {
    const m = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})(.*)$/);
    return m
      ? { date: m[1], body: m[2].trim() }
      : { date: "", body: line.trim() };
  });
  // const blocks = raw.split(/^\s*(\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2})\s*$/m).slice(1);
  // // entries配列に {date, body} オブジェクトとして格納。
  // // 2つずつ取り出すことで、日付と本文のペアを作る。
  // const entries = [];
  // for (let i = 0; i < blocks.length - 1; i += 2) {
  //   // blocks[i]: 日付文字列, blocks[i+1]: 本文
  //   // 本文がundefinedの場合は空文字列にする。
  //   entries.push({ date: blocks[i].trim(), body: (blocks[i + 1] || "").trim() });
  // }
  // // ※もしblocksの長さが奇数の場合、最後の本文がない日付は無視する（データ不整合防止）。

  // markdown-itを使ってMarkdown→HTML変換（リンク・太字等対応）
  // Deno向け: esm.sh経由でimport
  // import MarkdownIt from "npm:markdown-it"; // Deno v1.39+ならこれも可
  let md;
  try {
    // 動的import（Deno用）
    md = (await import("https://esm.sh/markdown-it@13.0.1?bundle"))?.default;
  } catch (e) {
    return <div>markdown-itの読み込みに失敗: {e.message}</div>;
  }
  const mdParser = new md();

  // entries配列を日付（新しい順）でソートし、上位5件のみ抽出
  const top5 = entries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // UI構成：
  // - 1件もなければ「クリッピングがありません」と表示
  // - あればul/liで上位5件リスト表示。本文はMarkdown→HTML変換してli内に描画
  // - dangerouslySetInnerHTMLはXSSリスクがあるが、信頼できる自作データのみを対象とする前提
  return (
    <div className="p-4 max-w-xl mx-auto">
  <div className="">
    {top5.length === 0 ? (
      <div className="alert alert-info">クリッピングがありません</div>
    ) : (
      <ul className="space-y-4">
        {top5.map(e => (
          <li className="card bg-base-100 shadow-md mb-4" key={e.date + e.body.slice(0,20)}>
            <div className="card-body p-4">
              <div className="badge badge-accent mb-2">{e.date}</div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: mdParser.render(e.body) }}></div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
  );
}


