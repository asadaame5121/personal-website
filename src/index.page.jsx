// トップページ（DropGarden）
export const layout = "../_includes/new_layouts/HomeLayout.jsx";
export const title = "DropGarden";
export const url = "/";
import DailyLog from "../_components/dailylog.jsx";
import ClippingList from "../_components/clippinglist.jsx";
import ReadingList from "../_components/ReadingList.jsx";
import CardContainer from "../_components/CardContainer.jsx";
import SmallCardGrid from "../_components/SmallCardComponents.jsx";
import AuthorCard from "../_components/AuthorCard.jsx";

export default function IndexPage({ search }) {
  return (
    <>
      <AuthorCard />
      <div className="prose max-w-none mb-8">
        <p>ここはドロップガーデン。日々の記録やアイデア、読書記録などを整理・共有するための個人的なデジタルガーデンです。</p>
      </div>
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

