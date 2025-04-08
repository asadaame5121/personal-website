/**
 * Obsidianのクリッピングディレクトリからブックマークデータを生成するスクリプト
 */
const fs = require('node:fs');
const path = require('node:path');
// 注意: 実際の環境では、gray-matterパッケージのインストールが必要です
// npm install gray-matter --save
const matter = require('gray-matter');

// Obsidianのクリッピングディレクトリのパス
const CLIPPINGS_DIR = 'C:/Users/Yudai/Documents/Obsidian/Clippings';

// ブックマークデータの生成
function generateBookmarks() {
  const bookmarks = [];
  const tags = {};
  
  // クリッピングディレクトリ内のMarkdownファイルを読み込む
  const files = fs.readdirSync(CLIPPINGS_DIR)
    .filter(file => file.endsWith('.md'));
  
  files.forEach((file, index) => {
    const filePath = path.join(CLIPPINGS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Front Matterを解析
    const { data } = matter(content);
    
    // 必要なデータを抽出
    const title = path.basename(file, '.md');
    const url = data.Source || '';
    const description = data.Description || '';
    const fileTags = data.Tags ? data.Tags.split(',').map(tag => tag.trim()) : [];
    const created = data.Date || new Date().toISOString();
    
    // タグの集計
    fileTags.forEach(tag => {
      tags[tag] = (tags[tag] || 0) + 1;
    });
    
    // ブックマークオブジェクトの作成
    const bookmark = {
      id: `b${(index + 1).toString().padStart(3, '0')}`,
      title,
      url,
      description,
      tags: fileTags,
      created,
      updated: created,
      thumbnail: '', // サムネイルは空に
      favorite: false
    };
    
    bookmarks.push(bookmark);
  });
  
  // JSONデータの作成
  const bookmarksData = {
    bookmarks,
    tags
  };
  
  // JSONファイルに書き込み
  fs.writeFileSync(
    path.join(__dirname, 'bookmarks.json'),
    JSON.stringify(bookmarksData, null, 2)
  );
  
  console.log(`${bookmarks.length}件のブックマークデータを生成しました。`);
  console.log(`${Object.keys(tags).length}個のタグが見つかりました。`);
}

// 実行
generateBookmarks();
