// タグ一覧ページの本文部分（レイアウトはlayout-article.jsxを利用）
export default function TagsIndexContent({ tags }) {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">タグ一覧</h2>
      <ul className="menu bg-base-100 rounded-box">
        {tags.map((tag) => (
          <li className="menu-item" key={tag}>
            <a href={`/tags/${encodeURIComponent(tag)}/`}>{tag}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
