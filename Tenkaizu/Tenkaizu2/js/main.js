import { NetValidator } from './validator.js';
import { NetValidator } from './validator.js';
// NetVisualizer is imported dynamically to ensure the 2D editor works even if Three.js (CDN) fails to load.

class App {
    constructor() {
        this.rows = 6;
        this.cols = 6;
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.validator = new NetValidator();
        this.visualizer = null; // Init later

        this.gridEl = document.getElementById('gridContainer');
        this.statusText = document.getElementById('statusText');
        this.msgEl = document.getElementById('validationMessage');
        this.resetBtn = document.getElementById('resetBtn');
        this.foldSlider = document.getElementById('foldSlider');

        this.init();
    }

    async init() {
        this.renderGrid();
        this.attachEvents();

        // Init Visualizer Dynamically
        try {
            const { NetVisualizer } = await import('./visualizer.js');
            const canvasContainer = document.getElementById('canvasContainer');
            this.visualizer = new NetVisualizer(canvasContainer);
            this.visualizer.animate();
        } catch (e) {
            console.error("Failed to load 3D visualizer. Likely network issue with Three.js CDN.", e);
            const container = document.getElementById('canvasContainer');
            container.innerHTML = `<div style="color:white; display:flex; height:100%; justify-content:center; align-items:center; text-align:center; padding:1rem;">
                3D表示を読み込めませんでした。<br>インターネット接続を確認してください。<br>(${e.message})
            </div>`;
        }
    }

    renderGrid() {
        this.gridEl.innerHTML = '';
        this.gridEl.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                if (this.grid[r][c] === 1) cell.classList.add('active');

                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.addEventListener('click', () => this.toggleCell(r, c));

                this.gridEl.appendChild(cell);
            }
        }
        this.updateStatus();
    }

    toggleCell(r, c) {
        this.grid[r][c] = this.grid[r][c] === 1 ? 0 : 1;
        this.renderGrid(); // Naive re-render, optimize if needed
        this.checkValidity();
        if (this.visualizer) {
            this.updateVisualizer();
        }
    }

    reset() {
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.renderGrid();
        this.checkValidity();
        if (this.visualizer) {
            this.updateVisualizer();
            this.visualizer.setFoldAngle(0);
        }
        this.foldSlider.value = 0;
    }

    updateStatus() {
        const count = this.grid.flat().filter(v => v === 1).length;
        this.statusText.textContent = `面: ${count}/6`;
        if (count === 6) {
            this.statusText.style.color = 'var(--text-main)';
        } else {
            this.statusText.style.color = 'var(--text-muted)';
        }
    }

    checkValidity() {
        // Run validation
        const result = this.validator.validate(this.grid);

        // Update UI
        this.msgEl.textContent = result.message;
        if (result.valid) {
            this.msgEl.className = 'validation-message valid';
        } else {
            this.msgEl.className = 'validation-message invalid';
        }
        return result.valid;
    }

    updateVisualizer() {
        if (!this.visualizer) return;
        // Pass grid data to visualizer
        // Only if we have some cells, otherwise clear
        this.visualizer.updateNet(this.grid);
    }

    attachEvents() {
        this.resetBtn.addEventListener('click', () => this.reset());

        this.foldSlider.addEventListener('input', (e) => {
            if (this.visualizer) {
                const val = parseFloat(e.target.value);
                this.visualizer.setFoldAngle(val);
            }
        });
    }
}

// Start App when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
