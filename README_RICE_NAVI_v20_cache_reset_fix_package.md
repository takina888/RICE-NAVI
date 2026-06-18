# RICE NAVI v20 cache reset fix package

v19 の reset.html でキャッシュ初期化画面が「待機中」のまま進まない問題を修正した版です。

## 修正内容
- reset.html のJavaScript構文を修正
- reset.html を自動実行＋ボタン再実行対応に変更
- index/app/data参照を v20 に更新
- Service Worker解除とCache Storage削除を継続

## 公開後の確認
1. GitHubにZIP中身を上書きアップロード
2. `reset.html?v=20` を開く
3. 自動で `index.html?v=20` に遷移することを確認

