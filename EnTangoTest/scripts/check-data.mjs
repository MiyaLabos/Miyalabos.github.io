import { readFile } from 'node:fs/promises';
import { validateBank } from '../quiz.js';

export async function checkData() {
  const bank = validateBank(JSON.parse(await readFile(new URL('../data/questions.json', import.meta.url), 'utf8')));
  for (const grade of [1, 2, 3]) {
    const items = bank.questions.filter((item) => item.grade === grade);
    console.log(`中学${grade}年：${items.length}語、${new Set(items.map((item) => item.unit)).size}単元、選択肢の検査に合格`);
  }
  return bank;
}
await checkData();
