// 日本語UI: 二次関数の問題生成・値域計算・SVG可視化を行う

// 小さめのユーティリティ（整数・分数・丸め）
function gcd(a, b) {
  a = Math.trunc(Math.abs(a));
  b = Math.trunc(Math.abs(b));
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a || 1;
}

function simplifyFraction(n, d) {
  if (d === 0) return { n: NaN, d: 0 };
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

function fracToString(n, d) {
  if (!isFinite(n) || d === 0) return "定義なし";
  if (n === 0) return "0";
  const { n: nn, d: dd } = simplifyFraction(n, d);
  if (dd === 1) return String(nn);
  return `${nn}/${dd}`;
}

function toFixedNice(x, digits = 2) {
  return Number(x).toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

// y = ax^2 + bx + c を計算
function f(a, b, c, x) {
  return a * x * x + b * x + c;
}

// 形式変換: 頂点形 <-> 標準形
function abcFromVertex(a, p, q) {
  const b = -2 * a * p;
  const c = a * p * p + q;
  return { a, b, c };
}
function pqFromStandard(a, b, c) {
  const p = -b / (2 * a);
  const q = c - (b * b) / (4 * a);
  return { p, q };
}

// LaTeX 風 -> HTML（簡易レンダラ: ^ と \frac のみ対応）
function escapeHtml(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function renderTeXToHTML(tex) {
  let s = escapeHtml(String(tex));
  // 記号の簡易置換
  s = s
    .replace(/\\\*/g, '×') // 予防: "\*" を × に（ほぼ未使用）
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±')
    .replace(/\\approx/g, '≈')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\left|\\right/g, '')
    .replace(/\\,/g, ' ');

  // \frac{...}{...} を再帰的に展開
  function parseFrac(input) {
    let out = input;
    while (true) {
      const i = out.indexOf('\\frac{');
      if (i === -1) break;
      const open1 = out.indexOf('{', i + 5);
      const br1 = readBrace(out, open1);
      if (!br1) break;
      const { content: num, end: end1 } = br1;
      if (out[end1 + 1] !== '{') break;
      const br2 = readBrace(out, end1 + 1);
      if (!br2) break;
      const { content: den, end: end2 } = br2;
      const rep = `<span class="mfrac"><span class="num">${parseAll(num)}</span><span class="den">${parseAll(den)}</span></span>`;
      out = out.slice(0, i) + rep + out.slice(end2 + 1);
    }
    return out;
  }
  function readBrace(input, bracePos) {
    if (bracePos < 0 || input[bracePos] !== '{') return null;
    let depth = 0;
    for (let j = bracePos; j < input.length; j++) {
      const ch = input[j];
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) return { content: input.slice(bracePos + 1, j), end: j }; }
    }
    return null;
  }
  function parseSupers(input) {
    // ^{...}
    let out = input.replace(/\^\{([^}]*)\}/g, (_, inner) => `<sup>${parseAll(inner)}</sup>`);
    // ^x（英数・符号軽め）
    out = out.replace(/\^([A-Za-z0-9+\-]+)/g, (_, inner) => `<sup>${parseAll(inner)}</sup>`);
    return out;
  }
  function stripLonelyBraces(input) { return input.replace(/[{}]/g, ''); }
  function parseAll(input) {
    let out = input;
    out = parseFrac(out);
    out = parseSupers(out);
    out = stripLonelyBraces(out);
    return out;
  }
  return `<span class="math">${parseAll(s)}</span>`;
}

function fracToTeX(n, d) {
  if (!isFinite(n) || d === 0) return '\\text{定義なし}';
  const { n: nn, d: dd } = simplifyFraction(n, d);
  if (dd === 1) return String(nn);
  return `\\frac{${nn}}{${dd}}`;
}

// 小数 -> 分数へ（有限小数を厳密に、その他は近似）
function toFractionFromNumber(x, maxDigits = 10) {
  if (!Number.isFinite(x)) return { n: NaN, d: 0 };
  if (Math.abs(x - Math.round(x)) < 1e-12) return { n: Math.round(x), d: 1 };
  // 有限桁で丸め、分母を10^kに
  const s = x.toFixed(maxDigits).replace(/0+$/, '').replace(/\.$/, '');
  const dot = s.indexOf('.');
  if (dot === -1) return { n: Number(s), d: 1 };
  const digits = s.length - dot - 1;
  const d = Math.pow(10, digits);
  const n = Math.round(x * d);
  return simplifyFraction(n, d);
}

function numToTeX(x) {
  const { n, d } = toFractionFromNumber(x);
  return fracToTeX(n, d);
}

// 値域の計算（頂点と端点を比較）
function computeRange(a, b, c, xMin, xMax) {
  if (xMin > xMax) [xMin, xMax] = [xMax, xMin];
  // 頂点 (h, k) 計算: h = -b / (2a), k = -Δ/(4a)
  const hNum = -b;
  const hDen = 2 * a;
  const hFrac = simplifyFraction(hNum, hDen);
  const h = hFrac.n / hFrac.d;

  const D = b * b - 4 * a * c; // 判別式
  const kFrac = simplifyFraction(-(D), 4 * a);
  const k = kFrac.n / kFrac.d;

  const y1 = f(a, b, c, xMin);
  const y2 = f(a, b, c, xMax);

  let minY, maxY, minSource, maxSource; // source: 'vertex' or 'endpoint'
  const vertexInside = (xMin <= h && h <= xMax);

  if (vertexInside) {
    if (a > 0) {
      minY = k; minSource = 'vertex';
      maxY = Math.max(y1, y2); maxSource = 'endpoint';
    } else {
      maxY = k; maxSource = 'vertex';
      minY = Math.min(y1, y2); minSource = 'endpoint';
    }
  } else {
    minY = Math.min(y1, y2); minSource = 'endpoint';
    maxY = Math.max(y1, y2); maxSource = 'endpoint';
  }

  return {
    xMin, xMax,
    hFrac, h,
    kFrac, k,
    y1, y2,
    minY, maxY, minSource, maxSource,
    a, b, c,
    vertexInside,
  };
}

// 問題文を作る（日本語, 数式はTeX表現）
function buildProblemText(formType, params, xMin, xMax, xLeftType, xRightType) {
  function isUnity(x) { const { n, d } = toFractionFromNumber(x); return d === 1 && Math.abs(n) === 1; }
  function isZero(x) { return Math.abs(x) < 1e-12; }
  function absTeX(x) { return numToTeX(Math.abs(x)); }

  function buildStandardExprTeX(a, b, c) {
    let expr = '';
    // a x^2
    if (!isZero(a)) {
      const sign = a >= 0 ? '' : '- ';
      const body = isUnity(a) ? 'x^2' : `${absTeX(a)}x^2`;
      expr += `${sign}${body}`;
    }
    // b x
    if (!isZero(b)) {
      const sign = b >= 0 ? ' + ' : ' - ';
      const body = isUnity(b) ? 'x' : `${absTeX(b)}x`;
      expr += `${sign}${body}`;
    }
    // c
    if (!isZero(c)) {
      const sign = c >= 0 ? ' + ' : ' - ';
      expr += `${sign}${absTeX(c)}`;
    }
    return expr || '0';
  }

  function buildVertexExprTeX(a, p, q) {
    const aPart = isUnity(a) ? (a > 0 ? '' : '-') : `${numToTeX(a)}`;
    const pSign = p >= 0 ? ' - ' : ' + ';
    const pAbs = absTeX(p);
    const qPart = isZero(q) ? '' : (q > 0 ? ` + ${numToTeX(q)}` : ` - ${absTeX(q)}`);
    return `${aPart}(x${pSign}${pAbs})^2${qPart}`;
  }

  let exprTeX = '';
  if (formType === 'vertex') {
    const { a, p, q } = params;
    exprTeX = buildVertexExprTeX(a, p, q);
  } else {
    const { a, b, c } = params;
    exprTeX = buildStandardExprTeX(a, b, c);
  }
  return `関数  y = ${exprTeX}  において、xの変域を ${formatIntervalTeXWithTypes(xMin, xMax, xLeftType, xRightType)} とするとき、yの値域を求めよ。`;
}

function formatInterval(l, r) {
  if (l > r) [l, r] = [r, l];
  return `【${l} ≤ x ≤ ${r}】`;
}

function formatRange(minY, maxY) {
  return `【${prettyNumber(minY)} ≤ y ≤ ${prettyNumber(maxY)}】`;
}

function formatIntervalTeX(l, r) {
  if (l > r) [l, r] = [r, l];
  return `【${numToTeX(l)} \\le x \\le ${numToTeX(r)}】`;
}
function formatIntervalTeXWithTypes(l, r, leftType, rightType) {
  if (l > r) [l, r] = [r, l];
  const lcmp = leftType === 'open' ? '<' : '\\le';
  const rcmp = rightType === 'open' ? '<' : '\\le';
  return `【${numToTeX(l)} ${lcmp} x ${rcmp} ${numToTeX(r)}】`;
}

function formatRangeTeX(minTeX, includeMin, maxTeX, includeMax) {
  const lcmp = includeMin ? '\\le' : '<';
  const rcmp = includeMax ? '\\le' : '<';
  return `【${minTeX} ${lcmp} y ${rcmp} ${maxTeX}】`;
}

function prettyNumber(x) {
  // 整数に近ければ整数表示
  if (Number.isFinite(x) && Math.abs(x - Math.round(x)) < 1e-10) return String(Math.round(x));
  return toFixedNice(x, 3);
}

// 解説（日本語）を作る
function buildExplanation(data, ctx) {
  const { a, b, c, xMin, xMax, hFrac, h, kFrac, k, y1, y2, minY, maxY, minSource, maxSource, vertexInside } = data;
  const { formType, p, q, xLeftType, xRightType, vertexIncluded, includeMin, includeMax, minTeX, maxTeX } = ctx || {};
  const steps = [];
  // 開区間に対応した極値の表現（達成しない場合を明示）
  const minPhrase = includeMin ? `最小値は  y = ${minTeX}` : `最小値は存在しない（下限は  y = ${minTeX}）`;
  const maxPhrase = includeMax ? `最大値は  y = ${maxTeX}` : `最大値は存在しない（上限は  y = ${maxTeX}）`;

  if (formType === 'vertex') {
    const pTeX = numToTeX(p);
    const qTeX = numToTeX(q);
    // 1) 形の特徴から軸・頂点を即時特定
    steps.push(`1) 与えられた式は頂点形  y = a(x - p)^2 + q。したがって、軸は  x = ${pTeX}、頂点は  (${pTeX}, ${qTeX})。`);
    // 2) 変域と頂点の位置
    steps.push(`2) 与えられた変域は ${formatIntervalTeXWithTypes(xMin, xMax, xLeftType, xRightType)}。頂点のx = ${pTeX} は${vertexIncluded ? '含まれる' : '含まれない'}。`);
    // 3) 場合分け
    if (vertexIncluded) {
      if (a > 0) {
        steps.push(`3) a ＞ 0 なので上に開く放物線。頂点が最小、最大は端点側（開区間では達成しない場合がある）。`);
        steps.push(`   端点の値は  f(${xMin}) = ${numToTeX(y1)},  f(${xMax}) = ${numToTeX(y2)}。`);
        steps.push(`4) よって ${minPhrase}、${maxPhrase}。`);
      } else {
        steps.push(`3) a ＜ 0 なので下に開く放物線。頂点が最大、最小は端点側（開区間では達成しない場合がある）。`);
        steps.push(`   端点の値は  f(${xMin}) = ${numToTeX(y1)},  f(${xMax}) = ${numToTeX(y2)}。`);
        steps.push(`4) よって ${maxPhrase}、${minPhrase}。`);
      }
    } else {
      steps.push(`3) 頂点が変域外なので、最小・最大は端点で決まる（開区間では達成しない場合がある）。`);
      steps.push(`   f(${xMin}) = ${numToTeX(y1)},  f(${xMax}) = ${numToTeX(y2)}。`);
      steps.push(`4) よって ${minPhrase}、${maxPhrase}。`);
    }
    steps.push(`5) 結論：yの値域は ${formatRangeTeX(minTeX, includeMin, maxTeX, includeMax)}。`);
  } else {
    // 標準形の解説（従来の流れ）
    steps.push(`1) 軸の方程式は  x = -\\frac{b}{2a}。 よって  x = -\\frac{${b}}{2\\times${a}} = ${fracToTeX(hFrac.n, hFrac.d)}。`);
    steps.push(`2) 頂点のy座標は  k = -\\frac{b^2 - 4ac}{4a}。 よって  k = -\\frac{${b}^2 - 4\\times${a}\\times${c}}{4\\times${a}} = ${fracToTeX(kFrac.n, kFrac.d)}。`);
    steps.push(`3) 与えられた変域は ${formatIntervalTeXWithTypes(xMin, xMax, xLeftType, xRightType)}。頂点のx = ${fracToTeX(hFrac.n, hFrac.d)} は${vertexIncluded ? '含まれる' : '含まれない'}。`);
    if (vertexIncluded) {
      if (a > 0) {
        steps.push(`4) a ＞ 0 なので上に開く放物線。頂点が最小、最大は端点側（開区間では達成しない場合がある）。`);
        steps.push(`   端点の値は  f(${xMin}) = ${numToTeX(y1)},  f(${xMax}) = ${numToTeX(y2)}。`);
        steps.push(`5) よって ${minPhrase}、${maxPhrase}。`);
      } else {
        steps.push(`4) a ＜ 0 なので下に開く放物線。頂点が最大、最小は端点側（開区間では達成しない場合がある）。`);
        steps.push(`   端点の値は  f(${xMin}) = ${numToTeX(y1)},  f(${xMax}) = ${numToTeX(y2)}。`);
        steps.push(`5) よって ${maxPhrase}、${minPhrase}。`);
      }
    } else {
      steps.push(`4) 頂点が変域外なので、最小・最大は端点で決まる（開区間では達成しない場合がある）。`);
      steps.push(`   f(${xMin}) = ${numToTeX(y1)},  f(${xMax}) = ${numToTeX(y2)}。`);
      steps.push(`5) よって ${minPhrase}、${maxPhrase}。`);
    }
    steps.push(`6) 結論：yの値域は ${formatRangeTeX(minTeX, includeMin, maxTeX, includeMax)}。`);
  }

  return steps;
}

// SVG描画: グリッド・軸・放物線・帯・点
function renderSVG(container, data) {
  const { a, b, c, xMin, xMax, h, k, minY, maxY } = data;

  // プロット範囲（自動スケール）
  const padX = Math.max(1, 0.2 * (xMax - xMin));
  let plotXmin = Math.min(xMin, h) - padX;
  let plotXmax = Math.max(xMax, h) + padX;

  // yレンジ: 端点と頂点をカバーして上下に少し余白
  const yLo = Math.min(minY, f(a, b, c, plotXmin), f(a, b, c, plotXmax));
  const yHi = Math.max(maxY, f(a, b, c, plotXmin), f(a, b, c, plotXmax));
  const padY = Math.max(1, 0.2 * (yHi - yLo));
  let plotYmin = yLo - padY;
  let plotYmax = yHi + padY;

  // SVGベース（高さが0になる環境向けフォールバックを追加）
  const rectBox = container.getBoundingClientRect ? container.getBoundingClientRect() : { width: 0, height: 0 };
  const W = container.clientWidth || rectBox.width || 800;
  const H = container.clientHeight || rectBox.height || 450;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  // 座標変換
  const x2s = (x) => ( (x - plotXmin) / (plotXmax - plotXmin) ) * W;
  const y2s = (y) => H - ( (y - plotYmin) / (plotYmax - plotYmin) ) * H;

  // 背景
  const bg = rect(0, 0, W, H, { fill: getCssVar('--plot-bg') });
  svg.appendChild(bg);

  // グリッドと軸
  drawGridAndAxes(svg, W, H, plotXmin, plotXmax, plotYmin, plotYmax, x2s, y2s);

  // xの変域（縦帯）
  const xBand = rect(x2s(xMin), 0, x2s(xMax) - x2s(xMin), H, { fill: getCssVar('--chip-x') });
  svg.appendChild(xBand);

  // yの値域（横帯）
  const yBand = rect(0, y2s(maxY), W, y2s(minY) - y2s(maxY), { fill: getCssVar('--chip-y') });
  svg.appendChild(yBand);

  // 放物線パス
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const samples = 300;
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const x = plotXmin + (i / samples) * (plotXmax - plotXmin);
    const y = f(a, b, c, x);
    const sx = x2s(x);
    const sy = y2s(y);
    d += (i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`);
  }
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", getCssVar('--curve'));
  path.setAttribute("stroke-width", "2.5");
  svg.appendChild(path);

  // 頂点
  const vx = x2s(h), vy = y2s(k);
  svg.appendChild(circle(vx, vy, 4.5, { fill: getCssVar('--vertex'), stroke: "#000", "stroke-width": 0.5 }));

  // 端点（xMin, xMax）
  const p1 = { x: x2s(xMin), y: y2s(f(a, b, c, xMin)) };
  const p2 = { x: x2s(xMax), y: y2s(f(a, b, c, xMax)) };
  svg.appendChild(circle(p1.x, p1.y, 4, { fill: getCssVar('--endpoint') }));
  svg.appendChild(circle(p2.x, p2.y, 4, { fill: getCssVar('--endpoint') }));

  // 描画
  container.innerHTML = "";
  container.appendChild(svg);

  // 内部ヘルパ
  function rect(x, y, w, h, attrs = {}) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", x);
    r.setAttribute("y", y);
    r.setAttribute("width", w);
    r.setAttribute("height", h);
    for (const k in attrs) r.setAttribute(k, attrs[k]);
    return r;
  }
  function circle(cx, cy, r, attrs = {}) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", cx);
    c.setAttribute("cy", cy);
    c.setAttribute("r", r);
    for (const k in attrs) c.setAttribute(k, attrs[k]);
    return c;
  }
  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
}

function drawGridAndAxes(svg, W, H, xmin, xmax, ymin, ymax, x2s, y2s) {
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid').trim();
  const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--axis').trim();
  const font = "10px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans JP, sans-serif";

  // おおまかに5〜8分割を目標に刻みを決める
  const tickInfoX = niceTicks(xmin, xmax, 7);
  const tickInfoY = niceTicks(ymin, ymax, 7);

  // グリッド（縦）
  tickInfoX.ticks.forEach(x => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const sx = x2s(x);
    line.setAttribute("x1", sx);
    line.setAttribute("y1", 0);
    line.setAttribute("x2", sx);
    line.setAttribute("y2", H);
    line.setAttribute("stroke", gridColor);
    line.setAttribute("stroke-width", "1");
    line.setAttribute("opacity", "0.5");
    svg.appendChild(line);
  });

  // グリッド（横）
  tickInfoY.ticks.forEach(y => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const sy = y2s(y);
    line.setAttribute("x1", 0);
    line.setAttribute("y1", sy);
    line.setAttribute("x2", W);
    line.setAttribute("y2", sy);
    line.setAttribute("stroke", gridColor);
    line.setAttribute("stroke-width", "1");
    line.setAttribute("opacity", "0.5");
    svg.appendChild(line);
  });

  // 軸（x=0, y=0 が範囲内なら強調）
  if (xmin <= 0 && 0 <= xmax) {
    const sx = x2s(0);
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", sx);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", sx);
    yAxis.setAttribute("y2", H);
    yAxis.setAttribute("stroke", axisColor);
    yAxis.setAttribute("stroke-width", "1.5");
    svg.appendChild(yAxis);
  }
  if (ymin <= 0 && 0 <= ymax) {
    const sy = y2s(0);
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", sy);
    xAxis.setAttribute("x2", W);
    xAxis.setAttribute("y2", sy);
    xAxis.setAttribute("stroke", axisColor);
    xAxis.setAttribute("stroke-width", "1.5");
    svg.appendChild(xAxis);
  }

  // 目盛ラベル
  tickInfoX.ticks.forEach(x => {
    const sx = x2s(x);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", sx + 2);
    text.setAttribute("y", H - 4);
    text.setAttribute("fill", "#9aa3af");
    text.setAttribute("font-size", "10");
    text.textContent = labelNice(x);
    svg.appendChild(text);
  });
  tickInfoY.ticks.forEach(y => {
    const sy = y2s(y);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", 4);
    text.setAttribute("y", sy - 2);
    text.setAttribute("fill", "#9aa3af");
    text.setAttribute("font-size", "10");
    text.textContent = labelNice(y);
    svg.appendChild(text);
  });

  function labelNice(v) {
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    return toFixedNice(v, 2);
  }
}

function niceTicks(min, max, targetCount = 7) {
  const span = Math.max(1e-9, max - min);
  const raw = span / Math.max(1, targetCount);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const steps = [1, 2, 2.5, 5, 10];
  let step = steps[0] * mag;
  for (const s of steps) {
    const candidate = s * mag;
    if (span / candidate <= targetCount) { step = candidate; break; }
  }
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = niceMin; v <= niceMax + 1e-9; v += step) ticks.push(Number(v.toFixed(12)));
  return { step, ticks, min: niceMin, max: niceMax };
}

// 入力取得
function getStateFromInputs() {
  const formType = document.getElementById('formType').value; // 'standard' | 'vertex'
  const a = Number(document.getElementById('a').value);
  const b = Number(document.getElementById('b').value);
  const c = Number(document.getElementById('c').value);
  const p = Number(document.getElementById('p').value);
  const q = Number(document.getElementById('q').value);
  let xMin = Number(document.getElementById('xmin').value);
  let xMax = Number(document.getElementById('xmax').value);
  const xLeftType = document.getElementById('xLeftType').value;  // 'closed' | 'open'
  const xRightType = document.getElementById('xRightType').value; // 'closed' | 'open'
  return { formType, a, b, c, p, q, xMin, xMax, xLeftType, xRightType };
}

function setError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg || '';
}

function updateAll(fromRandom = false) {
  setError('');
  const controls = document.getElementById('controls');
  let { formType, a, b, c, p, q, xMin, xMax, xLeftType, xRightType } = getStateFromInputs();
  // 表示切替
  controls.classList.toggle('mode-standard', formType === 'standard');
  controls.classList.toggle('mode-vertex', formType === 'vertex');

  if (!Number.isFinite(a) || a === 0) { setError('a は 0 以外の数で入力してください。'); return; }
  if (formType === 'vertex') {
    if (!Number.isFinite(p) || !Number.isFinite(q)) { setError('p, q は数値で入力してください。'); return; }
    const abc = abcFromVertex(a, p, q);
    b = abc.b; c = abc.c;
    // 相互反映
    document.getElementById('b').value = Number.isFinite(b) ? Number(b) : '';
    document.getElementById('c').value = Number.isFinite(c) ? Number(c) : '';
  } else {
    if (!Number.isFinite(b) || !Number.isFinite(c)) { setError('b, c は数値で入力してください。'); return; }
    const pq = pqFromStandard(a, b, c);
    p = pq.p; q = pq.q;
    // 相互反映
    document.getElementById('p').value = Number.isFinite(p) ? Number(p) : '';
    document.getElementById('q').value = Number.isFinite(q) ? Number(q) : '';
  }

  if (!Number.isFinite(xMin) || !Number.isFinite(xMax)) { setError('xの変域は数値で入力してください。'); return; }
  if (xMin === xMax) { setError('xの下限と上限が同じです。異なる値を設定してください。'); return; }
  if (xMin > xMax) {
    const tmp = xMin; xMin = xMax; xMax = tmp;
    document.getElementById('xmin').value = xMin;
    document.getElementById('xmax').value = xMax;
    // 比較演算子も左右入れ替え
    const leftSel = document.getElementById('xLeftType');
    const rightSel = document.getElementById('xRightType');
    const tmpVal = leftSel.value; leftSel.value = rightSel.value; rightSel.value = tmpVal;
    xLeftType = leftSel.value; xRightType = rightSel.value;
  }

  // 問題文
  const problemTeX = buildProblemText(formType, formType === 'vertex' ? { a, p, q } : { a, b, c }, xMin, xMax, xLeftType, xRightType);
  document.getElementById('problemText').innerHTML = renderTeXToHTML(problemTeX);

  // 計算（常に a,b,c を使用）
  const data = computeRange(a, b, c, xMin, xMax);

  // 結果テキスト（分数で統一表示）
  // 頂点が区間に「含まれる」か（境界一致時は閉区間のみ含む）
  const EPS = 1e-9;
  // data.h は頂点の x 座標。ここでの未定義参照が例外となり、描画が止まっていた。
  const vertexIncluded = (data.h > xMin + EPS && data.h < xMax - EPS) ||
                        (Math.abs(data.h - xMin) <= EPS && xLeftType === 'closed') ||
                        (Math.abs(data.h - xMax) <= EPS && xRightType === 'closed');
  const axisHTML = renderTeXToHTML(`x = ${fracToTeX(data.hFrac.n, data.hFrac.d)}`);
  const vertexHTML = renderTeXToHTML(`(${fracToTeX(data.hFrac.n, data.hFrac.d)}, ${fracToTeX(data.kFrac.n, data.kFrac.d)})`);
  const minTeX = (data.minSource === 'vertex') ? fracToTeX(data.kFrac.n, data.kFrac.d) : numToTeX(data.minY);
  const maxTeX = (data.maxSource === 'vertex') ? fracToTeX(data.kFrac.n, data.kFrac.d) : numToTeX(data.maxY);
  // 包含かどうか
  let includeMin = true, includeMax = true;
  if (data.minSource === 'vertex') {
    includeMin = vertexIncluded;
  } else {
    // 端点側
    if (Math.abs(data.y1 - data.y2) <= EPS) {
      includeMin = (xLeftType === 'closed') || (xRightType === 'closed');
    } else if (data.y1 < data.y2) {
      includeMin = (xLeftType === 'closed');
    } else {
      includeMin = (xRightType === 'closed');
    }
  }
  if (data.maxSource === 'vertex') {
    includeMax = vertexIncluded;
  } else {
    if (Math.abs(data.y1 - data.y2) <= EPS) {
      includeMax = (xLeftType === 'closed') || (xRightType === 'closed');
    } else if (data.y1 > data.y2) {
      includeMax = (xLeftType === 'closed');
    } else {
      includeMax = (xRightType === 'closed');
    }
  }
  const minHTML = renderTeXToHTML(`${minTeX}`);
  const maxHTML = renderTeXToHTML(`${maxTeX}`);
  const rangeHTML = renderTeXToHTML(formatRangeTeX(minTeX, includeMin, maxTeX, includeMax));
  document.getElementById('axisText').innerHTML = axisHTML;
  document.getElementById('vertexText').innerHTML = vertexHTML;
  document.getElementById('minText').innerHTML = minHTML;
  document.getElementById('maxText').innerHTML = maxHTML;
  document.getElementById('rangeText').innerHTML = rangeHTML;

  // 解説（簡易LaTeXレンダリング）
  const explain = buildExplanation(data, { formType, p, q, xLeftType, xRightType, vertexIncluded, includeMin, includeMax, minTeX, maxTeX });
  const list = document.getElementById('explainList');
  list.innerHTML = '';
  explain.forEach(line => {
    const li = document.createElement('li');
    li.innerHTML = renderTeXToHTML(line);
    list.appendChild(li);
  });

  // 図
  const wrap = document.getElementById('svgWrap');
  renderSVG(wrap, data);
}

// ランダム生成
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomize() {
  const formType = document.getElementById('formType').value;
  // aは-3..-1または1..3から
  const candidatesA = [-3, -2, -1, 1, 2, 3];
  const a = candidatesA[randomInt(0, candidatesA.length - 1)];
  let xMin = randomInt(-5, 1);
  let xMax = randomInt(2, 6);
  if (xMin === xMax) xMax += 1;

  if (formType === 'vertex') {
    const p = randomInt(-5, 5);
    const q = randomInt(-5, 5);
    document.getElementById('a').value = a;
    document.getElementById('p').value = p;
    document.getElementById('q').value = q;
    // b,c は updateAll 内で相互反映される
  } else {
    const b = randomInt(-5, 5);
    const c = randomInt(-5, 5);
    document.getElementById('a').value = a;
    document.getElementById('b').value = b;
    document.getElementById('c').value = c;
    // p,q は updateAll 内で相互反映される
  }
  document.getElementById('xmin').value = xMin;
  document.getElementById('xmax').value = xMax;
  updateAll(true);
}

// 初期化
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('updateBtn').addEventListener('click', () => updateAll(false));
  document.getElementById('randomBtn').addEventListener('click', randomize);
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  // 入力変更で即時更新（体験をよくする）
  ['formType', 'a', 'b', 'c', 'p', 'q', 'xmin', 'xmax', 'xLeftType', 'xRightType'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => updateAll(false));
    document.getElementById(id).addEventListener('input', () => updateAll(false));
  });
  // 初期モードクラス設定
  const controls = document.getElementById('controls');
  const formType = document.getElementById('formType').value;
  controls.classList.toggle('mode-standard', formType === 'standard');
  controls.classList.toggle('mode-vertex', formType === 'vertex');
  updateAll(false);
});
