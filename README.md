# 学習ツール集（Miyalabos.github.io）

このリポジトリは、数学・算数の学習用ツールやプリントをまとめた静的サイトです。トップページ（`index.html`）から各ツールへ移動できます。

## 収録コンテンツ
- 二次不等式（`2jifutoushiki/`）
  - 不等式の条件を入力して、解の集合・グラフ・手順解説を表示。
- 二次関数（`2jikansuu/`）
  - 標準形/頂点形と x の変域から y の値域を計算し、グラフと解説を表示。
- 算数プリント集（`sannsuu_pack/`）
  - 入口ページ（タブ切替）から小数のかけ算／たし算・ひき算／わり算のプリントを切替表示。
- 個別ページ（単独で開ける版）
  - 小数のかけ算（`syousuu_kakeru/syousuu_kakeru.html`）
  - 小数のたし算・ひき算（`syousuu_tasihiki/syousuu_tasihiki.html`）
  - わり算 旧版（`Q_maker/warizanmaker.html`）

## 使い方
- すぐ使う
  - ルートの `index.html` をブラウザで開くと、カード型リンク集が表示されます。
  - 直接サブページ（例: `2jifutoushiki/index.html`）を開いても利用できます。
- ローカルサーバでの確認（任意）
  - サイトルートで次を実行し、`http://localhost:8000/` を開きます。
    ```bash
    python3 -m http.server 8000
    ```
  - ブラウザ印刷時の挙動確認や iframe を使うページの動作確認に便利です。

## ディレクトリ構成（抜粋）
```
./
├─ index.html                   # トップページ（カード型リンク集）
├─ 2jifutoushiki/               # 二次不等式（index.html / main.js / styles.css / README.md）
├─ 2jikansuu/                   # 二次関数（index.html / main.js / styles.css / README.md）
├─ sannsuu_pack/                # 算数プリント集（index.html / syousuu_*.html / warizanmaker.html / README.md）
├─ syousuu_kakeru/              # 小数のかけ算（単独ページ）
├─ syousuu_tasihiki/            # 小数のたし算・ひき算（単独ページ）
├─ Q_maker/                     # 旧版: わり算（単独ページ）
└─ .gitignore
```

## トップページ（index.html）の拡張方法
- 「高校数学」「小学生向け 算数プリント」の各ブロックにある `<nav class="grid">` 内へ、次のようなカードを1枚追加します。
- アイコンは絵文字や短いテキスト（例: `f(x)`, `∑`, `📄`）で構いません。

```html
<a class="card" href="your/path/index.html">
  <span class="icon" aria-hidden="true">f(x)</span>
  <h3>ページ名</h3>
  <p class="desc">簡単な説明文をここに。</p>
  <div class="tags">
    <span class="tag">カテゴリ</span><span class="tag">補足</span>
  </div>
  </a>
```

カードは自動的にグリッドで整列・折返しされるため、リンク数を増やしてもレイアウトの違和感は出にくい構成です。

## 印刷に関する注意
- ブラウザやOSにより印刷プレビューの見え方が異なる場合があります。
- `sannsuu_pack/index.html` は `iframe` で各ページを読み込むため、印刷挙動が合わない場合は対象ページ（`syousuu_*.html` / `warizanmaker.html`）を直接開いて印刷すると安定します。

## 開発方針（メモ）
- 画面に表示される文言は日本語、コード（変数名・関数名など）は英語、コメントは日本語を基本としています。
- 静的な HTML / CSS / JavaScript のみで構成しています。

## GitHub Pages で公開（任意）
1. GitHub のリポジトリ設定で、`Settings` → `Pages` を開く。
2. `Build and deployment` を `Deploy from a branch` にし、ブランチ（例: `main`）とルート（`/root`）を選択。
3. 保存後、割り当てられたURLで `index.html` がトップとして表示されます。

## ライセンス
- 未設定（必要に応じて追記してください）。

## 貢献・問い合わせ
- 改善提案や不具合報告は Issue / Pull Request で歓迎します。

