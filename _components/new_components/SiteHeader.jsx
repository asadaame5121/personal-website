export default function SiteHeader() {
  return (
    <header className="bg-mono-black text-mono-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="site-title">
          <a href="/" className="flex items-center no-underline">
            <img src="/assets/images/newlogo.svg" alt="DropGardenロゴ" style={{ height: "28px" }} />
          </a>
        </div>
        <nav className="main-nav hidden md:block">
          <ul className="flex list-none gap-6 m-0 p-0">
            <li>
              <a href="/contact" className="text-mono-white no-underline transition-colors hover:text-mono-silver">
                お問い合わせ
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
