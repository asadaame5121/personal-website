export const layout = "layout-article.jsx"; // 全ページ共通のフロントマター

export default function* ({ search }) {
  const tags = search.values("tags"); // 全タグを収集
  for (const tag of tags) {
    const links = search.pages(tag as string, "date=desc").map((page) =>
      `<div><a href="${page.url}">${page.title}</a></div>`
    );
    yield {
      // ページ別のフロントマター
      title: `${tag}のページ一覧`,
      url: `/tags/${tag}/`,
      // ページコンテンツ
      content: links.join("")
    };
  }
}