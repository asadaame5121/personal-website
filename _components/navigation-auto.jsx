export default function NavigationAuto({ page, nav }) {
  const rootMenu = nav.menu();

  return (
    <div className="bg-mono-white p-4 rounded border border-mono-lightgray">
      <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">ナビゲーション</h2>
      
      {rootMenu.children.length > 0 && (
        <ul className="space-y-2">
          {/* ホームページ */}
          <li>
            {page.url === "/" ? (
              <span className="font-bold text-mono-black">ホーム</span>
            ) : (
              <a href="/" className="text-mono-accent hover:text-mono-black">ホーム</a>
            )}
          </li>
          
          {/* 自動生成されたトップレベルのナビゲーション項目 */}
          {rootMenu.children.map((item, index) => {
            if (item.data && item.data.url && !item.data.url.includes("/_") && !item.data.url.includes("/obsidian/")) {
              return (
                <li key={index}>
                  {page.url === item.data.url ? (
                    <span className="font-bold text-mono-black">{item.data.title || item.data.basename}</span>
                  ) : (
                    <a href={item.data.url} className="text-mono-accent hover:text-mono-black">
                      {item.data.title || item.data.basename}
                    </a>
                  )}
                  
                  {/* サブメニュー（最初のレベルのみ） */}
                  {item.children && item.children.length > 0 && (
                    <ul className="pl-4 mt-1 space-y-1 text-sm">
                      {item.children.map((child, childIndex) => {
                        if (child.data && child.data.url && !child.data.url.includes("/_")) {
                          return (
                            <li key={`${index}-${childIndex}`}>
                              {page.url === child.data.url ? (
                                <span className="font-bold text-mono-black">
                                  {child.data.title || child.data.basename}
                                </span>
                              ) : (
                                <a href={child.data.url} className="text-mono-accent hover:text-mono-black">
                                  {child.data.title || child.data.basename}
                                </a>
                              )}
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  )}
                </li>
              );
            }
            return null;
          })}
        </ul>
      )}
    </div>
  );
}
