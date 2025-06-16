// _filters/get-clippingshare.js
// clippingshare.jsonからcreated順で最新10件を返すフィルター
import clippingshare from "../data/clippingshare.json" assert { type: "json" };

export default function getClippingShare(limit = 10) {
  // createdプロパティがあるものだけ、降順ソート
  const sorted = clippingshare
    .filter(item => typeof item.created === "string")
    .sort((a, b) => new Date(b.created) - new Date(a.created));
  return sorted.slice(0, limit);
}
