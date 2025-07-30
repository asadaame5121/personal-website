import BaseLayout from "./BaseLayout.jsx";
import AuthorCard from "../../_components/AuthorCard.jsx";
import DrawerMenu from "../../_components/new_components/DrawerMenu.jsx";
import BaseHead from "../../_components/new_components/BaseHead.jsx";

function renderToc(toc) {
  if (!Array.isArray(toc) || toc.length === 0) return null;
  return (
    <ul>
      {toc.map((item) => (
        <li key={item.slug}>
          <a href={`#${item.slug}`}>{item.text}</a>
          {item.children && item.children.length > 0 && (
            <ul>
              {item.children.map((child) => (
                <li key={child.slug}>
                  <a href={`#${child.slug}`}>{child.text}</a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ArticleLayout({
  title,
  content,
  date,
  category,
  tags,
  blogAuthorID = "asadaame",
  previousPost,
  nextPost,
  children,
  comp,
  url,
  toc,
  bluesky,
  page,
}) {
  return (
    <>
      <BaseLayout title={title} url={page.data.url}>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* モバイル Drawer */}
            <DrawerMenu id="drawer-nav">
              {comp?.nav && <comp.nav />}
          </DrawerMenu>

          {/* メインカラム */}
          <main className="flex-1">
            <div className="card bg-base-100 shadow-md p-6">
              <article className="h-entry">
                {title && (
                  <h1 className="text-3xl font-bold mb-4">
                    <a className="p-name u-url" href={url}>
                      {title}
                    </a>
                  </h1>
                )}

                {date && (
                  <div className="post-date mb-2">
                    <time
                      className="dt-published"
                      dateTime={new Date(date).toISOString()}
                    >
                      {new Date(date).toLocaleString("ja-JP", {
                        timeZone: "Asia/Tokyo",
                      })}
                    </time>
                  </div>
                )}

                {/* PC ToC */}
                {Array.isArray(toc) && toc.length > 0 && (
                  <div className="card border border-base-300 bg-base-100 shadow-sm mb-4 hidden lg:block">
                    <div className="card-body p-4">
                      <h2 className="card-title text-base font-bold mb-2">ToC</h2>
                      <nav className="toc">{renderToc(toc)}</nav>
                    </div>
                  </div>
                )}

                {category && (
                  <div className="mb-2">
                    <a
                      href={`/category/${category}`}
                      className="category-main p-category"
                    >
                      {category}
                    </a>
                  </div>
                )}

                {/* モバイル ToC */}
                {Array.isArray(toc) && toc.length > 0 && (
                  <div className="card border border-base-300 bg-base-100 shadow-sm mb-4 block lg:hidden">
                    <div className="card-body p-4">
                      <h2 className="card-title text-base font-bold mb-2">ToC</h2>
                      <nav className="toc">{renderToc(toc)}</nav>
                    </div>
                  </div>
                )}

                {/* 本文 */}
                <div className="e-content prose max-w-none">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: content.replace(/<a\b(?![^>]*\bclass=)/g, '<a class="not-prose" '),
                    }}
                  />
                  <a href="https://brid.gy/publish/bluesky" hidden></a>
                  <a href="https://fed.brid.gy/" hidden></a>
                </div>



                {/* Bluesky Syndication */}
                {bluesky && (
                  <div className="mt-8">
                    <a
                      className="u-syndication inline-block align-middle"
                      href={bluesky}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Bluesky で見る"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-blue-500 hover:opacity-80"
                      >
                        <path d="M12 2c2.21 0 4.2.9 5.66 2.34A7.978 7.978 0 0120 10a7.978 7.978 0 01-2.34 5.66L12 21.32l-5.66-5.66A7.978 7.978 0 014 10c0-2.21.9-4.2 2.34-5.66A7.978 7.978 0 0112 2zm0 2a6 6 0 00-4.24 1.76A5.978 5.978 0 006 10c0 1.66.67 3.16 1.76 4.24L12 18.47l4.24-4.23A5.978 5.978 0 0018 10a5.978 5.978 0 00-1.76-4.24A6 6 0 0012 4z" />
                      </svg>
                    </a>

                  </div>
                )}

                {/* Webmention */}
                <div className="mt-8">
                  <h2 className="text-lg font-bold mb-2">Webmention コメント</h2>
                  <div id="webmention-comments"></div>
                </div>
                <script src="/assets/js/webmention.js" defer></script>

                {/* タグ */}
                {tags && tags.length > 0 && (
                  <div className="tags mt-4">
                    {tags.map((tag) => (
                      <a
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}/`}
                        className="p-category mr-2"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                )}

 
              {/* 著者カード */}
              <AuthorCard blogAuthorID={blogAuthorID} display />
                
              </article>
            </div>
          </main>

          {/* 右サイド（デスクトップのみ） */}
          <aside className="hidden lg:block flex-none lg:w-1/5">
            <div className="card bg-base-100 shadow-md p-4">
              <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">
                サイド
              </h2>
              <div className="space-y-4">
                {comp?.resentPages && <comp.resentPages />}
                {children?.sidebar}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </BaseLayout>
    {/* Cloudflare Web Analytics */}
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "a7178f3600b44953903b40f9872e592b"}'
    ></script>
  </>
);
}
