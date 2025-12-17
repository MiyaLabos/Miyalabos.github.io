import { NetValidator } from './validator.js';
import { NetVisualizer } from './visualizer.js';

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

    init() {
        this.renderGrid();
        this.attachEvents();

        // Init Visualizer
        const canvasContainer = document.getElementById('canvasContainer');
        this.visualizer = new NetVisualizer(canvasContainer);
        this.visualizer.animate();
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
        this.updateVisualizer();
    }

    reset() {
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.renderGrid();
        this.checkValidity();
        this.updateVisualizer();
        this.foldSlider.value = 0;
        this.visualizer.setFoldAngle(0);
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
        // Pass grid data to visualizer
        // Only if we have some cells, otherwise clear
        this.visualizer.updateNet(this.grid);
    }

    attachEvents() {
        this.resetBtn.addEventListener('click', () => this.reset());

        this.foldSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.visualizer.setFoldAngle(val);
        });
    }
}

// Start App when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
