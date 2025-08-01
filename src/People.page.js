export const layout = "category-list.njk";

export default function* ({ nav }) {
  const categoryUrl = "/People/";
  const categoryName = "People";
  yield {
    url: "/People/",
    categoryUrl,
    categoryName,
    title: "People",
  };
}
