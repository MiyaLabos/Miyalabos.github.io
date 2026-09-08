import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// 起動済みの専用Chromeの接続先を指定する、任意の画面検証。
const endpoint = process.argv[2];
if (!endpoint) throw new Error('検証用ブラウザの接続先を指定してください。');
const bank = JSON.parse(await readFile(new URL('../data/questions.json', import.meta.url), 'utf8'));
const socket = new WebSocket(endpoint);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let sequence = 0;
let sessionId;
let responseMode = 'normal';
const pending = new Map();
const exceptions = [];

function send(method, params = {}, attached = true) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`応答時間超過：${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params, ...(attached && sessionId ? { sessionId } : {}) }));
  });
}
socket.addEventListener('message', async (event) => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) {
    const { resolve, reject, timeout } = pending.get(message.id);
    clearTimeout(timeout); pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  } else if (message.method === 'Runtime.exceptionThrown') {
    exceptions.push(message.params.exceptionDetails);
  } else if (message.method === 'Fetch.requestPaused') {
    try {
      if (responseMode === 'network-error') await send('Fetch.failRequest', { requestId: message.params.requestId, errorReason: 'Failed' });
      else if (responseMode === 'invalid-data') await send('Fetch.fulfillRequest', { requestId: message.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from('{"schemaVersion":1,"questions":[]}').toString('base64') });
      else await send('Fetch.continueRequest', { requestId: message.params.requestId });
    } catch (error) { exceptions.push({ description: error.message }); }
  }
});

const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, false);
({ sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }, false));
await send('Page.enable'); await send('Runtime.enable');
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
async function waitFor(expression) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`画面の待機に失敗：${expression}`);
}
async function tap(selector) {
  const point = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  assert.ok(point, `操作対象が存在する：${selector}`);
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, radiusX: 2, radiusY: 2 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function viewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}
async function screenshot(name) {
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(`/private/tmp/entango-${name}.png`, Buffer.from(shot.data, 'base64'));
}
async function noOverflow() {
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), '横方向のはみ出しがない');
}
async function home() {
  await send('Page.navigate', { url: 'http://localhost:4173/' });
  await waitFor('!!document.querySelector("[data-action=start]")');
}

try {
  await viewport(1024, 768); await home(); await noOverflow(); await screenshot('home-landscape');
  await viewport(768, 1024); await noOverflow(); await screenshot('home-portrait');
  for (const [grade, expectedScore] of [[1, 10], [2, 6], [3, 0]]) {
    await tap(`label:has(input[value="${grade}"])`);
    await tap('[data-action=start]');
    await waitFor('!!document.querySelector(".answer-option")');
    await tap('[data-action=exit]');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    assert.ok(await evaluate('!document.querySelector("dialog").open && !!document.querySelector(".answer-option")'), '以前に終了した後でも、Escapeではテストを終了しない');
    const used = new Set();
    for (let index = 0; index < 10; index += 1) {
      const word = await evaluate('document.querySelector(".english-word").textContent');
      assert.ok(!used.has(word), '10問の単語が重複しない'); used.add(word);
      assert.ok(bank.questions.some((question) => question.word === word && question.grade === grade));
      assert.equal(await evaluate('document.querySelectorAll(".answer-option").length'), 4);
      const labels = await evaluate('[...document.querySelectorAll(".answer-option")].map(el=>el.getBoundingClientRect().height)');
      assert.ok(labels.every((height) => height >= 44));
      if (grade === 1 && index === 0) {
        await screenshot('quiz-portrait');
        await viewport(1024, 768); await noOverflow(); await screenshot('quiz-landscape');
        assert.equal(await evaluate('document.querySelector(".english-word").textContent'), word, '画面回転で問題が変わらない');
        await viewport(768, 1024);
        await tap('[data-action=exit]');
        assert.ok(await evaluate('document.querySelector("dialog").open'));
        await tap('dialog button[value=cancel]');
        assert.equal(await evaluate('document.querySelector(".english-word").textContent'), word);
      }
      const correct = index < expectedScore;
      await tap(`[data-option-id${correct ? '$=' : '*='}"${correct ? ':correct' : ':wrong-'}"]`);
      await waitFor('!!document.querySelector("[data-action=next]")');
      assert.equal(await evaluate('document.querySelectorAll(".answer-option:disabled").length'), 4);
      assert.equal(await evaluate('document.querySelectorAll(".answer-option.is-correct").length'), 1);
      if (!correct && index === 0) await screenshot(`wrong-grade-${grade}`);
      await noOverflow();
      await tap('[data-action=next]');
    }
    await waitFor('!!document.querySelector(".score-value")');
    assert.equal(await evaluate('parseInt(document.querySelector(".score-value").textContent,10)'), expectedScore);
    assert.equal(await evaluate('document.querySelectorAll(".review-item").length'), 10);
    assert.equal(await evaluate('document.querySelectorAll(".review-item.wrong").length'), 10 - expectedScore);
    await evaluate('window.scrollTo(0,0)');
    await screenshot(`result-grade-${grade}`);
    await tap('[data-action=retry]');
    assert.equal(await evaluate('document.querySelector(".grade-pill").textContent'), `中学${grade}年`);
    assert.equal(await evaluate('document.querySelector("[role=progressbar]").getAttribute("aria-valuenow")'), '0');
    await tap('[data-action=exit]'); await tap('dialog button[value=exit]');
    await waitFor('!!document.querySelector("[data-action=start]")');
    console.log(`中学${grade}年：10問のタップ回答、${expectedScore}点の採点、再挑戦、途中終了を確認`);
  }
  await viewport(390, 844); await noOverflow(); await evaluate('window.scrollTo(0,0)'); await screenshot('home-mobile');
  await tap('[data-action=start]'); await noOverflow(); await screenshot('quiz-mobile');
  await send('Page.reload'); await waitFor('!!document.querySelector("[data-action=start]")');
  assert.equal(await evaluate('document.querySelector("input[name=grade]:checked").value'), '1');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*data/questions.json*', requestStage: 'Request' }] });
  for (const mode of ['network-error', 'invalid-data']) {
    responseMode = mode; await send('Page.reload'); await waitFor('!!document.querySelector(".error-panel")');
    assert.ok(await evaluate('document.querySelector(".error-panel").textContent.includes("問題")'));
    responseMode = 'normal'; await tap('[data-action=reload]'); await waitFor('!!document.querySelector("[data-action=start]")');
    console.log(`${mode === 'network-error' ? '通信失敗' : '不正な問題データ'}：日本語のエラー表示と再試行を確認`);
  }
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
  console.log('横・縦・小型画面、画面回転、再読み込みの初期化を確認。実行時例外なし。');
} finally {
  await send('Target.closeTarget', { targetId }, false);
  socket.close();
}
