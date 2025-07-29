export default function SiteHeader() {
  return (
    <header className="bg-mono-black text-mono-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="site-title">
          <a href="/" className="flex items-center no-underline">
            <img src="/assets/images/newlogo.svg" alt="DropGardenロゴ" style={{ height: "28px" }} />
          </a>
        </div>
        <div className="flex-1"></div>
        {/* Pagefind 検索窓 */}
        <div id="search">
          {/* Pagefind UIのスクリプトがここを自動で置換・初期化 */}
        </div>
        
      </div>
    </header>
  );
}
