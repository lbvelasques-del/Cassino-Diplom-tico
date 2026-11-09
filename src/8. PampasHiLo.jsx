import React, { useState } from 'react';

export default function PampasHiLo({ currentUser, balance, setBalance }) {
  const [bet, setBet] = useState(10);
  const [currentCard, setCurrentCard] = useState(7);
  const [nextCard, setNextCard] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('Adivinhe se a próxima carta será Maior ou Menor!');

  const startGame = () => {
    const betVal = parseFloat(bet);
    if (isNaN(betVal) || betVal <= 0) return alert('Insira um valor de aposta válido.');
    if (betVal > balance) return alert('Saldo insuficiente para esta aposta.');

    setBalance(prev => prev - betVal);
    setIsPlaying(true);
    const initial = Math.floor(Math.random() * 12) + 1;
    setCurrentCard(initial);
    setNextCard(null);
    setMessage('Carta na mesa! Escolha Maior ou Menor.');
  };

  const guess = (direction) => {
    if (!isPlaying) return;

    const drawn = Math.floor(Math.random() * 12) + 1;
    setNextCard(drawn);

    let win = false;
    if (direction === 'high' && drawn >= currentCard) win = true;
    if (direction === 'low' && drawn <= currentCard) win = true;

    if (win) {
      const winAmount = bet * 1.9;
      setBalance(prev => prev + winAmount);
      setMessage(`Acertou! Saiu o ${drawn}. Ganhou R$ ${winAmount.toFixed(2)}! 🎉`);
    } else {
      setMessage(`Errou! Saiu o ${drawn}. Não foi desta vez.`);
    }

    setCurrentCard(drawn);
    setIsPlaying(false);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full shadow-2xl text-center">
        <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">Pampas HiLo 📊</h2>
        <p className="text-xs text-zinc-400 mb-6">Adivinhe se a carta seguinte é mais alta ou mais baixa.</p>

        <div className="bg-black border border-zinc-800 p-8 rounded-2xl mb-6 shadow-inner flex justify-center items-center gap-6">
          <div className="w-24 h-32 bg-zinc-900 border border-zinc-700 rounded-2xl flex flex-col items-center justify-center shadow-xl">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Carta Atual</span>
            <span className="text-4xl font-black text-amber-400">{currentCard}</span>
          </div>
        </div>

        {isPlaying && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => guess('high')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20">
              📈 Maior ou Igual
            </button>
            <button onClick={() => guess('low')} className="bg-red-600 hover:bg-red-500 text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-red-600/20">
              📉 Menor ou Igual
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

        {!isPlaying && (
          <button onClick={startGame} className="w-full max-w-xs mx-auto bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm block">
            INICIAR JOGO
          </button>
        )}
      </div>
    </div>
  );
}

