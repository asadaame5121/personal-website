// _components/TOC.jsx
// 安全なTOC表示専用コンポーネント

export default function TOC({ toc, className = "" }) {
  if (typeof toc !== "string" || !toc) return null;
  return (
    <nav className={className}>
      <div dangerouslySetInnerHTML={{ __html: toc }} />
    </nav>
  );
}
