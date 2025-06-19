export default function Navigation({ page, nav }) {
  // 主要セクションのみに絞ったメニュー構造を取得
  // 第2引数: フィルター条件（例: "folder=true" でフォルダのみ）
  // 第3引数: ソート順（例: "basename=asc-locale"）
  const _menu = nav.menu("/", "", "basename=asc-locale");
  
  // 通常のリンク項目をレンダリング（非再帰的）
  const renderLink = (url, title, isActive) => {
    return isActive ? (
      <span className="font-bold text-mono-black">{title}</span>
    ) : (
      <a href={url} className="text-mono-accent hover:text-mono-black">{title}</a>
    );
  };

  // 第1階層のメニュー項目をレンダリング
  const renderTopLevelItem = (item) => {
    const isActive = page.url === item.data?.url;
    const title = item.data?.title || item.data?.basename || "無題";
    const url = item.data?.url || "#";
    
    return (
      <li key={url}>
        {renderLink(url, title, isActive)}
        
        {/* 第2階層（子要素）があれば表示 */}
        {item.children && item.children.length > 0 && (
          <ul className="pl-4 mt-1 space-y-1">
            {item.children.map(child => {
              const childIsActive = page.url === child.data?.url;
              const childTitle = child.data?.title || child.data?.basename || "無題";
              const childUrl = child.data?.url || "#";
              
              return (
                <li key={childUrl}>
                  {renderLink(childUrl, childTitle, childIsActive)}
                  {/* 第3階層以降は表示しない（メモリ使用量削減のため） */}
                </li>
              );
            })}
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
          {renderLink("/", "ホーム", page.url === "/")}
        </li>
        
        {/* Navプラグインによって生成されたメニュー項目（最大2階層まで） */}
        {_menu.children?.map(item => renderTopLevelItem(item))}
      </ul>
    </div>
  );
}
