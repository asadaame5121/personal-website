// Book/_data.ts
// 各BookページのISBNからog_image(OpenBD書影URL)を自動生成するLumeデータファイル
import type { Data } from "lume/core.ts";

export default async function* (pages: Data[]) {
  for (const page of pages) {
    const isbn = page.ISBN as string | undefined;
    let og_image: string | undefined = undefined;
    if (isbn) {
      // OpenBD書影URLを組み立て（API都度取得せずURLのみ生成）
      og_image = `https://cover.openbd.jp/${isbn}.jpg`;
      // 画像が実際に存在するかどうかのチェックは省略（API側404時もimgタグが出ないだけ）
    }
    yield {
      ...page,
      og_image,
    };
  }
}
