import { readFile } from 'node:fs/promises';
import { normalizedWord, validateBank } from '../quiz.js';

export async function checkData() {
  const bank = validateBank(JSON.parse(await readFile(new URL('../data/questions.json', import.meta.url), 'utf8')));
  const csv = await readFile(new URL('../eigo_19goidata.csv', import.meta.url), 'utf8');
  const listedWords = new Set(csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1).map((line) => normalizedWord(line.split(',')[1])));
  const preparedWords = new Set(bank.questions.map((item) => normalizedWord(item.word)));
  if (listedWords.size !== preparedWords.size || [...listedWords].some((word) => !preparedWords.has(word))) {
    throw new Error('公式語彙CSVにある綴りが問題データと一致しません。');
  }
  for (const grade of [1, 2, 3]) {
    const items = bank.questions.filter((item) => item.grade === grade);
    console.log(`中学${grade}年：${items.length}語、選択肢の検査に合格`);
  }
  console.log(`学年未確認：${bank.questions.filter((item) => item.grade === null).length}語、全収録語：${bank.questions.length}語`);
  return bank;
}
await checkData();
