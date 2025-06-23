export default function ThreeColumn({ title, content, children }) {
  return (
    <>
      {`<!DOCTYPE html>`}
      <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assets/css/tailwind.css" />
        <link rel="stylesheet" href="/assets/css/dailylog.css" />
        <link rel="icon" href="/assets/images/favicon.jpeg" type="image/jpeg" />
        <title>{title}</title>
      </head>
      <body className="bg-mono-white text-mono-darkgray">
        <header className="bg-mono-black text-mono-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="site-title">
              <a href="/" className="flex items-center no-underline">
                <img src="/assets/images/logo.jpg" alt="DropGarden Logo" className="h-6 mr-2" />
                <span className="text-mono-white text-2xl font-bold">DropGarden</span>
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 左カラム：ナビゲーション */}
            <nav className="md:col-span-3 lg:col-span-2">
              <div className="bg-mono-white p-4 rounded border border-mono-lightgray">
                <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">ナビゲーション</h2>
                <ul className="space-y-2">
                  <li><a href="/" className="text-mono-accent hover:text-mono-black">ホーム</a></li>
                  <li><a href="/dailylog" className="text-mono-accent hover:text-mono-black">Daily Log</a></li>
                  <li><a href="/readinglist" className="text-mono-accent hover:text-mono-black">Reading List</a></li>
                  <li><a href="/clippingshare" className="text-mono-accent hover:text-mono-black">Clipping Share</a></li>
                  <li><a href="/about" className="text-mono-accent hover:text-mono-black">About</a></li>
                </ul>
              </div>
            </nav>
            
            {/* 中央カラム：メインコンテンツ */}
            <main className="md:col-span-9 lg:col-span-7">
              <div className="bg-mono-white p-6 rounded border border-mono-lightgray">
                {children?.content || content}
              </div>
            </main>
            
            {/* 右カラム：サイドメニュー（デスクトップのみ） */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="bg-mono-white p-4 rounded border border-mono-lightgray">
                <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">サイド</h2>
                <div className="space-y-4">
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
