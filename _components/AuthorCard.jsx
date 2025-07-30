// 著者情報カード（IndieWeb h-card, display:none）
import blogAuthorData from "../src/_data/blogAuthor.json" with { type: "json" };


export default function AuthorCard({ blogAuthorID = "asadaame", display = true }) {
  const blogAuthor = blogAuthorData[blogAuthorID];
  if (!blogAuthor) return null;
  return (
    <div className="card card-side bg-base-100 shadow-md flex-col sm:flex-row h-card" style={{ display: display ? undefined : "none" }}>
      <figure className="flex justify-center items-center p-4">
        <img
          className="u-photo w-24 h-24 rounded-full object-cover border border-base-200"
          src={blogAuthor.photo}
          alt={blogAuthor.name}
        />
      </figure>
      <div className="card-body flex-1">
        <h2 className="card-title p-name u-url">
          <a href={blogAuthor.url} className="u-url u-uid p-author">{blogAuthor.name}</a>
        </h2>
        <p className="p-note mb-2">{blogAuthor.bio}</p>
        <div className="flex gap-4 mt-2">
          {blogAuthor.github && (
            <a className="u-github btn btn-sm btn-outline" rel="me" href={blogAuthor.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          )}
          {blogAuthor.fediverse && (
            <a className="u-fediverse btn btn-sm btn-outline" rel="me" href={blogAuthor.fediverse} target="_blank" rel="noopener noreferrer">Fediverse</a>
          )}
          {blogAuthor.bluesky && (
            <a className="u-bluesky btn btn-sm btn-outline" rel="me" href={blogAuthor.bluesky} target="_blank" rel="noopener noreferrer">Bluesky</a>
          )}
          {blogAuthor.twitter && (
            <a className="u-twitter btn btn-sm btn-outline" rel="me" href={blogAuthor.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
          )}

        </div>
      </div>
      {/* 他の著者情報表示 */}
      <div style={{ marginTop: '1em' }}>
        <a href="https://www.amazon.jp/hz/wishlist/ls/3FGTO8FA8MTCY?ref_=wl_share" target="_blank" rel="noopener noreferrer" style={{ color: '#785E49', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.3em' }}>
          ほしいものリスト
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}><path d="M6.5 2a.5.5 0 0 1 .5-.5h6A1.5 1.5 0 0 1 14.5 3v6a.5.5 0 0 1-1 0V3A.5.5 0 0 0 13 2.5H7a.5.5 0 0 1-.5-.5z"/><path d="M13.354 2.646a.5.5 0 0 1 0 .708l-10 10a.5.5 0 1 1-.708-.708l10-10a.5.5 0 0 1 .708 0z"/></svg>
        </a>
      </div>
    </div>
  );
}


