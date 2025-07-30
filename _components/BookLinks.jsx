export default ({ Calil, amazonUrl }) => {
    return (
      <>
        <div className="flex gap-4 mt-8">
          {amazonUrl && (
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Amazonで購入
            </a>
          )}
          {(() => {
            // Calilのバリデーション: isbn=のあとに10桁または13桁の数字
            const match = typeof Calil === "string" && Calil.match(/isbn=(\d{10}|\d{13})\b/);
            if (match) {
              return (
                <a
                  href={Calil}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  カーリルで図書館検索
                </a>
              );
            }
            return null;
          })()}
        </div>
      </>
    );
  };