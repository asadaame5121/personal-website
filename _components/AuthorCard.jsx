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
        </div>
      </div>
    </div>
  );
}
