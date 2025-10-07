const state = {
  words: [],
  print: {
    lastConfig: null,
  },
};

const WORD_NUMBER_MIN = 1;
const WORD_NUMBER_MAX = 2500;

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  elements.generateButton = document.getElementById("generateButton");
  elements.printButton = document.getElementById("printButton");
  elements.printForm = document.getElementById("printForm");
  elements.printPreview = document.getElementById("printPreview");
  elements.printCount = document.getElementById("printCount");
  elements.printStartNumber = document.getElementById("printStartNumber");
  elements.printEndNumber = document.getElementById("printEndNumber");
  elements.printStatus = document.getElementById("printStatus");

  elements.generateButton.disabled = true;
  elements.printButton.disabled = true;

  if (window.location.protocol === "file:") {
    elements.printStatus.textContent =
      "ローカルファイルから直接開くとブラウザの制限により単語データを読み込めません。" +
      "ターミナルで `python3 -m http.server` などを実行してローカルサーバーを起動し、" +
      "`http://localhost:8000/index.html` などのURLからアクセスしてください。";
    return;
  }

  fetchWords();

  elements.generateButton.addEventListener("click", () => {
    if (!state.words.length) {
      elements.printPreview.classList.remove("hidden");
      elements.printPreview.textContent = "単語データの読み込みが完了してから実行してください。";
      return;
    }
    const settings = collectPrintSettings();
    const generated = generatePrintSheets(settings);
    if (generated) {
      elements.printButton.disabled = false;
      elements.generateButton.textContent = "再生成";
      elements.printStatus.textContent = "プリントプレビューを更新しました。";
    }
  });

  elements.printButton.addEventListener("click", () => {
    if (state.print.lastConfig) {
      window.print();
    }
  });
});

async function fetchWords() {
  try {
    const response = await fetch("data/words.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("HTTPエラー");
    }
    const data = await response.json();
    state.words = data.filter((entry) => Array.isArray(entry.meanings));
    elements.printStatus.textContent = `単語データを ${state.words.length} 件読み込みました。`;
    elements.generateButton.disabled = false;
    elements.printButton.disabled = true;
  } catch (error) {
    console.error(error);
    elements.printStatus.textContent = "単語データの読み込みに失敗しました。ページを再読み込みしてください。";
  }
}

function collectPrintSettings() {
  const modeInput = new FormData(elements.printForm).get("printMode");
  const mode = modeInput === "jaToEn" ? "jaToEn" : "enToJa";
  const perPageInput = Number(elements.printCount.value);
  const perPage = clamp(Number.isFinite(perPageInput) ? perPageInput : 20, 10, 30);

  const startInput = Number(elements.printStartNumber.value);
  const endInput = Number(elements.printEndNumber.value);

  let startNumber = Number.isFinite(startInput) ? startInput : WORD_NUMBER_MIN;
  let endNumber = Number.isFinite(endInput) ? endInput : WORD_NUMBER_MAX;

  startNumber = clamp(startNumber, WORD_NUMBER_MIN, WORD_NUMBER_MAX);
  endNumber = clamp(endNumber, WORD_NUMBER_MIN, WORD_NUMBER_MAX);

  if (startNumber > endNumber) {
    [startNumber, endNumber] = [endNumber, startNumber];
  }

  elements.printCount.value = perPage;
  elements.printStartNumber.value = startNumber;
  elements.printEndNumber.value = endNumber;

  return { mode, perPage, pages: 1, startNumber, endNumber };
}

function generatePrintSheets(config) {
  if (!state.words.length) {
    return false;
  }

  const mode = config?.mode ?? "enToJa";
  const perPage = config?.perPage ?? 20;
  const pages = config?.pages ?? 1;
  let startNumber = config?.startNumber ?? WORD_NUMBER_MIN;
  let endNumber = config?.endNumber ?? WORD_NUMBER_MAX;

  startNumber = clamp(startNumber, WORD_NUMBER_MIN, WORD_NUMBER_MAX);
  endNumber = clamp(endNumber, WORD_NUMBER_MIN, WORD_NUMBER_MAX);

  if (startNumber > endNumber) {
    [startNumber, endNumber] = [endNumber, startNumber];
  }

  const available = state.words.filter(
    (entry) => isValidForMode(entry, mode) && isWithinNumberRange(entry, startNumber, endNumber)
  );
  if (available.length < 5) {
    elements.printPreview.classList.remove("hidden");
    elements.printPreview.textContent = "指定範囲に該当するデータが不足しています。";
    return false;
  }

  const totalNeeded = perPage * pages;
  const pool = shuffle([...available]);
  const selected = [];
  let cursor = 0;

  while (selected.length < totalNeeded) {
    if (cursor >= pool.length) {
      cursor = 0;
      pool.sort(() => Math.random() - 0.5);
    }
    selected.push(pool[cursor]);
    cursor += 1;
  }

  const pagesData = [];
  for (let pageIndex = 0; pageIndex < pages; pageIndex += 1) {
    const slice = selected.slice(pageIndex * perPage, (pageIndex + 1) * perPage);
    const questions = slice.map((entry, idx) => {
      const prompt = mode === "enToJa" ? entry.word : buildMeaningText(entry);
      const answerText = mode === "enToJa" ? buildMeaningText(entry) : entry.word;
      const hintParts = [];
      if (entry.pos) {
        hintParts.push(`品詞: ${entry.pos}`);
      }
      const hint = hintParts.join(" / ");
      const fullAnswer =
        mode === "enToJa"
          ? `${answerText}（英語: ${entry.word}）`
          : `${answerText}（日本語: ${buildMeaningText(entry)}）`;
      return {
        index: idx + 1,
        prompt,
        answer: answerText,
        hint,
        fullAnswer,
      };
    });
    pagesData.push({ pageNumber: pageIndex + 1, questions });
  }

  renderPrintPreview(pagesData, mode, { startNumber, endNumber });
  elements.printPreview.classList.remove("hidden");

  state.print.lastConfig = { mode, perPage, pages, startNumber, endNumber };
  elements.printCount.value = perPage;
  elements.printStartNumber.value = startNumber;
  elements.printEndNumber.value = endNumber;

  return true;
}

function renderPrintPreview(pagesData, mode, range) {
  elements.printPreview.innerHTML = "";
  const modeLabel = formatModeLabel(mode);
  const rangeLabel = range ? formatRangeLabel(range.startNumber, range.endNumber) : "";

  pagesData.forEach((page) => {
    const pageBlock = document.createElement("section");
    pageBlock.className = "print-page print-test";

    const header = document.createElement("header");
    header.className = "print-page-header";

    const title = document.createElement("div");
    title.className = "print-title";
    title.textContent = "はば単 小テスト";
    header.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "print-meta";

    const infoGroup = document.createElement("div");
    infoGroup.className = "print-meta-group";

    const modeSpan = document.createElement("span");
    modeSpan.textContent = `形式: ${modeLabel}`;
    infoGroup.appendChild(modeSpan);

    const nameSpan = document.createElement("span");
    nameSpan.textContent = "氏名：＿＿＿＿＿＿＿＿＿＿";
    infoGroup.appendChild(nameSpan);

    const scoreSpan = document.createElement("span");
    scoreSpan.textContent = `得点：＿＿＿＿／${page.questions.length}`;
    infoGroup.appendChild(scoreSpan);

    if (rangeLabel) {
      const rangeSpan = document.createElement("span");
      rangeSpan.textContent = rangeLabel;
      infoGroup.appendChild(rangeSpan);
    }

    meta.appendChild(infoGroup);
    header.appendChild(meta);

    pageBlock.appendChild(header);

    const questionList = document.createElement("ol");
    questionList.className = "print-question-list";

    page.questions.forEach((question) => {
      const item = document.createElement("li");
      item.className = "print-question-item";

      const headerRow = document.createElement("div");
      headerRow.className = "print-question-header";

      const number = document.createElement("span");
      number.className = "print-question-number";
      number.textContent = `（${toFullWidthNumber(question.index)}）`;
      headerRow.appendChild(number);

      const body = document.createElement("div");
      body.className = "print-question-body";

      const questionText = document.createElement("div");
      questionText.className = "print-question-text";
      questionText.textContent = question.prompt;
      body.appendChild(questionText);

      if (question.hint) {
        const hint = document.createElement("div");
        hint.className = "print-question-hint";
        hint.textContent = question.hint;
        body.appendChild(hint);
      }

      headerRow.appendChild(body);
      item.appendChild(headerRow);

      const answerArea = document.createElement("div");
      answerArea.className = "print-answer-area";
      for (let lineIndex = 0; lineIndex < 2; lineIndex += 1) {
        const line = document.createElement("div");
        line.className = "print-answer-line";
        answerArea.appendChild(line);
      }
      item.appendChild(answerArea);
      questionList.appendChild(item);
    });

    pageBlock.appendChild(questionList);
    elements.printPreview.appendChild(pageBlock);
  });

  const answerPage = document.createElement("section");
  answerPage.className = "print-page print-answers";

  const answerHeader = document.createElement("header");
  answerHeader.className = "print-page-header";
  const answerTitle = document.createElement("div");
  answerTitle.className = "print-title";
  answerTitle.textContent = "解答";
  answerHeader.appendChild(answerTitle);

  const answerMeta = document.createElement("div");
  answerMeta.className = "print-meta";
  const answerInfo = document.createElement("div");
  answerInfo.className = "print-meta-group";
  const modeSpan = document.createElement("span");
  modeSpan.textContent = `形式: ${modeLabel}`;
  answerInfo.appendChild(modeSpan);
  if (rangeLabel) {
    const rangeSpan = document.createElement("span");
    rangeSpan.textContent = rangeLabel;
    answerInfo.appendChild(rangeSpan);
  }
  answerMeta.appendChild(answerInfo);
  answerHeader.appendChild(answerMeta);
  answerPage.appendChild(answerHeader);

  pagesData.forEach((page) => {
    const section = document.createElement("section");
    section.className = "answer-section";

    const list = document.createElement("ol");
    list.className = "answer-list";

    page.questions.forEach((question) => {
      const item = document.createElement("li");
      const detail = question.fullAnswer || question.answer;
      const numbering = `（${toFullWidthNumber(question.index)}）`;
      item.textContent = `${numbering} ${detail}`;
      list.appendChild(item);
    });

    section.appendChild(list);
    answerPage.appendChild(section);
  });

  elements.printPreview.appendChild(answerPage);
}

function buildMeaningText(entry) {
  if (!entry.meanings || entry.meanings.length === 0) {
    return "(意味未登録)";
  }
  return entry.meanings.join(" ／ ");
}

function formatModeLabel(mode) {
  return mode === "jaToEn" ? "日本語 → 英語" : "英語 → 日本語";
}

function toFullWidthNumber(value) {
  return String(value).replace(/\d/g, (digit) =>
    String.fromCharCode("０".charCodeAt(0) + Number(digit))
  );
}

function isValidForMode(entry, mode) {
  if (!entry || !entry.word) {
    return false;
  }
  if (!Array.isArray(entry.meanings) || entry.meanings.length === 0) {
    return false;
  }
  if (mode === "enToJa") {
    return Boolean(buildMeaningText(entry));
  }
  return Boolean(entry.word.trim());
}

function isWithinNumberRange(entry, start, end) {
  if (!entry || typeof entry.number !== "number") {
    return false;
  }
  return entry.number >= start && entry.number <= end;
}

function shuffle(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatRangeLabel(start, end) {
  if (typeof start !== "number" || typeof end !== "number") {
    return "";
  }
  return `番号: ${start}～${end}`;
}
