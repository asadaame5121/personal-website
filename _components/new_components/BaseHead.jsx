const SITE_URL = "https://asadaame5121.net";

export default function BaseHead({url,title = "", extra = null}) {
  return (
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/assets/css/tailwind.css" />
      <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
      <link rel="canonical" href={url?.startsWith("http") ? url : SITE_URL + url} />
      <link rel="icon" href="/assets/images/favicon.jpeg" type="image/jpeg" />
      <link rel="webmention" href="https://webmention.io/asadaame5121.net/webmention" />
      <link rel="me" href="https://github.com/asadaame5121" />
      <link rel="me" href="https://bsky.app/profile/asadaame5121.bsky.social" />
      <script src="/assets/js/webmention.min.js" async></script>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6712420256268662"
     crossorigin="anonymous"></script>
      <script dangerouslySetInnerHTML={{
        __html: `document.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll('.pagefind-ui-container').forEach(el => {
            if (el.dataset.pfInit) return;
            el.dataset.pfInit = '1';
            new PagefindUI({
              element: el,
              showImages: false,
              excerptLength: 0,
              showEmptyFilters: true,
              showSubResults: false,
              resetStyles: true,
              bundlePath: '/pagefind/',
              baseUrl: '/',
            });
          });
        });`,
      }} />
      {extra}
      <title>{title}</title>
    </head>
  );
}
