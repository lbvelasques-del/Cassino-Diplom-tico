import React, { useState } from 'react';

export default function RoletaDiplomatica({ currentUser, balance, setBalance }) {
  const [bet, setBet] = useState(10);
  const [selectedColor, setSelectedColor] = useState('red');
  const [spinning, setSpinning] = useState(false);
  const [resultColor, setResultColor] = useState('🪙');
  const [message, setMessage] = useState('Escolha uma cor e gire a roleta!');

  const spinWheel = () => {
    const betVal = parseFloat(bet);
    if (isNaN(betVal) || betVal <= 0) return alert('Insira um valor de aposta válido.');
    if (betVal > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - betVal);
    setSpinning(true);
    setMessage('A girar a roleta diplomática...');

    setTimeout(() => {
      setSpinning(false);
      const rand = Math.random();
      // 45% vermelho, 45% preto, 10% verde (especial)
      let outcome = 'red';
      if (rand > 0.45 && rand <= 0.90) outcome = 'black';
      if (rand > 0.90) outcome = 'green';

      setResultColor(outcome);

      if (outcome === selectedColor) {
        const multiplier = outcome === 'green' ? 14 : 2;
        const winAmount = betVal * multiplier;
        setBalance(prev => prev + winAmount);
        setMessage(`Parabéns! Saiu ${outcome.toUpperCase()}. Ganhou R$ ${winAmount.toFixed(2)}! 🎉`);
      } else {
        setMessage(`Deu ${outcome.toUpperCase()}. Não foi desta vez!`);
      }
    }, 1500);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full shadow-2xl text-center">
        <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">Roleta Diplomática 🎡</h2>
        <p className="text-xs text-zinc-400 mb-6">Aposte na cor certa e multiplique o seu capital.</p>

        <div className="bg-black border border-zinc-800 h-36 sm:h-44 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-inner">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black border-4 shadow-xl transition-all ${
            resultColor === 'red' ? 'bg-red-600 border-red-400' :
            resultColor === 'black' ? 'bg-zinc-800 border-zinc-600' :
            resultColor === 'green' ? 'bg-emerald-600 border-emerald-400' : 'bg-zinc-900 border-amber-500'
          }`}>
            {spinning ? '🔄' : resultColor === 'red' ? '🔴' : resultColor === 'black' ? '⚫' : '🟢'}
          </div>
          <p className="text-xs text-zinc-400 mt-3 uppercase tracking-wider font-bold">
            {spinning ? 'A girar...' : `Resultado: ${resultColor}`}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-xs text-zinc-400 mb-2 font-bold">ESCOLHA A COR</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button onClick={() => setSelectedColor('red')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${selectedColor === 'red' ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30' : 'bg-black text-zinc-400 border-zinc-800'}`}>
              Vermelho (2x)
            </button>
            <button onClick={() => setSelectedColor('black')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${selectedColor === 'black' ? 'bg-zinc-800 text-white border-zinc-600 shadow-lg shadow-zinc-800/30' : 'bg-black text-zinc-400 border-zinc-800'}`}>
              Preto (2x)
            </button>
            <button onClick={() => setSelectedColor('green')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${selectedColor === 'green' ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30' : 'bg-black text-zinc-400 border-zinc-800'}`}>
              Verde (14x)
            </button>
          </div>

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

        <p className="text-xs font-bold text-amber-400 mb-6 h-6 flex items-center justify-center">{message}</p>

        <button disabled={spinning} onClick={spinWheel} className="w-full max-w-xs mx-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm block">
          {spinning ? 'A GIRAR...' : 'GIRAR ROLETA'}
        </button>
      </div>
    </div>
  );
}

