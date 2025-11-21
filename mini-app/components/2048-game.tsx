'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share } from '@/components/share';
import { url } from '@/lib/metadata';

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function randomTile() {
  return Math.random() < TILE_PROBABILITIES[0] ? 2 : 4;
}

export function Game2048() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    // start with two tiles
    addRandomTile(grid);
    addRandomTile(grid);
  }, []);

  function addRandomTile(g: number[][]) {
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = g.map(row => [...row]);
    newGrid[r][c] = randomTile();
    setGrid(newGrid);
  }

  function move(dir: 'up' | 'down' | 'left' | 'right') {
    if (gameOver) return;
    const rotated = rotateGrid(grid, dir);
    const merged = mergeRows(rotated);
    const newGrid = rotateBack(merged, dir);
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(newGrid);
      addRandomTile(newGrid);
      const newScore = newGrid.flat().reduce((a, b) => a + b, 0);
      setScore(newScore);
      if (newGrid.flat().some(v => v >= 2048)) setWon(true);
      if (!hasMoves(newGrid)) setGameOver(true);
    }
  }

  function rotateGrid(g: number[][], dir: string) {
    let res = g;
    if (dir === 'up') res = transpose(g);
    if (dir === 'down') res = transpose(g).map(row => row.reverse());
    if (dir === 'right') res = g.map(row => row.reverse());
    return res;
  }

  function rotateBack(g: number[][], dir: string) {
    let res = g;
    if (dir === 'up') res = transpose(g);
    if (dir === 'down') res = transpose(g).map(row => row.reverse());
    if (dir === 'right') res = g.map(row => row.reverse());
    return res;
  }

  function transpose(g: number[][]) {
    return g[0].map((_, i) => g.map(row => row[i]));
  }

  function mergeRows(g: number[][]) {
    return g.map(row => {
      const filtered = row.filter(v => v !== 0);
      const merged: number[] = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          i += 2;
        } else {
          merged.push(filtered[i]);
          i += 1;
        }
      }
      while (merged.length < GRID_SIZE) merged.push(0);
      return merged;
    });
  }

  function hasMoves(g: number[][]) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) return true;
        if (c + 1 < GRID_SIZE && g[r][c] === g[r][c + 1]) return true;
        if (r + 1 < GRID_SIZE && g[r][c] === g[r + 1][c]) return true;
      }
    }
    return false;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((v, idx) => (
          <div key={idx} className="w-12 h-12 flex items-center justify-center bg-muted rounded">
            {v !== 0 && <span className="text-lg font-bold">{v}</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => move('up')}>↑</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => move('left')}>←</Button>
          <Button variant="outline" onClick={() => move('down')}>↓</Button>
          <Button variant="outline" onClick={() => move('right')}>→</Button>
        </div>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-bold">{won ? 'You won!' : 'Game Over'}</span>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
