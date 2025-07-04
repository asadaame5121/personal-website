export const layout = "category-list.njk";

export default function* ({ nav }) {
  const categoryUrl = "/Book/";
  const categoryName = "Book";
  yield {
    url: "/Book/",
    categoryUrl,
    categoryName,
  };
}
