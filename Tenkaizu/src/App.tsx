import { useState } from 'react';
import { Grid } from './components/Editor/Grid';
import { Scene } from './components/Viewer/Scene';
import { isValidNet, isConnected } from './logic/validation';
import type { Point } from './types';
import classNames from 'classnames';

function App() {
  const [squares, setSquares] = useState<Point[]>([]);
  const [foldProgress, setFoldProgress] = useState(0);

  const handleToggle = (p: Point) => {
    setSquares(prev => {
      const exists = prev.some(s => s.x === p.x && s.y === p.y);
      if (exists) {
        return prev.filter(s => s.x !== p.x || s.y !== p.y);
      }
      return [...prev, p];
    });
  };

  const isValid = isValidNet(squares);

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-slate-50 gap-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2">
          立方体展開図ラボ
        </h1>
        <p className="text-slate-600">
          6つの正方形で形を作り、立方体に組み立てられるか試してみよう
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 items-start w-full max-w-6xl justify-center">
        <div className="flex flex-col gap-4 shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100">
            <h2 className="text-lg font-semibold mb-4 text-slate-700">エディタ</h2>
            <Grid squares={squares} onToggle={handleToggle} />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-slate-500 text-sm">正方形: {squares.length}/6</span>
              <button
                onClick={() => setSquares([])}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded"
              >
                クリア
              </button>
            </div>
          </div>

          <div className={classNames(
            "p-6 rounded-xl shadow-lg border transition-colors duration-300",
            isValid
              ? "bg-emerald-50 border-emerald-200"
              : squares.length === 6
                ? "bg-rose-50 border-rose-200"
                : "bg-white border-slate-100"
          )}>
            <h2 className={classNames(
              "text-lg font-bold mb-2",
              isValid ? "text-emerald-700" : squares.length === 6 ? "text-rose-700" : "text-slate-700"
            )}>
              判定結果
            </h2>
            <div className="space-y-2 text-sm">
              <ValidationItem
                label="数"
                valid={squares.length === 6}
                text={squares.length === 6 ? "OK (6個)" : `${squares.length}/6 個`}
              />
              <ValidationItem
                label="連結"
                valid={squares.length > 0 && isConnected(squares)}
                text={squares.length > 0 && isConnected(squares) ? "OK" : "つながっていません"}
              />
              <ValidationItem
                label="組み立て"
                valid={isValid}
                text={isValid ? "成功！立方体になります" : "失敗（重なり・隙間など）"}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-grow w-full max-w-2xl">
          <div className="bg-indigo-950 text-white p-2 rounded-xl shadow-xl flex flex-col gap-2 h-[500px]">
            <div className="flex justify-between items-center px-4 pt-2">
              <h2 className="font-bold">3D プレビュー</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-300">組み立て</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={foldProgress}
                  onChange={(e) => setFoldProgress(parseFloat(e.target.value))}
                  className="w-32 accent-indigo-400 cursor-pointer"
                />
                <span className="text-xs w-8 text-right">{Math.round(foldProgress * 100)}%</span>
              </div>
            </div>

            <div className="flex-grow rounded-lg overflow-hidden bg-slate-900 border border-indigo-900/50 relative">
              <Scene squares={squares} foldProgress={foldProgress} />
              {squares.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-indigo-300/50 pointer-events-none">
                  正方形を配置してください
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border text-sm text-slate-600">
            <p><strong>使い方:</strong> グリッドをクリックして正方形を配置します。スライダーを動かすと、展開図がどのように折りたたまれるかを確認できます。正しく立方体になる形を見つけてみましょう。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const ValidationItem = ({ label, valid, text }: { label: string, valid: boolean, text: string }) => (
  <div className="flex items-center gap-3">
    <div className={classNames(
      "w-2 h-2 rounded-full",
      valid ? "bg-emerald-500" : "bg-slate-300"
    )} />
    <span className={classNames(
      "font-medium",
      valid ? "text-slate-900" : "text-slate-400"
    )}>{label}:</span>
    <span className={valid ? "text-slate-700" : "text-slate-400"}>{text}</span>
  </div>
);

export default App;
