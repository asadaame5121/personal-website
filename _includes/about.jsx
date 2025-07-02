export default function About({ title, comp, photo, name, note, email, url, tel, location, social, content, skills }) {
  return (
    <>
      {`<!DOCTYPE html>`}
      <html lang="ja">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" href="/assets/styles.css" />
          <link rel="icon" href="/assets/images/favicon.jpeg" type="image/jpeg" />
          <title>{title}</title>
        </head>
        <body className="bg-mono-white text-mono-darkgray">
          <header className="bg-mono-black text-mono-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="site-title">
                <a href="/" className="flex items-center no-underline">
                  <span className="text-mono-white text-2xl font-bold">DropGarden</span>
                </a>
              </div>
            </div>
          </header>
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* モバイルDrawerサイドバー */}
              <div className="drawer lg:hidden">
                <input id="drawer-nav" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                  <label htmlFor="drawer-nav" className="btn btn-primary btn-sm m-2 drawer-button">
                    ≡ メニュー
                  </label>
                </div>
                <div className="drawer-side z-40">
                  <label htmlFor="drawer-nav" className="drawer-overlay"></label>
                  <aside className="w-64 bg-base-100 text-base-content h-full card shadow-md p-4 space-y-4">
                    <div id="search-mobile" className="mb-4"></div>
                    {comp && comp.nav && <comp.nav />}
                  </aside>
                </div>
              </div>
              {/* PC用サイドバー */}
              <aside className="hidden lg:block w-full lg:w-1/5">
                <div className="card bg-base-100 shadow-md p-4 space-y-4">
                  <div id="search-pc" className="mb-4"></div>
                  {comp && comp.nav && <comp.nav />}
                </div>
              </aside>
              {/* 中央カラム：プロフィール・本文 */}
              <main className="flex-1">
                <div className="card bg-base-100 shadow-md p-6">
                  <article className="h-entry">
                    <div className="h-card mb-6">
                      {photo && (
                        <img className="u-photo mb-4 rounded-full w-32 h-32 object-cover" src={photo} alt={name} />
                      )}
                      <h1 className="p-name text-3xl font-bold mb-2">{name}</h1>
                      {note && (
                        <div className="p-note mb-2">{note}</div>
                      )}
                      <div className="contact-info mb-2">
                        {email && (
                          <div className="contact-item">
                            <a className="u-email" href={`mailto:${email}`}>{email}</a>
                          </div>
                        )}
                        {url && (
                          <div className="contact-item">
                            <a className="u-url" href={url}>{url}</a>
                          </div>
                        )}
                        {tel && (
                          <div className="contact-item">
                            <a className="p-tel" href={`tel:${tel}`}>{tel}</a>
                          </div>
                        )}
                        {location && (
                          <div className="contact-item">
                            <span className="p-locality">{location}</span>
                          </div>
                        )}
                      </div>
                      {social && social.length > 0 && (
                        <div className="social-links flex flex-wrap gap-2 mt-2">
                          {social.map((platform, idx) => (
                            <a href={platform.url} className="u-url underline text-mono-accent" rel="me" key={idx}>{platform.name}</a>
                          ))}
                        </div>
                      )}
                      {skills && skills.length > 0 && (
                        <div className="skills mt-4">
                          <h2 className="text-xl font-bold">Skills</h2>
                          <ul className="list-disc ml-6">
                            {skills.map((skill, idx) => (
                              <li key={idx}>{skill}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="about-content prose mt-8">
                      {content}
                    </div>
                  </article>
                </div>
              </main>
              {/* 右カラム：サイドメニュー（デスクトップのみ） */}
              <aside className="hidden lg:block flex-none lg:w-1/5">
                <div className="card bg-base-100 shadow-md p-4">
                  <h2 className="text-xl font-bold mb-4 text-mono-black border-b border-mono-lightgray pb-2">サイド</h2>
                  <div className="space-y-4">
                    {comp && comp.resentPages && <comp.resentPages />}
                    {/* aboutページ用の追加サイド情報があればここに */}
                  </div>
                </div>
              </aside>
            </div>
          </div>
          {comp.footer && comp.footer()}
        </body>
      </html>
    </>
  );
}
