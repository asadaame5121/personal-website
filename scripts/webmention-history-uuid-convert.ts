// 履歴ファイル（webmention-history.json）のclippingshare.clip_idをUUIDへ変換するスクリプト
// 実行例: deno run --allow-read --allow-write scripts/webmention-history-uuid-convert.ts

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

const HISTORY_PATH = join("data", "webmention-history.json");
const CLIPPING_PATH = join("external_data", "clippingshare.json");

// ファイル読込
const historyRaw = await Deno.readTextFile(HISTORY_PATH);
const clippingRaw = await Deno.readTextFile(CLIPPING_PATH);
const history = JSON.parse(historyRaw);
const clippings = JSON.parse(clippingRaw);

// タイトル・URL→UUIDマップ作成
const uuidMap = new Map<string, string>();
for (const entry of clippings) {
  if (entry.title && entry.id) uuidMap.set(entry.title, entry.id);
  if (entry.url && entry.id) uuidMap.set(entry.url, entry.id);
}

// 旧clip_idからタイトル推定（.md除去）
function guessTitle(clipId: string): string {
  return clipId.replace(/\.md$/, "");
}

// clippingshare履歴変換
const updated = [];
for (const item of history.sent_webmentions.clippingshare) {
  let uuid = uuidMap.get(item.title) || uuidMap.get(item.target_url);
  if (!uuid && item.clip_id) {
    const title = guessTitle(item.clip_id);
    uuid = uuidMap.get(title);
  }
  if (uuid) {
    updated.push({
      ...item,
      clip_id: uuid,
      source_url: `https://asadaame5121.net/clippingshare/${uuid}`
    });
  } else {
    // マッチしなければ旧clip_idのまま
    updated.push(item);
  }
}

// 履歴オブジェクトを上書き
const newHistory = {
  ...history,
  sent_webmentions: {
    ...history.sent_webmentions,
    clippingshare: updated
  }
};

// 上書き保存
await Deno.writeTextFile(HISTORY_PATH, JSON.stringify(newHistory, null, 2));

console.log("webmention-history.json の clippingshare.clip_id をUUIDへ変換しました。");
