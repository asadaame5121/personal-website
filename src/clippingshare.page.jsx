export const pagefind = false;
export const layout = "new_layouts/ArticleLayout.jsx";
export const title = "Clippingshare";

import ClippingList from "../_components/clippinglist.jsx";

export default async function Clippingshare() {
  const list = await ClippingList();
  return <>{list}</>;
}
