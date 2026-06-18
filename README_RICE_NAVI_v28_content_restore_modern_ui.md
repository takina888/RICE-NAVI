# RICE NAVI v28 content restore / modern UI

目的：v18/v24系で積み上げたコンテンツを維持し、v27で確認した軽量起動構成を使いながら、古臭く見えないUIへ作り直した版。

## 方針
- 「開くだけ優先」で中身を崩さない。
- 旧JSON（v24/v25/v26）や診断用ファイル、一時ファイルは入れない。
- 起動時は `manifest.json` と core JSON を読み、重いデータは画面を開いた時だけ読む。
- Service Workerはキャッシュ保持に使わない。`sw.js` は古いService Worker解除用の最小ファイル。
- 表示名は「今日の米言葉」に統一。
- 世界の米ランキングは4ヶ国語対応の通常コンテンツ。
- 日本語限定は日本語読み物コーナーのみ。

## GitHub配置
ZIPの中身をリポジトリ直下へ置く。

```
RICE-NAVI/
  index.html
  app.js
  styles.css
  sw.js
  version.txt
  assets/
  data/
  masters/
  README_RICE_NAVI_v28_content_restore_modern_ui.md
```

## 起動確認
- `https://takina888.github.io/RICE-NAVI/version.txt?v=28`
- `https://takina888.github.io/RICE-NAVI/?v=28`

## 編集運用
アプリはJSONを読む。Excelは `masters/official_edit_masters/` に編集用正本として同梱。
Excelを変更した場合はJSON再生成が必要。
