import React, { useState } from 'react';

export default function PampasHoldAndWin({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [reels, setReels] = useState(['💰', '💰', '💰']);
  const [spinning, setSpinning] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const symbols = ['💰', '💎', '⭐', '🍒', '7️⃣', '🔔'];

  const handleSpin = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente.');

    setBalance(prev => prev - bet);
    setSpinning(true);
    setGameResult(null);

    setTimeout(() => {
      const r1 = symbols[Math.floor(Math.random() * symbols.length)];
      const r2 = symbols[Math.floor(Math.random() * symbols.length)];
      const r3 = symbols[Math.floor(Math.random() * symbols.length)];
      
      setReels([r1, r2, r3]);

      let winVal = 0;
      let isWinner = false;

      if (r1 === r2 && r2 === r3) {
        isWinner = true;
        winVal = bet * 10; // 3 iguais dá 10x
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        isWinner = true;
        winVal = bet * 2; // 2 iguais dá 2x
      }

      if (isWinner) {
        setBalance(prev => prev + winVal);
      }

      setGameResult({ isWinner, winVal, bet });
      setSpinning(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">💰 Hold & Win</h2>
          <p className="text-xs text-zinc-400">Gire os cilindros e acumule prémios instantâneos com combinações premiadas.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-black/60 border border-zinc-800 rounded-3xl p-8 text-center mb-8">
            <div className="flex justify-center gap-4 mb-6">
              {reels.map((symbol, idx) => (
                <div key={idx} className={`w-20 h-28 bg-black border-2 border-zinc-800 rounded-2xl flex items-center justify-center text-4xl shadow-xl ${spinning ? 'animate-pulse text-amber-500' : 'text-white'}`}>
                  {symbol}
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              {spinning ? 'A girar cilindros...' : gameResult ? (gameResult.isWinner ? `Parabéns! Ganhou R$ ${gameResult.winVal.toFixed(2)}!` : 'Não premiado. Tente novamente!') : 'Pronto para girar'}
            </p>
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
                disabled={spinning} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" 
              />
            </div>
          </div>

          <button onClick={handleSpin} disabled={spinning} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 text-xs">
            {spinning ? 'A GIRAR...' : 'GIRAR CILINDROS'}
          </button>
        </div>
      </div>
    </div>
  );
}

