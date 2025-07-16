// ReadingList.jsx: 現在読んでいる本を一覧表示
// Lume の search ヘルパーを利用し "📚/読んでる" を含むページを取得してリスト化する

export default function ReadingList({ search }) {
  // search ヘルパーが渡されない場合は何も描画しない（ビルドエラー防止）
  if (!search) {
    return null;
  }
  const readingBooks = search.pages("📚/読んでる");
  if (!readingBooks || readingBooks.length === 0) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">現在読んでいる本</h2>
        <div className="alert alert-warning">現在読んでいる本は見つかりません。</div>
      </div>
    );
  }
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">現在読んでいる本</h2>
      <ul className="menu bg-base-100 rounded-box">
        {readingBooks.map((book) => (
          <li className="menu-item" key={book.url}>
            <a href={book.url}>{book.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
