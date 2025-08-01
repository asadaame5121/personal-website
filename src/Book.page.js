export const layout = "category-list.njk";

export default function* ({ nav }) {
  const categoryUrl = "/Book/";
  const categoryName = "Book";
  yield {
    url: "/Book/",
    outputPath: "/Book/index.html",
    categoryUrl,
    categoryName,
    title: "Book",
    content: "書籍一覧のトップページです。",
  };
}
