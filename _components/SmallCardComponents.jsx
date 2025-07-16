export default function SmallCardGrid({ children, cols = "grid-cols-1 md:grid-cols-2", className = "" }) {
    return (
      <div className={`grid ${cols} gap-6 ${className}`}>
        {children}
      </div>
    );
  }