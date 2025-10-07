const state = {
  words: [],
  quiz: {
    mode: "enToJa",
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    answered: false,
    finished: false,
    lastConfig: {
      mode: "enToJa",
      count: 20,
    },
  },
};

const QUIZ_CHOICES = 5;

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  elements.homeView = document.getElementById("homeView");
  elements.quizView = document.getElementById("quizView");
  elements.quizBackButton = document.getElementById("quizBackButton");
  elements.quizProgressLabel = document.getElementById("quizProgressLabel");
  elements.quizProgressBar = document.getElementById("quizProgressBar");
  elements.quizScoreValue = document.getElementById("quizScoreValue");
  elements.questionMeta = document.getElementById("questionMeta");
  elements.questionPrompt = document.getElementById("questionPrompt");
  elements.questionSubtext = document.getElementById("questionSubtext");
  elements.choicesGrid = document.getElementById("choicesGrid");
  elements.answerStatus = document.getElementById("answerStatus");
  elements.answerDetail = document.getElementById("answerDetail");
  elements.quizRetryButton = document.getElementById("quizRetryButton");
  elements.quizNextButton = document.getElementById("quizNextButton");

  elements.startButton = document.getElementById("startButton");
  elements.dataStatus = document.getElementById("dataStatus");
  elements.quizForm = document.getElementById("quizForm");
  elements.questionCount = document.getElementById("questionCount");

  elements.startButton.disabled = true;

  if (window.location.protocol === "file:") {
    elements.dataStatus.textContent =
      "ローカルファイルから直接開くとブラウザの制限により単語データを読み込めません。" +
      "ターミナルで `python3 -m http.server` などを実行してローカルサーバーを起動し、" +
      "`http://localhost:8000/quiz.html` などのURLからアクセスしてください。";
    return;
  }

  fetchWords();

  elements.quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.words.length) {
      return;
    }
    startQuiz();
  });

  elements.quizBackButton.addEventListener("click", () => {
    if (!state.quiz.questions.length) {
      exitQuizView();
      return;
    }
    const confirmed = window.confirm("現在のテストを終了して設定画面に戻りますか？");
    if (confirmed) {
      exitQuizView();
    }
  });

  elements.quizRetryButton.addEventListener("click", () => {
    retryQuiz();
  });

  document.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("quiz-active")) {
      return;
    }
    if (event.key === "Escape") {
      elements.quizBackButton.click();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (!elements.quizNextButton.disabled) {
        elements.quizNextButton.click();
      }
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
    elements.dataStatus.textContent = `単語データを ${state.words.length} 件読み込みました。`;
    elements.startButton.disabled = false;
  } catch (error) {
    console.error(error);
    elements.dataStatus.textContent = "単語データの読み込みに失敗しました。ページを再読み込みしてください。";
  }
}

function startQuiz() {
  const formData = new FormData(elements.quizForm);
  const mode = formData.get("mode") === "jaToEn" ? "jaToEn" : "enToJa";
  const requestedCount = Number(elements.questionCount.value) || 20;
  const questionCount = clamp(requestedCount, 5, 50);

  if (!prepareQuiz(mode, questionCount)) {
    window.alert("出題に必要な単語が不足しています。設定を見直してください。");
    return;
  }
  enterQuizView();
  renderQuestion();
}

function prepareQuiz(mode, questionCount) {
  const available = state.words.filter((entry) => isValidForMode(entry, mode));
  if (available.length < QUIZ_CHOICES) {
    return false;
  }

  const shuffled = shuffle([...available]);
  const selected = shuffled.slice(0, Math.min(questionCount, available.length));
  const questions = selected.map((entry) => buildQuestion(entry, mode));

  state.quiz.mode = mode;
  state.quiz.questions = questions;
  state.quiz.currentIndex = 0;
  state.quiz.correctCount = 0;
  state.quiz.answered = false;
  state.quiz.finished = false;
  state.quiz.lastConfig = { mode, count: questions.length };

  return true;
}

function buildQuestion(entry, mode) {
  const promptLabel = mode === "enToJa" ? "英語を日本語に訳しましょう" : "意味に合う英単語を選びましょう";
  const promptText = mode === "enToJa" ? entry.word : buildMeaningText(entry);
  const subText = buildQuestionSubtext(entry);

  const options = buildOptions(entry, mode);

  return {
    entry,
    mode,
    promptLabel,
    promptText,
    subText,
    options,
    answerText: mode === "enToJa" ? buildMeaningText(entry) : entry.word,
  };
}

function buildOptions(correctEntry, mode) {
  const pool = state.words.filter(
    (entry) => entry.number !== correctEntry.number && isValidForMode(entry, mode)
  );
  const distractors = shuffle(pool).slice(0, Math.max(0, QUIZ_CHOICES - 1));
  const candidates = shuffle([correctEntry, ...distractors]);

  return candidates.map((entry) => ({
    entry,
    isCorrect: entry.number === correctEntry.number,
    display: mode === "enToJa" ? buildMeaningText(entry) : entry.word,
  }));
}

function renderQuestion() {
  const question = state.quiz.questions[state.quiz.currentIndex];

  elements.questionMeta.textContent = question.promptLabel;
  elements.questionPrompt.textContent = question.promptText;
  if (question.subText) {
    elements.questionSubtext.textContent = question.subText;
    elements.questionSubtext.classList.remove("hidden");
  } else {
    elements.questionSubtext.textContent = "";
    elements.questionSubtext.classList.add("hidden");
  }

  elements.choicesGrid.innerHTML = "";
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.dataset.index = String(index);

    const label = document.createElement("span");
    label.className = "choice-index";
    label.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.className = "choice-text";
    text.textContent = option.display;

    button.append(label, text);
    button.addEventListener("click", () => handleChoice(option, button));
    elements.choicesGrid.appendChild(button);
  });

  elements.answerStatus.textContent = "選択すると結果が表示されます。";
  elements.answerStatus.classList.remove("correct", "incorrect");
  elements.answerDetail.textContent = "";
  elements.quizRetryButton.classList.add("hidden");
  elements.quizRetryButton.disabled = true;

  elements.quizNextButton.disabled = true;
  elements.quizNextButton.textContent =
    state.quiz.currentIndex === state.quiz.questions.length - 1 ? "結果を見る" : "次へ";

  state.quiz.answered = false;
  updateQuizHeader(false);
}

function handleChoice(option, clickedButton) {
  if (state.quiz.answered) {
    return;
  }
  state.quiz.answered = true;

  const buttons = elements.choicesGrid.querySelectorAll("button");
  buttons.forEach((button) => {
    button.disabled = true;
    const idx = Number(button.dataset.index);
    const choice = state.quiz.questions[state.quiz.currentIndex].options[idx];
    if (choice.isCorrect) {
      button.classList.add("correct");
    }
  });

  const question = state.quiz.questions[state.quiz.currentIndex];
  const correctOption = question.options.find((item) => item.isCorrect);

  if (option.isCorrect) {
    state.quiz.correctCount += 1;
    elements.answerStatus.textContent = "◎ 正解です！";
    elements.answerStatus.classList.remove("incorrect");
    elements.answerStatus.classList.add("correct");
    elements.answerDetail.textContent = buildAnswerDetail(question.answerText, option.entry, state.quiz.mode);
  } else {
    elements.answerStatus.textContent = "✕ 不正解";
    elements.answerStatus.classList.remove("correct");
    elements.answerStatus.classList.add("incorrect");
    clickedButton.classList.add("incorrect");
    if (correctOption) {
      elements.answerDetail.textContent = buildAnswerDetail(
        question.answerText,
        correctOption.entry,
        state.quiz.mode
      );
    }
  }

  updateQuizHeader(true);
  elements.quizScoreValue.textContent = state.quiz.correctCount;
  elements.quizNextButton.disabled = false;
}

function goNextQuestion() {
  if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
    state.quiz.currentIndex += 1;
    renderQuestion();
  } else {
    showQuizResult();
  }
}

function showQuizResult() {
  const total = state.quiz.questions.length;
  const correct = state.quiz.correctCount;
  const rate = Math.round((correct / total) * 100);

  state.quiz.finished = true;
  state.quiz.answered = true;
  elements.quizProgressLabel.textContent = "結果";
  elements.quizProgressBar.style.width = "100%";
  elements.quizScoreValue.textContent = `${correct} / ${total}`;

  elements.questionMeta.textContent = "テスト終了";
  elements.questionPrompt.textContent = `${total}問中 ${correct}問正解でした！`;
  elements.questionSubtext.textContent = `正答率 ${rate}%`;
  elements.questionSubtext.classList.remove("hidden");

  elements.choicesGrid.innerHTML = "";
  elements.answerStatus.textContent = buildResultMessage(rate);
  elements.answerStatus.classList.remove("correct", "incorrect");
  elements.answerDetail.textContent = formatResultDetail(total, correct, rate);
  elements.quizRetryButton.classList.remove("hidden");
  elements.quizRetryButton.disabled = false;
  elements.quizNextButton.textContent = "設定画面に戻る";
  elements.quizNextButton.disabled = false;
  elements.quizNextButton.focus();
  elements.quizNextButton.onclick = () => {
    exitQuizView();
  };
}

function buildQuestionSubtext(entry) {
  const pieces = [];
  if (entry.pos) {
    pieces.push(`品詞: ${entry.pos}`);
  }

  const example = (entry.examples || []).find((text) => text && !text.includes("☆"));
  if (example) {
    pieces.push(`例文: ${example}`);
  }

  return pieces.join(" / ");
}

function getPrimaryMeaning(entry) {
  if (!entry.meanings || entry.meanings.length === 0) {
    return "";
  }
  return entry.meanings[0];
}

function buildAnswerDetail(answerText, entry, mode) {
  const parts = [];
  if (mode === "enToJa") {
    parts.push(`意味: ${answerText}`);
    parts.push(`英単語: ${entry.word}`);
  } else {
    parts.push(`英単語: ${answerText}`);
    parts.push(`意味: ${buildMeaningText(entry)}`);
  }

  const example = (entry.examples || []).find((text) => text && !text.includes("☆"));
  if (example) {
    parts.push(`例文: ${example}`);
  }

  return parts.join("\n");
}

function formatResultDetail(total, correct, rate) {
  const parts = [
    `出題数: ${total}問`,
    `正解数: ${correct}問`,
    `正答率: ${rate}%`,
    `出題形式: ${formatModeLabel(state.quiz.mode)}`,
  ];
  return parts.join("\n");
}

function formatModeLabel(mode) {
  return mode === "jaToEn" ? "日本語 → 英語" : "英語 → 日本語";
}

function buildResultMessage(rate) {
  if (rate === 100) {
    return "満点です！素晴らしい！";
  }
  if (rate >= 80) {
    return "よくできました！この調子です。";
  }
  if (rate >= 50) {
    return "あと少し！復習してもう一度挑戦しましょう。";
  }
  return "焦らず続ければ大丈夫。再チャレンジしてみましょう。";
}

function updateQuizHeader(answered) {
  const total = state.quiz.questions.length;
  const current = state.quiz.currentIndex + 1;
  const completed = answered ? current : current - 1;
  const progress = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

  elements.quizProgressLabel.textContent = `${current} / ${total}`;
  elements.quizProgressBar.style.width = `${progress}%`;
  elements.quizScoreValue.textContent = state.quiz.correctCount;
}

function enterQuizView() {
  document.body.classList.add("quiz-active");
  elements.quizView.classList.remove("hidden");
  elements.quizRetryButton.classList.add("hidden");
  elements.quizRetryButton.disabled = true;
  elements.quizRetryButton.onclick = null;
  elements.quizNextButton.onclick = () => {
    if (!state.quiz.answered) {
      return;
    }
    goNextQuestion();
  };
}

function exitQuizView() {
  document.body.classList.remove("quiz-active");
  elements.quizView.classList.add("hidden");
  state.quiz.questions = [];
  state.quiz.currentIndex = 0;
  state.quiz.correctCount = 0;
  state.quiz.answered = false;
  state.quiz.finished = false;
  elements.quizNextButton.disabled = true;
  elements.quizNextButton.textContent = "次へ";
  elements.quizNextButton.onclick = () => {
    if (!state.quiz.answered) {
      return;
    }
    goNextQuestion();
  };
  elements.quizRetryButton.classList.add("hidden");
  elements.quizRetryButton.disabled = true;
  elements.quizRetryButton.onclick = null;
  elements.quizProgressLabel.textContent = "0 / 0";
  elements.quizProgressBar.style.width = "0";
  elements.quizScoreValue.textContent = "0";
  elements.questionMeta.textContent = "英語 → 日本語";
  elements.questionPrompt.textContent = "問題文";
  elements.questionSubtext.textContent = "選択肢から答えを選んでください。";
  elements.questionSubtext.classList.remove("hidden");
  elements.choicesGrid.innerHTML = "";
  elements.answerStatus.textContent = "選択すると結果が表示されます。";
  elements.answerStatus.classList.remove("correct", "incorrect");
  elements.answerDetail.textContent = "";
}

function retryQuiz() {
  const { mode, count } = state.quiz.lastConfig;
  if (!prepareQuiz(mode, count)) {
    window.alert("再挑戦に必要な単語が不足しています。設定を確認してください。");
    return;
  }
  elements.quizRetryButton.classList.add("hidden");
  elements.quizRetryButton.disabled = true;
  elements.quizRetryButton.onclick = null;
  elements.quizNextButton.textContent = "次へ";
  elements.quizNextButton.onclick = () => {
    if (!state.quiz.answered) {
      return;
    }
    goNextQuestion();
  };
  renderQuestion();
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

function buildMeaningText(entry) {
  if (!entry.meanings || entry.meanings.length === 0) {
    return "(意味未登録)";
  }
  return entry.meanings.join(" ／ ");
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

