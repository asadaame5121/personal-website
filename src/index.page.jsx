// トップページ（DropGarden）
export const layout = "../_includes/new_layouts/HomeLayout.jsx";
export const title = "DropGarden";
export const url = "/";
export const description = "DropGardenは、あさだあめが日々の気づきや読書記録、クリッピングをまとめるデジタルガーデンです。知的探究や創作の過程を公開し、誰もが自由に巡れる知識の庭を目指しています。";
import DailyLog from "../_components/dailylog.jsx";
import ClippingList from "../_components/clippinglist.jsx";
import ReadingList from "../_components/ReadingList.jsx";
import CardContainer from "../_components/CardContainer.jsx";
import SmallCardGrid from "../_components/SmallCardComponents.jsx";


export default function IndexPage({ search }) {
  return (
    <>
    <CardContainer>
        <p>ここはドロップガーデン。<a href="/about">あさだあめ</a>が、日々の記録やアイデア、読書記録などを整理・共有するための個人的なデジタルガーデンです。</p>
        <p>主に以下のような内容を整理・共有しています。</p>
        <ul>
          <li><a href="/Article/">Article</a>カテゴリ:自分の書いたメモ、文章など、ブログとしての運用が主です。このカテゴリ限定のRSSは→
  <a href="/article-updates.rss" style={{ fontSize: '0.85em', marginLeft: '0.4em', verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }} aria-label="Articleカテゴリ専用RSS">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.15em' }} aria-hidden="true"><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4v3c7.18 0 13 5.82 13 13h3C20 10.06 13.94 4 4 4z"/><path d="M4 11v3c3.86 0 7 3.14 7 7h3c0-5.52-4.48-10-10-10z"/></svg>
    RSS
  </a>
</li>
          <li><a href="/Book/">Book</a>カテゴリ: 読んだ本について</li>
          <li><a href="/Glossary/">Glossary</a>カテゴリ:自分用の語彙集</li>
          <li><a href="/People/">People</a>カテゴリ:自分用の人名辞典</li>
        </ul>
      </CardContainer>
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

