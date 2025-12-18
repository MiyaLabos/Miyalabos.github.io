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

    // Audio Context for Beep
    let audioCtx = null;
    
    const playAlarm = () => {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); 
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    };

    const updateDisplay = () => {
        const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const s = String(remainingSeconds % 60).padStart(2, '0');
        display.textContent = `${m}:${s}`;
    };

    const stopAlarm = () => {
        document.body.classList.remove('alarm-active');
        isAlarmPlaying = false;
    };

    updateDisplay();

    // Adjust Buttons
    adjustBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (intervalId) return; // Cannot adjust while running
            
            const action = btn.getAttribute('data-action');
            if (action === 'inc-min') totalSeconds += 60;
            if (action === 'dec-min') totalSeconds = Math.max(0, totalSeconds - 60);
            if (action === 'inc-sec') totalSeconds += 10;
            if (action === 'dec-sec') totalSeconds = Math.max(0, totalSeconds - 10);
            
            remainingSeconds = totalSeconds;
            updateDisplay();
        });
    });

    startBtn.addEventListener('click', () => {
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
                
                // Play sound repeatedly
                const alarmInterval = setInterval(() => {
                    if (!isAlarmPlaying) {
                        clearInterval(alarmInterval);
                    } else {
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
