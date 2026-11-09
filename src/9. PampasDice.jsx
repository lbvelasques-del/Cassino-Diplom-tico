import React, { useState } from 'react';

export default function PampasDice({ currentUser, balance, setBalance }) {
  const [bet, setBet] = useState(10);
  const [prediction, setPrediction] = useState('over');
  const [targetNumber, setTargetNumber] = useState(50);
  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [message, setMessage] = useState('Defina a previsão e role os dados!');

  const rollDice = () => {
    const betVal = parseFloat(bet);
    if (isNaN(betVal) || betVal <= 0) return alert('Insira um valor de aposta válido.');
    if (betVal > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - betVal);
    setRolling(true);
    setMessage('A rolar os dados...');

    setTimeout(() => {
      setRolling(false);
      const outcome = Math.floor(Math.random() * 100) + 1;
      setDiceResult(outcome);

      let win = false;
      if (prediction === 'over' && outcome > targetNumber) win = true;
      if (prediction === 'under' && outcome < targetNumber) win = true;

      if (win) {
        const winAmount = betVal * 2;
        setBalance(prev => prev + winAmount);
        setMessage(`Parabéns! Saiu o número ${outcome}. Ganhou R$ ${winAmount.toFixed(2)}! 🎲🎉`);
      } else {
        setMessage(`Saiu o número ${outcome}. Não foi desta vez!`);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full shadow-2xl text-center">
        <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">Pampas Dice 🎲</h2>
        <p className="text-xs text-zinc-400 mb-6">Acerte se o resultado fica acima ou abaixo do alvo.</p>

        <div className="bg-black border border-zinc-800 p-6 rounded-2xl mb-6 shadow-inner flex flex-col items-center justify-center">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Resultado do Dado</span>
          <span className="text-5xl font-black text-amber-400">{rolling ? '🔄' : diceResult !== null ? diceResult : '--'}</span>
        </div>

        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setPrediction('over')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${prediction === 'over' ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-black text-zinc-400 border-zinc-800'}`}>
              Acima de {targetNumber}
            </button>
            <button onClick={() => setPrediction('under')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${prediction === 'under' ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-black text-zinc-400 border-zinc-800'}`}>
              Abaixo de {targetNumber}
            </button>
          </div>

          <div>
            <p className="text-xs text-zinc-400 mb-2 font-bold">VALOR DA APOSTA</p>
            <div className="flex justify-center gap-2 mb-3">
              {[10, 50, 100, 500].map(val => (
                <button key={val} onClick={() => setBet(val)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${bet === val ? 'bg-amber-500 text-black border-amber-500' : 'bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700'}`}>
                  R$ {val}
                </button>
              ))}
            </div>
            <input type="number" value={bet} onChange={e => setBet(e.target.value)} className="w-full max-w-xs mx-auto bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-center text-white text-sm focus:border-amber-500 outline-none block" />
          </div>
        </div>

        <p className="text-xs font-bold text-amber-400 mb-6 h-6 flex items-center justify-center">{message}</p>

        <button disabled={rolling} onClick={rollDice} className="w-full max-w-xs mx-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm block">
          {rolling ? 'A ROLAR...' : 'ROLAR DADO'}
        </button>
      </div>
    </div>
  );
}

