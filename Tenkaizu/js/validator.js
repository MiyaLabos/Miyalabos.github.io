export class NetValidator {
    constructor() {
        this.faces = [];
    }

    validate(grid) {
        // grid is a 2D array (e.g. 6x6) of 0s and 1s.
        this.faces = [];
        const cells = [];
        const rows = grid.length;
        const cols = grid[0].length;

        // 1. Collect all active cells
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 1) {
                    cells.push({ r, c });
                }
            }
        }

        // 2. Count Check
        if (cells.length !== 6) {
            return { valid: false, message: `面は6つ必要です (現在: ${cells.length})` };
        }

        // 3. Connectivity Check (Flood Fill)
        const visited = new Set();
        const queue = [cells[0]];
        visited.add(`${cells[0].r},${cells[0].c}`);
        let connectedCount = 0;

        while (queue.length > 0) {
            const { r, c } = queue.shift();
            connectedCount++;

            const neighbors = [
                { r: r - 1, c: c },
                { r: r + 1, c: c },
                { r: r, c: c - 1 },
                { r: r, c: c + 1 }
            ];

            for (const n of neighbors) {
                // Check bounds and if cell is active
                if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols && grid[n.r][n.c] === 1) {
                    const key = `${n.r},${n.c}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push(n);
                    }
                }
            }
        }

        if (connectedCount !== 6) {
            return { valid: false, message: "全ての面がつながっている必要があります" };
        }

        // 4. Folding Simulation
        // Map to verify unique normals
        // Key: stringified normal vector "x,y,z"
        // Value: grid coordinate that mapped there
        const usedNormals = new Map();

        // BFS for folding
        // State: { r, c, normal: Vector3, up: Vector3 }
        // Start with first cell at Front Face
        const startNode = {
            r: cells[0].r,
            c: cells[0].c,
            normal: { x: 0, y: 0, z: 1 },
            up: { x: 0, y: 1, z: 0 }
        };

        const foldQueue = [startNode];
        const foldVisited = new Set();
        foldVisited.add(`${startNode.r},${startNode.c}`);

        // Helper: Cross Product
        const cross = (a, b) => ({
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        });

        // Helper: Negate
        const neg = (v) => ({ x: -v.x, y: -v.y, z: -v.z });

        // Helper: Stringify
        const vKey = (v) => `${Math.round(v.x)},${Math.round(v.y)},${Math.round(v.z)}`;

        while (foldQueue.length > 0) {
            const curr = foldQueue.shift();

            // Check collision
            const normalKey = vKey(curr.normal);
            if (usedNormals.has(normalKey)) {
                return { valid: false, message: "組み立てると面が重なってしまいます" };
            }
            usedNormals.set(normalKey, { r: curr.r, c: curr.c });

            // Neighbors
            const dirs = [
                { dr: -1, dc: 0, type: 'UP' },
                { dr: 1, dc: 0, type: 'DOWN' },
                { dr: 0, dc: -1, type: 'LEFT' },
                { dr: 0, dc: 1, type: 'RIGHT' }
            ];

            for (const d of dirs) {
                const nr = curr.r + d.dr;
                const nc = curr.c + d.dc;

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
                    if (!foldVisited.has(`${nr},${nc}`)) {
                        foldVisited.add(`${nr},${nc}`);

                        let nextNormal, nextUp;
                        const N = curr.normal;
                        const U = curr.up;
                        // Local Right = U x N (assuming Y=Up, Z=Normal -> X=Right)
                        const R = cross(U, N);

                        switch (d.type) {
                            case 'UP':
                                // Fold Top Neighbor Back
                                nextNormal = U;
                                nextUp = neg(N);
                                break;
                            case 'DOWN':
                                // Fold Bottom Neighbor Back
                                nextNormal = neg(U);
                                nextUp = N;
                                break;
                            case 'RIGHT':
                                // Fold Right Neighbor Back
                                nextNormal = R;
                                nextUp = U;
                                break;
                            case 'LEFT':
                                // Fold Left Neighbor Back
                                nextNormal = neg(R);
                                nextUp = U;
                                break;
                        }

                        foldQueue.push({
                            r: nr,
                            c: nc,
                            normal: nextNormal,
                            up: nextUp
                        });
                    }
                }
            }
        }

        return { valid: true, message: "正解！きれいな立方体になります" };
    }
}
