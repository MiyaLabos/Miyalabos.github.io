export const QUESTION_COUNT = 10;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
export const normalizedWord = (value) => value.normalize('NFKC').trim().toLowerCase().replaceAll('’', "'");
const normalized = (value) => value.normalize('NFKC').trim().toLowerCase();

export function questionLocation(item) {
  if (item.grade === null) return '学年未確認';
  const grade = `中学${item.grade}年`;
  return item.unitNumber ? `${grade}・${item.unit}` : grade;
}

export function validateBank(bank) {
  if (!bank || bank.schemaVersion !== 2 || !text(bank.edition) || !Array.isArray(bank.questions)) {
    throw new Error('問題データの形式が正しくありません。');
  }
  const ids = new Set();
  const words = new Set();
  const counts = [0, 0, 0, 0];
  for (const item of bank.questions) {
    if (!item || ![1, 2, 3, null].includes(item.grade) || !['id', 'word', 'partOfSpeech', 'meaning', 'unit', 'source'].every((key) => text(item[key]))) {
      throw new Error('問題データに必要な項目がありません。');
    }
    if (ids.has(item.id)) throw new Error('問題の番号が重複しています。');
    if (item.unitNumber !== undefined && (!Number.isInteger(item.unitNumber) || item.unitNumber < 1 || item.grade === null)) {
      throw new Error('単元番号が正しくありません。');
    }
    ids.add(item.id);
    const wordKey = normalizedWord(item.word);
    if (words.has(wordKey)) throw new Error('英単語の綴りが重複しています。');
    words.add(wordKey);
    if (!Array.isArray(item.distractors) || item.distractors.length !== 3 || !item.distractors.every(text)) {
      throw new Error('誤答候補は3つ必要です。');
    }
    if (new Set([item.meaning, ...item.distractors].map(normalized)).size !== 4) {
      throw new Error('選択肢の意味が重複しています。');
    }
    if (item.grade !== null) counts[item.grade] += 1;
  }
  for (const grade of [1, 2, 3]) {
    if (counts[grade] < QUESTION_COUNT) throw new Error(`中学${grade}年の問題が10問に足りません。`);
  }
  return bank;
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function createSession(bank, grade, random = Math.random) {
  validateBank(bank);
  if (![1, 2, 3, 'all'].includes(grade)) throw new Error('出題範囲を選択してください。');
  const questions = shuffle(bank.questions.filter((item) => grade === 'all' || item.grade === grade), random)
    .slice(0, QUESTION_COUNT)
    .map((item) => ({
      ...item,
      options: shuffle([
        { id: `${item.id}:correct`, label: item.meaning, correct: true },
        ...item.distractors.map((label, index) => ({ id: `${item.id}:wrong-${index}`, label, correct: false })),
      ], random),
    }));
  return { grade, questions, index: 0, answers: [], finished: false };
}

export function answerQuestion(session, questionId, optionId) {
  if (session.finished || session.answers.length !== session.index) return false;
  const question = session.questions[session.index];
  if (question.id !== questionId) return false;
  const option = question.options.find((item) => item.id === optionId);
  if (!option) return false;
  session.answers.push({ questionId, optionId, label: option.label, correct: option.correct });
  return true;
}

export function advanceQuestion(session, questionId) {
  if (session.finished || session.questions[session.index].id !== questionId || session.answers.length !== session.index + 1) return false;
  if (session.answers.length === QUESTION_COUNT) session.finished = true;
  else session.index += 1;
  return true;
}

export function getScore(session) {
  return session.answers.filter((item) => item.correct).length;
}
