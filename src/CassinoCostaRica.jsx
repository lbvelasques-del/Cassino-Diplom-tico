import React, { useState } from 'react';

export default function CassinoCostaRica({ balance, setBalance, currentUser }) {
  const [selectedGame, setSelectedGame] = useState(null); // Null = Abre o Lobby do Cassino Diplomático
  const [betAmount, setBetAmount] = useState(30000);
  const [gameResult, setGameResult] = useState('');

  // Jogos alojados dentro do Cassino Diplomático (incluindo o Cassino Costa Rica)
  const gamesList = [
    { id: 'costarica', name: 'Cassino Costa Rica', icon: '🎰', highlight: false },
    { id: 'crash', name: 'Pampas Crash', icon: '🚀', highlight: false },
    { id: 'towers', name: 'Pampas Towers', icon: '🏰', highlight: false },
    { id: 'diamond', name: 'Diamond Striker', icon: '💎', highlight: false },
    { id: 'holdwin', name: 'Hold & Win', icon: '🫎', highlight: false },
    { id: 'dice', name: 'Pampas Dice', icon: '🎲', highlight: false },
    { id: 'goal', name: 'Pampas Goal', icon: '⚽', highlight: false },
    { id: 'hilo', name: 'Pampas HiLo', icon: '🃏', highlight: false },
    { id: 'roleta', name: 'Roleta Diplomática', icon: '🎡', highlight: false },
    { id: 'guerra', name: 'Guerra das Américas', icon: '⚔️', highlight: true },
  ];

  const handleSimulateGame = (multiplier) => {
    if (balance < betAmount) return alert("Saldo insuficiente no cofre!");
    const win = Math.random() > 0.45;
    const change = win ? Math.floor(betAmount * multiplier) : -betAmount;
    const newBal = balance + change;
    setBalance(newBal);
    setGameResult(win ? `🎉 Vitória! Ganhou R$ ${change.toLocaleString('pt-BR')}` : `❌ Derrota! Perdeu R$ ${betAmount.toLocaleString('pt-BR')}`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 pt-16 flex flex-col items-center">
      
      {/* LOBBY DO CASSINO DIPLOMÁTICO (Menu em 2 Colunas) */}
      {!selectedGame ? (
        <div className="w-full max-w-md space-y-6 text-center animate-fade-in">
          
          {/* Logo / Header do Cassino Diplomático */}
          <div className="bg-[#111] p-6 rounded-3xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 rounded-2xl flex items-center justify-center font-black text-2xl text-black shadow-lg mb-2">
              RP
            </div>
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">REDE PAMPAS</p>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 uppercase tracking-wider mt-1">
              CASSINO DIPLOMÁTICO
            </h1>
            <div className="mt-3 bg-black/80 px-5 py-2 rounded-xl border border-amber-500/40">
              <span className="text-[10px] text-zinc-400 uppercase font-black block">Saldo Disponível</span>
              <span className="text-lg font-black text-emerald-400">R$ {balance.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {/* Grelha de Mini-Jogos em 2 Colunas */}
          <div className="grid grid-cols-2 gap-3">
            {gamesList.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGame(g)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer ${
                  g.highlight
                    ? 'col-span-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black border-amber-300 hover:scale-[1.02] py-4 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-[#12100d] border-amber-900/40 text-amber-400 hover:border-amber-500 hover:bg-[#1a140f]'
                }`}
              >
                <span className="text-base">{g.icon}</span>
                <span>{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* MESA DE JOGO SELECIONADA (Ex: Cassino Costa Rica / Pampas Crash / Guerra das Américas) */
        <div className="w-full max-w-md bg-[#0e0c0a] border border-amber-500/40 p-6 rounded-3xl space-y-5 text-center shadow-2xl relative">
          <button onClick={() => { setSelectedGame(null); setGameResult(''); }} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-black cursor-pointer">
            ✕
          </button>

          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{selectedGame.icon}</span>
            <h2 className="text-xl font-black text-amber-400 uppercase">{selectedGame.name}</h2>
          </div>

          <div className="bg-black/80 p-4 rounded-2xl border border-amber-900/30">
            <p className="text-xs text-zinc-400 font-bold uppercase mb-1">Aposta Selecionada</p>
            <p className="text-2xl font-black text-emerald-400">R$ {betAmount.toLocaleString('pt-BR')}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[30000, 60000, 100000, 300000, 500000, 1000000].map((v) => (
              <button key={v} onClick={() => setBetAmount(v)} className={`py-2 rounded-xl text-[10px] font-black uppercase border cursor-pointer ${betAmount === v ? 'bg-amber-500 text-black border-amber-300' : 'bg-black text-zinc-400 border-zinc-800'}`}>
                R$ {(v / 1000)}k
              </button>
            ))}
          </div>

          <button onClick={() => handleSimulateGame(2.5)} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-4 rounded-2xl uppercase tracking-wider text-sm shadow-lg hover:scale-[1.01] cursor-pointer">
            ▶️ JOGAR AGORA
          </button>

          {gameResult && (
            <div className="p-3 bg-black/60 rounded-xl border border-amber-500/30 text-xs font-black">
              {gameResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
