export default function SiteFooter() {
  return (
    <footer className="bg-mono-black text-mono-silver mt-8 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="mb-2 md:mb-0">&copy; 2025 DropGarden - All rights reserved</p>
        <div className="flex gap-4 text-sm">
          <a href="/privacy" className="hover:text-mono-white">プライバシーポリシー</a>
          <a href="/terms" className="hover:text-mono-white">利用規約</a>
        </div>
      </div>
    </footer>
  );
}
