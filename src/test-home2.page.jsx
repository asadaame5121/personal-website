// テスト用トップページテンプレート v2
// HomeLayout の子として ReadingList / DailyLog / ClippingList を配置

export const layout = "../_includes/new_layouts/HomeLayout.jsx"; // この JSX 自体が最上位レイアウト
export const url = "/test-home2/";
export const title = "テスト Home v2";
import DailyLog from "../_components/dailylog.jsx";
import ClippingList from "../_components/clippinglist.jsx";
import ReadingList from "../_components/ReadingList.jsx";
import CardContainer from "../_components/CardContainer.jsx";
import SmallCardGrid from "../_components/SmallCardComponents.jsx";

export default function TestHome2({ search }) {
  return (
    <>
      <SmallCardGrid className="my-8">
      <CardContainer title="Reading List">
        <ReadingList search={search} />
      </CardContainer>
      
      <CardContainer title="Daily Log">
        <DailyLog />
      </CardContainer>
      </SmallCardGrid>

    <CardContainer title="Clippingshare" className="my-8">
        <ClippingList />
      </CardContainer>
    </>
  
  );
}
