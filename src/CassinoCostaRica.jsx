import React, { useState } from 'react';

export default function CassinoCostaRica({ currentUser, balance, setBalance }) {
  const [betAmount, setBetAmount] = useState('10');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState([]);

  const handleNumberSelect = (num) => {
    if (spinning) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      if (selectedNumbers.length < 5) {
        setSelectedNumbers([...selectedNumbers, num]);
      } else {
        alert('Pode selecionar no máximo 5 números!');
      }
    }
  };

  const handlePlay = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return alert('Insira um valor de aposta válido.');
    if (bet > balance) return alert('Saldo insuficiente para esta aposta.');
    if (selectedNumbers.length === 0) return alert('Selecione pelo menos um número.');

    setBalance(prev => prev - bet);
    setSpinning(true);
    setGameResult(null);

    setTimeout(() => {
      const winningNumber = Math.floor(Math.random() * 37);
      const isWinner = selectedNumbers.includes(winningNumber);
      let winValue = 0;

      if (isWinner) {
        const multiplier = 36 / selectedNumbers.length;
        winValue = bet * multiplier;
        setBalance(prev => prev + winValue);
      }

      const resultData = { winningNumber, isWinner, winValue, bet };
      setGameResult(resultData);
      setHistory(prev => [resultData, ...prev.slice(0, 9)]);
      setSpinning(false);
    }, 1500);
  };
    return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400">🎰 Cassino Costa Rica</h2>
          <p className="text-xs text-zinc-400">Escolha até 5 números da sorte (0 a 36) e multiplique o seu saldo.</p>
        </div>
        <div className="bg-black/60 px-6 py-3 rounded-2xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 block">SEU SALDO</span>
          <span className="text-lg font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <div className="mb-6">
            <label className="text-xs font-bold text-zinc-400 block mb-2">Valor da Aposta (R$)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={betAmount} 
                onChange={e => setBetAmount(e.target.value)} 
                disabled={spinning} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" 
              />
              <button onClick={() => setBetAmount(prev => Math.max(1, Number(prev) / 2))} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-xl text-xs font-bold">½</button>
              <button onClick={() => setBetAmount(prev => Number(prev) * 2)} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-xl text-xs font-bold">2×</button>
            </div>
          </div>
                    <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-zinc-400">Selecione até 5 números ({selectedNumbers.length}/5)</span>
              <button onClick={() => setSelectedNumbers([])} className="text-[10px] text-amber-400 hover:underline">Limpar Seleção</button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 37 }, (_, i) => i).map(num => {
                const isSelected = selectedNumbers.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => handleNumberSelect(num)}
                    disabled={spinning}
                    className={`py-3 rounded-xl font-black text-sm transition-all ${
                      isSelected 
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105' 
                        : 'bg-black/60 border border-zinc-800 text-zinc-300 hover:border-amber-500/50'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
                    <button 
            onClick={handlePlay} 
            disabled={spinning || selectedNumbers.length === 0} 
            className="w-full bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 text-sm tracking-wider"
          >
            {spinning ? 'A GIRAR A ROLETA...' : 'APOSTAR AGORA'}
          </button>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-white mb-4">📊 Últimos Resultados</h3>
            {gameResult && (
              <div className={`mb-4 p-4 rounded-2xl border text-center ${gameResult.isWinner ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                <div className="text-2xl font-black mb-1">{gameResult.winningNumber}</div>
                <div className="text-xs font-bold">{gameResult.isWinner ? `Ganhou R$ ${gameResult.winValue.toFixed(2)}!` : 'Não foi desta vez!'}</div>
              </div>
            )}

            <div className="space-y-2">
              {history.map((h, index) => (
                <div key={index} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl text-xs border border-zinc-800">
                  <span className="text-zinc-400">Número: <strong className="text-white">{h.winningNumber}</strong></span>
                  <span className={h.isWinner ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    {h.isWinner ? `+R$ ${h.winValue.toFixed(2)}` : 'Perdido'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 text-center">
            Cassino Costa Rica • Sorteio Verificado
          </div>
        </div>
      </div>
    </div>
  );
}

