// scripts/test-bluesky-auth.js
// Blueskyの認証情報をテストするシンプルなスクリプト
import { AtpAgent } from "npm:@atproto/api";
import { load } from "https://deno.land/std/dotenv/mod.ts";

// .envファイルから環境変数を読み込む
await load({ export: true });

async function testBlueskyAuth() {
  console.log("Bluesky認証テストを開始します...");
  
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
    
    console.log("認証成功！セッション情報:");
    console.log(`- DID: ${loginResult.data.did}`);
    console.log(`- ハンドル: ${loginResult.data.handle}`);
    console.log(`- メールアドレス: ${loginResult.data.email || "未設定"}`);
    
    // 自分の投稿を取得するテスト
    const handle = loginResult.data.handle;
    console.log(`\n${handle}の投稿を取得します...`);
    
    const feedResult = await agent.getAuthorFeed({
      actor: handle,
      limit: 5,
    });

    const likeResult = await agent.getActorLikes({
      actor: handle,
    });
    
    console.log(`いいね数: ${likeResult.data.total}`);
    
    const posts = feedResult.data.feed;
    
    console.log(`取得結果: ${posts.length}件の投稿`);
    
    if (posts.length > 0) {
      console.log("\n=== 最新の投稿 ===");
      posts.forEach((item, index) => {
        const post = item.post;
        console.log(`\n[投稿 ${index + 1}]`);
        console.log(`日時: ${new Date(post.indexedAt).toLocaleString("ja-JP")}`);
        console.log(`内容: ${post.record.text.substring(0, 100)}${post.record.text.length > 100 ? '...' : ''}`);
      });
    } else {
      console.log("投稿が見つかりませんでした。");
    }
    
    console.log("\nテスト完了！認証と投稿取得が正常に動作しています。");
    
  } catch (error) {
    console.error("\nテスト失敗:", error.message);
    console.log("\n考えられる原因:");
    console.log("1. 認証情報（ユーザー名またはパスワード）が間違っている");
    console.log("2. Bluesky APIの仕様が変更されている");
    console.log("3. ネットワーク接続に問題がある");
    console.log("\n対処法:");
    console.log("1. .envファイルの認証情報を確認する");
    console.log("2. Blueskyのウェブサイトで直接ログインできるか確認する");
    console.log("3. Bluesky APIのドキュメントを確認する（https://atproto.com/docs）");
  }
}

// テスト実行
await testBlueskyAuth();
