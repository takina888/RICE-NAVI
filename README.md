# RICE NAVI アプリ v1

このフォルダをそのまま GitHub Pages にアップロードすると、スマホで使える軽量Webアプリとして動作します。

## 中身
- `index.html`：アプリ本体
- `styles.css`：デザイン
- `app.js`：検索・診断・表示ロジック
- `data.js`：Excelから抽出したデータ
- `manifest.webmanifest` / `service-worker.js`：スマホインストール・オフライン表示用
- `icon.svg` / `icon-192.png` / `icon-512.png`：アプリアイコン

## 今回取り込んだデータ
- 知識DB：839件
- トラブル診断：40件
- 出典DB：47件

## 使い方
1. GitHubで新しいリポジトリを作る
2. このフォルダ内のファイルをアップロードする
3. Settings → Pages → Branch を `main` / root にする
4. 表示されたURLをスマホで開く
5. iPhoneは共有ボタン → ホーム画面に追加、Androidはインストール

## 注意
食品安全・期限設定・法令判断は、必ず公式資料・社内基準・実測結果で確認してください。
このアプリは現場確認と学習を助けるナレッジ表示ツールです。
