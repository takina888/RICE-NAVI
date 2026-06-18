# RICE NAVI v26 full route diagnostic package

この版は、起動停止問題を複数角度から切り分けるための版です。

## 追加した確認導線

- `version.txt`：GitHub Pagesにv26が反映されたか確認するだけの軽いファイル
- `diagnose-v26.html`：主要ファイルとJSONの読込テスト
- `index-v26.html`：通常の `index.html` が古いService Workerに捕まる場合の直接起動用
- `reset.html`：単純化したキャッシュ初期化ページ

## 基本確認URL

1. `https://takina888.github.io/RICE-NAVI/version.txt?v=26`
2. `https://takina888.github.io/RICE-NAVI/diagnose-v26.html?v=26`
3. `https://takina888.github.io/RICE-NAVI/index-v26.html?v=26`
4. `https://takina888.github.io/RICE-NAVI/?v=26`

## 軽量構成

アプリ起動時はExcelを読まず、JSONだけ読みます。Excelは `masters/` に編集用正本として保管しています。
