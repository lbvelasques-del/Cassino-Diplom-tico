import React, { useState } from 'react';

export default function PampasHoldAndWin({ currentUser, balance, setBalance }) {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [symbols, setSymbols] = useState(['💰', '💰', '💰', '💰']);
  const [message, setMessage] = useState('Gire e acumule símbolos dourados para faturar!');

  const spin = () => {
    const betVal = parseFloat(bet);
    if (isNaN(betVal) || betVal <= 0) return alert('Insira um valor de aposta válido.');
    if (betVal > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - betVal);
    setSpinning(true);
    setMessage('A girar os prêmios acumulados...');

    const possible = ['💰', '⭐', '💎', '🔥', '🪙'];

    setTimeout(() => {
      setSpinning(false);
      const s1 = possible[Math.floor(Math.random() * possible.length)];
      const s2 = possible[Math.floor(Math.random() * possible.length)];
      const s3 = possible[Math.floor(Math.random() * possible.length)];
      const s4 = possible[Math.floor(Math.random() * possible.length)];
      setSymbols([s1, s2, s3, s4]);

      // Conta quantos símbolos iguais ou valiosos saíram
      const matches = [s1, s2, s3, s4].filter(s => s === '💰' || s === '💎').length;

      if (matches >= 3) {
        const winAmount = betVal * 10;
        setBalance(prev => prev + winAmount);
        setMessage(`HOLD & WIN! Conseguiu ${matches} símbolos especiais! Ganhou R$ ${winAmount.toFixed(2)}! 🎉`);
      } else if (matches === 2) {
        const winAmount = betVal * 3;
        setBalance(prev => prev + winAmount);
        setMessage(`Boa! 2 símbolos especiais. Ganhou R$ ${winAmount.toFixed(2)}!`);
      } else {
        setMessage('Não juntou símbolos suficientes. Tente novamente!');
      }
    }, 1200);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full shadow-2xl text-center">
        <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">Hold & Win 💰</h2>
        <p className="text-xs text-zinc-400 mb-6">Tranque os símbolos premiados e multiplique o seu ganho.</p>

        <div className="bg-black border border-zinc-800 p-6 rounded-2xl grid grid-cols-2 gap-4 mb-6 shadow-inner max-w-xs mx-auto">
          {symbols.map((sym, idx) => (
            <div key={idx} className="h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              {spinning ? '🔄' : sym}
            </div>
          ))}
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

        <p className="text-xs font-bold text-amber-400 mb-6 h-6 flex items-center justify-center">{message}</p>

        <button disabled={spinning} onClick={spin} className="w-full max-w-xs mx-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm block">
          {spinning ? 'A GIRAR...' : 'GIRAR & GUARDAR'}
        </button>
      </div>
    </div>
  );
}

