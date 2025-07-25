export default function Footer({ children }) {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-section">
          <div className="footer-links">
            <a href="/">ホーム</a>
            <a href="/about">About</a>
            <a href="/articles">記事一覧</a>
            <a href="/contact">お問い合わせ</a>
          </div>
        </div>
        <div className="footer-section">
          <div className="copyright"> 2025 個人ウェブサイト All Rights Reserved.</div>
        </div>
      </footer>
      <style>{`
        .site-footer {
          height: 100px;
          background-color: #2c3e50;
          color: #ecf0f1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          font-family: Arial, sans-serif;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }
        .footer-section {
          display: flex;
          flex-direction: column;
        }
        .footer-links {
          display: flex;
          gap: 1.5rem;
        }
        .footer-links a {
          color: #ecf0f1;
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-links a:hover {
          color: #3498db;
        }
        .copyright {
          font-size: 0.9rem;
          opacity: 0.8;
        }
      `}</style>
      {children}
    </>
  );
}
