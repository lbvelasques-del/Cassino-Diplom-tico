import React, { useState } from 'react';

export default function RoletaDiplomatica({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [selectedColor, setSelectedColor] = useState('red'); // 'red', 'black', 'green'
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSpin = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente.');

    setBalance(prev => prev - bet);
    setSpinning(true);
    setLastResult(null);

    setTimeout(() => {
      // Roleta: 0 (Verde - 14x), 1-7 (Vermelho - 2x), 8-14 (Preto - 2x)
      const roll = Math.floor(Math.random() * 15);
      let color = 'green';
      if (roll >= 1 && roll <= 7) color = 'red';
      else if (roll >= 8) color = 'black';

      let winVal = 0;
      const isWinner = color === selectedColor;

      if (isWinner) {
        const multiplier = color === 'green' ? 14 : 2;
        winVal = bet * multiplier;
        setBalance(prev => prev + winVal);
      }

      const res = { roll, color, isWinner, winVal, bet };
      setLastResult(res);
      setHistory(prev => [res, ...prev.slice(0, 9)]);
      setSpinning(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">🎡 Roleta Diplomática</h2>
          <p className="text-xs text-zinc-400">Escolha a cor diplomática e multiplique o seu capital instantaneamente.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center">
          <div className={`w-36 h-36 rounded-full border-4 flex items-center justify-center text-3xl font-black mb-8 transition-all ${
            spinning ? 'animate-spin border-amber-500 bg-amber-500/10' : 
            lastResult?.color === 'red' ? 'border-red-500 bg-red-500/20 text-red-400' :
            lastResult?.color === 'black' ? 'border-zinc-700 bg-zinc-800 text-white' :
            lastResult?.color === 'green' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' :
            'border-amber-500 bg-black text-amber-400'
          }`}>
            {spinning ? '🎡' : lastResult ? lastResult.roll : '🎲'}
          </div>

          <div className="w-full grid grid-cols-3 gap-3 mb-6">
            <button 
              onClick={() => setSelectedColor('red')} 
              disabled={spinning}
              className={`py-4 rounded-2xl font-black text-xs transition-all border ${selectedColor === 'red' ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30' : 'bg-black/60 border-zinc-800 text-zinc-400'}`}
            >
              VERMELHO (2×)
            </button>
            <button 
              onClick={() => setSelectedColor('green')} 
              disabled={spinning}
              className={`py-4 rounded-2xl font-black text-xs transition-all border ${selectedColor === 'green' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30' : 'bg-black/60 border-zinc-800 text-zinc-400'}`}
            >
              VERDE (14×)
            </button>
            <button 
              onClick={() => setSelectedColor('black')} 
              disabled={spinning}
              className={`py-4 rounded-2xl font-black text-xs transition-all border ${selectedColor === 'black' ? 'bg-zinc-700 border-zinc-500 text-white shadow-lg shadow-zinc-700/30' : 'bg-black/60 border-zinc-800 text-zinc-400'}`}
            >
              PRETO (2×)
            </button>
          </div>

          <button 
            onClick={handleSpin} 
            disabled={spinning}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 text-xs"
          >
            {spinning ? 'A GIRAR A ROLETA...' : 'GIRAR ROLETA'}
          </button>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-white mb-4">📊 Histórico</h3>
            {lastResult && (
              <div className={`p-4 rounded-2xl border mb-4 text-center ${lastResult.isWinner ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                <div className="text-xs font-bold">{lastResult.isWinner ? `Ganhou R$ ${lastResult.winVal.toFixed(2)}!` : 'Não foi desta vez!'}</div>
              </div>
            )}
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-xl text-xs border border-zinc-800">
                  <span className="text-zinc-400">Cor: <strong className="uppercase text-white">{h.color}</strong></span>
                  <span className={h.isWinner ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>{h.isWinner ? `+R$ ${h.winVal.toFixed(2)}` : 'Perdido'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

