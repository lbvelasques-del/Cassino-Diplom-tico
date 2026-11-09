import React, { useState } from 'react';

export default function PampasGoal({ currentUser, balance, setBalance }) {
  const [bet, setBet] = useState(10);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('Escolha o canto para rematar e marcar o golo!');
  const [goalResult, setGoalResult] = useState(null);

  const spots = [
    { id: 0, name: 'Ângulo Superior Esquerdo' },
    { id: 1, name: 'Ângulo Superior Direito' },
    { id: 2, name: 'Centro' },
    { id: 3, name: 'Canto Inferior Esquerdo' },
    { id: 4, name: 'Canto Inferior Direito' }
  ];

  const shoot = (spotId) => {
    const betVal = parseFloat(bet);
    if (isNaN(betVal) || betVal <= 0) return alert('Insira um valor de aposta válido.');
    if (betVal > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - betVal);
    setSelectedSpot(spotId);
    setPlaying(true);
    setMessage('A rematar...');
    setGoalResult(null);

    setTimeout(() => {
      setPlaying(false);
      // Guarda defende aleatoriamente um dos cantos
      const gkSave = Math.floor(Math.random() * 5);
      const scored = spotId !== gkSave;

      if (scored) {
        const winAmount = betVal * 2;
        setBalance(prev => prev + winAmount);
        setGoalResult(true);
        setMessage(`GOLO! O guarda-redes foi para o lado errado. Ganhou R$ ${winAmount.toFixed(2)}! ⚽🎉`);
      } else {
        setGoalResult(false);
        setMessage('DEFESA! O guarda-redes defendeu o remate!');
      }
    }, 1200);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full shadow-2xl text-center">
        <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">Pampas Goal ⚽</h2>
        <p className="text-xs text-zinc-400 mb-6">Escolha onde rematar e vença o guarda-redes.</p>

        <div className="bg-black border border-zinc-800 p-6 rounded-2xl mb-6 shadow-inner">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {spots.map(spot => (
              <button
                key={spot.id}
                disabled={playing}
                onClick={() => shoot(spot.id)}
                className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                  selectedSpot === spot.id
                    ? goalResult === true
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                      : goalResult === false
                      ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30'
                      : 'bg-amber-500 border-amber-400 text-black'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/50'
                }`}
              >
                ⚽ {spot.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
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

        <p className="text-xs font-bold text-amber-400 h-6 flex items-center justify-center">{message}</p>
      </div>
    </div>
  );
}

