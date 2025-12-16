import type { Point } from '../types';

// Check if two points are equal
const pointsEqual = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

// Get neighbors of a point on grid
const getNeighbors = (p: Point): Point[] => [
    { x: p.x + 1, y: p.y },
    { x: p.x - 1, y: p.y },
    { x: p.x, y: p.y - 1 }, // UP (Grid y-1)
    { x: p.x, y: p.y + 1 }, // DOWN (Grid y+1)
];

export const isConnected = (squares: Point[]): boolean => {
    if (squares.length === 0) return true;
    const visited = new Set<string>();
    const queue = [squares[0]];
    visited.add(`${squares[0].x},${squares[0].y}`);

    let count = 0;
    while (queue.length > 0) {
        const current = queue.shift()!;
        count++;

        getNeighbors(current).forEach(n => {
            if (squares.some(s => pointsEqual(s, n)) && !visited.has(`${n.x},${n.y}`)) {
                visited.add(`${n.x},${n.y}`);
                queue.push(n);
            }
        });
    }

    return count === squares.length;
};

export const isValidNet = (squares: Point[]): boolean => {
    // 1. Must have exactly 6 squares
    if (squares.length !== 6) return false;

    // 2. Must be connected
    if (!isConnected(squares)) return false;

    // 3. Must fold into a cube without overlap
    return canFoldIntoCube(squares);
};

type Vector3 = { x: number; y: number; z: number };

const vecStr = (v: Vector3) => `${Math.round(v.x)},${Math.round(v.y)},${Math.round(v.z)}`;

// Cross product
const cross = (a: Vector3, b: Vector3): Vector3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
});

// Negate
const neg = (v: Vector3): Vector3 => ({ x: -v.x, y: -v.y, z: -v.z });

const canFoldIntoCube = (squares: Point[]): boolean => {
    // We use a BFS to traverse the net and map each square to a face on the cube.
    // We track the (Normal, Up) vectors for each square in 3D space.
    // Initial Square (index 0) is mapped to Bottom Face.
    // Normal: (0, -1, 0)
    // Up: (0, 0, -1) (Corresponds to Grid Up/Back)

    // Grid System:
    // x+1 (Right)
    // x-1 (Left)
    // y+1 (Down)
    // y-1 (Up)

    const startState = {
        n: { x: 0, y: -1, z: 0 },
        u: { x: 0, y: 0, z: -1 }
    };

    const visitedIndices = new Set<number>();
    const occupiedNormals = new Set<string>(); // Tracks the normal vector of occupied faces.

    const queue: { idx: number; state: typeof startState }[] = [];

    // Start with first square
    queue.push({ idx: 0, state: startState });
    visitedIndices.add(0);
    occupiedNormals.add(vecStr(startState.n));

    while (queue.length > 0) {
        const { idx, state } = queue.shift()!;
        const currentSquare = squares[idx];

        // Right vector implied by N x U
        const r = cross(state.n, state.u);

        // Check neighbors
        const neighbors = [
            { p: { x: currentSquare.x + 1, y: currentSquare.y }, dir: 'RIGHT' },
            { p: { x: currentSquare.x - 1, y: currentSquare.y }, dir: 'LEFT' },
            { p: { x: currentSquare.x, y: currentSquare.y - 1 }, dir: 'UP' },
            { p: { x: currentSquare.x, y: currentSquare.y + 1 }, dir: 'DOWN' },
        ];

        for (const { p, dir } of neighbors) {
            const nIdx = squares.findIndex(s => pointsEqual(s, p));
            if (nIdx !== -1 && !visitedIndices.has(nIdx)) {
                // Transform state based on direction
                let nextN = state.n;
                let nextU = state.u;

                if (dir === 'RIGHT') {
                    // Fold right involves rotation around Right Edge.
                    // New Normal = Old Right
                    nextN = r;
                    nextU = state.u;
                } else if (dir === 'LEFT') {
                    // New Normal = -Old Right
                    nextN = neg(r);
                    nextU = state.u;
                } else if (dir === 'UP') {
                    // New Normal = Old Up (because old Up starts pointing Back, and Up face is Back)
                    // Wait, previous logic:
                    // OldN=(0,-1,0), OldU=(0,0,-1). Move Up (y-1).
                    // New Face should be Back Face (0,0,-1).
                    // So NewN = OldU.
                    // NewU = -OldN?
                    // Left is (0,1,0). 
                    // Let's check: NewN(Back) x NewU(Top) = (0,0,-1)x(0,1,0) = -(-i) = i = Right.
                    // Matches Old Right.
                    // Yes.
                    nextN = state.u;
                    nextU = neg(state.n);
                } else if (dir === 'DOWN') {
                    // Move Down (y+1).
                    // New N = -Old U.
                    // New U = Old N.
                    nextN = neg(state.u);
                    nextU = state.n;
                }

                // Check collision
                const nStr = vecStr(nextN);
                if (occupiedNormals.has(nStr)) {
                    return false; // Collision!
                }

                occupiedNormals.add(nStr);
                visitedIndices.add(nIdx);
                queue.push({ idx: nIdx, state: { n: nextN, u: nextU } });
            }
        }
    }

    // If we processed all squares without collision, it's a valid net part.
    // Since we already checked `isConnected` and `length===6`, 
    // if no overlap, it MUST be a valid cube net.
    return true;
};
