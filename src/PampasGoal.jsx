import React, { useState } from 'react';

export default function PampasGoal({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [selectedDirection, setSelectedDirection] = useState(null); // 'left', 'center', 'right'
  const [gameState, setGameState] = useState('idle'); // 'idle', 'shooting', 'goal', 'saved'
  const [multiplier, setMultiplier] = useState(1.95);
  const [history, setHistory] = useState([]);

  const handleShoot = (direction) => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente.');

    setSelectedDirection(direction);
    setBalance(prev => prev - bet);
    setGameState('shooting');

    setTimeout(() => {
      // O guarda-redes escolhe uma direção aleatória: 'left', 'center', 'right'
      const directions = ['left', 'center', 'right'];
      const keeperChoice = directions[Math.floor(Math.random() * directions.length)];
      const isGoal = direction !== keeperChoice;

      let winVal = 0;
      if (isGoal) {
        winVal = bet * multiplier;
        setBalance(prev => prev + winVal);
        setGameState('goal');
      } else {
        setGameState('saved');
      }

      const res = { direction, keeperChoice, isGoal, winVal, bet };
      setHistory(prev => [res, ...prev.slice(0, 9)]);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">⚽ Pampas Goal</h2>
          <p className="text-xs text-zinc-400">Escolha o canto, faça o golo e vença o guarda-redes.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-full max-w-md bg-black/60 border border-zinc-800 rounded-3xl p-6 text-center relative mb-8">
            <div className="text-4xl mb-4">
              {gameState === 'shooting' && '⚽💨...'}
              {gameState === 'goal' && '🎉 GOOOOOOL!'}
              {gameState === 'saved' && '🧤 DEFENDIDO!'}
              {gameState === 'idle' && '🥅'}
            </div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              {gameState === 'idle' && 'Escolha onde quer rematar abaixo'}
              {gameState === 'shooting' && 'A rematar à baliza...'}
              {gameState === 'goal' && `Golo marcado! +R$ ${(parseFloat(betAmount) * multiplier).toFixed(2)}`}
              {gameState === 'saved' && 'O guarda-redes defendeu o remate!'}
            </p>
          </div>

          <div className="w-full max-w-md grid grid-cols-3 gap-3">
            <button 
              onClick={() => handleShoot('left')} 
              disabled={gameState === 'shooting'}
              className="bg-black/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 py-4 rounded-2xl font-black text-xs transition-all"
            >
              ⬅️ CANTO ESQ.
            </button>
            <button 
              onClick={() => handleShoot('center')} 
              disabled={gameState === 'shooting'}
              className="bg-black/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 py-4 rounded-2xl font-black text-xs transition-all"
            >
              ⬆️ CENTRO
            </button>
            <button 
              onClick={() => handleShoot('right')} 
              disabled={gameState === 'shooting'}
              className="bg-black/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 py-4 rounded-2xl font-black text-xs transition-all"
            >
              ➡️ CANTO DIR.
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-white mb-4">⚙️ Painel de Aposta</h3>
            <div className="mb-4">
              <label className="text-xs font-bold text-zinc-400 block mb-2">Valor da Aposta (R$)</label>
              <input 
                type="number" 
                value={betAmount} 
                onChange={e => setBetAmount(e.target.value)} 
                disabled={gameState === 'shooting'} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" 
              />
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-400 block">MULTIPLICADOR DE GOLO</span>
              <span className="text-xl font-black text-amber-400">{multiplier}×</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 text-center">
            Pampas Goal • Futebol & Sorte
          </div>
        </div>
      </div>
    </div>
  );
}

