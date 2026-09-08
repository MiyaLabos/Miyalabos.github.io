import { mkdir, copyFile } from 'node:fs/promises';
import './check-data.mjs';

const files = ['index.html', 'styles.css', 'app.js', 'quiz.js', 'data/questions.json', 'data/sources.md'];
for (const file of files) {
  const destination = new URL(`../dist/${file}`, import.meta.url);
  await mkdir(new URL('./', destination), { recursive: true });
  await copyFile(new URL(`../${file}`, import.meta.url), destination);
}
console.log('公開用の静的ファイルを dist に出力しました。');
