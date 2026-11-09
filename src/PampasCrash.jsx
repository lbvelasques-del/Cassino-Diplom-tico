import React, { useState, useEffect, useRef } from 'react';

export default function PampasCrash({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'running', 'crashed', 'cashed'
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(1.00);
  const [cashedMultiplier, setCashedMultiplier] = useState(0);
  const [history, setHistory] = useState([]);
  
  const timerRef = useRef(null);

  const startCrashGame = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente.');

    setBalance(prev => prev - bet);
    setGameState('running');
    setMultiplier(1.00);
    setCashedMultiplier(0);

    // Gerar ponto de crash aleatório (ex: entre 1.05x e 10.00x)
    const randomCrash = parseFloat((1.01 + Math.random() * (Math.random() < 0.2 ? 1.5 : 8.5)).toFixed(2));
    setCrashPoint(randomCrash);

    let currentMult = 1.00;
    timerRef.current = setInterval(() => {
      currentMult = parseFloat((currentMult + 0.03).toFixed(2));
      setMultiplier(currentMult);

      if (currentMult >= randomCrash) {
        clearInterval(timerRef.current);
        setMultiplier(randomCrash);
        setGameState(prev => prev === 'running' ? 'crashed' : prev);
        setHistory(prev => [randomCrash, ...prev.slice(0, 4)]);
      }
    }, 100);
  };

  const cashOut = () => {
    if (gameState !== 'running') return;
    clearInterval(timerRef.current);
    setCashedMultiplier(multiplier);
    setGameState('cashed');

    const bet = parseFloat(betAmount);
    const winVal = bet * multiplier;
    setBalance(prev => prev + winVal);
    setHistory(prev => [multiplier, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">🚀 Pampas Crash</h2>
          <p className="text-xs text-zinc-400">Retire antes que o foguetão exploda para multiplicar a sua aposta.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden">
          <div className="absolute top-4 left-4 flex gap-2">
            {history.map((h, i) => (
              <span key={i} className={`text-xs font-black px-2.5 py-1 rounded-xl border ${h >= 2 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                {h}×
              </span>
            ))}
          </div>

          <div className="text-center my-auto">
            <div className={`text-5xl sm:text-6xl font-black mb-2 transition-all ${gameState === 'crashed' ? 'text-red-500 scale-110' : gameState === 'cashed' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {multiplier.toFixed(2)}×
            </div>
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">
              {gameState === 'running' && 'Foguetão em voo...'}
              {gameState === 'crashed' && '💥 CRASHED! Foguetão explodiu!'}
              {gameState === 'cashed' && `✨ Retirado com sucesso a ${cashedMultiplier}×!`}
              {gameState === 'waiting' && 'Pronto para descolar'}
            </p>
          </div>

          <div className="w-full mt-6">
            {gameState === 'running' ? (
              <button onClick={cashOut} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 text-sm tracking-wider">
                RETIRAR (R$ {(parseFloat(betAmount) * multiplier).toFixed(2)})
              </button>
            ) : (
              <button onClick={startCrashGame} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 text-sm tracking-wider">
                LANÇAR FOGUETÃO
              </button>
            )}
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
                disabled={gameState === 'running'} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" 
              />
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 text-center pt-4 border-t border-zinc-800">
            Pampas Crash • Sistema de Multiplicador Dinâmico
          </div>
        </div>
      </div>
    </div>
  );
}

