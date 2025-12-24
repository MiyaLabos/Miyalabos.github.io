/**
 * Redesigned Timer Logic
 * Supporting 7-segment display and Japanese date info
 */

document.addEventListener('DOMContentLoaded', () => {
    init7Segments();
    initNavigation();
    initClock();
    initStopwatch();
    initTimer();
});

/* --- 7-Segment Logic --- */
const segmentMap = {
    '0': ['a', 'b', 'c', 'd', 'e', 'f'],
    '1': ['b', 'c'],
    '2': ['a', 'b', 'g', 'e', 'd'],
    '3': ['a', 'b', 'g', 'c', 'd'],
    '4': ['f', 'g', 'b', 'c'],
    '5': ['a', 'f', 'g', 'c', 'd'],
    '6': ['a', 'f', 'e', 'd', 'c', 'g'],
    '7': ['a', 'b', 'c'],
    '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    '9': ['a', 'b', 'c', 'd', 'f', 'g'],
    ' ': []
};

function init7Segments() {
    // Inject segment divs into all digit containers
    document.querySelectorAll('.digit').forEach(el => {
        el.innerHTML = ''; // Clear existing
        ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach(seg => {
            const segDiv = document.createElement('div');
            segDiv.className = `segment seg-${seg}`;
            segDiv.dataset.seg = seg; // Add data-seg for reliable identification
            el.appendChild(segDiv);
        });
    });
}

const digitCache = {};

function updateDigit(id, val) {
    if (digitCache[id] === val) return; // Prevent flickering by skipping redundant updates
    digitCache[id] = val;

    const el = document.getElementById(id);
    if (!el) return;
    const activeSegs = segmentMap[val] || [];
    el.querySelectorAll('.segment').forEach(segEl => {
        const segName = segEl.dataset.seg;
        if (activeSegs.includes(segName)) {
            segEl.classList.add('on');
        } else {
            segEl.classList.remove('on');
        }
    });
}

/* --- Japanese Date Info --- */
function getJapaneseInfo(date) {
    // Era: Reiwa starts from 2019
    const year = date.getFullYear();
    let era = "";
    if (year >= 2019) {
        const reiwaYear = year - 2018;
        era = `令和${reiwaYear === 1 ? '元' : reiwaYear}年`;
    } else if (year >= 1989) {
        era = `平成${year - 1988}年`;
    }

    // Rokuyo: Simplified calculation (requires lunar month/day)
    // For now, providing a lookup for 2024-2025 or a rough approximation
    // Real calculation is complex. Using a dummy for demo or a simplified arithmetic
    const rokuyoNames = ["先勝", "友引", "先負", "仏滅", "大安", "赤口"];

    // This is a VERY simplified mock logic. Accurate Rokuyo needs a library or full table.
    // For this redesign, we'll use a deterministic but not 100% accurate formula
    // (month + day) % 6 is commonly used for rough estimates but resets on lunar months.
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const rokuyo = rokuyoNames[(month + day) % 6];

    return { era, rokuyo };
}

/* --- Navigation --- */
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.mode-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/* --- Clock --- */
function initClock() {
    const updateClock = () => {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();

        // Main Digits
        const hStr = String(h).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');
        updateDigit('digit-h1', hStr[0]);
        updateDigit('digit-h2', hStr[1]);
        updateDigit('digit-m1', mStr[0]);
        updateDigit('digit-m2', mStr[1]);

        // Left Indicators
        document.getElementById('label-am').classList.toggle('active', h < 12);
        document.getElementById('label-pm').classList.toggle('active', h >= 12);
        document.getElementById('small-time').textContent = `${h}:${mStr}`;

        // Right Info
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        document.getElementById('date-main').textContent = `${now.getMonth() + 1}月${now.getDate()}日 (${days[now.getDay()]})`;
        const jInfo = getJapaneseInfo(now);
        document.getElementById('date-era').textContent = jInfo.era;
        document.getElementById('date-rokuyo').textContent = jInfo.rokuyo;
    };

    setInterval(updateClock, 1000);
    updateClock();
}

/* --- Stopwatch --- */
function initStopwatch() {
    const startBtn = document.getElementById('sw-start');
    const stopBtn = document.getElementById('sw-stop');
    const resetBtn = document.getElementById('sw-reset');

    let startTime = 0;
    let elapsedTime = 0;
    let intervalId = null;

    const updateDisplay = (ms) => {
        const totalSec = Math.floor(ms / 1000);
        const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        const msPart = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');

        updateDigit('sw-m1', m[0]);
        updateDigit('sw-m2', m[1]);
        updateDigit('sw-s1', s[0]);
        updateDigit('sw-s2', s[1]);
        updateDigit('sw-ms1', msPart[0]);
        updateDigit('sw-ms2', msPart[1]);
    };

    startBtn.addEventListener('click', () => {
        if (intervalId) return;
        startTime = Date.now() - elapsedTime;
        intervalId = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay(elapsedTime);
        }, 30); // 30ms for performance

        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = true;
    });

    stopBtn.addEventListener('click', () => {
        clearInterval(intervalId);
        intervalId = null;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = false;
        startBtn.textContent = "RESUME";
    });

    resetBtn.addEventListener('click', () => {
        elapsedTime = 0;
        updateDisplay(0);
        resetBtn.disabled = true;
        startBtn.textContent = "START";
    });
}

/* --- Timer --- */
function initTimer() {
    const startBtn = document.getElementById('tm-start');
    const pauseBtn = document.getElementById('tm-pause');
    const resetBtn = document.getElementById('tm-reset');
    const adjustBtns = document.querySelectorAll('.adjust-btn');

    let totalSeconds = 300;
    let remainingSeconds = totalSeconds;
    let intervalId = null;

    const updateDisplay = () => {
        const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const s = String(remainingSeconds % 60).padStart(2, '0');
        updateDigit('tm-m1', m[0]);
        updateDigit('tm-m2', m[1]);
        updateDigit('tm-s1', s[0]);
        updateDigit('tm-s2', s[1]);
    };

    adjustBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (intervalId) return;
            const action = btn.getAttribute('data-action');
            if (action === 'inc-10min') totalSeconds += 600;
            if (action === 'dec-10min') totalSeconds = Math.max(0, totalSeconds - 600);
            if (action === 'inc-min') totalSeconds += 60;
            if (action === 'dec-min') totalSeconds = Math.max(0, totalSeconds - 60);
            if (action === 'inc-sec') totalSeconds += 10;
            if (action === 'dec-sec') totalSeconds = Math.max(0, totalSeconds - 10);
            remainingSeconds = totalSeconds;
            updateDisplay();
        });
    });

    startBtn.addEventListener('click', () => {
        if (intervalId || remainingSeconds <= 0) return;
        intervalId = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateDisplay();
            } else {
                clearInterval(intervalId);
                intervalId = null;
                alert("Time's up!");
            }
        }, 1000);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    });

    pauseBtn.addEventListener('click', () => {
        clearInterval(intervalId);
        intervalId = null;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(intervalId);
        intervalId = null;
        remainingSeconds = totalSeconds;
        updateDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    });

    updateDisplay();
}
