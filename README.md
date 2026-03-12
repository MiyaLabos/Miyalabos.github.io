# 学習ツール集（Miyalabos.github.io）

このリポジトリは、算数・数学・英語・理科の学習用ツールをまとめた静的サイトです。  
ルートの `index.html` から各教材へ移動できます。

## 収録コンテンツ

### 高校数学
- `koukou/2jifutoushiki/`
  - 二次不等式の解の集合、グラフ、手順解説を表示します。
- `koukou/2jikansuu/`
  - 二次関数の変域と値域を計算し、グラフつきで確認できます。
- `koukou/3kakuhi/`
  - 三角比を直角三角形・単位円・グラフ・クイズで学べる試作教材です。

### 中学数学
- `chuugaku/1jihouteishiki/`
  - 一次方程式プリントを自動生成し、問題・解答を印刷できます。
- `chuugaku/2jihouteishiki/`
  - 二次方程式プリントを自動生成し、問題・解答を印刷できます。
- `chuugaku/insuubunkai/`
  - 因数分解の問題を条件付きで自動生成し、印刷できます。
- `chuugaku/tenkai/`
  - 展開公式の問題を形式ごとに切り替えて自動生成し、印刷できます。

### 小学生向け
- `sannsuu_pack/`
  - 小数・整数・分数・わり算のプリントをタブ切り替えで利用できます。
- `Tenkaizu/`
  - 立方体の展開図を作り、3D 表示で組み立てを確認できます。

### 英語学習
- `TangoTester/`
  - 英検3〜5級の単語テストを条件指定で生成し、印刷できます。
- `habatan/`
  - はば単 2,500 をもとに、プリント作成ページと 5 択クイズページを提供します。

### 理科
- `genso/`
  - 周期表の穴埋め問題を自動生成し、問題用紙と模範解答を印刷できます。

### 学習サポート
- `Timer/`
  - 時計・ストップウォッチ・カウントダウンを備えたタイマーです。

## 使い方

### すぐ使う
- ルートの `index.html` をブラウザで開くと、教材一覧のトップページが表示されます。
- 必要な教材のカードを選ぶと、各ページへ移動できます。
- 直接サブページを開いて利用しても構いません。

### ローカルサーバーを使う場合
一部の教材は `fetch()` や ES Modules を利用しているため、ブラウザで直接ファイルを開くと動作しない場合があります。必要に応じて、サイトルートで次を実行してください。

```bash
python3 -m http.server 8000
```

その後、`http://localhost:8000/` を開きます。

ローカルサーバーの利用が推奨される主な教材:
- `TangoTester/`
- `habatan/`
- `Tenkaizu/`

## ディレクトリ構成（抜粋）

```text
./
├─ index.html                  # トップページ
├─ README.md                   # リポジトリ案内
├─ koukou/                     # 高校数学教材
├─ chuugaku/                   # 中学数学教材
├─ sannsuu_pack/               # 小学生向け算数プリント集
├─ Tenkaizu/                   # 立方体展開図教材
├─ TangoTester/                # 英単語テスト生成
├─ habatan/                    # はば単プリント・クイズ
├─ genso/                      # 元素記号プリント
├─ Timer/                      # タイマー
└─ .gitignore
```

## トップページへの追加方法
`index.html` の各カテゴリにある `<nav class="grid">` 内へ、次の形式でカードを追加します。

```html
<a class="card" href="your/path/index.html">
  <span class="icon" aria-hidden="true">f(x)</span>
  <h3>ページ名</h3>
  <p class="desc">簡単な説明文をここに書きます。</p>
  <div class="tags">
    <span class="tag">カテゴリ</span><span class="tag">補足</span>
  </div>
</a>
```

カードはグリッドで自動整列されるため、数を増やしてもレイアウトが崩れにくい構成です。

## 補足
- ブラウザや OS によって印刷プレビューの見え方が異なる場合があります。
- `sannsuu_pack/index.html` は `iframe` を使って各ページを切り替えるため、印刷が安定しない場合は個別ページを直接開いて印刷してください。

## 開発方針
- 画面に表示する文言は日本語を基本とします。
- コードの識別子は英語、コメントは日本語を基本とします。
- 基本構成は静的な HTML / CSS / JavaScript です。

## GitHub Pages で公開する場合
1. GitHub のリポジトリ設定で `Settings` → `Pages` を開きます。
2. `Build and deployment` を `Deploy from a branch` に設定します。
3. ブランチとルートを指定して保存すると、`index.html` をトップページとして公開できます。

## ライセンス
- 未設定です。必要に応じて追記してください。
