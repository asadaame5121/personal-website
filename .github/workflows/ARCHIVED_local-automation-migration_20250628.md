# Workflowsアーカイブ

2025-06-28

ローカル自動化（Deno.cron）移行に伴い、以下のGitHub Actionsワークフローを無効化・アーカイブ化。

- update-clippings.yml
- update-dailylog.yml
- update-submodule.yml

これらのファイルは `.github/workflows/ARCHIVED_local-automation-migration_20250628.md` に記録し、今後はローカル自動化運用を主とする。

---

## アーカイブ理由
- Deno公式unstable APIによるcron運用が安定したため
- サーバレス・CIコスト削減
- サブモジュールやmdファイル競合のリスク低減

---

## アーカイブ手順
- workflowsディレクトリから該当ymlファイルを削除
- このドキュメントに記録
