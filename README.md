# personal-website

個人ウェブサイト（Deno + Lume + Nunjucks + Obsidian連携）

## 概要

このリポジトリは、DenoとLume（静的サイトジェネレーター）、Nunjucksテンプレート、Obsidianノートのサブモジュール連携を活用した個人ウェブサイトのソースです。Obsidianのメモやクリッピング、日報などを自動で抽出・Web公開する仕組みを持ち、独自のタイル型ナビゲーションやソーシャルブックマーク機能も搭載しています。

## 技術スタック
- Deno
- Lume (SSG)
- Nunjucks
- TypeScript, JavaScript
- TailwindCSS, PostCSS
- Obsidian（サブモジュール）

## セットアップ

1. **Denoのインストール**
   - https://deno.com/manual/getting_started/installation

2. **リポジトリのクローンとサブモジュール初期化**
   ```sh
   git clone https://github.com/asadaame5121/personal-website.git
   cd personal-website
   git submodule update --init --recursive
   ```

3. **依存関係のインストール（必要に応じて）**
   - Lumeプラグインやnpmパッケージが必要な場合は、`deno task`や`npm install`を参照

## 主なディレクトリ・ファイル構成

```
personal-website/
├── _components/      # Nunjucks/JSXコンポーネント
├── _includes/        # Nunjucksテンプレート
├── assets/           # 画像・JS・CSS等のアセット
├── data/             # サイト用データ（dailylog.mdなど）
├── obsidian/         # Obsidianノート（サブモジュール）
├── scripts/          # データ抽出・自動化スクリプト
├── src/              # 記事・ページ（Markdown）
├── README.md         # このファイル
└── ...
```

## 開発・ビルド・デプロイ

- **ローカル開発サーバー起動**
  ```sh
  deno task serve
  # または
  lume --serve
  ```
- **ビルド**
  ```sh
  deno task build
  ```
- **デプロイ**
  - GitHub Actionsによる自動デプロイ、またはNetlify/Vercel/Deno Deploy等
  - サブモジュールの自動更新やObsidianノートの抽出もActionsで管理

## Obsidian連携
- `obsidian/`ディレクトリはサブモジュールとして管理
- 日報・クリッピング・読書リスト等はスクリプトで自動抽出し、`data/`配下に変換
- 詳細は`scripts/`や各種ワークフローを参照

## ライセンス
MIT License

## Issue/PRガイドライン
- バグ報告・機能要望はIssueへ
- コントリビュート歓迎

---

