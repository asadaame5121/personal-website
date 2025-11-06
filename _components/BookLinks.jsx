const parseAmazonUrls = (amazonUrl) => {
  if (!amazonUrl) return [];
  let urls = amazonUrl;
  if (typeof urls === "string") {
    urls = urls.includes(",") ? urls.split(",").map((s) => s.trim()) : [urls.trim()];
  }
  return Array.isArray(urls) ? urls.filter(Boolean) : [];
};

const hasValidCalil = (Calil) => {
  if (Array.isArray(Calil)) {
    return Calil.find((entry) => hasValidCalil(entry));
  }
  return typeof Calil === "string" && /isbn=(\d{10}|\d{13})\b/.test(Calil);
};

const NoImagePlaceholder = ({ title }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 280"
    className="w-full h-auto max-h-80"
    role="img"
    aria-label={`${title ?? "この本"}の表紙画像が見つかりません`}
  >
    <rect width="200" height="280" fill="#E5E7EB" />
    <text
      x="100"
      y="120"
      textAnchor="middle"
      fontSize="20"
      fill="#9CA3AF"
    >
      No image
    </text>
    <text
      x="100"
      y="150"
      textAnchor="middle"
      fontSize="14"
      fill="#9CA3AF"
    >
      (OpenBD)
    </text>
  </svg>
);

export default function BookLinks({
  Calil,
  amazonUrl,
  shopUrl,
  OPENBDBookCover,
  title,
}) {
  const amazonUrls = parseAmazonUrls(amazonUrl);
  const calilUrl = Array.isArray(Calil) ? Calil.find(hasValidCalil) : hasValidCalil(Calil) ? Calil : undefined;
  const coverUrl =
    typeof OPENBDBookCover === "string" && OPENBDBookCover.trim() ? OPENBDBookCover.trim() : undefined;

  return (
    <div className="card lg:card-side bg-base-100 shadow-xl mt-8">
      <figure className="w-full lg:max-w-xs bg-base-200 flex items-center justify-center p-4">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${title ?? "この本"}の表紙（OpenBDより取得）`}
            className="w-full h-auto max-h-80 object-contain"
            loading="lazy"
          />
        ) : (
          <NoImagePlaceholder title={title} />
        )}
      </figure>
      <div className="card-body">
        <div>
          <h2 className="card-title text-lg">購入・図書館リンク</h2>
          <p className="text-sm text-base-content/70">
            画像: openbdbookcover（OpenBDより取得）
          </p>
        </div>
        <div className="card-actions flex-wrap gap-2 mt-4">
          {amazonUrls.map((url, idx) => (
            <a
              key={`${url}-${idx}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {`Amazon${amazonUrls.length > 1 ? ` ${idx + 1}` : ""}で購入`}
            </a>
          ))}

          {shopUrl && (
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Amazon以外で購入
            </a>
          )}

          {calilUrl && (
            <a
              href={calilUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              カーリルで図書館検索
            </a>
          )}
        </div>
        {!coverUrl && (
          <p className="text-xs text-base-content/60 mt-2">
            OpenBDで表紙画像が見つからなかったため、プレースホルダーを表示しています。
          </p>
        )}
      </div>
    </div>
  );
}