import React, { useState } from 'react';

export default function PampasTowers({ currentUser, balance, setBalance }) {
  const [bet, setBet] = useState(10);
  const [currentRow, setCurrentRow] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('Escolha a aposta e comece a subir na torre!');
  const [multipliers] = useState([1.2, 1.5, 2.0, 3.0, 5.0, 10.0]);

  const startGame = () => {
    const betVal = parseFloat(bet);
    if (isNaN(betVal) || betVal <= 0) return alert('Insira um valor de aposta válido.');
    if (betVal > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - betVal);
    setIsPlaying(true);
    setCurrentRow(0);
    setMessage('Torre iniciada! Escolha uma porta em segurança.');
  };

  const chooseTile = (choice) => {
    if (!isPlaying) return;

    // 25% de probabilidade de encontrar o obstáculo
    const hitTrap = Math.random() < 0.25;

    if (hitTrap) {
      setIsPlaying(false);
      setMessage('Bateu no obstáculo! Perdeu a aposta.');
    } else {
      if (currentRow + 1 >= multipliers.length) {
        const winAmount = bet * multipliers[multipliers.length - 1];
        setBalance(prev => prev + winAmount);
        setIsPlaying(false);
        setMessage(`PARABÉNS! Chegou ao topo da torre e ganhou R$ ${winAmount.toFixed(2)}! 🎉`);
      } else {
        setCurrentRow(prev => prev + 1);
        setMessage(`Subiu de nível! Multiplicador atual: ${multipliers[currentRow + 1]}x`);
      }
    }
  };

  const cashOut = () => {
    if (!isPlaying || currentRow === 0) return;
    const winAmount = bet * multipliers[currentRow - 1];
    setBalance(prev => prev + winAmount);
    setIsPlaying(false);
    setMessage(`Resgate efetuado com sucesso no nível ${currentRow}! Ganhou R$ ${winAmount.toFixed(2)} 🎉`);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full shadow-2xl text-center">
        <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">Pampas Towers 🗼</h2>
        <p className="text-xs text-zinc-400 mb-6">Suba os andares da torre acumulando multiplicadores sem cair.</p>

        <div className="bg-black border border-zinc-800 p-6 rounded-2xl mb-6 shadow-inner flex flex-col gap-2">
          {multipliers.slice().reverse().map((mult, idx) => {
            const actualRow = multipliers.length - 1 - idx;
            const isActive = isPlaying && currentRow === actualRow;
            return (
              <div key={actualRow} className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${isActive ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}>
                <span>Andar {actualRow + 1} ({mult}x)</span>
                {isActive ? <span>📍 Nível Atual</span> : <span>{actualRow < currentRow ? '✅ Passado' : '🔒'}</span>}
              </div>
            );
          })}
        </div>

        {isPlaying && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => chooseTile(0)} className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20">
              Escolher Porta A
            </button>
            <button onClick={() => chooseTile(1)} className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20">
              Escolher Porta B
            </button>
          </div>
        )}

        {!isPlaying ? (
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

        {!isPlaying ? (
          <button onClick={startGame} className="w-full max-w-xs mx-auto bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm block">
            INICIAR TORRE
          </button>
        ) : currentRow > 0 ? (
          <button onClick={cashOut} className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-sm block">
            RESGATAR (R$ {(bet * multipliers[currentRow - 1]).toFixed(2)})
          </button>
        ) : null}
      </div>
    </div>
  );
}

