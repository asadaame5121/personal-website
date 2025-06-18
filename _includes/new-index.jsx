export const frontmatter = {
  layout: "layout-grid.jsx",
  title: "DropGarden"
};

export default function NewIndex({ comp, clippingshare, categories, tags }) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-mono-black">DropGarden</h1>

      <div className="prose max-w-none mb-8">
        <p>
          ここはドロップガーデン。日々の記録やアイデア、読書記録などを整理・共有するための個人的なデジタルガーデンです。
        </p>
      </div>

      {/* カード形式でコンテンツを表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Daily Log カード */}
        <div className="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden">
          <div className="bg-mono-accent text-mono-white px-4 py-2">
            <h2 className="text-xl font-bold">Daily Log</h2>
          </div>
          <div className="p-4">
            {comp.dailylog()}
            <div className="mt-4">
              <a href="/dailylog" className="text-mono-accent hover:text-mono-black font-medium">すべて見る →</a>
            </div>
          </div>
        </div>
        
        {/* Reading List カード */}
        <div className="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden">
          <div className="bg-mono-accent text-mono-white px-4 py-2">
            <h2 className="text-xl font-bold">Reading List</h2>
          </div>
          <div className="p-4">
            {comp.readinglist()}
            <div className="mt-4">
              <a href="/readinglist" className="text-mono-accent hover:text-mono-black font-medium">すべて見る →</a>
            </div>
          </div>
        </div>
      </div>

      {/* Clipping Share カード */}
      <div className="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden mb-6">
        <div className="bg-mono-accent text-mono-white px-4 py-2">
          <h2 className="text-xl font-bold">Clipping Share</h2>
        </div>
        <div className="p-4">
          {clippingshare.map((clipping, index) => (
            <div key={index} className={`mb-4 pb-4 ${index < clippingshare.length - 1 ? 'border-b border-mono-lightgray' : ''}`}>
              <h3 className="text-lg font-bold mb-2">
                <a href={clipping.url} className="text-mono-accent hover:text-mono-black">{clipping.title}</a>
              </h3>
              <div className="text-mono-gray text-sm">{clipping.date}</div>
              {clipping.excerpt && <p className="mt-2">{clipping.excerpt}</p>}
            </div>
          ))}
          <div className="mt-4">
            <a href="/clippingshare" className="text-mono-accent hover:text-mono-black font-medium">すべて見る →</a>
          </div>
        </div>
      </div>
    </>
  );
}

// サイドバーコンテンツの定義
export function Sidebar({ categories, tags }) {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 text-mono-black">カテゴリー</h3>
        <ul className="space-y-1">
          {categories.map((category, index) => (
            <li key={index}>
              <a href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-mono-accent hover:text-mono-black">
                {category.name} ({category.count})
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-2 text-mono-black">タグクラウド</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <a 
              key={index}
              href={`/tags/${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm px-2 py-1 bg-mono-white border border-mono-lightgray rounded hover:bg-mono-lightgray text-mono-accent"
              style={{ fontSize: `${0.8 + tag.count * 0.05}rem` }}
            >
              {tag.name}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
