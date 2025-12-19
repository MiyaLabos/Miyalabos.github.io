/*
 * Cyber Timer Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initClock();
    initStopwatch();
    initTimer();
});

/* --- Navigation --- */
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.mode-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/* --- Clock --- */
function initClock() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');

    const updateClock = () => {
        const now = new Date();

        // Time: HH:MM:SS
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${h}:${m}:${s}`;

        // Date: YYYY.MM.DD ???
        const y = now.getFullYear();
        const mo = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const day = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()];
        dateEl.textContent = `${y}.${mo}.${d} ${day}`;
    };

    setInterval(updateClock, 1000);
    updateClock();
}

/* --- Stopwatch --- */
function initStopwatch() {
    const display = document.getElementById('stopwatch-time');
    const startBtn = document.getElementById('sw-start');
    const stopBtn = document.getElementById('sw-stop');
    const resetBtn = document.getElementById('sw-reset');

    let startTime = 0;
    let elapsedTime = 0;
    let intervalId = null;

    const formatTime = (ms) => {
        const totalSec = Math.floor(ms / 1000);
        const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        const centi = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
        return `${m}:${s}.${centi}`;
    };

    startBtn.addEventListener('click', () => {
        if (intervalId) return;
        startTime = Date.now() - elapsedTime;
        intervalId = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            display.textContent = formatTime(elapsedTime);
        }, 10);

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
        clearInterval(intervalId);
        intervalId = null;
        elapsedTime = 0;
        display.textContent = "00:00.00";

        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = true;
        startBtn.textContent = "START";
    });
}

/* --- Timer --- */
function initTimer() {
    const display = document.getElementById('timer-display');
    const startBtn = document.getElementById('tm-start');
    const pauseBtn = document.getElementById('tm-pause');
    const resetBtn = document.getElementById('tm-reset');
    const adjustBtns = document.querySelectorAll('.adjust-btn');

    let totalSeconds = 300; // Default 5 min
    let remainingSeconds = totalSeconds;
    let intervalId = null;
    let isAlarmPlaying = false;
    let alarmInterval = null;

    // Audio Context for Beep
    let audioCtx = null;

    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    };

    const playAlarm = () => {
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        const pips = 4; // Number of beeps in the pattern
        const pipDuration = 0.05; // 50ms each
        const interval = 0.12; // Time between beeps

        for (let i = 0; i < pips; i++) {
            const startTime = now + (i * interval);
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(2500, startTime);

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + pipDuration - 0.01);
            gainNode.gain.linearRampToValueAtTime(0, startTime + pipDuration);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + pipDuration);
        }
    };

    const updateDisplay = () => {
        const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const s = String(remainingSeconds % 60).padStart(2, '0');
        display.textContent = `${m}:${s}`;
    };

    const stopAlarm = () => {
        document.body.classList.remove('alarm-active');
        isAlarmPlaying = false;
        if (alarmInterval) {
            clearInterval(alarmInterval);
            alarmInterval = null;
        }
    };

    updateDisplay();

    // Adjust Buttons
    adjustBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (intervalId) return; // Cannot adjust while running

            // Interaction sound (optional, but good for retro feel)
            // initAudio(); // Optional, maybe too aggressive

            const action = btn.getAttribute('data-action');
            if (action === 'inc-10min') totalSeconds += 600;
            if (action === 'dec-10min') totalSeconds = Math.max(0, totalSeconds - 600);
            if (action === 'inc-min') totalSeconds += 60;
            if (action === 'dec-min') totalSeconds = Math.max(0, totalSeconds - 60);
            if (action === 'inc-sec') totalSeconds += 10;
            if (action === 'dec-sec') totalSeconds = Math.max(0, totalSeconds - 10);
            if (action === 'reset-setup') totalSeconds = 0;

            remainingSeconds = totalSeconds;
            updateDisplay();
        });
    });

    startBtn.addEventListener('click', () => {
        // Initialize Audio on user interaction
        initAudio();

        if (intervalId) return;
        if (remainingSeconds === 0) return;
        if (isAlarmPlaying) { stopAlarm(); return; }

        intervalId = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateDisplay();
            } else {
                // Time's up
                clearInterval(intervalId);
                intervalId = null;
                startBtn.disabled = false;
                pauseBtn.disabled = true;

                // Alarm trigger
                document.body.classList.add('alarm-active');
                isAlarmPlaying = true;

                playAlarm(); // Play initial
                // Play sound repeatedly
                alarmInterval = setInterval(() => {
                    if (isAlarmPlaying) {
                        playAlarm();
                    }
                }, 1000);
            }
        }, 1000);

        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
    });

    pauseBtn.addEventListener('click', () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    });

    resetBtn.addEventListener('click', () => {
        stopAlarm();
        if (intervalId) clearInterval(intervalId);
        intervalId = null;

        remainingSeconds = totalSeconds;
        updateDisplay();

        startBtn.disabled = false;
        pauseBtn.disabled = true;
    });
}
