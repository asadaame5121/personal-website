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
  // external_data ディレクトリに配置した JSON を読み込む
  let raw = "";
  try {
    raw = await Deno.readTextFile("./external_data/clippingshare.json");
  } catch (e) {
    return <div>clippingshare.json が読めません: {e.message}</div>;
  }

  // JSON を配列としてパース
  let entries = [];
  try {
    entries = JSON.parse(raw);
  } catch (e) {
    return <div>JSON のパースに失敗しました: {e.message}</div>;
  }

  // 先頭 20 件のみ表示 (必要であれば調整)
  const top20 = entries.slice(0, 20);

  // コメント欄は簡易 Markdown → HTML 変換 (改行のみ対応)
  const mdParser = { render: md2html };

  // UI構成：
  // - 1件もなければ「クリッピングがありません」と表示
  // - あればul/liで上位5件リスト表示。本文はMarkdown→HTML変換してli内に描画
  // - dangerouslySetInnerHTMLはXSSリスクがあるが、信頼できる自作データのみを対象とする前提
  return (
    <div class="p-4 max-w-xl mx-auto">
      {top20.length === 0 ? (
        <div class="alert alert-info">クリッピングがありません</div>
      ) : (
        <ul class="space-y-4">
          {top20.map((item) => (
            <li class="not-prose card bg-base-100 shadow-md" key={item.id}>
              <div class="card-body p-4 space-y-2">
                <a href={item.url || "#"} class="u-like-of link link-primary text-lg font-semibold" target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
                {item.source && (
                  <div class="text-sm opacity-70">{item.source}</div>
                )}
                {item.comment && (
                  <div class="prose max-w-none" dangerouslySetInnerHTML={{ __html: mdParser.render(item.comment) }}></div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
