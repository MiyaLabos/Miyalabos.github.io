# 参照資料と収録範囲

確認日：2026年9月24日

## 対象と語数

東京書籍『NEW HORIZON English Course』令和7年度版（2026年度使用）の公式語彙CSV `eigo_19goidata.csv` に記載された全1,789行を対象にしています。大文字・小文字、全角・半角、曲がったアポストロフィーの違いをそろえ、同じ綴りは代表的な語義を1問にまとめました。収録問題は1,768問です。

| 出題範囲 | 問題数 |
| --- | ---: |
| 中学1年 | 903 |
| 中学2年 | 395 |
| 中学3年 | 326 |
| 学年未確認 | 144 |
| 全収録語 | 1,768 |

学年未確認の語は、学年別テストには含めず、「全収録語」テストから出題します。同じ語が複数学年の資料にある場合は、最も早い学年にまとめています。以前から収録していた345語の単元区分は維持しています。

## 掲載語と学年の照合

- [東京書籍・令和7年度本教科書掲載語彙データの案内](https://ten.tokyo-shoseki.co.jp/text/chu/eigo/download/)
- [公式語彙表（エクセル）](https://ten.tokyo-shoseki.co.jp/text/chu/eigo/download/documents/eigo_19goidata.xlsx)
- [英語漬け・中学1年の単元一覧](https://www.eigo-duke.com/tango/textindexchu1nh.html)
- [英語漬け・中学2年の単元一覧](https://www.eigo-duke.com/tango/textindexchu2nh.html)
- [英語漬け・中学3年の単元一覧](https://www.eigo-duke.com/tango/textindexchu3nh.html)
- [2025年度版の小学校語彙一覧](https://github.com/tgmgroup/Word-List-from-New-Horizons/blob/main/ES%20Words.csv)

公式語彙表には単語ごとの学年・単元情報がありません。2025年度版の公開学習資料で確認できた学年を付け、小学校語彙一覧にある語を中学1年から出題できる語として扱っています。資料から確認できない144語の学年は推測していません。`data/questions.json` の各問題には掲載語の参照先と、確認できた場合の学年資料の参照先を保存しています。

## 意味と選択肢

追加語の日本語訳と品詞は、上記の小学校語彙一覧および[2025年度版の中学校語彙一覧](https://github.com/tgmgroup/Word-List-from-New-Horizons/blob/main/JHS%20Words.csv)を参考に、1問につき短い代表的な意味を選んでいます。活用形・短縮形は元の形との関係を日本語で示すものがあります。複数の意味を持つ語について、教科書の全語義を問うものではありません。

誤答候補は、原則として同じ学年・同じ品詞の別の語から事前に選び、同じ意味や近い意味を避けています。候補が足りない場合は他学年・他品詞から補います。ブラウザでは保存済みの4択を並べ替えるだけです。

## 2026年度の訂正

- [東京書籍・令和7年度版の訂正案内](https://ten.tokyo-shoseki.co.jp/text-information/chu/english-r7/)

以前から収録していた `breed` は訂正後の「繁殖させる」を維持しています。発音記号は表示しません。教科書の本文・画像・音声はアプリに収録していません。
