import { readFile, writeFile } from 'node:fs/promises';
import { validateBank } from '../quiz.js';

// 配布時に一度だけ実行する。ブラウザで誤答候補を生成しない。
const source = await readFile(new URL('../data/vocabulary.tsv', import.meta.url), 'utf8');
const entries = source.trim().split('\n').slice(1).map((line) => {
  const [grade, unit, word, partOfSpeech, meaning] = line.split('\t');
  return { grade: Number(grade), unit: Number(unit), word, partOfSpeech, meaning };
});

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
const confusable = (first, second) => first.meaning === second.meaning || equivalentGroups.some((group) => group.includes(first.word) && group.includes(second.word));
const fallback = {
  '代名詞': ['だれか', '何もないもの', '私たち'],
  '前置詞': ['〜の下に', '〜に向かって', '〜なしで'],
};

const questions = entries.map((entry, index) => {
  const candidates = entries.filter((other) => other.grade === entry.grade && other.partOfSpeech === entry.partOfSpeech && other.word !== entry.word && !confusable(entry, other));
  const distractors = [];
  if (candidates.length >= 3) {
    const start = (index * 17 + 7) % candidates.length;
    for (let step = 0; step < candidates.length && distractors.length < 3; step += 1) {
      const candidate = candidates[(start + step) % candidates.length];
      if (!distractors.includes(candidate.meaning)) distractors.push(candidate.meaning);
    }
  } else {
    distractors.push(...(fallback[entry.partOfSpeech] || []));
  }
  return {
    id: `nh-${entry.grade}-${entry.word}`,
    grade: entry.grade,
    unit: `第${entry.unit}単元・関連教材`,
    unitNumber: entry.unit,
    word: entry.word,
    partOfSpeech: entry.partOfSpeech,
    meaning: entry.meaning,
    distractors,
    source: `https://www.eigo-duke.com/tango/chu${entry.grade}nhu${entry.unit}.html`,
  };
});

const bank = validateBank({
  schemaVersion: 1,
  edition: '東京書籍 NEW HORIZON English Course 令和7年度版（2026年度使用）',
  preparedAt: '2026-09-08',
  scope: '各学年の主要単元・関連教材から選んだ345語。全掲載語の網羅ではありません。',
  vocabularySource: 'https://ten.tokyo-shoseki.co.jp/text/chu/eigo/download/documents/eigo_19goidata.xlsx',
  correctionsSource: 'https://ten.tokyo-shoseki.co.jp/text-information/chu/english-r7/',
  questions,
});
await writeFile(new URL('../data/questions.json', import.meta.url), `${JSON.stringify(bank, null, 2)}\n`);
console.log(`${questions.length}語の問題と、各3つの誤答候補を保存しました。`);
