export default ({ Calil, amazonUrl, shopUrl }) => {
    return (
      <>
        <div className="flex gap-4 mt-8">
          {/* amazonUrlが配列またはカンマ区切りの場合も対応 */}
          {(() => {
            if (!amazonUrl) return null;
            let urls = amazonUrl;
            if (typeof amazonUrl === "string") {
              // カンマ区切りで複数URL対応
              urls = amazonUrl.includes(",") ? amazonUrl.split(",").map(s => s.trim()) : [amazonUrl];
            }
            if (Array.isArray(urls)) {
              return urls.map((url, idx) => (
                <a
                  key={url + idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {`Amazon${urls.length > 1 ? ` ${idx + 1}` : ""}で購入`}
                </a>
              ));
            }
            return null;
          })()}

          {shopUrl && (
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Amazon以外で購入
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