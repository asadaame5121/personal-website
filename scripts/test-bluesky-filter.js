// scripts/test-bluesky-filter.js
import { load } from "https://deno.land/std/dotenv/mod.ts";
import getBlueskyPostsFilter from "../_filters/get-bluesky-posts.js";

// .envファイルから環境変数を読み込む
await load({ export: true });

async function testBlueskyFilter() {
  console.log("Blueskyフィルターのテストを開始します...");
  
  // フィルター関数を取得
  const filter = getBlueskyPostsFilter();
  
  // テストするハンドル名（自分のBlueskyハンドル）
  const handle = "asadaame5121.bsky.social"; // 投稿取得用
  const limit = 10; // テスト用に少し多めに設定
  
  console.log(`${handle}の最新${limit}件の投稿を取得します...`);
  
  // 日付フィルタリングなしで投稿を取得するテスト関数
  async function getRawPosts() {
      try {
        // セッション作成
        const createBlueskySession = async () => {
          try {
            // 環境変数から認証情報を取得
            const identifier = Deno.env.get("BLUESKY_IDENTIFIER");
            const password = Deno.env.get("BLUESKY_PASSWORD");
            
            console.log(`認証情報: ${identifier} (パスワードは表示しません)`); 
            
            console.log("Blueskyセッション作成リクエスト送信中...");
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
            
            console.log(`レスポンスステータス: ${response.status}`);
            
            const data = await response.json();
            console.log("レスポンスデータ:", JSON.stringify(data, null, 2));
            
            if (data.error) {
              throw new Error(`API エラー: ${data.error} - ${data.message}`);
            }
            
            return data.accessJwt;
          } catch (error) {
            console.error("Blueskyセッション作成エラー:", error);
            return null;
          }
        };
        
        const session = await createBlueskySession();
        if (!session) {
          console.error("セッション作成に失敗しました");
          return [];
        }
        
        console.log("セッション作成成功！");
        
        // 投稿取得
        const response = await fetch(
          `https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed?actor=${handle}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session}`,
            },
          }
        );
        
        const data = await response.json();
        return data.feed?.map(item => item.post) || [];
      } catch (error) {
        console.error("直接投稿取得エラー:", error);
        return [];
      }
    }
    
    // フィルターなしで直接取得
    const rawPosts = await getRawPosts();
    console.log(`フィルターなしの取得結果: ${rawPosts.length}件の投稿`);
    
    if (rawPosts.length > 0) {
      console.log("\n=== フィルターなしの投稿（最新3件）===");
      rawPosts.slice(0, 3).forEach((post, index) => {
        console.log(`\n[投稿 ${index + 1}]`);
        console.log(`日時: ${new Date(post.indexedAt).toLocaleString("ja-JP")}`);
        console.log(`内容: ${post.record.text.substring(0, 50)}${post.record.text.length > 50 ? '...' : ''}`);
      });
    }
    
    // フィルター関数を実行
    const posts = await filter.getBlueskyPosts(handle, limit);
    
    console.log(`\n本日の投稿の取得結果: ${posts.length}件の投稿`);
    
    // 結果の表示
    if (posts.length > 0) {
      console.log("\n=== 取得した投稿 ===");
      posts.forEach((post, index) => {
        console.log(`\n[投稿 ${index + 1}]`);
        console.log(`日時: ${new Date(post.indexedAt).toLocaleString("ja-JP")}`);
        console.log(`内容: ${post.record.text}`);
        console.log(`URI: ${post.uri}`);
        console.log("------------------------");
      });
    } else {
      console.log("本日の投稿はありませんでした。");
    }
  } catch (error) {
    console.error("テスト実行中にエラーが発生しました:", error);
  }
}

// テスト実行
await testBlueskyFilter();
