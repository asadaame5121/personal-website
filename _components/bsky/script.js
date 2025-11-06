import { AtpAgent } from "@atproto/api";
import { load } from "@std/dotenv";
await load({ export: true });

async function fetchBskyPosts() {
  const identifier = Deno.env.get("BLUESKY_IDENTIFIER");
  const password = Deno.env.get("BLUESKY_PASSWORD");

  if (!identifier || !password) {
    console.warn("Blueskyの認証情報が設定されていません。.env を確認してください。");
    return [];
  }

  try {
    const agent = new AtpAgent({ service: "https://bsky.social" });
    const loginResult = await agent.login({ identifier, password });
    const handle = loginResult.data.handle ?? identifier;

    const { data } = await agent.getAuthorFeed({
      actor: handle,
      limit: 5,
    });

    return data.feed.map((item) => {
      const post = item.post;
      return {
        uri: post.uri,
        cid: post.cid,
        text: post.record?.text ?? "",
        indexedAt: post.indexedAt,
        likeCount: post.likeCount ?? 0,
        replyCount: post.replyCount ?? 0,
        repostCount: post.repostCount ?? 0,
        author: {
          did: post.author?.did,
          handle: post.author?.handle,
          displayName: post.author?.displayName,
          avatar: post.author?.avatar,
        },
      };
    });
  } catch (error) {
    console.error("Bluesky投稿の取得に失敗しました:", error);
    return [];
  }
}

const posts = await fetchBskyPosts();
export const BskyPost = posts;
export default posts;
