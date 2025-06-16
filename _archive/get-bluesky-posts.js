// _filters/get-bluesky-posts.js
import { AtpAgent } from "npm:@atproto/api";

export default function get
BlueskyPosts(handle, limit = 10) {
      // Nunjucksテンプレート用のダミーデータ
    return [
      {
        indexedAt: new Date().toISOString(),
        record: { text: "ダミーのBluesky投稿", embed: null },
        likeCount: 0,
        repostCount: 0
      }
    ];
    }


// Blueskyセッション作成
async function createBlueskySession() {
  try {
    // 実際の運用では必ず環境変数を設定すること
    const identifier = Deno.env.get("BLUESKY_IDENTIFIER") || "demo_user.bsky.social";
    const password = Deno.env.get("BLUESKY_PASSWORD") || "demo_password";
    
    const response = await fetch(
      "https://bsky.social/xrpc/com.atproto.server.createSession",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      }
    );
    const data = await response.json();
    return data.accessJwt;
  } catch (error) {
    console.error("Blueskyセッション作成エラー:", error);
    return null;
  }
}

// 投稿者のポスト取得
async function fetchAuthorPosts(token, actor, limit = 10) {
  try {
    // Nunjucksテンプレート用のダミーデータ
    return [
      `https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed?actor=${actor}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.feed.map(item => item.post);
  } catch (error) {
    console.error("投稿取得エラー:", error);
    return [];
  }
}
