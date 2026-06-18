# RICE NAVI v18 operational master package

## 修正内容

- 世界の米ランキングは「番外編」「暇つぶしの読み物」「日本語限定」ではありません。
- 世界の米ランキングは4ヶ国語対応データとして、通常コンテンツに修正しました。
- 日本語限定なのは、添付Excel `rice_navi_jp_reading_corner_yoneshoten.xlsx` の読み物コーナーです。
- 日本語限定読み物は、`data/jp_reading_corner/rice_navi_jp_reading_corner_yoneshoten.json` として別JSON化しました。
- 軽量動作のため、世界ランキングと日本語限定読み物は画面を開いた時だけ読み込みます。

## 軽量化方針

アプリ起動時に読む主データは `data/rice_navi_data_v15.json` のみです。
大型・追加系データは次のように分離しています。

- 米品種: `data/rice_varieties/rice_navi_rice_varieties_ja_LATEST.json`
- 世界の米ランキング: `data/world_rice_rankings/rice_navi_world_rice_rankings_master_v1_multilingual.json`
- 日本語限定読み物: `data/jp_reading_corner/rice_navi_jp_reading_corner_yoneshoten.json`

編集用Excelは `masters/official_edit_masters/` に保管しています。
アプリが直接読むのはJSONです。
