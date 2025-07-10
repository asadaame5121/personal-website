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

export default function LayoutArticle({ title, content, date, category, tags, author, previousPost, nextPost, children, comp, url, toc }) {
  console.log("toc:", toc);
  return (
    <>
      <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assets/css/tailwind.css" />
        <link rel="stylesheet" href="/assets/css/dailylog.css" />
        <link rel="icon" href="/assets/images/favicon.jpeg" type="image/jpeg" />
        <title>{title}</title>
        <meta property="og:url" content={url} />
        <a className="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
      </head>
      <body className="bg-mono-white text-mono-darkgray">
        <header className="bg-mono-black text-mono-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="site-title">
              <a href="/" className="flex items-center no-underline">
                <img src="/assets/images/newlogo.svg" alt="DropGardenロゴ" style={{height: "28px"}} />
              </a>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* モバイルDrawerサイドバー */}
            <div className="drawer lg:hidden">
              <input id="drawer-nav" type="checkbox" className="drawer-toggle" />
              <div className="drawer-content">
                <label htmlFor="drawer-nav" className="btn btn-primary btn-sm m-2 drawer-button">
                  ≡ メニュー
                </label>
              </div>
              <div className="drawer-side z-40">
                <label htmlFor="drawer-nav" className="drawer-overlay"></label>
                <aside className="w-64 bg-base-100 text-base-content h-full card shadow-md p-4 space-y-4">
                  <div id="search-mobile" className="mb-4"></div>
                  {comp && comp.nav && <comp.nav />}
                </aside>
              </div>
            </div>
            {/* PC用サイドバー */}
            <aside className="hidden lg:block w-full lg:w-1/5">
              <div className="card bg-base-100 shadow-md p-4 space-y-4">
                <div id="search-pc" className="mb-4"></div>
                {comp && comp.nav && <comp.nav />}
              </div>
            </aside>
            {/* 中央カラム：メインコンテンツ */}
            <main className="flex-1">
              <div className="card bg-base-100 shadow-md p-6">
                <article className="h-entry">
                  {title && (
                    <h1 className="text-3xl font-bold mb-4">
                      <a className="p-name u-url" href={url}>{title}</a>
                    </h1>
                  )}
                  {date && (
                    <div className="post-date mb-2">
                      {/* ISO8601形式で出力 */}
                      <time className="dt-published" dateTime={new Date(date).toISOString()}>{new Date(date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</time>
                    </div>
                  )}
                  {Array.isArray(toc) && toc.length > 0 && (
                    <div className="card border border-base-300 bg-base-100 shadow-sm mb-4 hidden lg:block">
                      <div className="card-body p-4">
                        <h2 className="card-title text-base font-bold mb-2">ToC</h2>
                        <nav className="toc">
                          {renderToc(toc)}
                        </nav>
                      </div>
                    </div>
                  )}
                  {category && (
                    <div className="mb-2">
                      <a href={`/category/${category}`} className="category-main p-category">{category}</a>
                    </div>
                  )}
                  {Array.isArray(toc) && toc.length > 0 && (
                    <div className="card border border-base-300 bg-base-100 shadow-sm mb-4 block lg:hidden">
                      <div className="card-body p-4">
                        <h2 className="card-title text-base font-bold mb-2">ToC</h2>
                        <nav className="toc">
                          {renderToc(toc)}
                        </nav>
                      </div>
                    </div>
                  )}
                  <div className="e-content prose max-w-none">
                    {/* ここで本文にproseのみ適用。ただしリンクはnot-prose化 */}
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/<a /g, '<a class=\"not-prose\" ') }} />
                  </div>
                  <div className="mt-8">
                    <a className="u-syndication" href="https://bsky.app/profile/asadaame5121.bsky.social" target="_blank" rel="noopener noreferrer">Blueskyで見る</a>
                    <a href="https://brid.gy/publish/bluesky"></a>
                  </div>
                  {tags && tags.length > 0 && (
                    <div className="tags mt-4">
                      {tags.map((tag) => (
                        <a key={tag} href={`/tags/${encodeURIComponent(tag)}/`} className="p-category mr-2">{tag}</a>
                      ))}
                    </div>
                  )}
                  {author && (
                    <div className="p-author h-card mt-4">
                      {author.photo && (
                        <img src={author.photo} alt={author.name} className="inline-block w-12 h-12 rounded-full mr-2" />
                      )}
                      <div className="p-author-info inline-block align-middle">
                        <div className="p-author-name font-bold">{author.name}</div>
                        {author.bio && <div>{author.bio}</div>}
                      </div>
                    </div>
                  )}
                  <div className="post-navigation mt-8 flex justify-between">
                    {previousPost ? (
                      <a href={previousPost.url} className="prev-post u-url">← 前の記事</a>
                    ) : <span></span>}
                    {nextPost ? (
                      <a href={nextPost.url} className="next-post u-url">次の記事 →</a>
                    ) : <span></span>}
                  </div>
                </article>
              </div>
            </main>
            {/* 右カラム：サイドメニュー（デスクトップのみ） */}
            <aside className="hidden lg:block flex-none lg:w-1/5">
              <div className="card bg-base-100 shadow-md p-4">
                <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">サイド</h2>
                <div className="space-y-4">
                  {/* PC用TOC（右サイドバー上部、sticky） */}
                  
                  {comp && comp.resentPages && <comp.resentPages />}
                  {children?.sidebar}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </body>
      </html>
    </>
  );
}
