export default function DrawerMenu({ id = "drawer-nav", children }) {
  return (
    <>
      {/* Mobile: drawer */}
      <div className="drawer lg:hidden">
        <input id={id} type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor={id} className="btn btn-primary btn-sm m-2 drawer-button">
            ≡ メニュー
          </label>
        </div>
        <div className="drawer-side z-40">
          <label htmlFor={id} className="drawer-overlay" />
          <aside className="w-64 bg-base-100 text-base-content h-full card shadow-md p-4 space-y-4">
            {children}
          </aside>
        </div>
      </div>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:block w-64 bg-base-100 text-base-content h-full card shadow-md p-4 space-y-4">
        {children}
      </aside>
    </>
  );
}
