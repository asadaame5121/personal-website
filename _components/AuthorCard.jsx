// 著者情報カード（IndieWeb h-card, display:none）
export default function AuthorCard() {
  return (
    <div className="h-card" style={{ display: "none" }}>
      <a className="u-url u-uid p-name" href="https://asadaame5121.net/">あさだあめ</a>
      <img className="u-photo" src="/assets/images/profile.jpg" alt="あさだあめ" />
      <span className="p-note">本を読んだりするおじさん。</span>
      <a className="u-github" rel="me" href="https://github.com/asadaame5121">GitHub</a>
      <a className="u-fediverse" rel="me" href="https://bsky.app/profile/asadaame5121.bsky.social">Fediverse</a>
    </div>
  );
}
