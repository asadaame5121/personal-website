export default function SiteFooter() {
  return (
    <footer className="bg-mono-black text-mono-silver mt-8 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="mb-2 md:mb-0">&copy; 2025 DropGarden - All rights reserved</p>
        <a href="/feed.rss" className="hover:text-orange-400" title="RSS購読" target="_blank" rel="noopener noreferrer">
          <img src="/assets/icons/rss.svg" alt="RSS" width="24" height="24" />
        </a>
      </div>
    </footer>
  );
}
