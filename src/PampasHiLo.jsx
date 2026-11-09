import React, { useState } from 'react';

export default function PampasHiLo({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const getRandomCard = () => Math.floor(Math.random() * 13) + 2; // 2 a 14 (Ás)

  const startGame = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente.');

    setBalance(prev => prev - bet);
    const first = getRandomCard();
    setCurrentCard(first);
    setNextCard(null);
    setStreak(0);
    setMultiplier(1.2);
    setIsPlaying(true);
    setGameResult(null);
  };

  const handleGuess = (guess) => {
    if (!isPlaying) return;

    const next = getRandomCard();
    setNextCard(next);

    let isCorrect = false;
    if (guess === 'higher' && next >= currentCard) isCorrect = true;
    if (guess === 'lower' && next <= currentCard) isCorrect = true;

    if (isCorrect) {
      const newStreak = streak + 1;
      const newMult = Number((multiplier * 1.35).toFixed(2));
      setStreak(newStreak);
      setMultiplier(newMult);
      setCurrentCard(next);
      setNextCard(null);
    } else {
      setIsPlaying(false);
      setGameResult('lost');
    }
  };

  const cashOut = () => {
    if (!isPlaying || streak === 0) return;
    const bet = parseFloat(betAmount);
    const winVal = bet * multiplier;
    setBalance(prev => prev + winVal);
    setIsPlaying(false);
    setGameResult('won');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">📊 Pampas HiLo</h2>
          <p className="text-xs text-zinc-400">Adivinhe se a carta seguinte é maior ou menor para subir o multiplicador.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[320px]">
          {isPlaying ? (
            <div className="text-center w-full max-w-sm">
              <div className="mb-6 flex justify-center items-center gap-4">
                <div className="w-24 h-36 bg-black border-2 border-amber-500/50 rounded-2xl flex flex-col items-center justify-center shadow-xl">
                  <span className="text-[10px] text-zinc-400 block mb-1">CARTA ATUAL</span>
                  <span className="text-3xl font-black text-amber-400">{currentCard}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => handleGuess('higher')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all text-xs shadow-lg">
                  📈 MAIOR OU IGUAL
                </button>
                <button onClick={() => handleGuess('lower')} className="bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl transition-all text-xs shadow-lg">
                  📉 MENOR OU IGUAL
                </button>
              </div>

              {streak > 0 && (
                <button onClick={cashOut} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl transition-all text-xs shadow-lg">
                  LEVANTAR (R$ {(parseFloat(betAmount) * multiplier).toFixed(2)})
                </button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">🃏</div>
              <p className="text-xs text-zinc-400 mb-6 font-bold uppercase tracking-wider">Configure a aposta e inicie o jogo</p>
              {gameResult && (
                <div className={`p-4 rounded-2xl border mb-6 text-center ${gameResult === 'won' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  <div className="text-xs font-bold">{gameResult === 'won' ? 'Prémio resgatado com sucesso!' : 'Errou a carta! Tente de novo.'}</div>
                </div>
              )}
            </div>
          )}
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
                disabled={isPlaying} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" 
              />
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 mb-4 text-center">
              <span className="text-[10px] text-zinc-400 block">MULTIPLICADOR / SEQUÊNCIA</span>
              <span className="text-xl font-black text-amber-400">{multiplier}×</span>
              <span className="text-xs text-zinc-400 block mt-1">Sequência: {streak} acertos</span>
            </div>
          </div>

          {!isPlaying && (
            <button onClick={startGame} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 text-xs">
              INICIAR HILO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

