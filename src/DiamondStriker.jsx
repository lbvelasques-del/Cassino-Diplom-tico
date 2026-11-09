import React, { useState } from 'react';

export default function DiamondStriker({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [grid, setGrid] = useState(Array(16).fill({ status: 'hidden', isMine: false }));
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [revealedCount, setRevealedCount] = useState(0);

  const startGame = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - bet);
    setIsPlaying(true);
    setGameOver(false);
    setGameWon(false);
    setMultiplier(1.0);
    setRevealedCount(0);

    const mines = [];
    while (mines.length < 4) {
      const rand = Math.floor(Math.random() * 16);
      if (!mines.includes(rand)) mines.push(rand);
    }

    const newGrid = Array(16).fill(null).map((_, idx) => ({
      status: 'hidden',
      isMine: mines.includes(idx)
    }));
    setGrid(newGrid);
  };

  const handleTileClick = (index) => {
    if (!isPlaying || gameOver || gameWon) return;
    const tile = grid[index];
    if (tile.status === 'revealed') return;

    if (tile.isMine) {
      const newGrid = grid.map(t => t.isMine ? { ...t, status: 'mine' } : t);
      setGrid(newGrid);
      setGameOver(true);
      setIsPlaying(false);
    } else {
      const newGrid = [...grid];
      newGrid[index] = { ...tile, status: 'revealed' };
      setGrid(newGrid);

      const newRevealed = revealedCount + 1;
      setRevealedCount(newRevealed);
      const newMult = Number((1.0 + newRevealed * 0.25).toFixed(2));
      setMultiplier(newMult);

      if (newRevealed === 12) {
        const bet = parseFloat(betAmount);
        const winVal = bet * newMult;
        setBalance(prev => prev + winVal);
        setGameWon(true);
        setIsPlaying(false);
      }
    }
  };

  const cashOut = () => {
    if (!isPlaying) return;
    const bet = parseFloat(betAmount);
    const winVal = bet * multiplier;
    setBalance(prev => prev + winVal);
    setGameWon(true);
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">💎 Diamond Striker</h2>
          <p className="text-xs text-zinc-400">Encontre os diamantes e fuja das minas para multiplicar os seus ganhos.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col items-center">
          <div className="grid grid-cols-4 gap-3 w-full max-w-sm mb-6">
            {grid.map((tile, idx) => (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={!isPlaying || tile.status === 'revealed'}
                className={`h-20 rounded-2xl font-black text-2xl flex items-center justify-center transition-all ${
                  tile.status === 'revealed'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : tile.status === 'mine'
                    ? 'bg-red-500/30 border border-red-500/50 text-red-500'
                    : 'bg-black/80 border border-zinc-800 hover:border-amber-500/50 text-zinc-400'
                }`}
              >
                {tile.status === 'revealed' ? '💎' : tile.status === 'mine' ? '💣' : '❓'}
              </button>
            ))}
          </div>

          {isPlaying && (
            <div className="w-full max-w-sm flex gap-2">
              <button onClick={cashOut} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all text-xs">
                RETIRAR (R$ {(parseFloat(betAmount) * multiplier).toFixed(2)})
              </button>
            </div>
          )}
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-white mb-4">⚙️ Painel de Jogo</h3>
            <div className="mb-4">
              <label className="text-xs font-bold text-zinc-400 block mb-2">Aposta (R$)</label>
              <input 
                type="number" 
                value={betAmount} 
                onChange={e => setBetAmount(e.target.value)} 
                disabled={isPlaying} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" 
              />
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 mb-4 text-center">
              <span className="text-[10px] text-zinc-400 block">MULTIPLICADOR ATUAL</span>
              <span className="text-xl font-black text-amber-400">{multiplier}×</span >
            </div>

            {(gameOver || gameWon) && (
              <div className={`p-4 rounded-2xl border text-center mb-4 ${gameWon ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                <div className="text-xs font-bold">{gameWon ? 'Parabéns! Vitória registada!' : 'Explodiu numa mina! Tente de novo.'}</div>
              </div>
            )}
          </div>

          {!isPlaying && (
            <button onClick={startGame} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 text-xs">
              INICIAR MINERAÇÃO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
