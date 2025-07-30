import BaseHead from "../../_components/new_components/BaseHead.jsx";
import SiteHeader from "../../_components/new_components/SiteHeader.jsx";
import SiteFooter from "../../_components/new_components/SiteFooter.jsx";

// ベースレイアウト: 全ページ共通で <html> ラッパーを提供
export default function BaseLayout({ title, url, headExtra = null, children }) {
  return (
    <>
      <html lang="ja">
        <BaseHead title={title} url={url} extra={headExtra} />
        <body className="bg-mono-white text-mono-darkgray flex flex-col min-h-screen">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </body>
      </html>
    </>
  );
}
