// 共通カードコンポーネント
// タイトル付きのボックスとして children をラップ

export default function CardContainer({ title, children, className = "", headerClass = "bg-mono-accent text-mono-white" }) {
  return (
    <div className={`bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden ${className}`}>
      {title && (
        <div className={`${headerClass} px-4 py-2`}>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
