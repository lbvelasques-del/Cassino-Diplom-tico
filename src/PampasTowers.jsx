import React, { useState } from 'react';

export default function PampasTowers({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [currentRow, setCurrentRow] = useState(0); // 0 a 7 (8 níveis)
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [revealedRows, setRevealedRows] = useState({}); // { rowIndex: chosenColIndex }

  const totalRows = 8;
  const colsPerRow = 3;

  const startGame = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente.');

    setBalance(prev => prev - bet);
    setIsPlaying(true);
    setGameOver(false);
    setGameWon(false);
    setCurrentRow(0);
    setMultiplier(1.0);
    setRevealedRows({});
  };

  const handleTileClick = (rowIndex, colIndex) => {
    if (!isPlaying || rowIndex !== currentRow || gameOver || gameWon) return;

    // Gerar aleatoriamente a posição da armadilha (1 em cada 3 colunas tem armadilha)
    const trapCol = Math.floor(Math.random() * colsPerRow);
    const isTrap = colIndex === trapCol;

    if (isTrap) {
      setGameOver(true);
      setIsPlaying(false);
      setRevealedRows(prev => ({ ...prev, [rowIndex]: { chosen: colIndex, trap: trapCol, failed: true } }));
    } else {
      const newMult = Number((multiplier * 1.35).toFixed(2));
      setMultiplier(newMult);
      setRevealedRows(prev => ({ ...prev, [rowIndex]: { chosen: colIndex, trap: trapCol, failed: false } }));

      if (currentRow + 1 === totalRows) {
        // Chegou ao topo!
        const bet = parseFloat(betAmount);
        const winVal = bet * newMult;
        setBalance(prev => prev + winVal);
        setGameWon(true);
        setIsPlaying(false);
      } else {
        setCurrentRow(prev => prev + 1);
      }
    }
  };

  const cashOut = () => {
    if (!isPlaying || currentRow === 0) return;
    const bet = parseFloat(betAmount);
    const winVal = bet * multiplier;
    setBalance(prev => prev + winVal);
    setGameWon(true);
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">🗼 Pampas Towers</h2>
          <p className="text-xs text-zinc-400">Suba os andares da torre sem cair nas armadilhas para multiplicar os prémios.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl shadow-xl flex flex-col items-center">
          <div className="w-full max-w-sm space-y-2 mb-6">
            {Array.from({ length: totalRows }, (_, rIdx) => {
              // Desenhar de cima para baixo (do nível 7 ao 0)
              const rowLevel = totalRows - 1 - rIdx;
              const isActiveRow = isPlaying && rowLevel === currentRow;
              const rowData = revealedRows[rowLevel];

              return (
                <div key={rowLevel} className={`p-2 rounded-2xl border flex items-center justify-between gap-2 ${isActiveRow ? 'bg-amber-500/10 border-amber-500/50' : 'bg-black/40 border-zinc-800'}`}>
                  <span className="text-[10px] font-bold text-zinc-400 w-12 text-center">Nível {rowLevel + 1}</span>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    {Array.from({ length: colsPerRow }, (_, cIdx) => {
                      let btnStyle = 'bg-black/80 border-zinc-800 text-zinc-400 hover:border-amber-500/50';
                      let content = '❓';

                      if (rowData) {
                        if (rowData.chosen === cIdx) {
                          btnStyle = rowData.failed ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
                          content = rowData.failed ? '💥' : '⭐';
                        }
                      }

                      return (
                        <button
                          key={cIdx}
                          onClick={() => handleTileClick(rowLevel, cIdx)}
                          disabled={!isActiveRow}
                          className={`py-3 rounded-xl border font-black text-sm transition-all ${btnStyle}`}
                        >
                          {content}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {isPlaying && currentRow > 0 && (
            <button onClick={cashOut} className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all text-xs">
              RETIRAR (R$ {(parseFloat(betAmount) * multiplier).toFixed(2)})
            </button>
          )}
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-white mb-4">⚙️ Painel de Jogo</h3>
            <div className="mb-4">
              <label className="text-xs font-bold text-zinc-400 block mb-2">Aposta (R$)</label>
              <input 
                type="number" 
                value={betAmount} 
                onChange={e => setBetAmount(e.target.value)} 
                disabled={isPlaying} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" 
              />
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 mb-4 text-center">
              <span className="text-[10px] text-zinc-400 block">MULTIPLICADOR ATUAL</span>
              <span className="text-xl font-black text-amber-400">{multiplier}×</span>
            </div>

            {(gameOver || gameWon) && (
              <div className={`p-4 rounded-2xl border text-center mb-4 ${gameWon ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                <div className="text-xs font-bold">{gameWon ? 'Parabéns! Chegou ao topo!' : 'Armadilha ativada! Tente de novo.'}</div>
              </div>
            )}
          </div>

          {!isPlaying && (
            <button onClick={startGame} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 text-xs">
              INICIAR SUBIDA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

