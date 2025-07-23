// シンプルなWebmentionエンドポイント発見テスト

const targetUrl = 'https://aboutmonica.com/blog/fetch-webmentions-automatically-with-github-actions';

console.log('Webmentionエンドポイント発見テスト開始');
console.log('対象URL:', targetUrl);

try {
  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Webmention Discovery Bot (https://asadaame5121.net/)'
    },
    redirect: 'follow'
  });
  
  console.log('HTTPステータス:', response.status);
  console.log('Content-Type:', response.headers.get('Content-Type'));
  
  // HTTPヘッダーチェック
  const linkHeader = response.headers.get('Link');
  console.log('Linkヘッダー:', linkHeader || 'なし');
  
  // HTMLコンテンツチェック
  const html = await response.text();
  
  // webmentionリンクを検索
  const webmentionMatch = html.match(/<link[^>]+rel=["']?[^"']*webmention[^"']*["']?[^>]*href=["']([^"']+)["'][^>]*>/i);
  
  if (webmentionMatch) {
    console.log('✅ Webmentionエンドポイント発見:', webmentionMatch[1]);
  } else {
    console.log('❌ Webmentionエンドポイント未発見');
    
    // デバッグ用：webmentionを含む行を表示
    const lines = html.split('\n');
    const webmentionLines = lines.filter(line => line.toLowerCase().includes('webmention'));
    console.log('webmentionを含む行:');
    webmentionLines.forEach((line, index) => {
      console.log(`${index + 1}: ${line.trim()}`);
    });
  }
  
} catch (error) {
  console.error('エラー:', error.message);
}
