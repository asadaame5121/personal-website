import BaseLayout from "./BaseLayout.jsx";
import DrawerMenu from "../../_components/new_components/DrawerMenu.jsx";
import SearchBox from "../../_components/new_components/SearchBox.jsx";
import AuthorCard from "../../_components/AuthorCard.jsx";

export default function HomeLayout({
  title = "DropGarden",
  url,
  date,
  category,
  tags,
  author = "asadaame",
  children,
  comp,
}) {
  return (
    <BaseLayout
      title={title}
      headExtra={<link rel="syndication" href="https://bsky.app/profile/asadaame5121.bsky.social" />}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* モバイル Drawer */}
          <DrawerMenu id="drawer-nav">
            <SearchBox id="search" />
            {comp?.nav && <comp.nav />}
          </DrawerMenu>

          {/* メイン グリッド */}
          <main className="flex-1">
            {/* microformats for home page */}
            <article className="h-entry">
              <a
                className="u-url"
                href={url || "https://asadaame5121.net/"}
                style={{ display: "none" }}
                tabIndex={-1}
              >
                {url || "https://asadaame5121.net/"}
              </a>
              {date && (
                <time
                  className="dt-published"
                  dateTime={new Date(date).toISOString()}
                  style={{ display: "none" }}
                  tabIndex={-1}
                >
                  {new Date(date).toLocaleDateString("ja-JP")}
                </time>
              )}
              {title && title !== "DropGarden" && (
                <h1 className="p-name text-2xl font-bold mb-4">{title}</h1>
              )}

              {/* カテゴリーバッジ */}
              {category && (
                <div className="mb-4">
                  <a
                    href={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
                    className="badge badge-secondary"
                  >
                    {category}
                  </a>
                </div>
              )}

              {/* タイル / コンテンツ */}
              <div className="e-content">{children}</div>

              {/* タグ */}
              {tags && tags.length > 0 && (
                <div className="tags mt-6">
                  {tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/tags/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      className="badge badge-outline mr-1"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              )}

              {/* 著者 */}
              <AuthorCard blogAuthorID={author} display />
            </article>
          </main>

          {/* 右サイド */}
          <aside className="hidden lg:block flex-none lg:w-1/5">
            <div className="card bg-base-100 shadow-md p-4">
              <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">
                サイド
              </h2>
              <div className="space-y-4">
                {comp?.resentPages && <comp.resentPages />}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </BaseLayout>
  );
}
