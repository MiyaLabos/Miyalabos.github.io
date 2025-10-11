// 二次不等式教材（日本語UI）: ax^2 + bx + c ◇ 0 の解の可視化

// ========== ユーティリティ ==========
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function f(a, b, c, x) { return a * x * x + b * x + c; }
function isFiniteNumber(x) { return typeof x === 'number' && isFinite(x); }

// 分数ユーティリティ（整数入力前提）
function igcd(a, b) { a = Math.trunc(Math.abs(a)); b = Math.trunc(Math.abs(b)); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
function frac(n, d=1) {
  if (d === 0) return { n: NaN, d: 0 };
  if (d < 0) { n = -n; d = -d; }
  const g = igcd(n, d);
  return { n: Math.trunc(n / g), d: Math.trunc(d / g) };
}
function fadd(a, b) { return frac(a.n * b.d + b.n * a.d, a.d * b.d); }
function fsub(a, b) { return frac(a.n * b.d - b.n * a.d, a.d * b.d); }
function fmul(a, b) { return frac(a.n * b.n, a.d * b.d); }
function fdiv(a, b) { return frac(a.n * b.d, a.d * b.n); }
function fint(x) { return frac(x, 1); }
function ftoNumber(x) { return x.n / x.d; }
function ftoString(x) {
  if (!isFinite(x.n) || x.d === 0) return '定義なし';
  if (x.n === 0) return '0';
  if (x.d === 1) return String(x.n);
  return `${x.n}/${x.d}`;
}
function isPerfectSquareInt(n) { if (n < 0) return false; const s = Math.floor(Math.sqrt(n)); return s*s === n ? s : false; }
function sqrtDecompose(n) {
  // n = out^2 * inside（inside は平方因子を持たない）
  let inside = n;
  let out = 1;
  for (let i = 2; i * i <= inside; i++) {
    while ((inside % (i * i)) === 0) {
      inside = Math.trunc(inside / (i * i));
      out *= i;
    }
  }
  return { out, inside };
}

// 標準形 <-> 頂点形
function abcFromVertex(a, p, q) { return { a, b: -2 * a * p, c: a * p * p + q }; }
function pqFromStandard(a, b, c) {
  const p = frac(-b, 2 * a);
  // q = c - b^2/(4a)
  const q = fsub(fint(c), fdiv(fint(b*b), fint(4*a)));
  return { p, q };
}

// 判別式と根（分数/根号表記）
function rootsDetailed(a, b, c) {
  const D = b * b - 4 * a * c; // 整数
  if (D < 0) return { D, count: 0, r1: NaN, r2: NaN };
  const den = 2 * a;
  if (D === 0) {
    const r = frac(-b, den);
    return { D, count: 1, r1: ftoNumber(r), r2: ftoNumber(r), r1Text: ftoString(r), r2Text: ftoString(r) };
  }
  const s = isPerfectSquareInt(D);
  if (s !== false) {
    const r1f = frac(-b - s, den);
    const r2f = frac(-b + s, den);
    const r1 = ftoNumber(r1f), r2 = ftoNumber(r2f);
    const [R1, R2] = (r1 <= r2) ? [r1f, r2f] : [r2f, r1f];
    return {
      D, count: 2,
      r1: Math.min(r1, r2), r2: Math.max(r1, r2),
      r1Text: ftoString(R1), r2Text: ftoString(R2)
    };
  } else {
    // 根号の簡約と約分: (-b ± out*√inside) / (2a)
    const { out, inside } = sqrtDecompose(D);
    const denNorm = den < 0 ? -den : den; // 分母は正に
    const nb0 = (den >= 0) ? -b : b;      // 分母正規化に合わせて分子も調整
    const signMinus = (den >= 0) ? '−' : '＋';
    const signPlus  = (den >= 0) ? '＋' : '−';
    // 約分（分母・整数部・根号係数の最大公約数）
    const g1 = igcd(Math.abs(nb0), out);
    const g = igcd(denNorm, g1);
    const nb = Math.trunc(nb0 / g);
    const oc = Math.trunc(out / g);
    const dn = Math.trunc(denNorm / g);
    const rootTerm = (coef) => (coef === 1 ? `√${inside}` : `${coef}√${inside}`);
    const r1Text = `(${nb} ${signMinus} ${rootTerm(oc)})/${dn}`;
    const r2Text = `(${nb} ${signPlus} ${rootTerm(oc)})/${dn}`;
    const r1 = (-b - Math.sqrt(D)) / den;
    const r2 = (-b + Math.sqrt(D)) / den;
    return { D, count: 2, r1: Math.min(r1, r2), r2: Math.max(r1, r2), r1Text: r1Text, r2Text: r2Text };
  }
}

// 解集合（区間の配列 or 全体/空集合）
// 形式: { kind: 'all' | 'none' | 'intervals', intervals?: [{l, r, lop, rop}] }
function solveQuadraticIneq(a, b, c, op) {
  const { D, count, r1, r2, r1Text, r2Text } = rootsDetailed(a, b, c);
  if (count === 0) {
    // 実数解なし: f(x) は常に a と同符号
    if (a > 0) {
      if (op === '<' || op === '<=') return { kind: 'none' };
      return { kind: 'all' };
    } else { // a < 0
      if (op === '>' || op === '>=') return { kind: 'none' };
      return { kind: 'all' };
    }
  }
  if (count === 1) {
    // f(x) = a(x-r)^2
    if (op === '<') return { kind: 'none' };
    if (op === '<=') return { kind: 'intervals', intervals: [{ l: r1, r: r1, lText: r1Text, rText: r1Text, lop: false, rop: false }] };
    if (op === '>=') return { kind: 'all' };
    if (op === '>') return { kind: 'intervals', intervals: [
      { l: -Infinity, r: r1, lText: '-∞', rText: r1Text, lop: false, rop: true },
      { l: r1, r: Infinity, lText: r1Text, rText: '∞', lop: true, rop: false }
    ] };
  }
  // count === 2
  const open = (op === '<' || op === '>');
  if (a > 0) {
    if (op === '<' || op === '<=') {
      return { kind: 'intervals', intervals: [{ l: r1, r: r2, lText: r1Text, rText: r2Text, lop: open, rop: open }] };
    } else {
      return { kind: 'intervals', intervals: [
        { l: -Infinity, r: r1, lText: '-∞', rText: r1Text, lop: false, rop: open },
        { l: r2, r: Infinity, lText: r2Text, rText: '∞', lop: open, rop: false },
      ] };
    }
  } else { // a < 0
    if (op === '<' || op === '<=') {
      return { kind: 'intervals', intervals: [
        { l: -Infinity, r: r1, lText: '-∞', rText: r1Text, lop: false, rop: open },
        { l: r2, r: Infinity, lText: r2Text, rText: '∞', lop: open, rop: false },
      ] };
    } else {
      return { kind: 'intervals', intervals: [{ l: r1, r: r2, lText: r1Text, rText: r2Text, lop: open, rop: open }] };
    }
  }
}

function intervalToText(I) {
  if (I.kind === 'all') return 'すべての実数';
  if (I.kind === 'none') return '解なし';
  if (I.kind === 'intervals' && I.intervals.length === 1) {
    const it = I.intervals[0];
    if (isFinite(it.l) && isFinite(it.r) && Math.abs(it.l - it.r) < 1e-12) {
      const val = it.lText ?? toFixedNice(it.l);
      return `{${val}}`;
    }
  }
  const parts = I.intervals.map(({ l, r, lText, rText, lop, rop }) => {
    const L = (l === -Infinity) ? '(-∞' : (lop ? '(' : '[') + (lText ?? '');
    const R = (r === +Infinity) ? '∞)' : (rText ?? '') + (rop ? ')' : ']');
    return `${L}, ${R}`;
  });
  return parts.join(' ∪ ');
}

function toFixedNice(x, digits = 4) {
  if (!isFinite(x)) return String(x);
  return Number(x).toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

// ========== 描画 ==========
function draw(a, b, c, solution, opt = {}) {
  const wrap = document.getElementById('svgWrap');
  const W = opt.W || 880, H = opt.H || 420; // キャンバス
  // 適応的な表示範囲（根/頂点/0 を入れる）
  const { p: pFrac, q: qFrac } = pqFromStandard(a, b, c);
  const vx = ftoNumber(pFrac);
  const vy = ftoNumber(qFrac);
  let xs = [-4, 4, vx];
  const solIntervals = (solution.kind === 'intervals') ? solution.intervals : [];
  for (const { l, r } of solIntervals) xs.push(isFinite(l) ? l : 0), xs.push(isFinite(r) ? r : 0);
  let xmin = Math.min(...xs) - 2;
  let xmax = Math.max(...xs) + 2;
  if (!isFiniteNumber(xmin) || !isFiniteNumber(xmax) || xmin === xmax) { xmin = -6; xmax = 6; }
  const sample = (x) => f(a, b, c, x);
  // y範囲: 端点と頂点、0 を含める
  const Xs = [xmin, (2 * xmin + xmax) / 3, (xmin + xmax) / 2, (xmin + 2 * xmax) / 3, xmax, vx];
  const Ys = Xs.map(sample).concat([0, vy]);
  let ymin = Math.min(...Ys), ymax = Math.max(...Ys);
  if (ymin === ymax) { ymin -= 1; ymax += 1; }
  const padY = (ymax - ymin) * 0.15; ymin -= padY; ymax += padY;

  // 座標変換
  const X = (x) => (x - xmin) / (xmax - xmin) * W;
  const Y = (y) => H - (y - ymin) / (ymax - ymin) * H;

  // グリッド（整数目盛中心）
  const gridStep = niceStep((xmax - xmin) / 10);
  const vlines = [];
  const hlines = [];
  for (let x = Math.ceil(xmin / gridStep) * gridStep; x <= xmax; x += gridStep) {
    vlines.push(`<line class="gridline" x1="${X(x)}" y1="0" x2="${X(x)}" y2="${H}" />`);
  }
  const yStep = niceStep((ymax - ymin) / 8);
  for (let y = Math.ceil(ymin / yStep) * yStep; y <= ymax; y += yStep) {
    hlines.push(`<line class="gridline" x1="0" y1="${Y(y)}" x2="${W}" y2="${Y(y)}" />`);
  }

  // 解の縦帯
  const bands = [];
  if (solution.kind === 'intervals') {
    for (const { l, r } of solution.intervals) {
      const xl = isFinite(l) ? X(l) : 0;
      const xr = isFinite(r) ? X(r) : W;
      bands.push(`<rect class="band-solution" x="${xl}" y="0" width="${xr - xl}" height="${H}" />`);
    }
  } else if (solution.kind === 'all') {
    bands.push(`<rect class="band-solution" x="0" y="0" width="${W}" height="${H}" />`);
  }

  // 軸
  const axis = [];
  if (0 >= xmin && 0 <= xmax) axis.push(`<line class="axis" x1="${X(0)}" y1="0" x2="${X(0)}" y2="${H}" />`);
  if (0 >= ymin && 0 <= ymax) axis.push(`<line class="axis" x1="0" y1="${Y(0)}" x2="${W}" y2="${Y(0)}" />`);

  // 曲線サンプル
  const pts = [];
  const N = 400;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = xmin + (xmax - xmin) * t;
    const y = sample(x);
    pts.push(`${X(x)},${Y(y)}`);
  }
  const curve = `<polyline class="curve" points="${pts.join(' ')}" />`;

  // 頂点
  const vertex = `<circle class="vertex" cx="${X(vx)}" cy="${Y(vy)}" r="4" />`;

  // 端点（根）
  const rootMarks = [];
  if (solution.kind === 'intervals') {
    for (const { l, r, lop, rop } of solution.intervals) {
      if (isFinite(l)) rootMarks.push(`<circle class="${lop ? 'root-open' : 'root-closed'}" cx="${X(l)}" cy="${Y(0)}" r="5" />`);
      if (isFinite(r)) rootMarks.push(`<circle class="${rop ? 'root-open' : 'root-closed'}" cx="${X(r)}" cy="${Y(0)}" r="5" />`);
    }
  }

  const svg = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${W}" height="${H}" fill="transparent" />
      ${vlines.join('')}
      ${hlines.join('')}
      ${bands.join('')}
      ${axis.join('')}
      ${curve}
      ${vertex}
      ${rootMarks.join('')}
    </svg>
  `;
  wrap.innerHTML = svg;
}

function niceStep(span) {
  // 人間に優しい目盛間隔
  const pow = Math.pow(10, Math.floor(Math.log10(span)));
  const base = span / pow;
  let step;
  if (base <= 1.2) step = 1; else if (base <= 2.5) step = 2; else if (base <= 3.5) step = 3; else if (base <= 5.5) step = 5; else step = 10;
  return step * pow;
}

// ========== UI制御 ==========
function readInputs() {
  const formType = document.getElementById('formType').value;
  const a = Number(document.getElementById('a').value);
  if (!Number.isInteger(a) || a === 0) throw new Error('a は 0 以外の整数を入力してください');
  let b, c;
  if (formType === 'standard') {
    b = Number(document.getElementById('b').value);
    c = Number(document.getElementById('c').value);
    if (!Number.isInteger(b) || !Number.isInteger(c)) throw new Error('b, c は整数を入力してください');
  } else {
    const p = Number(document.getElementById('p').value);
    const q = Number(document.getElementById('q').value);
    if (!Number.isInteger(p) || !Number.isInteger(q)) throw new Error('p, q は整数を入力してください');
    const abc = abcFromVertex(a, p, q); b = abc.b; c = abc.c;
  }
  const op = document.getElementById('ineqType').value; // '<', '<=', '>', '>='
  return { a, b, c, op, formType };
}

function setMode(formType) {
  const root = document.getElementById('controls');
  root.classList.toggle('mode-vertex', formType === 'vertex');
}

function formatProblem(a, b, c, op) {
  const term = (coef, sym) => {
    if (coef === 0) return null;
    if (sym === 'x^2') {
      if (coef === 1) return 'x²';
      if (coef === -1) return '-x²';
    }
    const s = (coef >= 0 ? `+ ${coef}` : `- ${Math.abs(coef)}`);
    return `${s}${sym ? sym.replace('^2','²') : ''}`.trim();
  };
  const parts = [term(a, 'x^2'), term(b, 'x'), term(c, '')].filter(Boolean);
  let lhs = parts.join(' ').replace(/^\+\s*/, '');
  if (!lhs) lhs = '0';
  const opText = { '<': '< 0', '<=': '≤ 0', '>': '> 0', '>=': '≥ 0' }[op];
  return `次の二次不等式を解け： ${lhs} ${opText}`;
}

function formatRoots(a, b, c) {
  const { D, count, r1Text, r2Text } = rootsDetailed(a, b, c);
  if (count === 0) return `実数解なし（D = ${D}）`;
  if (count === 1) return `重解 x = ${r1Text}（D = 0）`;
  return `x = ${r1Text}, ${r2Text}（D = ${D}）`;
}

function signSummary(a, b, c) {
  const { D } = rootsDetailed(a, b, c);
  if (D < 0) return a > 0 ? '常に正' : '常に負';
  return a > 0 ? '外側が正・内側が負' : '外側が負・内側が正';
}

function explainSteps(a, b, c, op, solution) {
  const { p, q } = pqFromStandard(a, b, c);
  const { D, count, r1Text, r2Text } = rootsDetailed(a, b, c);
  const steps = [];
  steps.push(`1) 判別式 D = b² − 4ac = ${D} を計算。`);
  if (count === 0) {
    steps.push(`2) 実数解なし。f(x) は常に ${a > 0 ? '正' : '負'}。`);
  } else if (count === 1) {
    steps.push(`2) 重解 r = ${r1Text}。f(x) = a(x − r)² ≥ 0。`);
  } else {
    steps.push(`2) 2つの実数解 r1 = ${r1Text}, r2 = ${r2Text}（r1 < r2）。`);
  }
  steps.push(`3) グラフは a = ${a} より ${a > 0 ? '上に開く' : '下に開く'}。頂点は (${ftoString(p)}, ${ftoString(q)})。`);
  steps.push(`4) 不等号「${op} 0」に応じて、${a > 0 ? '外側/内側' : '内側/外側'} を選ぶ。端点は ${op.includes('=') ? '含む' : '含まない'}。`);
  steps.push(`5) よって解は ${intervalToText(solution)}。`);
  return steps;
}

function renderExplain(list) {
  const el = document.getElementById('explainList');
  el.innerHTML = list.map(s => `<li>${s}</li>`).join('');
}

function updateAll(fromRandom = false) {
  const errEl = document.getElementById('error');
  errEl.textContent = '';
  try {
    const { a, b, c, op, formType } = readInputs();
    setMode(formType);
    // 問題文
    const prob = formatProblem(a, b, c, op);
    document.getElementById('problemText').textContent = prob;
    // 結果テキスト
    const { p, q } = pqFromStandard(a, b, c);
    const sol = solveQuadraticIneq(a, b, c, op);
    document.getElementById('discText').textContent = String(b * b - 4 * a * c);
    document.getElementById('vertexText').textContent = `(${ftoString(p)}, ${ftoString(q)})`;
    document.getElementById('rootsText').textContent = formatRoots(a, b, c);
    document.getElementById('signText').textContent = signSummary(a, b, c);
    document.getElementById('solutionText').textContent = intervalToText(sol);
    // 図
    draw(a, b, c, sol);
    // 解説
    renderExplain(explainSteps(a, b, c, op, sol));
  } catch (e) {
    errEl.textContent = e.message || String(e);
  }
}

function randomInt(lo, hi) {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function genRandomParams() {
  // 頂点形の整数を生成して整合のとれた標準形を得る
  let a = 0; while (a === 0) a = randomInt(-3, 3);
  const p = randomInt(-4, 4);
  const q = randomInt(-6, 6);
  const { b, c } = abcFromVertex(a, p, q);
  const ops = ['<', '<=', '>', '>='];
  const op = ops[randomInt(0, ops.length - 1)];
  return { a, b, c, p, q, op };
}

function applyRandom() {
  const { a, b, c, p, q, op } = genRandomParams();
  document.getElementById('a').value = a;
  document.getElementById('b').value = b;
  document.getElementById('c').value = c;
  // 頂点形側も整数で連動
  document.getElementById('p').value = p;
  document.getElementById('q').value = q;
  document.getElementById('ineqType').value = op;
  updateAll(true);
}

function bindEvents() {
  document.getElementById('updateBtn').addEventListener('click', () => updateAll());
  document.getElementById('randomBtn').addEventListener('click', () => applyRandom());
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  document.getElementById('formType').addEventListener('change', () => updateAll());
  // 入力変化で即時更新（軽量処理）
  ['a','b','c','p','q','ineqType'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => updateAll());
    el.addEventListener('change', () => updateAll());
  });
}

// 表示初期化
window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  applyRandom(); // 初回はランダム問題を表示
});
