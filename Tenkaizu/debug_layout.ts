import { buildFoldingTree, BoxNode } from './src/logic/folding';
import type { Point } from './src/types';

const squares: Point[] = [
    { x: 3, y: 1 }, // Top
    { x: 2, y: 2 }, // Left
    { x: 3, y: 2 }, // Center
    { x: 4, y: 2 }, // Right
    { x: 5, y: 2 }, // Far Right
    { x: 3, y: 3 }, // Bottom
];

// Mock tree build
const root = buildFoldingTree(squares);

console.log('Root:', root.point);

const calculateFlatPositions = (node: BoxNode, currentPos: { x: number, z: number }) => {
    console.log(`Node (${node.point.x}, ${node.point.y}) mapped to 3D (${currentPos.x}, ${currentPos.z})`);

    node.children.forEach(child => {
        let nextPos = { ...currentPos };
        if (child.directionFromParent === 'RIGHT') nextPos.x += 1;
        if (child.directionFromParent === 'LEFT') nextPos.x -= 1;
        if (child.directionFromParent === 'DOWN') nextPos.z += 1;
        if (child.directionFromParent === 'UP') nextPos.z -= 1;

        calculateFlatPositions(child, nextPos);
    });
};

if (root) {
    calculateFlatPositions(root, { x: 0, z: 0 });
} else {
    console.log('No root!');
}
