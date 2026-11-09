import React, { useState, useEffect } from 'react';

export default function PampasCrash({ currentUser, balance, setBalance }) {
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [message, setMessage] = useState('Faça a sua aposta e levante antes que o foguetão exploda!');

  useEffect(() => {
    let timer;
    if (isPlaying && !crashed && !cashedOut) {
      timer = setInterval(() => {
        setMultiplier(prev => {
          const next = prev + 0.05;
          // Sorteio aleatório para rebentar
          if (Math.random() < 0.03 && next > 1.2) {
            setCrashed(true);
            setIsPlaying(false);
            setMessage('O foguetão explodiu! Perdeu a aposta.');
            return prev;
          }
          return Number(next.toFixed(2));
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, crashed, cashedOut]);

  const startGame = () => {
    const betVal = parseFloat(bet);
    if (isNaN(betVal) || betVal <= 0) return alert('Insira um valor de aposta válido.');
    if (betVal > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - betVal);
    setIsPlaying(true);
    setCrashed(false);
    setCashedOut(false);
    setMultiplier(1.00);
    setMessage('Foguetão lançado! A subir...');
  };

  const handleCashOut = () => {
    if (!isPlaying || crashed || cashedOut) return;
    setCashedOut(true);
    setIsPlaying(false);
    const betVal = parseFloat(bet);
    const winAmount = betVal * multiplier;
    setBalance(prev => prev + winAmount);
    setMessage(`Resgate efetuado com sucesso! Ganhou R$ ${winAmount.toFixed(2)} 🎉`);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full shadow-2xl text-center">
        <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">Pampas Crash 🚀</h2>
        <p className="text-xs text-zinc-400 mb-6">Acompanhe o multiplicador e retire a tempo.</p>

        <div className="bg-black border border-zinc-800 h-48 sm:h-56 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-inner relative overflow-hidden">
          <div className={`text-4xl sm:text-6xl font-black transition-all ${crashed ? 'text-red-500 scale-110' : cashedOut ? 'text-emerald-400 scale-110' : 'text-amber-400'}`}>
            {multiplier.toFixed(2)}x
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            {crashed ? '💥 EXPLODIU' : cashedOut ? '✅ RESGATADO' : '🚀 EM VOO'}
          </p>
        </div>

        {!isPlaying && !cashedOut && !crashed ? (
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
        ) : null}

        <p className="text-xs font-bold text-amber-400 mb-6 h-6 flex items-center justify-center">{message}</p>

        {!isPlaying && !cashedOut && !crashed ? (
          <button onClick={startGame} className="w-full max-w-xs mx-auto bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm block">
            INICIAR VOO
          </button>
        ) : isPlaying ? (
          <button onClick={handleCashOut} className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-sm block animate-pulse">
            RETIRAR (R$ {(bet * multiplier).toFixed(2)})
          </button>
        ) : (
          <button onClick={() => { setCrashed(false); setCashedOut(false); }} className="w-full max-w-xs mx-auto bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 rounded-2xl transition-all text-sm block">
            JOGAR NOVAMENTE
          </button>
        )}
      </div>
    </div>
  );
}

