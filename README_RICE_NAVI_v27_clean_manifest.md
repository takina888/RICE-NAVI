RICE NAVI v27 clean manifest package

目的:
- 余分な一時ファイルや診断専用ページを入れない。
- ファイル数を減らしつつ、後から追加しやすいmanifest管理型にする。
- 起動時は data/manifest.json と data/core/home.json だけ読む。
- 米品種250件、世界ランキング、日本語読み物などは画面を開いた時だけ読み込む。

GitHubに置くファイル:
index.html
app.js
styles.css
version.txt
assets/
data/
masters/

注意:
Excelは masters/ に編集用正本として入っています。アプリが読むのは data/ のJSONです。Excelを編集した場合は、対応するJSONの再生成が必要です。
