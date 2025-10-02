// インタラクティブ挙動を定義（日本語コメント）
// - 直角三角形エクスプローラ
// - 単位円エクスプローラ
// - 正弦・余弦グラフ
// - クイッククイズ（特別角）

(function () {
  'use strict';

  // 角度の単位管理（表示用）
  const unitSelect = document.getElementById('angleUnit');

  // 直角三角形UI
  const triRange = document.getElementById('triAngle');
  const triOut = document.getElementById('triAngleOut');
  const triSvg = document.getElementById('triSvg');
  const triAdj = document.getElementById('triAdj');
  const triOpp = document.getElementById('triOpp');
  const triHyp = document.getElementById('triHyp');
  const triArc = document.getElementById('triArc');
  const triThetaText = document.getElementById('triThetaText');
  const sinVal = document.getElementById('sinVal');
  const cosVal = document.getElementById('cosVal');
  const tanVal = document.getElementById('tanVal');

  // 単位円UI
  const circRange = document.getElementById('circAngle');
  const circOut = document.getElementById('circAngleOut');
  const circSvg = document.getElementById('circSvg');
  const ray = document.getElementById('ray');
  const projX = document.getElementById('projX');
  const projY = document.getElementById('projY');
  const point = document.getElementById('point');
  const cosVal2 = document.getElementById('cosVal2');
  const sinVal2 = document.getElementById('sinVal2');
  const quadrant = document.getElementById('quadrant');

  // グラフUI
  const graphRange = document.getElementById('graphAngle');
  const graphOut = document.getElementById('graphAngleOut');
  const graphCanvas = document.getElementById('graphCanvas');
  const gctx = graphCanvas.getContext('2d');

  // クイズUI
  const quizQ = document.getElementById('quizQ');
  const quizOpts = document.getElementById('quizOpts');
  const quizNext = document.getElementById('quizNext');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizCorrectEl = document.getElementById('quizCorrect');
  const quizTotalEl = document.getElementById('quizTotal');

  // ユーティリティ関数
  const degToRad = (deg) => (deg * Math.PI) / 180;
  const radToDeg = (rad) => (rad * 180) / Math.PI;
  const toFixed = (x) => x.toFixed(3);

  const formatAngle = (degVal) => {
    const unit = unitSelect?.value || 'deg';
    if (unit === 'rad') {
      const rad = degToRad(Number(degVal));
      return toFixed(rad) + ' rad';
    }
    return `${degVal}°`;
  };

  // 表示単位を保存（ローカル）
  const loadPrefs = () => {
    try {
      const unit = localStorage.getItem('angleUnit');
      if (unit && unitSelect) unitSelect.value = unit;
    } catch {}
  };
  const savePrefs = () => {
      try { localStorage.setItem('angleUnit', unitSelect.value); } catch {}
  };

  // 直角三角形の描画
  function updateTriangle() {
    const deg = Number(triRange.value);
    triOut.value = formatAngle(deg);

    const rad = degToRad(deg);
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const t = Math.tan(rad);

    sinVal.textContent = toFixed(s);
    cosVal.textContent = toFixed(c);
    tanVal.textContent = Math.abs(deg) === 90 ? '—' : toFixed(t);

    // SVG座標系：左上(0,0)、yは下方向が+。
    const O = { x: 40, y: 240 };     // 原点（左下付近）
    const R = 160;                    // 斜辺の長さ（描画用の見栄え）
    const P = { x: O.x + R * c, y: O.y - R * s }; // 角度θの端点
    const F = { x: O.x + R * c, y: O.y };         // 垂線の足

    // 隣辺（青）・対辺（赤）・斜辺（緑）
    triAdj.setAttribute('x1', O.x); triAdj.setAttribute('y1', O.y);
    triAdj.setAttribute('x2', F.x); triAdj.setAttribute('y2', F.y);

    triOpp.setAttribute('x1', F.x); triOpp.setAttribute('y1', F.y);
    triOpp.setAttribute('x2', P.x); triOpp.setAttribute('y2', P.y);

    triHyp.setAttribute('x1', O.x); triHyp.setAttribute('y1', O.y);
    triHyp.setAttribute('x2', P.x); triHyp.setAttribute('y2', P.y);

    // 角度弧
    const arcR = 28;
    const ax = O.x + arcR * Math.cos(0);
    const ay = O.y + arcR * Math.sin(0);
    const bx = O.x + arcR * Math.cos(-rad);
    const by = O.y + arcR * Math.sin(-rad);
    const largeArc = rad > Math.PI ? 1 : 0;
    const arcPath = `M ${ax} ${ay} A ${arcR} ${arcR} 0 ${largeArc} 0 ${bx} ${by}`;
    triArc.setAttribute('d', arcPath);

    // θ のテキスト位置を微調整
    triThetaText.setAttribute('x', String(O.x + 10));
    triThetaText.setAttribute('y', String(O.y - 12));
  }

  // 単位円の描画
  function updateCircle() {
    const deg = Number(circRange.value);
    circOut.value = formatAngle(deg);
    const rad = degToRad(deg);

    const cx = 170, cy = 170, R = 120;
    const x = cx + R * Math.cos(rad);
    const y = cy - R * Math.sin(rad);

    // 半直線
    ray.setAttribute('x2', String(x));
    ray.setAttribute('y2', String(y));

    // 投影
    projX.setAttribute('x1', String(x)); projX.setAttribute('y1', String(y));
    projX.setAttribute('x2', String(x)); projX.setAttribute('y2', String(cy));
    projY.setAttribute('x1', String(x)); projY.setAttribute('y1', String(y));
    projY.setAttribute('x2', String(cx)); projY.setAttribute('y2', String(y));

    // 点
    point.setAttribute('cx', String(x));
    point.setAttribute('cy', String(y));

    // 数値表示
    cosVal2.textContent = toFixed(Math.cos(rad));
    sinVal2.textContent = toFixed(Math.sin(rad));

    // 象限
    const q = quadrantOf(deg);
    quadrant.textContent = qLabel(q);
  }

  // 象限（1,2,3,4）または軸上は0
  function quadrantOf(deg) {
    const a = ((deg % 360) + 360) % 360;
    if (a === 0 || a === 90 || a === 180 || a === 270) return 0;
    if (a < 90) return 1;
    if (a < 180) return 2;
    if (a < 270) return 3;
    return 4;
  }
  function qLabel(q) {
    return q === 0 ? '軸上' : `第${['I','II','III','IV'][q-1]}象限`;
  }

  // グラフ描画（sin, cos）
  function drawGraph() {
    const W = graphCanvas.width, H = graphCanvas.height;
    gctx.clearRect(0, 0, W, H);

    // 背景と軸
    gctx.fillStyle = getCSS('--plot-bg') || getCSS('--panel') || '#111827';
    gctx.fillRect(0, 0, W, H);

    // グリッド
    gctx.strokeStyle = getCSS('--grid') || '#223';
    gctx.lineWidth = 1;
    for (let i = 0; i <= 12; i++) {
      const x = (W / 12) * i; // 30°ごと
      gctx.beginPath(); gctx.moveTo(x, 0); gctx.lineTo(x, H); gctx.stroke();
    }
    const mid = H / 2;
    gctx.strokeStyle = getCSS('--axis') || '#56607a';
    gctx.beginPath(); gctx.moveTo(0, mid); gctx.lineTo(W, mid); gctx.stroke();

    // 曲線描画ヘルパー
    const plot = (fn, color) => {
      gctx.beginPath();
      gctx.lineWidth = 2;
      gctx.strokeStyle = color;
      for (let deg = 0; deg <= 360; deg++) {
        const x = (W * deg) / 360;
        const y = mid - fn(degToRad(deg)) * (H * 0.42);
        if (deg === 0) gctx.moveTo(x, y); else gctx.lineTo(x, y);
      }
      gctx.stroke();
    };

    plot(Math.sin, getCSS('--sin') || '#ff3b30');
    plot(Math.cos, getCSS('--cos') || '#2b7fff');

    // 現在角度のハイライト
    const deg = Number(graphRange.value);
    const x = (W * deg) / 360;
    const ys = mid - Math.sin(degToRad(deg)) * (H * 0.42);
    const yc = mid - Math.cos(degToRad(deg)) * (H * 0.42);

    gctx.strokeStyle = 'rgba(255,255,255,.35)';
    gctx.beginPath(); gctx.moveTo(x, 0); gctx.lineTo(x, H); gctx.stroke();

    gctx.fillStyle = getCSS('--sin') || '#ff3b30';
    gctx.beginPath(); gctx.arc(x, ys, 4, 0, Math.PI * 2); gctx.fill();
    gctx.fillStyle = getCSS('--cos') || '#2b7fff';
    gctx.beginPath(); gctx.arc(x, yc, 4, 0, Math.PI * 2); gctx.fill();
  }

  function getCSS(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function updateGraphUI() {
    const deg = Number(graphRange.value);
    graphOut.value = formatAngle(deg);
    drawGraph();
  }

  // クイズ（特別角）
  const specialAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  const funcs = ['sin', 'cos'];
  let quizState = { correct: 0, total: 0, current: null };

  function nextQuiz() {
    quizFeedback.textContent = '';
    const angle = specialAngles[Math.floor(Math.random() * specialAngles.length)];
    const fn = funcs[Math.floor(Math.random() * funcs.length)];
    const ans = exactTrigString(angle, fn);
    quizState.current = { angle, fn, ans };

    quizQ.textContent = `${fn} ${angle}° の値として正しいものを選ぼう。`;
    const opts = buildOptions(ans);
    renderOptions(opts, ans);
  }

  function buildOptions(answer) {
    const pool = ['1', '0', '1/2', '√2/2', '√3/2', '-1', '-1/2', '-√2/2', '-√3/2'];
    const candidates = pool.filter((x) => x !== answer);
    shuffle(candidates);
    const picks = candidates.slice(0, 3).concat([answer]);
    return shuffle(picks.slice());
  }

  function renderOptions(options, answer) {
    quizOpts.innerHTML = '';
    options.forEach((val) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = val;
      btn.dataset.v = val;
      btn.addEventListener('click', () => {
        const ok = val === answer;
        quizState.total += 1;
        if (ok) quizState.correct += 1;
        quizFeedback.textContent = ok ? '正解！' : `残念… 正解は ${answer}`;
        quizCorrectEl.textContent = String(quizState.correct);
        quizTotalEl.textContent = String(quizState.total);
        // 選択済みの視覚化
        [...quizOpts.querySelectorAll('button')].forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      });
      quizOpts.appendChild(btn);
    });
  }

  function exactTrigString(angleDeg, fn) {
    const a = ((angleDeg % 360) + 360) % 360;
    if (fn === 'sin') {
      if (a === 0 || a === 180 || a === 360) return '0';
      if (a === 90) return '1';
      if (a === 270) return '-1';
    } else {
      if (a === 90 || a === 270) return '0';
      if (a === 0 || a === 360) return '1';
      if (a === 180) return '-1';
    }

    const ref = referenceAngle(a);
    let base = '';
    if (ref === 30) base = fn === 'sin' ? '1/2' : '√3/2';
    else if (ref === 45) base = '√2/2';
    else if (ref === 60) base = fn === 'sin' ? '√3/2' : '1/2';
    else base = '0';

    const sign = signOf(fn, a, base === '0' ? 0 : 1);
    if (base === '0') return '0';
    return sign < 0 ? `-${base}` : base;
  }

  function referenceAngle(a) {
    if (a <= 90) return a;
    if (a <= 180) return 180 - a;
    if (a <= 270) return a - 180;
    return 360 - a;
  }

  function signOf(fn, a, nonzero) {
    // nonzero: 0->0, 1->±1
    if (nonzero === 0) return 0;
    // sinの符号: I +, II +, III -, IV -
    // cosの符号: I +, II -, III -, IV +
    if (fn === 'sin') {
      if (a < 90) return 1;
      if (a < 180) return 1;
      if (a < 270) return -1;
      return -1;
    } else {
      if (a < 90) return 1;
      if (a < 180) return -1;
      if (a < 270) return -1;
      return 1;
    }
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // イベント登録
  function bindEvents() {
    unitSelect?.addEventListener('change', () => {
      savePrefs();
      triOut.value = formatAngle(Number(triRange.value));
      circOut.value = formatAngle(Number(circRange.value));
      graphOut.value = formatAngle(Number(graphRange.value));
    });

    triRange.addEventListener('input', () => updateTriangle());
    circRange.addEventListener('input', () => updateCircle());
    graphRange.addEventListener('input', () => updateGraphUI());

    quizNext.addEventListener('click', () => nextQuiz());
  }

  // 初期化
  function init() {
    loadPrefs();
    bindEvents();
    updateTriangle();
    updateCircle();
    updateGraphUI();
    nextQuiz();
  }

  // DOM読み込み後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
