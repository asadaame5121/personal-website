// scripts/get-bluesky-likes.ts
// Blueskyでいいねした投稿を取得するスクリプト
import { AtpAgent } from "npm:@atproto/api";
import { load } from "https://deno.land/std/dotenv/mod.ts";

// .envファイルから環境変数を読み込む
await load({ export: true });

/**
 * いいねした投稿を取得して表示する関数
 * @param limit 取得する投稿の最大数
 */
async function getLikedPosts(limit = 10) {
  console.log("Blueskyのいいね投稿取得を開始します...");
  
  try {
    // 環境変数から認証情報を取得
    const identifier = Deno.env.get("BLUESKY_IDENTIFIER");
    const password = Deno.env.get("BLUESKY_PASSWORD");
    
    if (!identifier || !password) {
      throw new Error("環境変数が設定されていません。.envファイルを確認してください。");
    }
    
    console.log(`認証情報: ${identifier} (パスワードは表示しません)`);
    
    // AtpAgentを使用した認証
    console.log("AtpAgentを使用してログイン中...");
    const agent = new AtpAgent({
      service: "https://bsky.social",
    });
    
    const loginResult = await agent.login({
      identifier,
      password,
    });
    
    console.log("認証成功！");
    console.log(`- ハンドル: ${loginResult.data.handle}`);
    
    // 自分のいいねした投稿を取得
    const handle = loginResult.data.handle;
    console.log(`\n${handle}のいいねした投稿を取得します...`);
    
    const likesResult = await agent.getActorLikes({
      actor: handle,
      limit,
    });
    
    const likedPosts = likesResult.data.feed;
    
    console.log(`取得結果: ${likedPosts.length}件のいいね投稿`);
    
    if (likedPosts.length > 0) {
      console.log("\n=== いいねした投稿一覧 ===");
      likedPosts.forEach((item, index) => {
        const post = item.post;
        const author = post.author;
        console.log(`\n[投稿 ${index + 1}]`);
        console.log(`投稿者: ${author.displayName || author.handle} (@${author.handle})`);
        console.log(`日時: ${new Date(post.indexedAt).toLocaleString("ja-JP")}`);
        console.log(`内容: ${post.record.text.substring(0, 100)}${post.record.text.length > 100 ? '...' : ''}`);
        
        // 画像があれば表示
        if (post.embed?.images) {
          console.log(`画像: ${post.embed.images.length}枚`);
        }
        
        // リポスト数といいね数
        console.log(`リポスト数: ${post.repostCount || 0}, いいね数: ${post.likeCount || 0}`);
      });
      
      // いいねした投稿を配列として返す（他の処理で使用可能）
      return likedPosts;
    } else {
      console.log("いいねした投稿が見つかりませんでした。");
      return [];
    }
    
  } catch (error) {
    console.error("\n処理失敗:", error.message);
    console.log("\n考えられる原因:");
    console.log("1. 認証情報（ユーザー名またはパスワード）が間違っている");
    console.log("2. Bluesky APIの仕様が変更されている");
    console.log("3. ネットワーク接続に問題がある");
    console.log("\n対処法:");
    console.log("1. .envファイルの認証情報を確認する");
    console.log("2. Blueskyのウェブサイトで直接ログインできるか確認する");
    console.log("3. Bluesky APIのドキュメントを確認する（https://atproto.com/docs）");
    return [];
  }
}

/**
 * 特定のキーワードを含むいいね投稿を検索する関数
 * @param keyword 検索キーワード
 * @param limit 取得する投稿の最大数
 */
async function searchLikedPosts(keyword: string, limit = 20) {
  console.log(`キーワード「${keyword}」を含むいいね投稿を検索します...`);
  
  try {
    const likedPosts = await getLikedPosts(limit);
    
    if (likedPosts.length === 0) {
      return [];
    }
    
    // キーワードを含む投稿をフィルタリング
    const matchedPosts = likedPosts.filter(item => 
      item.post.record.text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    console.log(`\n検索結果: ${matchedPosts.length}件の投稿が「${keyword}」を含んでいます`);
    
    if (matchedPosts.length > 0) {
      console.log("\n=== 検索結果 ===");
      matchedPosts.forEach((item, index) => {
        const post = item.post;
        const author = post.author;
        console.log(`\n[検索結果 ${index + 1}]`);
        console.log(`投稿者: ${author.displayName || author.handle} (@${author.handle})`);
        console.log(`内容: ${post.record.text.substring(0, 100)}${post.record.text.length > 100 ? '...' : ''}`);
      });
    }
    
    return matchedPosts;
    
  } catch (error) {
    console.error("検索処理中にエラーが発生しました:", error.message);
    return [];
  }
}

// 実行部分
// 引数からキーワードを取得（指定がなければ全ていいね投稿を表示）
const keyword = Deno.args[0];

if (keyword) {
  await searchLikedPosts(keyword);
} else {
  await getLikedPosts();
}

console.log("\n処理完了！");
