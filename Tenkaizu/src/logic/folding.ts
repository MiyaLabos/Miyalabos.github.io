import type { Point } from '../types';

export type FoldDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface BoxNode {
    id: string; // "x,y"
    point: Point;
    directionFromParent: FoldDirection | null; // Which side of parent this node attaches to
    children: BoxNode[];
}

export const buildFoldingTree = (squares: Point[]): BoxNode | null => {
    if (squares.length === 0) return null;

    // Simple BFS to build tree
    const rootPoint = squares[0];
    const root: BoxNode = {
        id: `${rootPoint.x},${rootPoint.y}`,
        point: rootPoint,
        directionFromParent: null,
        children: []
    };

    const visited = new Set<string>();
    visited.add(root.id);

    const queue: { node: BoxNode }[] = [{ node: root }];

    while (queue.length > 0) {
        const { node } = queue.shift()!;
        const { x, y } = node.point;

        // Check neighbors
        const candidates = [
            { p: { x: x + 1, y }, dir: 'RIGHT' as FoldDirection },
            { p: { x: x - 1, y }, dir: 'LEFT' as FoldDirection },
            { p: { x, y: y + 1 }, dir: 'DOWN' as FoldDirection },
            { p: { x, y: y - 1 }, dir: 'UP' as FoldDirection },
        ];

        candidates.forEach(({ p, dir }) => {
            const exists = squares.some(s => s.x === p.x && s.y === p.y);
            const id = `${p.x},${p.y}`;
            if (exists && !visited.has(id)) {
                visited.add(id);
                const childNode: BoxNode = {
                    id,
                    point: p,
                    directionFromParent: dir,
                    children: []
                };
                node.children.push(childNode);
                queue.push({ node: childNode });
            }
        });
    }

    return root;
};
