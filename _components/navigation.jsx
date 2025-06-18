export default function Navigation({ page, nav }) {
  const _menu = nav.menu();
  
  // Navプラグインの機能を活用するためのヘルパー関数
  const renderMenuItem = (item) => {
    const isActive = page.url === item.url;
    
    return (
      <li key={item.url}>
        {isActive ? (
          <span className="font-bold text-mono-black">{item.title}</span>
        ) : (
          <a href={item.url} className="text-mono-accent hover:text-mono-black">{item.title}</a>
        )}
        
        {item.children && item.children.length > 0 && (
          <ul className="pl-4 mt-1 space-y-1">
            {item.children.map(child => renderMenuItem(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="bg-mono-white p-4 rounded border border-mono-lightgray">
      <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">ナビゲーション</h2>
      <ul className="space-y-2">
        {/* ホームページ */}
        <li>
          {page.url === "/" ? (
            <span className="font-bold text-mono-black">ホーム</span>
          ) : (
            <a href="/" className="text-mono-accent hover:text-mono-black">ホーム</a>
          )}
        </li>
        
        {/* Navプラグインによって生成されたメニュー項目 */}
        {_menu.children?.map(item => renderMenuItem(item))}
      </ul>
    </div>
  );
}
