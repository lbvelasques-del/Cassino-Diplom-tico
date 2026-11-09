import React, { useState } from 'react';

export default function DiamondStriker({ currentUser, balance, setBalance }) {
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState(Array(9).fill(false));
  const [revealed, setRevealed] = useState(Array(9).fill(false));
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('Escolha o valor e clique em Iniciar Mineração!');
  const [multiplier, setMultiplier] = useState(1);

  const startGame = () => {
    const betVal = parseFloat(bet);
    if (isNaN(betVal) || betVal <= 0) return alert('Insira um valor de aposta válido.');
    if (betVal > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - betVal);
    setIsPlaying(true);
    setMultiplier(1);
    setRevealed(Array(9).fill(false));

    // Sorteia aleatoriamente 3 diamantes nas 9 posições
    const newGrid = Array(9).fill(false);
    let diamondsPlaced = 0;
    while (diamondsPlaced < 3) {
      const idx = Math.floor(Math.random() * 9);
      if (!newGrid[idx]) {
        newGrid[idx] = true;
        diamondsPlaced++;
      }
    }
    setGrid(newGrid);
    setMessage('Mineração ativa! Clique nas pedras para encontrar os diamantes.');
  };

  const handleTileClick = (index) => {
    if (!isPlaying || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index]) {
      // Achou diamante
      const newMult = multiplier + 1.5;
      setMultiplier(newMult);
      setMessage(`Achou um diamante! Multiplicador atual: ${newMult}x`);
    } else {
      // Achou rocha vazia
      setMessage('Pedra vazia... Continue procurando ou retire o lucro.');
    }
  };

  const cashOut = () => {
    if (!isPlaying) return;
    const betVal = parseFloat(bet);
    const winAmount = betVal * multiplier;
    setBalance(prev => prev + winAmount);
    setMessage(`Resgate efetuado com sucesso! Ganhou R$ ${winAmount.toFixed(2)} 🎉`);
    setIsPlaying(false);
    setRevealed(Array(9).fill(true));
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full shadow-2xl text-center">
        <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">Diamond Striker 💎</h2>
        <p className="text-xs text-zinc-400 mb-6">Cave nas pedras e encontre os diamantes ocultos.</p>

        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
          {grid.map((hasDiamond, idx) => (
            <button
              key={idx}
              disabled={!isPlaying || revealed[idx]}
              onClick={() => handleTileClick(idx)}
              className={`h-20 sm:h-24 rounded-2xl border flex items-center justify-center text-3xl sm:text-4xl transition-all ${
                revealed[idx]
                  ? hasDiamond
                    ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-950 border-zinc-900 opacity-50'
                  : 'bg-black border-zinc-800 hover:border-amber-500/50'
              }`}
            >
              {revealed[idx] ? (hasDiamond ? '💎' : '🪨') : '⛏️'}
            </button>
          ))}
        </div>

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
        ) : (
          <div className="mb-6">
            <p className="text-xs text-amber-400 font-bold mb-2">Multiplicador: {multiplier}x</p>
          </div>
        )}

        <p className="text-xs font-bold text-amber-400 mb-6 h-6 flex items-center justify-center">{message}</p>

        {!isPlaying ? (
          <button onClick={startGame} className="w-full max-w-xs mx-auto bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm block">
            INICIAR MINERAÇÃO
          </button>
        ) : (
          <button onClick={cashOut} className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-sm block">
            RESGATAR LUCRO (R$ {(bet * multiplier).toFixed(2)})
          </button>
        )}
      </div>
    </div>
  );
}

