# Cyber Turn Timer

iPadのSafariでの利用を想定した、サイバーパンク・ネオンデザインのWebタイマーアプリケーションです。
静的HTML/CSS/JSのみで作られており、オフラインでも動作します。

## 📱 機能 (Features)

1.  **Clock (時計)**
    - 現在時刻を大きく表示。
2.  **Stopwatch (ストップウォッチ)**
    - 1/100秒単位の計測。
    - Start / Stop / Reset 機能。
3.  **Timer (タイマー)**
    - 分・秒単位での時間設定。
    - カウントダウン機能。
    - タイムアップ時の**画面点滅**および**アラーム音**による通知。
    - *Note: アラーム音はブラウザの制限により、一度画面を操作した後にのみ再生されます。*

## 🎨 デザイン (Design)

- **Theme**: Cyberpunk / Neon
- **Font**: Roboto Mono (可読性と等幅性を重視)
- **Responsive**: iPadの画面サイズに最適化されていますが、PCやスマートフォンでも動作します。

## 🚀 使い方 (Usage)

1.  `index.html` をモダンブラウザ（Safari, Chrome, Firefox等）で開いてください。
2.  画面上部のタブでモードを切り替えます。
3.  各モードのボタンで操作します。

## 🛠 技術スタック (Tech Stack)

- HTML5
- CSS3 (Variables, Flexbox, Animations)
- Vanilla JavaScript
- Google Fonts (Roboto Mono)
- Web Audio API (for Timer Alarm)

## 📁 ディレクトリ構成

```
.
├── index.html  # アプリケーションのエントリーポイント
├── style.css   # スタイル定義
├── script.js   # アプリケーションロジック
└── README.md   # ドキュメント
```

## License

Personal Use
