export const layout = "category-list.njk";

export default function* ({ nav }) {
  const categoryUrl = "/Glossary/";
  const categoryName = "Glossary";
  yield {
    url: "/Glossary/",
    categoryUrl,
    categoryName,
  };
}
