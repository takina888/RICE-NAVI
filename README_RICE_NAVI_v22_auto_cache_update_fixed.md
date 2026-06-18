# RICE NAVI v22 auto cache update fixed

v21でindex.htmlが `app.js?v=15` のままになっていた問題を修正しました。

## 主な修正
- index.htmlをv22化
- app.js読み込みを `app.js?v=22` に修正
- styles.css / manifest / iconもv22付きで読み込み
- app.js内のJSON読み込みを `?v=22` に修正
- reset.htmlをv22化し、自動初期化＋ボタン再実行に対応
- sw.jsをv22化し、キャッシュ削除・登録解除を行う非常用SWに修正

## GitHub Pages配置
ZIPの中身をリポジトリ直下へアップロードしてください。

```
RICE-NAVI/
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

通常URL:
`https://takina888.github.io/RICE-NAVI/?v=22`

非常用リセット:
`https://takina888.github.io/RICE-NAVI/reset.html?v=22`
