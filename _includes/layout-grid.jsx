export default function LayoutGrid({ title, content, date, category, tags, author, previousPost, nextPost, children, comp, resentPages }) {
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
        <script src="/pagefind/pagefind-ui.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('search-mobile')) {
              new PagefindUI({ element: "#search-mobile", showImages: false, excerptLength: 0, showEmptyFilters: true, showSubResults: false, resetStyles: true, bundlePath: "/pagefind/", baseUrl: "/" });
            }
            if (document.getElementById('search-pc')) {
              new PagefindUI({ element: "#search-pc", showImages: false, excerptLength: 0, showEmptyFilters: true, showSubResults: false, resetStyles: true, bundlePath: "/pagefind/", baseUrl: "/" });
            }
          });
        `}} />
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
            <nav className="main-nav">
              <ul className="flex list-none gap-6 m-0 p-0">
                <li><a href="/contact" className="text-mono-white no-underline transition-colors hover:text-mono-silver">お問い合わせ</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左カラム：ナビゲーション */}
            {/* サイドバー（モバイル: Drawer, PC: aside常時表示） */}
            {/* モバイルDrawer */}
            <div className="drawer lg:hidden">
              <input id="drawer-nav" type="checkbox" className="drawer-toggle" />
              <div className="drawer-content">
                {/* ハンバーガーメニュー */}
                <label htmlFor="drawer-nav" className="btn btn-primary btn-sm m-2 drawer-button">
                  ≡ メニュー
                </label>
              </div>
              <div className="drawer-side z-40">
                <label htmlFor="drawer-nav" className="drawer-overlay"></label>
                <aside className="w-64 bg-base-100 text-base-content h-full card shadow-md p-4 space-y-4">
                  <div id="search-mobile" className="mb-4"></div>
                  <comp.nav />
                </aside>
              </div>
            </div>
            {/* PC用サイドバー */}
            <aside className="hidden lg:block w-full lg:w-1/5">
              <div className="card bg-base-100 shadow-md p-4 space-y-4">
                <div id="search-pc" className="mb-4"></div>
                <comp.nav />
              </div>
            </aside>
            
            {/* 中央カラム：メインコンテンツ */}
            <main className="flex-1">
              <div className="card bg-base-100 shadow-md p-6">
  <article className="h-entry">
  {/* microformats for Webmention/IndieWeb: 非表示で出力 */}
  <a className="u-url" href="https://asadaame5121.net/" style={{display: 'none'}} tabIndex={-1}>https://asadaame5121.net/</a>
  <time className="dt-published" dateTime="2025-07-06T00:00:00+09:00" style={{display: 'none'}} tabIndex={-1}>2025-07-06</time>
  {/* 記事の正規URLをu-urlで明示 */}
  {typeof url === 'string' && (
    <link rel="canonical" className="u-url" href={url} />
  )}
    {title && title !== 'DropGarden' && (
      <h1 className="p-name text-2xl font-bold mb-4">{title}</h1>
    )}
    {date && (!title || title !== 'DropGarden') && (
  <div className="post-date mb-4">
    {/* ISO8601形式で出力 */}
    <time className="dt-published" dateTime={new Date(date).toISOString()}>{new Date(date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</time>
  </div>
)}
                  
                  {category && (
                    <div className="mb-4">
                      <a href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`} className="badge badge-secondary">{category}</a>
                    </div>
                  )}
                  
                  <div className="e-content">
                    {children}
                  </div>
                  
                  {tags && tags.length > 0 && (
                    <div className="tags mt-6">
                      {tags.map((tag, index) => (
                        <a key={index} href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`} className="badge badge-outline mr-1">{tag}</a>
                      ))}
                    </div>
                  )}
                  
                  {author && (
                    <div className="p-author h-card mt-8 pt-4 border-t border-mono-lightgray">
                      {author.photo && (
                        <img src={author.photo} alt={author.name} className="w-12 h-12 rounded-full mr-3" />
                      )}
                      <div className="p-author-info">
                        <div className="p-author-name font-bold">{author.name}</div>
                        {author.bio && <div>{author.bio}</div>}
                      </div>
                    </div>
                  )}
                  
                  {(previousPost || nextPost) && (
                    <div className="post-navigation flex justify-between mt-8 pt-4 border-t border-mono-lightgray">
                      {previousPost ? (
                        <a href={previousPost.url} className="prev-post u-url px-3 py-1 bg-mono-accent text-white rounded hover:bg-mono-black">← 前の記事</a>
                      ) : (
                        <span></span>
                      )}
                      
                      {nextPost ? (
                        <a href={nextPost.url} className="next-post u-url px-3 py-1 bg-mono-accent text-white rounded hover:bg-mono-black">次の記事 →</a>
                      ) : (
                        <span></span>
                      )}
                    </div>
                  )}
                </article>
              </div>
            </main>
            
            {/* 右カラム：サイドメニュー（デスクトップのみ） */}
            <aside className="hidden lg:block flex-none lg:w-1/5">
              <div className="card bg-base-100 shadow-md p-4">
                <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">サイド</h2>
                <div className="space-y-4">
                  <comp.resentPages />
                  {children?.sidebar}
                </div>
              </div>
            </aside>
          </div>
        </div>
        
        <footer className="bg-mono-black text-mono-silver mt-8 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p>&copy; 2025 DropGarden - All rights reserved</p>
              </div>
              <div className="flex gap-4">
                <a href="/privacy" className="text-mono-silver hover:text-mono-white">プライバシーポリシー</a>
                <a href="/terms" className="text-mono-silver hover:text-mono-white">利用規約</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
      </html>
    </>
  );
}
