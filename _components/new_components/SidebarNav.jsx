

export default function SidebarNav({ nav: NavComp, searchIdPrefix = "sidebar", className = "" }) {
  return (
    <aside className={`card bg-base-100 shadow-md p-4 space-y-4 w-full lg:w-1/5 ${className}`}>
      {/* 検索ボックス */}

      {/* ナビゲーションコンポーネント（サイトマップ相当） */}
      {NavComp ? <NavComp /> : null}
    </aside>
  );
}
