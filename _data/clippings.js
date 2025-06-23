// _data/clippings.js
import { AtpAgent } from "npm:@atproto/api";

// Deno標準ライブラリ
const { readTextFileSync, readDirSync, existsSync } = Deno;
const { join } = Deno.build.os === "windows" ? 
  (await import("https://deno.land/std@0.170.0/path/win32.ts")) : 
  (await import("https://deno.land/std@0.170.0/path/posix.ts"));

// Front Matterパーサー
import matter from "npm:gray-matter@4.0.3";

// 環境変数の読み込み
try {
  // GitHub Actionsでは環境変数が直接設定されるため、.envファイルは不要
  if (Deno.env.get("GITHUB_ACTIONS") !== "true") {
    const { load } = await import("https://deno.land/std@0.170.0/dotenv/mod.ts");
    await load({ export: true });
  }
} catch (error) {
  console.log("環境変数の読み込みに失敗しましたが続行します", error);
}

// 定期実行用のメイン関数
export default async function() {
  // 1. Obsidianクリッピングの取得
  // リポジトリ内のobsidian/Clippingsパスを使用
  const currentDir = Deno.cwd();
  const clippingsDir = join(currentDir, "obsidian", "Clippings");
  
  // ディレクトリが存在するか確認
  if (!existsSync(clippingsDir)) {
    console.error(`クリッピングディレクトリが見つかりません: ${clippingsDir}`);
    return { items: [], tags: [], lastUpdated: new Date().toISOString() };
  }
  
  // ディレクトリ内のマークダウンファイルを取得
  const files = [];
  try {
    for (const entry of readDirSync(clippingsDir)) {
      if (entry.isFile && entry.name.endsWith(".md")) {
        files.push(entry.name);
      }
    }
  } catch (error) {
    console.error(`ディレクトリの読み取りエラー: ${error.message}`);
    return { items: [], tags: [], lastUpdated: new Date().toISOString() };
  }
  
  const clippings = [];
  const allTags = {};
  
  // Obsidianクリッピングの処理
  files.forEach(file => {
    const filePath = join(clippingsDir, file);
    let content;
    try {
      content = readTextFileSync(filePath);
    } catch (error) {
      console.error(`ファイル読み取りエラー (${file}): ${error.message}`);
      return; // このファイルはスキップ
    }
    
    // Front Matterの解析
    let data = {}, excerpt = "";
    try {
      const parsed = matter(content, { excerpt: true });
      data = parsed.data;
      excerpt = parsed.excerpt || "";
    } catch (error) {
      console.error(`Front Matter解析エラー (${file}): ${error.message}`);
      // 最低限のデータだけで続行
    }
    
    // ファイル名からタイトルを抽出（.mdを除去）
    const fileName = file.replace(/\.md$/, "");
    
    // クリッピングデータを作成
    const clipping = {
      id: fileName.replace(/\s+/g, "-").toLowerCase(),
      title: data.title || fileName,
      url: data.url || "",
      description: data.description || excerpt || "",
      tags: data.tags || [],
      created: data.created || new Date().toISOString().split("T")[0],
      updated: data.updated || data.created || new Date().toISOString().split("T")[0],
      source: "obsidian"
    };
    
    // タグの集計
    if (clipping.tags && Array.isArray(clipping.tags)) {
      clipping.tags.forEach(tag => {
        if (typeof tag === "string") {
          allTags[tag] = (allTags[tag] || 0) + 1;
        }
      });
    }
    
    clippings.push(clipping);
  });
  
  // 2. Blueskyいいね情報の取得（可能な場合）
  try {
    const blueskyLikes = await getBlueskyLikes();
    
    // Blueskyいいねをクリッピング形式に変換して追加
    blueskyLikes.forEach(like => {
      const post = like.post;
      const author = post.author;
      
      // クリッピングデータを作成
      const clipping = {
        id: `bluesky-${post.uri.split('/').pop()}`,
        title: `${author.displayName || author.handle}の投稿`,
        url: `https://bsky.app/profile/${author.handle}/post/${post.uri.split('/').pop()}`,
        description: post.record.text,
        tags: ["Bluesky", "いいね"],
        created: new Date(post.indexedAt).toISOString().split("T")[0],
        updated: new Date(post.indexedAt).toISOString().split("T")[0],
        source: "bluesky",
        author: {
          name: author.displayName || author.handle,
          handle: author.handle,
          avatar: author.avatar
        },
        stats: {
          likes: post.likeCount || 0,
          reposts: post.repostCount || 0
        }
      };
      
      // タグの集計
      clipping.tags.forEach(tag => {
        allTags[tag] = (allTags[tag] || 0) + 1;
      });
      
      clippings.push(clipping);
    });
  } catch (error) {
    console.error("Blueskyデータの取得に失敗しました:", error);
    // エラーが発生しても処理を続行
  }
  
  // 日付の新しい順にソート
  clippings.sort((a, b) => new Date(b.created) - new Date(a.created));
  
  return {
    items: clippings,
    tags: Object.keys(allTags).map(tag => ({
      name: tag,
      count: allTags[tag]
    })).sort((a, b) => b.count - a.count),
    lastUpdated: new Date().toISOString()
  };
}

// Blueskyいいね情報を取得する関数
async function getBlueskyLikes(limit = 10) {
  try {
    // 環境変数から認証情報を取得
    const identifier = Deno.env.get("BLUESKY_IDENTIFIER");
    const password = Deno.env.get("BLUESKY_PASSWORD");
    
    if (!identifier || !password) {
      console.log("Bluesky認証情報が設定されていません");
      return [];
    }
    
    // AtpAgentを使用した認証
    const agent = new AtpAgent({
      service: "https://bsky.social",
    });
    
    const loginResult = await agent.login({
      identifier,
      password,
    });
    
    // 自分のいいねした投稿を取得
    const handle = loginResult.data.handle;
    const likesResult = await agent.getActorLikes({
      actor: handle,
      limit,
    });
    
    return likesResult.data.feed || [];
  } catch (error) {
    console.error("Blueskyいいね取得エラー:", error);
    return [];
  }
}
