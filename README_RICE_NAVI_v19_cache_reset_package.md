# RICE NAVI v19 cache reset package

v18で「RICE NAVIを読み込み中...」から進まない、またはPCで古い画面が残る問題に対応した版です。

## 変更点

- `index.html` の参照を `?v=19` に更新
- 起動時に古い Service Worker を unregister
- Cache Storage を削除
- `sw.js` を自己解除型に変更
- `reset.html` を追加
- JSON fetch を `cache: no-store` に変更
- 読み込みが9秒以上止まった場合、エラーメッセージを表示

## GitHub Pagesへのアップロード

旧ファイルを削除してから、このZIPの中身をリポジトリ直下へアップロードしてください。

必須配置:

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

## 古い画面が出る場合

公開URLの末尾に以下を付けて開いてください。

```
reset.html?v=19
```

例:

```
https://ユーザー名.github.io/リポジトリ名/reset.html?v=19
```

初期化後、自動で `index.html?v=19` を開きます。
