// _filters/extract-log-content.js
export default function (html = "") {
    // Markdown の ------ は <hr> になるので、最初の <hr> 以降を返す
    const idx = html.indexOf("<hr");
    if (idx >= 0) {
      // <hr ...> を含めて切り捨て
      return html.slice(html.indexOf(">", idx) + 1).trim();
    }
    // 保険として最初の <h2> 以降
    const h2 = html.indexOf("<h2");
    return h2 >= 0 ? html.slice(h2).trim() : html;
  }