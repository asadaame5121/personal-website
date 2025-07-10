// Webmention.io動的取得・描画用クライアント雛形
// ダミーデータでUIテスト→本番APIに差し替え可

// サンプルAPIエンドポイント（ダミー）
// テスト時は下記のダミーデータURLを有効化
// const WEBMENTION_API = "/assets/js/webmention-dummy.json";
// 本番時はWebmention.ioのAPIエンドポイントに戻す
// const WEBMENTION_API = "/assets/js/webmention-dummy.json"; // ←テスト用
const WEBMENTION_API = "https://webmention.io/api/mentions.jf2?target=https://asadaame5121.net"; // ←本番用

// コメント表示先のdiv
const COMMENTS_CONTAINER_ID = "webmention-comments";

function renderWebmentions(data) {
  const container = document.getElementById(COMMENTS_CONTAINER_ID);
  if (!container) return;
  if (!data.children || data.children.length === 0) {
    container.innerHTML = '<p>コメントはまだありません。</p>';
    return;
  }
  container.innerHTML = data.children.map(entry => {
    const author = entry.author || {};
    const avatar = author.photo ? `<img src="${author.photo}" alt="avatar" style="width:2em;height:2em;border-radius:50%;vertical-align:middle;">` : '';
    const name = author.name || 'Anonymous';
    const published = entry.published ? `<time datetime="${entry.published}">${new Date(entry.published).toLocaleString()}</time>` : '';
    let content = '';
    let typeIcon = '';
    switch(entry["wm-property"]) {
      case 'like-of':
        typeIcon = '👍';
        content = `<span style='color:#555;'>${name}さんがLikeしました</span>`;
        break;
      case 'repost-of':
        typeIcon = '🔁';
        content = `<span style='color:#555;'>${name}さんがRepostしました</span>`;
        break;
      case 'mention-of':
        typeIcon = '💬';
        content = entry.content && entry.content.html ? entry.content.html : (entry.content && entry.content.text ? entry.content.text : '');
        break;
      default:
        content = entry.content && entry.content.html ? entry.content.html : (entry.content && entry.content.text ? entry.content.text : '');
        typeIcon = '';
    }
    return `<div class="webmention-entry" style="margin-bottom:1em;border-bottom:1px solid #eee;padding-bottom:1em;">
      <div>${typeIcon} ${avatar} <strong>${name}</strong> ${published}</div>
      <div style="margin-left:2.5em;">${content}</div>
    </div>`;
  }).join('');
}

function fetchWebmentions() {
  fetch(WEBMENTION_API)
    .then(res => res.json())
    .then(renderWebmentions)
    .catch(err => {
      const container = document.getElementById(COMMENTS_CONTAINER_ID);
      if (container) container.innerHTML = `<p style="color:red">Webmention取得エラー: ${err}</p>`;
    });
}

document.addEventListener('DOMContentLoaded', fetchWebmentions);
