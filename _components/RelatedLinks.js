/**
 * 関連ページリストをHTMLで返す関数
 * @param {Object} params
 * @param {string} params.pagePath - 現在ページのURL（例: /Article/なぜツイッターは陰謀論の巣窟に見えるのか.html）
 * @param {Object} params.linkMap - link_graph.jsonのlinkMap部分
 * @returns {string} HTML文字列
 */
export default function RelatedLinks({ pagePath, linkMap, inboundMap, twoHopMap }) {
  function renderLinks(title, links) {
    if (!links || !links.length) return "";
    return `
      <section class="related-links mb-4 p-3 border rounded bg-base-50">
        <h3 class="font-bold text-base mb-2">${title}</h3>
        <ul>
          ${links.map(link =>
            `<li>
              <a href="${link}" class="hover:underline">
                ${decodeURIComponent(link).replace(/\.html$/, "")}
              </a>
            </li>`).join("")}
        </ul>
      </section>
    `;
  }

  return [
    renderLinks("関連ページ", linkMap?.[pagePath]),
    renderLinks("被リンク（Backlink）", inboundMap?.[pagePath]),
    renderLinks("2Hopリンク", twoHopMap?.[pagePath])
  ].join("");
}
