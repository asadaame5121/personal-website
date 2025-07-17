export const pagefind = false;
export const layout = "new_layouts/ArticleLayout.jsx";
export const title = "Daily Log";

import Dailylog from "../_components/dailylog.jsx";

export default async function DailylogPage() {
  const dailylogComponent = await Dailylog({ showAll: true });
  return <>{dailylogComponent}</>;
}
