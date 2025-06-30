// 各.mdファイルのファイル名をタイトルとして設定するLume用_data.js
export default function(page) {
  // ファイル名を取得（拡張子なし）
  const filePath = page.src?.path || page.inputPath || '';
  const fileName = filePath.split(/[\\/]/).pop() || '';
  const title = fileName.replace(/\.[^/.]+$/, '');
  return {
    ...page,
    title,
  };
}
