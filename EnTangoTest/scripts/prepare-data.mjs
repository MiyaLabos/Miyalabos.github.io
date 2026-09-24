import { readFile, writeFile } from 'node:fs/promises';
import { normalizedWord, validateBank } from '../quiz.js';

// 配布時に一度だけ実行する。ブラウザで誤答候補を生成しない。
const source = await readFile(new URL('../data/vocabulary.tsv', import.meta.url), 'utf8');
const originalEntries = source.trim().split('\n').slice(1).map((line) => {
  const [grade, unit, word, partOfSpeech, meaning] = line.split('\t');
  return { grade: Number(grade), unit: `第${unit}単元・関連教材`, unitNumber: Number(unit), word, partOfSpeech, meaning,
    source: `https://www.eigo-duke.com/tango/chu${grade}nhu${unit}.html` };
});
const extraSource = await readFile(new URL('../data/expanded-vocabulary.tsv', import.meta.url), 'utf8');
const gradeSources = {
  '小学校語彙': 'https://github.com/tgmgroup/Word-List-from-New-Horizons/blob/main/ES%20Words.csv',
  '中学1年': 'https://www.eigo-duke.com/tango/chu1n.html',
  '中学2年': 'https://www.eigo-duke.com/tango/chu2n.html',
  '中学3年': 'https://www.eigo-duke.com/tango/chu3n.html',
};
const extraEntries = extraSource.trim().split('\n').slice(1).map((line) => {
  const [gradeText, word, partOfSpeech, meaning, evidence] = line.split('\t');
  const grade = gradeText === '未確認' ? null : Number(gradeText);
  if (![1, 2, 3, null].includes(grade) || !word || !partOfSpeech || !meaning ||
      (grade === null ? evidence !== '未確認' : !gradeSources[evidence])) {
    throw new Error(`追加語のデータが正しくありません：${word || line}`);
  }
  return { grade, word, partOfSpeech, meaning, unit: grade === null ? '学年未確認' : '掲載語',
    source: 'https://ten.tokyo-shoseki.co.jp/text/chu/eigo/download/',
    ...(gradeSources[evidence] ? { gradeSource: gradeSources[evidence] } : {}) };
});
const entries = [...originalEntries, ...extraEntries];
const csv = await readFile(new URL('../eigo_19goidata.csv', import.meta.url), 'utf8');
const listedWords = new Set(csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1).map((line) => normalizedWord(line.split(',')[1])));
const preparedWords = new Set(entries.map((entry) => normalizedWord(entry.word)));
if (entries.length !== preparedWords.size || listedWords.size !== preparedWords.size ||
    [...listedWords].some((word) => !preparedWords.has(word))) {
  throw new Error('問題データと公式語彙CSVの綴りが一致しません。');
}

// 類義語・広い意味で正解になり得る語は、同じ問題の選択肢に入れない。
const equivalentGroups = [
  ['spot', 'place'], ['gift', 'souvenir'], ['great', 'cool'], ['love', 'enjoy'],
  ['picture', 'illustration'], ['learn', 'study'], ['choose', 'select'],
  ['important', 'precious', 'necessary'], ['ability', 'skill'],
  ['influence', 'impact'], ['overseas', 'abroad'], ['encourage', 'comfort', 'support'],
  ['animal', 'puppy', 'sheep', 'dolphin', 'bird'], ['people', 'friend', 'teacher', 'parent', 'father', 'brother', 'guide', 'owner', 'performer', 'volunteer', 'cousin', 'grandparent', 'neighbor'],
  ['food', 'fruit', 'meat'], ['sound', 'voice'], ['family', 'parent', 'father', 'brother', 'grandparent', 'cousin'],
  ['flight', 'tour'], ['class', 'lesson'], ['wool', 'fur'], ['clothing', 'accessory'],
  ['danger', 'emergency', 'disaster'], ['condition', 'case'], ['challenge', 'tough'],
];
const meaningKey = (value) => normalizedWord(value).replace(/[〜～…「」・（）()\s]/g, '');
const confusable = (first, second) => {
  const a = meaningKey(first.meaning);
  const b = meaningKey(second.meaning);
  return a === b || (a.length > 1 && b.length > 1 && (a.includes(b) || b.includes(a))) ||
    equivalentGroups.some((group) => group.includes(first.word) && group.includes(second.word));
};

const questions = entries.map((entry, index) => {
  const candidates = entries.filter((other) => other.word !== entry.word && !confusable(entry, other));
  const distractors = [];
  for (const preferred of [
    candidates.filter((candidate) => candidate.grade === entry.grade && candidate.partOfSpeech === entry.partOfSpeech),
    candidates.filter((candidate) => candidate.partOfSpeech === entry.partOfSpeech),
    candidates,
  ]) {
    const start = (index * 17 + 7) % preferred.length;
    for (let step = 0; step < preferred.length && distractors.length < 3; step += 1) {
      const candidate = preferred[(start + step) % preferred.length];
      if (!distractors.some((label) => meaningKey(label) === meaningKey(candidate.meaning))) distractors.push(candidate.meaning);
    }
    if (distractors.length === 3) break;
  }
  if (distractors.length !== 3) throw new Error(`誤答候補が足りません：${entry.word}`);
  return {
    id: `nh-${String(index + 1).padStart(4, '0')}`,
    ...entry,
    distractors,
  };
});

const bank = validateBank({
  schemaVersion: 2,
  edition: '東京書籍 NEW HORIZON English Course 令和7年度版（2026年度使用）',
  preparedAt: '2026-09-24',
  scope: '公式語彙CSVの全1,768綴り。学年を確認できない語は全収録語テストのみで出題します。',
  vocabularySource: 'https://ten.tokyo-shoseki.co.jp/text/chu/eigo/download/documents/eigo_19goidata.xlsx',
  correctionsSource: 'https://ten.tokyo-shoseki.co.jp/text-information/chu/english-r7/',
  questions,
});
await writeFile(new URL('../data/questions.json', import.meta.url), `${JSON.stringify(bank, null, 2)}\n`);
console.log(`${questions.length}語の問題と、各3つの誤答候補を保存しました。`);
