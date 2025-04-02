export default function Header({ children }) {
  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <div className="site-title">
            <a href="/">個人ウェブサイト</a>
          </div>
          <nav className="main-nav">
            <ul>
              <li><a href="/">ホーム</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/articles">記事一覧</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <style>{`
        .site-header {
          height: 80px;
          background-color: #2c3e50;
          color: #ecf0f1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 2rem;
          font-family: Arial, sans-serif;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header-content {
          width: 100%;
          max-width: 1200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .site-title a {
          color: #ecf0f1;
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .main-nav ul {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
        }
        .main-nav a {
          color: #ecf0f1;
          text-decoration: none;
          transition: color 0.3s;
        }
        .main-nav a:hover {
          color: #3498db;
        }
      `}</style>
      {children}
    </>
  );
}
