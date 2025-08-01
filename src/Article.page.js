export const layout = "category-list.njk";

export default function* ({ nav }) {
  const categoryUrl = "/Article/";
  const categoryName = "Article";
  yield {
    url: "/Article/",
    categoryUrl,
    categoryName,
    title: "Article",
  };
}
