export const layout = "layout-article.jsx";

export default function* ({ search }) {
  // 全ページからtagsを集めてユニーク化
  const allPages = search.pages();
  const tagSet = new Set();
  for (const page of allPages) {
    if (Array.isArray(page.tags)) {
      for (const tag of page.tags) tagSet.add(tag);
    }
  }
  const tags = Array.from(tagSet).sort();
  const content = `
    <h2 class="text-xl font-bold mb-4">タグ一覧</h2>
    <ul class="menu bg-base-100 rounded-box">
      ${tags.map(tag =>
        `<li class="menu-item"><a href="/tags/${encodeURIComponent(tag)}/">${tag}</a></li>`
      ).join("")}
    </ul>
  `;
  yield {
    url: "/tags/",
    tags,
    title: "タグ一覧",
    content,
    layout: "layout-article.jsx",
  };
}
