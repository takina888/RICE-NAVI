# RICE NAVI v24 full double-check package

端から端まで再確認した版です。

## 主な修正
- index.html / app.js / reset.html / manifest / sw.js のバージョンを v24 に統一
- app.js 内の古いコメント、重複関数、旧JSON参照を整理
- メインJSONを data/rice_navi_data_v24.json に更新
- 世界の米ランキングは通常コンテンツ、4ヶ国語対応として維持
- 日本語限定は jp_reading_corner のみ
- 番外編 / 暇つぶし表記はアプリ画面から除外
- アプリはExcelを直接読まず、data のJSONを読む軽量構成
- masters には編集用Excelを同梱

## GitHub配置
ZIPの中身をリポジトリ直下に置いてください。

```
index.html
app.js
styles.css
manifest.webmanifest
sw.js
reset.html
assets/
data/
masters/
```

通常確認URL:
`https://takina888.github.io/RICE-NAVI/?v=24`

非常用リセットURL:
`https://takina888.github.io/RICE-NAVI/reset.html?v=24`
