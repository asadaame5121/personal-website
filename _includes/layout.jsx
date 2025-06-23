export default function Layout({ title, date, category, content, tags, author, previousPost, nextPost, comp, children }) {
  return (
    <>
      {`<!DOCTYPE html>`}
      <html lang="ja">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" href="/assets/css/tailwind.css" />
          <link rel="stylesheet" href="/assets/css/dailylog.css" />
          <link rel="icon" href="/assets/images/favicon.jpeg" type="image/jpeg" />
          <title>{title}</title>
        </head>
        <body>
          {comp.header()}
          
          <main>
            <article className="h-entry">
              <h1 className="p-name">{title}</h1>
              
              {date && (
                <div className="post-date">
                  <time className="dt-published" dateTime={date}>{date}</time>
                </div>
              )}
              
              {category && (
                <div>
                  <a href={`/category/${category}`} className="category-main p-category">{category}</a>
                </div>
              )}
              
              <div className="e-content" dangerouslySetInnerHTML={{ __html: content }} />
              
              {tags && tags.length > 0 && (
                <div className="tags">
                  {tags.map((tag, index) => (
                    <a key={index} href={`/tags/${tag}`} className="p-category">{tag}</a>
                  ))}
                </div>
              )}
              
              {author && (
                <div className="p-author h-card">
                  {author.photo && (
                    <img src={author.photo} alt={author.name} />
                  )}
                  <div className="p-author-info">
                    <div className="p-author-name">{author.name}</div>
                    {author.bio && <div>{author.bio}</div>}
                  </div>
                </div>
              )}
              
              <div className="post-navigation">
                {previousPost ? (
                  <a href={previousPost.url} className="prev-post u-url">← 前の記事</a>
                ) : (
                  <span></span>
                )}
                
                {nextPost ? (
                  <a href={nextPost.url} className="next-post u-url">次の記事 →</a>
                ) : (
                  <span></span>
                )}
              </div>
            </article>
          </main>
          
          {comp.footer()}
        </body>
      </html>
    </>
  );
}
