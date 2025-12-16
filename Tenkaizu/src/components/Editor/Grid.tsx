import React from 'react';
import classNames from 'classnames';
import type { Point } from '../../types';

interface GridProps {
    squares: Point[];
    onToggle: (p: Point) => void;
    width?: number;
    height?: number;
}

export const Grid: React.FC<GridProps> = ({ squares, onToggle, width = 8, height = 8 }) => {
    const rows = Array.from({ length: height }, (_, i) => i);
    const cols = Array.from({ length: width }, (_, i) => i);

    const isSelected = (x: number, y: number) =>
        squares.some(s => s.x === x && s.y === y);

    return (
        <div className="inline-grid gap-1 bg-slate-200 p-2 rounded-lg" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>
            {rows.map(y => (
                cols.map(x => (
                    <div
                        key={`${x}-${y}`}
                        onClick={() => onToggle({ x, y })}
                        className={classNames(
                            "w-12 h-12 rounded cursor-pointer transition-all duration-200 border-2",
                            isSelected(x, y)
                                ? "bg-indigo-500 border-indigo-600 shadow-lg scale-100"
                                : "bg-white border-slate-300 hover:bg-slate-50 hover:border-indigo-300"
                        )}
                        title={`(${x},${y})`}
                    />
                ))
            ))}
        </div>
    );
};
