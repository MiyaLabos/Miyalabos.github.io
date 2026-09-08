import { QUESTION_COUNT, validateBank, createSession, answerQuestion, advanceQuestion, getScore } from './quiz.js';

const app = document.querySelector('#app');
const exitDialog = document.querySelector('#exit-dialog');
let bank = null;
let selectedGrade = 1;
let session = null;
let loading = false;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const arrow = '<span class="arrow" aria-hidden="true">→</span>';

function focusHeading() {
  const heading = app.querySelector('h1');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function renderHome(focus = true) {
  session = null;
  app.innerHTML = `
    <div class="home-layout">
      <section class="hero" aria-labelledby="home-title">
        <p class="eyebrow">今日の、ちいさな積み重ね。</p>
        <h1 id="home-title">英単語を、<br><em>10問ずつ。</em></h1>
        <p class="hero-copy">教科書で出会った単語を、もう一度。<br>4つの意味から選んで、今の理解を確かめよう。</p>
        <div class="test-facts"><div><strong>10<span>問</span></strong><small>1回のテスト</small></div><div><strong>4<span>択</span></strong><small>タップで回答</small></div><div><strong>自分の<span>ペース</span></strong><small>時間制限なし</small></div></div>
      </section>
      <section class="selection-panel" aria-labelledby="grade-title">
        <p class="section-caption">さあ、はじめましょう</p><h2 id="grade-title">学年を選んでスタート</h2>
        <fieldset class="grade-fieldset"><legend class="sr-only">テストの学年</legend>
          ${[1, 2, 3].map((grade) => `<label class="grade-option"><input type="radio" name="grade" value="${grade}" ${grade === selectedGrade ? 'checked' : ''}><span class="grade-content"><span class="grade-number" aria-hidden="true">${grade}</span><span class="grade-description"><strong>中学${grade}年</strong><small>教科書全体から選んだ ${bank.questions.filter((item) => item.grade === grade).length} 語</small></span><span class="radio-mark" aria-hidden="true"></span></span></label>`).join('')}
        </fieldset>
        <button class="button primary full-width" data-action="start">10問テストをはじめる ${arrow}</button>
        <p class="selection-note">英単語 → 日本語の意味 ・ 毎回ランダムに出題</p>
      </section>
    </div>
    <section class="how-it-works" aria-labelledby="how-title"><h2 id="how-title">テストの進め方</h2><div class="step"><span class="step-number" aria-hidden="true">01</span><div><strong>意味を選ぶ</strong><p>4つの選択肢から1つをタップ。</p></div></div><div class="step"><span class="step-number" aria-hidden="true">02</span><div><strong>正解を確かめる</strong><p>1問ずつ、答えを確認して次へ。</p></div></div><div class="step"><span class="step-number" aria-hidden="true">03</span><div><strong>10問を振り返る</strong><p>覚えた単語も、迷った単語も復習。</p></div></div></section>
    <details class="source-details"><summary>教科書と出題範囲について</summary><p>東京書籍『NEW HORIZON English Course』令和7年度版（2026年度使用）対応。各学年の単元から選んだ単語を収録しています。教科書の全掲載語を網羅したものではありません。</p><p>掲載語は東京書籍の公式語彙表、単元構成は公式年間指導計画で照合し、単語と学年・単元の対応は公開されている教科書準拠の学習資料で確認しています。日本語訳と誤答候補は、このテスト用に作成しています。</p><p><a href="https://ten.tokyo-shoseki.co.jp/text/chu/eigo/download/" target="_blank" rel="noopener noreferrer">公式語彙資料</a> ／ <a href="https://ten.tokyo-shoseki.co.jp/text-information/chu/english-r7/" target="_blank" rel="noopener noreferrer">2026年度の訂正情報</a> ／ <a href="./data/sources.md" target="_blank" rel="noopener noreferrer">参照資料と収録範囲</a></p><p>再読み込み・タブを閉じる操作で回答はリセットされます。生徒の氏名や成績の収集は行いません。</p></details>`;
  if (focus) focusHeading();
}

function renderQuestion() {
  const question = session.questions[session.index];
  const current = session.index + 1;
  app.innerHTML = `<div class="quiz-shell">
    <div class="quiz-toolbar"><button class="text-button" data-action="exit"><span aria-hidden="true">←</span> 学年選択に戻る</button><span class="grade-pill">中学${session.grade}年</span></div>
    <div class="progress-heading"><span><strong>${String(current).padStart(2, '0')}</strong><small>／ ${QUESTION_COUNT} 問</small></span><span>あと ${QUESTION_COUNT - session.answers.length} 問</span></div>
    <div class="progress-track" role="progressbar" aria-label="回答済みの問題数" aria-valuemin="0" aria-valuemax="${QUESTION_COUNT}" aria-valuenow="${session.answers.length}">${session.questions.map((_, index) => `<span class="progress-step ${index < session.index ? 'done' : index === session.index ? 'current' : ''}"></span>`).join('')}</div>
    <section class="question-panel" aria-labelledby="question-word">
      <p class="question-intro">この英単語の意味は？</p>
      <div class="word-wrap"><h1 class="english-word" id="question-word" lang="en">${escapeHtml(question.word)}</h1><span class="part-of-speech">${escapeHtml(question.partOfSpeech)}</span>${question.context ? `<p class="context">${escapeHtml(question.context)}</p>` : ''}</div>
      <div class="answer-grid" role="group" aria-label="日本語の意味を1つ選択">${question.options.map((option, index) => `<button class="answer-option" data-action="answer" data-question-id="${escapeHtml(question.id)}" data-option-id="${escapeHtml(option.id)}"><span class="option-number" aria-hidden="true">${index + 1}</span><span>${escapeHtml(option.label)}</span></button>`).join('')}</div>
      <div class="feedback-area"><div id="feedback" role="status" aria-live="polite" aria-atomic="true"></div><p class="answer-hint" id="answer-hint">答えを1つタップしてください。選ぶと回答が確定します。</p></div>
    </section><p class="quiz-bottom">急がなくて大丈夫。自分のペースで進めよう。</p>
  </div>`;
  focusHeading();
}

function renderFeedback() {
  const question = session.questions[session.index];
  const answer = session.answers[session.index];
  for (const button of app.querySelectorAll('[data-action="answer"]')) {
    const option = question.options.find((item) => item.id === button.dataset.optionId);
    button.disabled = true;
    if (option.correct) {
      button.classList.add('is-correct');
      button.querySelector('.option-number').textContent = '✓';
      button.setAttribute('aria-label', `${option.label}：正解${option.id === answer.optionId ? '、あなたの回答' : ''}`);
    } else if (option.id === answer.optionId) {
      button.classList.add('is-wrong');
      button.querySelector('.option-number').textContent = '×';
      button.setAttribute('aria-label', `${option.label}：あなたの回答、不正解`);
    }
  }
  app.querySelector('#answer-hint').hidden = true;
  app.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', session.answers.length);
  app.querySelector('.progress-heading > span:last-child').textContent = `あと ${QUESTION_COUNT - session.answers.length} 問`;
  app.querySelector('#feedback').innerHTML = `<div class="feedback ${answer.correct ? '' : 'wrong'}"><div><div class="feedback-title">${answer.correct ? '✓ 正解です！' : '× この単語を覚えよう'}</div><p>正解：${escapeHtml(question.meaning)}</p></div></div>`;
  const next = document.createElement('button');
  next.className = 'button primary';
  next.dataset.action = 'next';
  next.dataset.questionId = question.id;
  next.innerHTML = `${session.index === QUESTION_COUNT - 1 ? '結果を見る' : '次の問題へ'} ${arrow}`;
  app.querySelector('#feedback .feedback').append(next);
  next.focus({ preventScroll: true });
}

function renderResults() {
  const score = getScore(session);
  const message = score === 10 ? '全問正解！今日の単語、しっかり身についています。' : score >= 7 ? 'よくできました！迷った単語を確認して、もう一歩。' : '最後まで取り組めました。答えを見ながら、ひとつずつ覚えよう。';
  app.innerHTML = `<div class="quiz-shell"><div class="quiz-toolbar"><span class="grade-pill">中学${session.grade}年</span><span class="section-caption">全10問 回答完了</span></div>
    <section class="result-hero" aria-labelledby="result-title"><span class="complete-mark" aria-hidden="true">✓</span><h1 id="result-title">10問、おつかれさまでした。</h1><p>${message}</p><div class="score-card"><div><span class="sr-only">正解数</span><span class="score-value">${score}<small> / 10 問</small></span></div><div class="score-rate">正答率<strong>${score * 10}%</strong></div></div><div class="result-actions"><button class="button primary" data-action="retry">同じ学年でもう一度 ${arrow}</button><button class="button secondary" data-action="home">学年を選び直す</button></div></section>
    <section aria-labelledby="review-title"><div class="review-header"><h2 id="review-title">今回の単語を振り返ろう</h2><span>正解 ${score} ／ 不正解 ${QUESTION_COUNT - score}</span></div><ol class="review-list">${session.questions.map((question, index) => {
      const answer = session.answers[index];
      return `<li class="review-item ${answer.correct ? '' : 'wrong'}"><span class="review-symbol" aria-label="${index + 1}問目 ${answer.correct ? '正解' : '不正解'}">${answer.correct ? '✓' : '×'}</span><div><span class="review-word" lang="en">${escapeHtml(question.word)}</span><small class="review-unit">${escapeHtml(question.partOfSpeech)} ・ ${escapeHtml(question.unit)}</small></div><div class="review-answer"><small>正解</small>${escapeHtml(question.meaning)}${answer.correct ? '' : `<p class="wrong-answer">あなたの回答：${escapeHtml(answer.label)}</p>`}</div></li>`;
    }).join('')}</ol></section><p class="quiz-bottom">再挑戦では、新しく10問を出題します。</p></div>`;
  focusHeading();
}

function showError(message) {
  app.innerHTML = `<section class="error-panel" role="alert"><h1>問題を読み込めませんでした</h1><p>${escapeHtml(message)}</p><button class="button primary" data-action="reload">もう一度読み込む</button></section>`;
  focusHeading();
}

async function loadBank() {
  if (loading) return;
  loading = true;
  app.setAttribute('aria-busy', 'true');
  app.innerHTML = '<section class="loading-panel" role="status"><span class="loading-dot" aria-hidden="true"></span><h1>問題を準備しています</h1><p>もう少しお待ちください。</p></section>';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    if (location.protocol === 'file:') throw new Error('WebサイトのURLから開いてください。ファイルを直接開いた場合は、問題データを読み込めません。');
    const response = await fetch(new URL('./data/questions.json', import.meta.url), { signal: controller.signal, cache: 'no-cache' });
    if (!response.ok) throw new Error('問題データを取得できませんでした。通信状況を確認して、もう一度お試しください。');
    bank = validateBank(await response.json());
    renderHome(false);
  } catch (error) {
    const message = error.name === 'AbortError' ? '読み込みに時間がかかっています。通信状況を確認して、もう一度お試しください。' : error instanceof TypeError ? '通信できませんでした。接続を確認して、もう一度お試しください。' : error instanceof SyntaxError ? '問題データの形式が正しくありません。管理者にお知らせください。' : error.message;
    showError(message);
  } finally {
    clearTimeout(timeout);
    app.setAttribute('aria-busy', 'false');
    loading = false;
  }
}

app.addEventListener('change', (event) => {
  if (event.target.matches('input[name="grade"]')) selectedGrade = Number(event.target.value);
});

app.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'reload') { loadBank(); return; }
  if (!bank) return;
  if (action === 'start' || action === 'retry') {
    session = createSession(bank, selectedGrade);
    renderQuestion();
  } else if (action === 'answer' && session) {
    if (answerQuestion(session, button.dataset.questionId, button.dataset.optionId)) renderFeedback();
  } else if (action === 'next' && session) {
    if (advanceQuestion(session, button.dataset.questionId)) {
      if (session.finished) renderResults();
      else renderQuestion();
    }
  } else if (action === 'home') renderHome();
  else if (action === 'exit') {
    if (typeof exitDialog.showModal === 'function') {
      exitDialog.returnValue = '';
      exitDialog.showModal();
    }
    else if (window.confirm('テストを終了して学年選択に戻りますか？ここまでの回答は保存されません。')) renderHome();
  }
});

exitDialog.addEventListener('close', () => {
  if (exitDialog.returnValue === 'exit') renderHome();
});

loadBank();
