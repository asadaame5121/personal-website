export default function LayoutArticle({ title, content, date, category, tags, author, previousPost, nextPost, children, comp }) {
  return (
    <>
      <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assets/css/tailwind.css" />
        <link rel="stylesheet" href="/assets/css/dailylog.css" />
        <link rel="icon" href="/assets/images/favicon.jpeg" type="image/jpeg" />
        <title>{title}</title>
      </head>
      <body className="bg-mono-white text-mono-darkgray">
        <header className="bg-mono-black text-mono-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="site-title">
              <a href="/" className="flex items-center no-underline">
                <img src="/assets/images/logo.jpg" alt="DropGarden Logo" className="h-6 mr-2" />
                <span className="text-mono-white text-2xl font-bold">DropGarden</span>
              </a>
            </div>
          </div>
        </header>
        <main>
          <article className="h-entry max-w-3xl mx-auto px-4 py-8">
            <h1 className="p-name text-3xl font-bold mb-4">{title}</h1>
            {date && (
              <div className="post-date mb-2">
                <time className="dt-published" dateTime={date}>{date}</time>
              </div>
            )}
            {category && (
              <div className="mb-2">
                <a href={`/category/${category}`} className="category-main p-category">{category}</a>
              </div>
            )}
            <div className="e-content prose max-w-none">
  {/* ここで本文にproseのみ適用。ただしリンクはnot-prose化 */}
  <div dangerouslySetInnerHTML={{ __html: content.replace(/<a /g, '<a class="not-prose" ') }} />
</div>
            {tags && tags.length > 0 && (
              <div className="tags mt-4">
                {tags.map((tag) => (
                  <a key={tag} href={`/tags/${tag}`} className="p-category mr-2">{tag}</a>
                ))}
              </div>
            )}
            {author && (
              <div className="p-author h-card mt-4">
                {author.photo && (
                  <img src={author.photo} alt={author.name} className="inline-block w-12 h-12 rounded-full mr-2" />
                )}
                <div className="p-author-info inline-block align-middle">
                  <div className="p-author-name font-bold">{author.name}</div>
                  {author.bio && <div>{author.bio}</div>}
                </div>
              </div>
            )}
            <div className="post-navigation mt-8 flex justify-between">
              {previousPost ? (
                <a href={previousPost.url} className="prev-post u-url">← 前の記事</a>
              ) : <span></span>}
              {nextPost ? (
                <a href={nextPost.url} className="next-post u-url">次の記事 →</a>
              ) : <span></span>}
            </div>
          </article>
        </main>
      </body>
      </html>
    </>
  );
}
