export default function DeployIndex({ search, comp }) {
  return (
    <>
      {`<!DOCTYPE html>`}
      <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assets/styles.css" />
        <title>DropGarden</title>
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F2EFE2; /* イングリッシュガーデンの象牙色 */
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          header {
            background-color: #2E5A30; /* イングリッシュガーデンの緑 */
            color: white;
            padding: 20px 0;
            margin-bottom: 30px;
          }
          
          header h1 {
            margin: 0;
            padding: 0 20px;
          }
          
          .tab-container {
            margin-bottom: 30px;
          }
          
          .tabs {
            display: flex;
            border-bottom: 1px solid #ddd;
          }
          
          .tab {
            padding: 10px 20px;
            cursor: pointer;
            border: 1px solid transparent;
            border-bottom: none;
            background-color: #f9f9f9;
            margin-right: 5px;
            border-radius: 5px 5px 0 0;
          }
          
          .tab.active {
            background-color: #2E5A30; /* イングリッシュガーデンの緑 */
            color: white;
            border-color: #ddd;
          }
          
          .tab-content {
            display: none;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            background-color: white;
          }
          
          .tab-content.active {
            display: block;
          }
          
          .article-list {
            list-style: none;
            padding: 0;
          }
          
          .article-list li {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }
          
          .article-date {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
          }
          
          .article-title {
            font-size: 1.2em;
            margin-bottom: 5px;
          }
          
          .article-title a {
            color: #2E5A30;
            text-decoration: none;
          }
          
          .article-title a:hover {
            text-decoration: underline;
          }
          
          .article-description {
            color: #444;
          }
          
          footer {
            background-color: #2E5A30;
            color: white;
            padding: 20px 0;
            margin-top: 50px;
          }
        `}} />
      </head>
      <body>
        <header>
          <div className="container">
            <h1>DropGarden</h1>
          </div>
        </header>

        <div className="container">
          <div className="tab-container">
            <div className="tabs">
              <div className="tab active" data-tab="article">記事</div>
              <div className="tab" data-tab="resources">リソース</div>
              <div className="tab" data-tab="glossary">用語集</div>
              <div className="tab" data-tab="books">書籍</div>
            </div>
            
            <div className="tab-content active" id="article">
              <h2>最新の記事</h2>
              <ul className="article-list">
                {search.pages("type=article", "date=desc", 10).map((article, index) => (
                  <li key={index}>
                    <div className="article-date">{article.date}</div>
                    <div className="article-title"><a href={article.url}>{article.title}</a></div>
                    <div className="article-description">{article.description}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="tab-content" id="resources">
              <h2>リソース</h2>
              <ul className="article-list">
                {search.pages("type=resource", "date=desc", 10).map((resource, index) => (
                  <li key={index}>
                    <div className="article-date">{resource.date}</div>
                    <div className="article-title"><a href={resource.url}>{resource.title}</a></div>
                    <div className="article-description">{resource.description}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="tab-content" id="glossary">
              <h2>用語集</h2>
              <ul className="article-list">
                {search.pages("type=glossary", "title=asc", 10).map((term, index) => (
                  <li key={index}>
                    <div className="article-title"><a href={term.url}>{term.title}</a></div>
                    <div className="article-description">{term.description}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="tab-content" id="books">
              <h2>書籍メモ</h2>
              <ul className="article-list">
                {search.pages("type=book", "date=desc", 10).map((book, index) => (
                  <li key={index}>
                    <div className="article-date">{book.date}</div>
                    <div className="article-title"><a href={book.url}>{book.title}</a></div>
                    <div className="article-description">{book.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {comp.dailylog()}
        </div>
        
        <footer>
          <div className="container">
            <p>&copy; 2025 DropGarden</p>
          </div>
        </footer>

        <script dangerouslySetInnerHTML={{ __html: `
          // タブ切り替え機能
          document.addEventListener('DOMContentLoaded', () => {
            const tabs = document.querySelectorAll('.tab');
            
            tabs.forEach(tab => {
              tab.addEventListener('click', () => {
                // アクティブなタブを切り替え
                document.querySelector('.tab.active').classList.remove('active');
                tab.classList.add('active');
                
                // タブコンテンツを切り替え
                const tabName = tab.getAttribute('data-tab');
                document.querySelector('.tab-content.active').classList.remove('active');
                document.getElementById(tabName).classList.add('active');
              });
            });
          });
        `}} />
      </body>
      </html>
    </>
  );
}
