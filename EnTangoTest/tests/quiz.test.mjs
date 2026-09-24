import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { QUESTION_COUNT, normalizedWord, validateBank, createSession, answerQuestion, advanceQuestion, getScore } from '../quiz.js';

const bank = JSON.parse(await readFile(new URL('../data/questions.json', import.meta.url), 'utf8'));
function randomWithSeed(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('CSVの全綴りを1問ずつ収録し、学年と4択が揃う', async () => {
  assert.equal(validateBank(bank), bank);
  const csv = await readFile(new URL('../eigo_19goidata.csv', import.meta.url), 'utf8');
  const listedWords = new Set(csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1).map((line) => normalizedWord(line.split(',')[1])));
  assert.equal(listedWords.size, 1768);
  assert.equal(bank.questions.length, listedWords.size);
  assert.deepEqual(new Set(bank.questions.map((item) => normalizedWord(item.word))), listedWords);
  for (const [grade, count] of [[1, 903], [2, 395], [3, 326]]) {
    const questions = bank.questions.filter((item) => item.grade === grade);
    assert.equal(questions.length, count);
    for (const question of questions) {
      assert.ok(question.meaning.length > 0);
      assert.equal(question.distractors.length, 3);
    }
  }
  assert.equal(bank.questions.filter((item) => item.grade === null).length, 144);
  assert.deepEqual([...new Set(bank.questions.filter((item) => item.unitNumber).map((item) => item.grade))], [1, 2, 3]);
});

test('各学年から重複のない10問を抽出し、正解位置が固定されない', () => {
  const before = JSON.stringify(bank);
  const positions = new Set();
  const samples = new Set();
  for (const grade of [1, 2, 3, 'all']) {
    for (let seed = 1; seed <= 40; seed += 1) {
      const session = createSession(bank, grade, randomWithSeed(seed));
      assert.equal(session.questions.length, QUESTION_COUNT);
      assert.equal(new Set(session.questions.map((item) => item.word)).size, QUESTION_COUNT);
      assert.ok(session.questions.every((item) => grade === 'all' || item.grade === grade));
      for (const question of session.questions) {
        assert.equal(question.options.length, 4);
        assert.equal(question.options.filter((option) => option.correct).length, 1);
        assert.equal(new Set(question.options.map((option) => option.id)).size, 4);
        positions.add(question.options.findIndex((option) => option.correct));
      }
      samples.add(session.questions.map((question) => question.id).join(','));
    }
  }
  assert.equal(positions.size, 4);
  assert.ok(samples.size > 140);
  assert.equal(JSON.stringify(bank), before);
});

test('未回答での進行、二重回答、無効な選択肢、前問の古い操作を拒否する', () => {
  const session = createSession(bank, 1, randomWithSeed(9));
  const question = session.questions[0];
  assert.equal(advanceQuestion(session, question.id), false);
  assert.equal(answerQuestion(session, question.id, '存在しない選択肢'), false);
  assert.equal(answerQuestion(session, '古い問題', question.options[0].id), false);
  assert.equal(answerQuestion(session, question.id, question.options[0].id), true);
  assert.equal(answerQuestion(session, question.id, question.options[1].id), false);
  assert.equal(session.answers.length, 1);
  assert.equal(advanceQuestion(session, question.id), true);
  assert.equal(advanceQuestion(session, question.id), false);
  assert.equal(answerQuestion(session, question.id, question.options[0].id), false);
  assert.equal(session.index, 1);
});

for (const expectedScore of [0, 6, 10]) {
  test(`${expectedScore}問正解の採点・10問終了・再挑戦の初期化`, () => {
    const session = createSession(bank, 3, randomWithSeed(expectedScore + 10));
    for (let index = 0; index < QUESTION_COUNT; index += 1) {
      const question = session.questions[index];
      const option = question.options.find((item) => item.correct === (index < expectedScore));
      assert.equal(answerQuestion(session, question.id, option.id), true);
      assert.equal(session.finished, false);
      assert.equal(advanceQuestion(session, question.id), true);
    }
    assert.equal(session.finished, true);
    assert.equal(session.answers.length, QUESTION_COUNT);
    assert.equal(getScore(session), expectedScore);
    const last = session.questions[9];
    assert.equal(answerQuestion(session, last.id, last.options[0].id), false);
    assert.equal(advanceQuestion(session, last.id), false);
    const fresh = createSession(bank, 3, randomWithSeed(99));
    assert.equal(fresh.answers.length, 0);
    assert.equal(fresh.index, 0);
    assert.equal(fresh.finished, false);
    assert.equal(fresh.grade, 3);
  });
}

test('問題不足・選択肢重複・学年とIDの不備を検出する', () => {
  const mutate = (change) => { const copy = structuredClone(bank); change(copy); return copy; };
  assert.throws(() => validateBank(null));
  assert.throws(() => validateBank(mutate((copy) => { copy.questions = copy.questions.filter((item) => item.grade !== 2); })), /10問/);
  assert.throws(() => validateBank(mutate((copy) => { copy.questions[0].distractors[0] = copy.questions[0].meaning; })), /重複/);
  assert.throws(() => validateBank(mutate((copy) => { copy.questions[0].distractors.pop(); })), /3つ/);
  assert.throws(() => validateBank(mutate((copy) => { copy.questions[0].grade = 4; })));
  assert.throws(() => validateBank(mutate((copy) => { copy.questions[1].id = copy.questions[0].id; })), /重複/);
  assert.throws(() => validateBank(mutate((copy) => { copy.questions[1].word = copy.questions[0].word.toUpperCase(); })), /重複/);
  assert.throws(() => validateBank(mutate((copy) => { copy.questions[1].grade = null; copy.questions[1].word = copy.questions[0].word; })), /重複/);
  assert.throws(() => createSession(bank, 0));
  assert.throws(() => createSession(bank, '1'));
});

test('学年未確認の語は全収録語テストにのみ含める', () => {
  const unknown = bank.questions.find((item) => item.grade === null);
  assert.ok(unknown);
  for (const grade of [1, 2, 3]) assert.ok(!bank.questions.filter((item) => item.grade === grade).includes(unknown));
  assert.ok(bank.questions.includes(unknown));
  const session = createSession(bank, 'all', randomWithSeed(1));
  assert.equal(session.grade, 'all');
  assert.equal(session.questions.length, 10);
  assert.ok(Array.from({ length: 40 }, (_, index) => createSession(bank, 'all', randomWithSeed(index + 1)))
    .some((sample) => sample.questions.some((item) => item.grade === null)));
});

test('意味が近い語や2026年度の訂正に関わる語を確認する', () => {
  const find = (word) => bank.questions.find((question) => question.word === word);
  assert.equal(find('breed').meaning, '繁殖させる');
  for (const [first, second] of [['spot', 'place'], ['choose', 'select'], ['ability', 'skill'], ['overseas', 'abroad'], ['influence', 'impact']]) {
    assert.ok(!find(first).distractors.includes(find(second).meaning));
    assert.ok(!find(second).distractors.includes(find(first).meaning));
  }
});
