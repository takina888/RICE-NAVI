# RICE NAVI 世界のお米ランキング パッケージ v1

## 内容

このZIPは、RICE NAVI用の「世界のお米ランキング」資料をまとめたものです。

## 収録ファイル

1. `RICE_NAVI_world_rice_rankings_master_v1_multilingual.xlsx`  
   Excel管理用マスター。日本語、英語、繁體中文（台灣）、简体中文（中国）の翻訳入り。

2. `rice_navi_world_rice_rankings_master_v1_multilingual.json`  
   アプリ投入用のJSON構造案。実順位データは未入力。

3. `ranking_master_multilingual.csv`  
   Excelのランキングマスター部分をCSV化したもの。

4. `ranking_items_template.csv`  
   実際のTOP10データを入力するためのテンプレート。

## 採用ランキング11項目

1. 世界の米生産量ランキング / World rice production ranking / 全球稻米生產量排行 / 全球稻米生产量排行
2. 世界の米消費量ランキング / World rice consumption ranking / 全球稻米消費量排行 / 全球稻米消费量排行
3. 1人あたり米消費量ランキング / Per-capita rice consumption ranking / 人均稻米消費量排行 / 人均稻米消费量排行
4. 世界の米輸出国ランキング / World rice exporter ranking / 全球稻米出口國排行 / 全球稻米出口国排行
5. 世界の米輸入国ランキング / World rice importer ranking / 全球稻米進口國排行 / 全球稻米进口国排行
6. 世界の米作付・収穫面積ランキング / World rice harvested area ranking / 全球稻米收穫面積排行 / 全球稻米收获面积排行
7. 米の単収ランキング / Rice yield ranking / 稻米單位面積產量排行 / 稻米单位面积产量排行
8. 世界の米自給率ランキング / World rice self-sufficiency ranking / 全球稻米自給率排行 / 全球稻米自给率排行
9. 世界の米依存度ランキング / World rice dependency ranking / 全球稻米依存度排行 / 全球稻米依存度排行
10. 世界の主食に占める米の割合ランキング / Rice share among staple foods ranking / 主食中稻米占比排行 / 主食中稻米占比排行
11. 世界の米輸出価格ランキング / World rice export price ranking / 全球稻米出口價格排行 / 全球稻米出口价格排行

## 出典方針

主出典は以下を想定しています。

- FAOSTAT: 生産量、収穫面積、単収
- USDA PSD Online: 消費量、輸出量、輸入量
- FAO Food Balance Sheets: 1人あたり消費量、米依存度、主食内米比率
- FAO Rice Price Update: 主要輸出米の価格比較

## 注意

このパッケージは、ランキング設計・翻訳・出典管理用です。  
実際のランキング数値は、出典確認後に `ranking_items_template` へ入力してください。

「世界の米価格ランキング」は誤解を招きやすいため、アプリ表示では  
**主要輸出米の価格比較**  
を推奨します。

作成日: 2026-06-17
