const ELEMENTS = [
  { atomicNumber: 1, symbol: "H", nameJa: "水素", period: 1, group: 1 },
  { atomicNumber: 2, symbol: "He", nameJa: "ヘリウム", period: 1, group: 18 },
  { atomicNumber: 3, symbol: "Li", nameJa: "リチウム", period: 2, group: 1 },
  { atomicNumber: 4, symbol: "Be", nameJa: "ベリリウム", period: 2, group: 2 },
  { atomicNumber: 5, symbol: "B", nameJa: "ホウ素", period: 2, group: 13 },
  { atomicNumber: 6, symbol: "C", nameJa: "炭素", period: 2, group: 14 },
  { atomicNumber: 7, symbol: "N", nameJa: "窒素", period: 2, group: 15 },
  { atomicNumber: 8, symbol: "O", nameJa: "酸素", period: 2, group: 16 },
  { atomicNumber: 9, symbol: "F", nameJa: "フッ素", period: 2, group: 17 },
  { atomicNumber: 10, symbol: "Ne", nameJa: "ネオン", period: 2, group: 18 },
  { atomicNumber: 11, symbol: "Na", nameJa: "ナトリウム", period: 3, group: 1 },
  { atomicNumber: 12, symbol: "Mg", nameJa: "マグネシウム", period: 3, group: 2 },
  { atomicNumber: 13, symbol: "Al", nameJa: "アルミニウム", period: 3, group: 13 },
  { atomicNumber: 14, symbol: "Si", nameJa: "ケイ素", period: 3, group: 14 },
  { atomicNumber: 15, symbol: "P", nameJa: "リン", period: 3, group: 15 },
  { atomicNumber: 16, symbol: "S", nameJa: "硫黄", period: 3, group: 16 },
  { atomicNumber: 17, symbol: "Cl", nameJa: "塩素", period: 3, group: 17 },
  { atomicNumber: 18, symbol: "Ar", nameJa: "アルゴン", period: 3, group: 18 },
  { atomicNumber: 19, symbol: "K", nameJa: "カリウム", period: 4, group: 1 },
  { atomicNumber: 20, symbol: "Ca", nameJa: "カルシウム", period: 4, group: 2 },
  { atomicNumber: 21, symbol: "Sc", nameJa: "スカンジウム", period: 4, group: 3 },
  { atomicNumber: 22, symbol: "Ti", nameJa: "チタン", period: 4, group: 4 },
  { atomicNumber: 23, symbol: "V", nameJa: "バナジウム", period: 4, group: 5 },
  { atomicNumber: 24, symbol: "Cr", nameJa: "クロム", period: 4, group: 6 },
  { atomicNumber: 25, symbol: "Mn", nameJa: "マンガン", period: 4, group: 7 },
  { atomicNumber: 26, symbol: "Fe", nameJa: "鉄", period: 4, group: 8 },
  { atomicNumber: 27, symbol: "Co", nameJa: "コバルト", period: 4, group: 9 },
  { atomicNumber: 28, symbol: "Ni", nameJa: "ニッケル", period: 4, group: 10 },
  { atomicNumber: 29, symbol: "Cu", nameJa: "銅", period: 4, group: 11 },
  { atomicNumber: 30, symbol: "Zn", nameJa: "亜鉛", period: 4, group: 12 },
  { atomicNumber: 31, symbol: "Ga", nameJa: "ガリウム", period: 4, group: 13 },
  { atomicNumber: 32, symbol: "Ge", nameJa: "ゲルマニウム", period: 4, group: 14 },
  { atomicNumber: 33, symbol: "As", nameJa: "ヒ素", period: 4, group: 15 },
  { atomicNumber: 34, symbol: "Se", nameJa: "セレン", period: 4, group: 16 },
  { atomicNumber: 35, symbol: "Br", nameJa: "臭素", period: 4, group: 17 },
  { atomicNumber: 36, symbol: "Kr", nameJa: "クリプトン", period: 4, group: 18 },
  { atomicNumber: 37, symbol: "Rb", nameJa: "ルビジウム", period: 5, group: 1 },
  { atomicNumber: 38, symbol: "Sr", nameJa: "ストロンチウム", period: 5, group: 2 },
  { atomicNumber: 39, symbol: "Y", nameJa: "イットリウム", period: 5, group: 3 },
  { atomicNumber: 40, symbol: "Zr", nameJa: "ジルコニウム", period: 5, group: 4 },
  { atomicNumber: 41, symbol: "Nb", nameJa: "ニオブ", period: 5, group: 5 },
  { atomicNumber: 42, symbol: "Mo", nameJa: "モリブデン", period: 5, group: 6 },
  { atomicNumber: 43, symbol: "Tc", nameJa: "テクネチウム", period: 5, group: 7 },
  { atomicNumber: 44, symbol: "Ru", nameJa: "ルテニウム", period: 5, group: 8 },
  { atomicNumber: 45, symbol: "Rh", nameJa: "ロジウム", period: 5, group: 9 },
  { atomicNumber: 46, symbol: "Pd", nameJa: "パラジウム", period: 5, group: 10 },
  { atomicNumber: 47, symbol: "Ag", nameJa: "銀", period: 5, group: 11 },
  { atomicNumber: 48, symbol: "Cd", nameJa: "カドミウム", period: 5, group: 12 },
  { atomicNumber: 49, symbol: "In", nameJa: "インジウム", period: 5, group: 13 },
  { atomicNumber: 50, symbol: "Sn", nameJa: "スズ", period: 5, group: 14 },
  { atomicNumber: 51, symbol: "Sb", nameJa: "アンチモン", period: 5, group: 15 },
  { atomicNumber: 52, symbol: "Te", nameJa: "テルル", period: 5, group: 16 },
  { atomicNumber: 53, symbol: "I", nameJa: "ヨウ素", period: 5, group: 17 },
  { atomicNumber: 54, symbol: "Xe", nameJa: "キセノン", period: 5, group: 18 },
  { atomicNumber: 55, symbol: "Cs", nameJa: "セシウム", period: 6, group: 1 },
  { atomicNumber: 56, symbol: "Ba", nameJa: "バリウム", period: 6, group: 2 },
  { atomicNumber: 57, symbol: "La", nameJa: "ランタン", period: 8, group: 3, series: "lanthanoid" },
  { atomicNumber: 58, symbol: "Ce", nameJa: "セリウム", period: 8, group: 4, series: "lanthanoid" },
  { atomicNumber: 59, symbol: "Pr", nameJa: "プラセオジム", period: 8, group: 5, series: "lanthanoid" },
  { atomicNumber: 60, symbol: "Nd", nameJa: "ネオジム", period: 8, group: 6, series: "lanthanoid" },
  { atomicNumber: 61, symbol: "Pm", nameJa: "プロメチウム", period: 8, group: 7, series: "lanthanoid" },
  { atomicNumber: 62, symbol: "Sm", nameJa: "サマリウム", period: 8, group: 8, series: "lanthanoid" },
  { atomicNumber: 63, symbol: "Eu", nameJa: "ユウロピウム", period: 8, group: 9, series: "lanthanoid" },
  { atomicNumber: 64, symbol: "Gd", nameJa: "ガドリニウム", period: 8, group: 10, series: "lanthanoid" },
  { atomicNumber: 65, symbol: "Tb", nameJa: "テルビウム", period: 8, group: 11, series: "lanthanoid" },
  { atomicNumber: 66, symbol: "Dy", nameJa: "ジスプロシウム", period: 8, group: 12, series: "lanthanoid" },
  { atomicNumber: 67, symbol: "Ho", nameJa: "ホルミウム", period: 8, group: 13, series: "lanthanoid" },
  { atomicNumber: 68, symbol: "Er", nameJa: "エルビウム", period: 8, group: 14, series: "lanthanoid" },
  { atomicNumber: 69, symbol: "Tm", nameJa: "ツリウム", period: 8, group: 15, series: "lanthanoid" },
  { atomicNumber: 70, symbol: "Yb", nameJa: "イッテルビウム", period: 8, group: 16, series: "lanthanoid" },
  { atomicNumber: 71, symbol: "Lu", nameJa: "ルテチウム", period: 8, group: 17, series: "lanthanoid" },
  { atomicNumber: 72, symbol: "Hf", nameJa: "ハフニウム", period: 6, group: 4 },
  { atomicNumber: 73, symbol: "Ta", nameJa: "タンタル", period: 6, group: 5 },
  { atomicNumber: 74, symbol: "W", nameJa: "タングステン", period: 6, group: 6 },
  { atomicNumber: 75, symbol: "Re", nameJa: "レニウム", period: 6, group: 7 },
  { atomicNumber: 76, symbol: "Os", nameJa: "オスミウム", period: 6, group: 8 },
  { atomicNumber: 77, symbol: "Ir", nameJa: "イリジウム", period: 6, group: 9 },
  { atomicNumber: 78, symbol: "Pt", nameJa: "白金", period: 6, group: 10 },
  { atomicNumber: 79, symbol: "Au", nameJa: "金", period: 6, group: 11 },
  { atomicNumber: 80, symbol: "Hg", nameJa: "水銀", period: 6, group: 12 },
  { atomicNumber: 81, symbol: "Tl", nameJa: "タリウム", period: 6, group: 13 },
  { atomicNumber: 82, symbol: "Pb", nameJa: "鉛", period: 6, group: 14 },
  { atomicNumber: 83, symbol: "Bi", nameJa: "ビスマス", period: 6, group: 15 },
  { atomicNumber: 84, symbol: "Po", nameJa: "ポロニウム", period: 6, group: 16 },
  { atomicNumber: 85, symbol: "At", nameJa: "アスタチン", period: 6, group: 17 },
  { atomicNumber: 86, symbol: "Rn", nameJa: "ラドン", period: 6, group: 18 },
  { atomicNumber: 87, symbol: "Fr", nameJa: "フランシウム", period: 7, group: 1 },
  { atomicNumber: 88, symbol: "Ra", nameJa: "ラジウム", period: 7, group: 2 },
  { atomicNumber: 89, symbol: "Ac", nameJa: "アクチニウム", period: 9, group: 3, series: "actinoid" },
  { atomicNumber: 90, symbol: "Th", nameJa: "トリウム", period: 9, group: 4, series: "actinoid" },
  { atomicNumber: 91, symbol: "Pa", nameJa: "プロトアクチニウム", period: 9, group: 5, series: "actinoid" },
  { atomicNumber: 92, symbol: "U", nameJa: "ウラン", period: 9, group: 6, series: "actinoid" },
  { atomicNumber: 93, symbol: "Np", nameJa: "ネプツニウム", period: 9, group: 7, series: "actinoid" },
  { atomicNumber: 94, symbol: "Pu", nameJa: "プルトニウム", period: 9, group: 8, series: "actinoid" },
  { atomicNumber: 95, symbol: "Am", nameJa: "アメリシウム", period: 9, group: 9, series: "actinoid" },
  { atomicNumber: 96, symbol: "Cm", nameJa: "キュリウム", period: 9, group: 10, series: "actinoid" },
  { atomicNumber: 97, symbol: "Bk", nameJa: "バークリウム", period: 9, group: 11, series: "actinoid" },
  { atomicNumber: 98, symbol: "Cf", nameJa: "カリホルニウム", period: 9, group: 12, series: "actinoid" },
  { atomicNumber: 99, symbol: "Es", nameJa: "アインスタイニウム", period: 9, group: 13, series: "actinoid" },
  { atomicNumber: 100, symbol: "Fm", nameJa: "フェルミウム", period: 9, group: 14, series: "actinoid" },
  { atomicNumber: 101, symbol: "Md", nameJa: "メンデレビウム", period: 9, group: 15, series: "actinoid" },
  { atomicNumber: 102, symbol: "No", nameJa: "ノーベリウム", period: 9, group: 16, series: "actinoid" },
  { atomicNumber: 103, symbol: "Lr", nameJa: "ローレンシウム", period: 9, group: 17, series: "actinoid" },
  { atomicNumber: 104, symbol: "Rf", nameJa: "ラザホージウム", period: 7, group: 4 },
  { atomicNumber: 105, symbol: "Db", nameJa: "ドブニウム", period: 7, group: 5 },
  { atomicNumber: 106, symbol: "Sg", nameJa: "シーボーギウム", period: 7, group: 6 },
  { atomicNumber: 107, symbol: "Bh", nameJa: "ボーリウム", period: 7, group: 7 },
  { atomicNumber: 108, symbol: "Hs", nameJa: "ハッシウム", period: 7, group: 8 },
  { atomicNumber: 109, symbol: "Mt", nameJa: "マイトネリウム", period: 7, group: 9 },
  { atomicNumber: 110, symbol: "Ds", nameJa: "ダームスタチウム", period: 7, group: 10 },
  { atomicNumber: 111, symbol: "Rg", nameJa: "レントゲニウム", period: 7, group: 11 },
  { atomicNumber: 112, symbol: "Cn", nameJa: "コペルニシウム", period: 7, group: 12 },
  { atomicNumber: 113, symbol: "Nh", nameJa: "ニホニウム", period: 7, group: 13 },
  { atomicNumber: 114, symbol: "Fl", nameJa: "フレロビウム", period: 7, group: 14 },
  { atomicNumber: 115, symbol: "Mc", nameJa: "モスコビウム", period: 7, group: 15 },
  { atomicNumber: 116, symbol: "Lv", nameJa: "リバモリウム", period: 7, group: 16 },
  { atomicNumber: 117, symbol: "Ts", nameJa: "テネシン", period: 7, group: 17 },
  { atomicNumber: 118, symbol: "Og", nameJa: "オガネソン", period: 7, group: 18 },
];

const ALLOWED_QUIZ_SYMBOLS = [
  "H",
  "He",
  "Li",
  "Be",
  "B",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
  "K",
  "Ca",
  "Cu",
  "Zn",
  "Ag",
  "Fe",
  "Sn",
  "Ba",
  "Pt",
  "Au",
  "Hg",
  "Pb",
];

const QUIZ_COUNT_OPTIONS = [10, 20, 30];
const DEFAULT_QUIZ_COUNT = 10;
const QUIZ_RANGE_LABEL = "指定30元素";

const state = {
  quizItems: [],
  quizMeta: null,
  quizCount: DEFAULT_QUIZ_COUNT,
};

const questionPage = document.querySelector("#questionPage");
const answerPage = document.querySelector("#answerPage");
const generateButton = document.querySelector("#generateButton");
const printButton = document.querySelector("#printButton");
const quizCountSelect = document.querySelector("#quizCountSelect");

quizCountSelect.value = String(state.quizCount);

generateButton.addEventListener("click", () => {
  regenerateQuiz();
});

printButton.addEventListener("click", () => {
  window.print();
});

quizCountSelect.addEventListener("change", (event) => {
  const nextCount = Number(event.target.value);

  if (!QUIZ_COUNT_OPTIONS.includes(nextCount)) {
    return;
  }

  state.quizCount = nextCount;
  regenerateQuiz();
});

function regenerateQuiz() {
  state.quizItems = createQuizItems(ELEMENTS, state.quizCount);
  state.quizMeta = createQuizMeta();
  render();
}

function isQuizEligible(element) {
  return ALLOWED_QUIZ_SYMBOLS.includes(element.symbol);
}

function createQuizItems(elements, count) {
  const pool = elements.filter(isQuizEligible);

  if (count > pool.length) {
    throw new Error(`出題数 ${count} が候補数 ${pool.length} を超えています。`);
  }

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool
    .slice(0, count)
    .sort((left, right) => left.atomicNumber - right.atomicNumber)
    .map((element, index) => ({
      atomicNumber: element.atomicNumber,
      questionNumber: index + 1,
    }));
}

function createQuizMeta() {
  const now = new Date();
  const createdAt = now.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const id = `PT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  return { createdAt, id };
}

function render() {
  renderQuestionPage();
  renderAnswerPage();
}

function renderQuestionPage() {
  questionPage.replaceChildren(
    buildPage({
      eyebrow: "1枚目",
      title: "元素記号 穴埋め問題",
      meta: [
        createMetaField("名前"),
        createScoreField("点数"),
      ],
      tableMode: "question",
      footerNote: "○で囲まれた番号に対応する元素記号を、下の回答欄へ記入する。",
      includeAnswerSheet: true,
    })
  );
}

function renderAnswerPage() {
  answerPage.replaceChildren(
    buildPage({
      eyebrow: "2枚目",
      title: "模範解答",
      meta: [createPlainMeta(`問題番号 ${state.quizMeta.id}`)],
      tableMode: "answer",
      footerNote: "問題用紙と同じ番号を使って採点できます。",
      includeAnswerSheet: false,
    })
  );
}

function buildPage({ eyebrow, title, meta, tableMode, footerNote, includeAnswerSheet }) {
  const pageContent = document.createElement("div");
  pageContent.className = "page__content";

  pageContent.append(createHeader(eyebrow, title, meta));
  pageContent.append(createLegend());
  pageContent.append(createPeriodicTable(tableMode));

  if (includeAnswerSheet) {
    pageContent.append(createAnswerSheet());
  } else {
    pageContent.append(createAnswerKey());
  }

  pageContent.append(createFooter(footerNote));
  return pageContent;
}

function createHeader(eyebrow, title, metaNodes) {
  const template = document.querySelector("#headerTemplate");
  const header = template.content.firstElementChild.cloneNode(true);
  header.querySelector(".sheet-header__eyebrow").textContent = eyebrow;
  header.querySelector(".sheet-header__title").textContent = title;
  const meta = header.querySelector(".sheet-header__meta");
  metaNodes.forEach((node) => meta.append(node));
  return header;
}

function createMetaField(label) {
  const field = document.createElement("div");
  field.className = "meta-field";

  const labelNode = document.createElement("span");
  labelNode.textContent = label;

  const line = document.createElement("span");
  line.className = "meta-line";

  field.append(labelNode, line);
  return field;
}

function createScoreField(label) {
  const field = document.createElement("div");
  field.className = "score-field";

  const labelNode = document.createElement("span");
  labelNode.textContent = label;

  const box = document.createElement("span");
  box.className = "score-box";

  const unit = document.createElement("span");
  unit.textContent = ` / ${state.quizCount}`;

  field.append(labelNode, box, unit);
  return field;
}

function createPlainMeta(text) {
  const node = document.createElement("p");
  node.className = "guide";
  node.textContent = text;
  return node;
}

function createLegend() {
  const wrapper = document.createElement("div");
  wrapper.className = "legend";

  const info = document.createElement("p");
  info.className = "guide";
  info.textContent = `作成日時 ${state.quizMeta.createdAt}`;

  const items = document.createElement("div");
  items.className = "legend__items";

  const badge = document.createElement("div");
  badge.className = "legend-chip";
  const badgeSample = document.createElement("span");
  badgeSample.className = "legend-chip__sample";
  const badgeText = document.createElement("span");
  badgeText.textContent = `出題された${state.quizCount}問`;
  badge.append(badgeSample, badgeText);

  const cellInfo = document.createElement("span");
  cellInfo.textContent = `${QUIZ_RANGE_LABEL}から${state.quizCount}問を出題・原子番号順で番号付け`;
  items.append(badge, cellInfo);

  wrapper.append(info, items);
  return wrapper;
}

function createPeriodicTable(mode) {
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";

  const table = document.createElement("div");
  table.className = "periodic-table";

  const quizMap = new Map(state.quizItems.map((item) => [item.atomicNumber, item.questionNumber]));

  ELEMENTS.forEach((element) => {
    const isBlank = quizMap.has(element.atomicNumber);
    const questionNumber = quizMap.get(element.atomicNumber) ?? null;
    table.append(createElementCell(element, mode, isBlank, questionNumber));
  });

  wrap.append(table);
  return wrap;
}

function createElementCell(element, mode, isBlank, questionNumber) {
  const cell = document.createElement("article");
  cell.className = `element-cell${isBlank ? " element-cell--blank" : ""}`;
  cell.style.gridColumn = String(element.group);
  cell.style.gridRow = String(element.period);

  const atomicNumber = document.createElement("div");
  atomicNumber.className = "element-cell__atomic-number";
  atomicNumber.textContent = element.atomicNumber;

  const symbol = document.createElement("div");
  symbol.className = "element-cell__symbol";
  symbol.textContent = isBlank && mode === "question" ? "" : element.symbol;

  const name = document.createElement("div");
  name.className = "element-cell__name";
  name.textContent = element.nameJa;

  cell.append(atomicNumber, symbol, name);

  if (questionNumber) {
    const badge = document.createElement("div");
    badge.className = "question-badge";
    badge.textContent = questionNumber;
    badge.setAttribute("aria-label", `問題番号 ${questionNumber}`);
    cell.append(badge);
  }

  return cell;
}

function createAnswerSheet() {
  const fragment = document.createDocumentFragment();

  const note = document.createElement("p");
  note.className = "answer-sheet__note";
  note.textContent = "回答欄";
  fragment.append(note);

  const sheet = document.createElement("section");
  sheet.className = "answer-sheet";

  state.quizItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "answer-sheet__item";

    const badge = document.createElement("div");
    badge.className = "question-badge";
    badge.textContent = item.questionNumber;
    badge.setAttribute("aria-hidden", "true");

    const line = document.createElement("div");
    line.className = "answer-sheet__line";

    row.append(badge, line);
    sheet.append(row);
  });

  fragment.append(sheet);
  return fragment;
}

function createAnswerKey() {
  const fragment = document.createDocumentFragment();

  const note = document.createElement("p");
  note.className = "answer-sheet__note";
  note.textContent = `出題された${state.quizCount}問の正答一覧`;
  fragment.append(note);

  const key = document.createElement("section");
  key.className = "answer-key";

  state.quizItems.forEach((item) => {
    const element = ELEMENTS.find(({ atomicNumber }) => atomicNumber === item.atomicNumber);
    const row = document.createElement("div");
    row.className = "answer-key__item";

    const badge = document.createElement("div");
    badge.className = "question-badge";
    badge.textContent = item.questionNumber;
    badge.setAttribute("aria-hidden", "true");

    const symbol = document.createElement("span");
    symbol.className = "answer-key__symbol";
    symbol.textContent = element.symbol;

    const name = document.createElement("span");
    name.textContent = `${element.nameJa}（${element.atomicNumber}）`;

    row.append(badge, symbol, name);
    key.append(row);
  });

  fragment.append(key);
  return fragment;
}

function createFooter(noteText) {
  const footer = document.createElement("footer");
  footer.className = "page-footer";

  const left = document.createElement("p");
  left.className = "guide";
  left.textContent = noteText;

  const right = document.createElement("p");
  right.className = "guide";
  right.textContent = `問題番号 ${state.quizMeta.id}`;

  footer.append(left, right);
  return footer;
}

regenerateQuiz();
