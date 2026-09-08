import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { QUESTION_COUNT, validateBank, createSession, answerQuestion, advanceQuestion, getScore } from '../quiz.js';

const bank = JSON.parse(await readFile(new URL('../data/questions.json', import.meta.url), 'utf8'));
function randomWithSeed(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('全学年のデータに必要な項目・4択・主要単元が揃う', () => {
  assert.equal(validateBank(bank), bank);
  assert.equal(bank.questions.length, 345);
  for (const [grade, count, units] of [[1, 150, 10], [2, 105, 7], [3, 90, 6]]) {
    const questions = bank.questions.filter((item) => item.grade === grade);
    assert.equal(questions.length, count);
    assert.deepEqual([...new Set(questions.map((item) => item.unitNumber))], Array.from({ length: units }, (_, index) => index + 1));
    for (const question of questions) {
      assert.match(question.meaning, /[ぁ-んァ-ヶ一-龠]/);
      assert.equal(question.distractors.length, 3);
    }
  }
});

test('各学年から重複のない10問を抽出し、正解位置が固定されない', () => {
  const before = JSON.stringify(bank);
  const positions = new Set();
  const samples = new Set();
  for (const grade of [1, 2, 3]) {
    for (let seed = 1; seed <= 40; seed += 1) {
      const session = createSession(bank, grade, randomWithSeed(seed));
      assert.equal(session.questions.length, QUESTION_COUNT);
      assert.equal(new Set(session.questions.map((item) => item.word)).size, QUESTION_COUNT);
      assert.ok(session.questions.every((item) => item.grade === grade));
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
  assert.ok(samples.size > 100);
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
  assert.throws(() => createSession(bank, 0));
  assert.throws(() => createSession(bank, '1'));
});

test('意味が近い語や2026年度の訂正に関わる語を確認する', () => {
  const find = (word) => bank.questions.find((question) => question.word === word);
  assert.equal(find('breed').meaning, '繁殖させる');
  for (const [first, second] of [['spot', 'place'], ['choose', 'select'], ['ability', 'skill'], ['overseas', 'abroad'], ['influence', 'impact']]) {
    assert.ok(!find(first).distractors.includes(find(second).meaning));
    assert.ok(!find(second).distractors.includes(find(first).meaning));
  }
});
