import React, { useState } from 'react';

export default function PampasDice({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [targetNumber, setTargetNumber] = useState(50);
  const [condition, setCondition] = useState('over'); // 'over', 'under'
  const [rolling, setRolling] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const multiplier = condition === 'over' ? Number((99 / (100 - targetNumber)).toFixed(2)) : Number((99 / targetNumber).toFixed(2));
  const winChance = condition === 'over' ? (100 - targetNumber) : targetNumber;

  const handleRoll = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente.');

    setBalance(prev => prev - bet);
    setRolling(true);
    setGameResult(null);

    setTimeout(() => {
      const rolledValue = Math.floor(Math.random() * 100) + 1; // 1 a 100
      let isWinner = false;

      if (condition === 'over' && rolledValue > targetNumber) isWinner = true;
      if (condition === 'under' && rolledValue < targetNumber) isWinner = true;

      let winVal = 0;
      if (isWinner) {
        winVal = bet * multiplier;
        setBalance(prev => prev + winVal);
      }

      setGameResult({ rolledValue, isWinner, winVal, bet });
      setRolling(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">🎲 Pampas Dice</h2>
          <p className="text-xs text-zinc-400">Acerte no lançamento dos dados ajustando a sua probabilidade de ganho.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-black/60 border border-zinc-800 rounded-3xl p-8 text-center mb-8 relative">
            <div className={`text-6xl font-black mb-3 transition-all ${rolling ? 'animate-bounce text-amber-500' : gameResult?.isWinner ? 'text-emerald-400' : 'text-white'}`}>
              {rolling ? '🎲' : gameResult ? gameResult.rolledValue : targetNumber}
            </div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              {rolling ? 'A lançar os dados...' : gameResult ? (gameResult.isWinner ? `Ganhou R$ ${gameResult.winVal.toFixed(2)}!` : 'Não foi desta vez!') : `Aposta: ${condition === 'over' ? 'Acima de' : 'Abaixo de'} ${targetNumber}`}
            </p>
          </div>

          <div className="w-full max-w-md space-y-4 mb-6">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
              <span>Alvo: {targetNumber}</span>
              <span>Chance: {winChance}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              value={targetNumber} 
              onChange={e => setTargetNumber(Number(e.target.value))} 
              disabled={rolling}
              className="w-full accent-amber-500 cursor-pointer" 
            />
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setCondition('over')} 
                disabled={rolling}
                className={`py-3 rounded-xl font-black text-xs border transition-all ${condition === 'over' ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-black/60 border-zinc-800 text-zinc-400'}`}
              >
                ROLAR ACIMA
              </button>
              <button 
                onClick={() => setCondition('under')} 
                disabled={rolling}
                className={`py-3 rounded-xl font-black text-xs border transition-all ${condition === 'under' ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-black/60 border-zinc-800 text-zinc-400'}`}
              >
                ROLAR ABAIXO
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-white mb-4">⚙️ Painel de Jogo</h3>
            <div className="mb-4">
              <label className="text-xs font-bold text-zinc-400 block mb-2">Valor da Aposta (R$)</label>
              <input 
                type="number" 
                value={betAmount} 
                onChange={e => setBetAmount(e.target.value)} 
                disabled={rolling} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" 
              />
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 text-center mb-6">
              <span className="text-[10px] text-zinc-400 block">MULTIPLICADOR</span>
              <span className="text-xl font-black text-amber-400">{multiplier}×</span>
            </div>
          </div>

          <button onClick={handleRoll} disabled={rolling} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 text-xs">
            {rolling ? 'A LANÇAR...' : 'LANÇAR DADO'}
          </button>
        </div>
      </div>
    </div>
  );
}

