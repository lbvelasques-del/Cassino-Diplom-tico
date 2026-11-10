import React, { useState } from 'react';

export default function CassinoCostaRica({ balance, setBalance, currentUser }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [betAmount, setBetAmount] = useState(30000);
  const [gameResult, setGameResult] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Estados do Caça-Níquel dos Pampas
  const symbols = [
    { icon: '🫎', name: 'Pampas', mult: 0.5 },
    { icon: '⚗️', name: 'Alquimia', mult: 0.8 },
    { icon: '🛢️', name: 'Petróleo', mult: 1.0 },
    { icon: '🪙', name: 'Moeda', mult: 1.5 },
    { icon: '🇧🇷', name: 'Brasil', mult: 2.0 },
    { icon: '🇨🇷', name: 'Costa Rica', mult: 3.0 },
    { icon: '💎', name: 'Diamante', mult: 5.0 }
  ];
  const [reels, setReels] = useState(['🫎', '🇧🇷', '💎']);

  // Jogos Alojados no Cassino Diplomático
  const gamesList = [
    { id: 'slots', name: 'Caça-Níquel dos Pampas', icon: '🎰', highlight: true },
    { id: 'guerra', name: 'Guerra das Américas', icon: '⚔️', highlight: true },
    { id: 'diamond', name: 'Diamond Striker', icon: '💎', highlight: false },
    { id: 'holdwin', name: 'Pampas Hold & Win', icon: '🫎', highlight: false },
    { id: 'crash', name: 'Pampas Crash', icon: '🚀', highlight: false },
    { id: 'towers', name: 'Pampas Towers', icon: '🏰', highlight: false },
    { id: 'dice', name: 'Pampas Dice', icon: '🎲', highlight: false },
    { id: 'goal', name: 'Pampas Penalty Goal', icon: '⚽', highlight: false },
    { id: 'roleta', name: 'Roleta Diplomática', icon: '🎡', highlight: false }
  ];

  // Motor Caça-Níquel Real
  const handleSpinSlots = () => {
    if (balance < betAmount) return alert("Saldo insuficiente no cofre!");
    setIsSpinning(true);
    setGameResult('');

    // Cobrar aposta
    const currentBal = balance - betAmount;
    setBalance(currentBal);

    setTimeout(() => {
      const r1 = symbols[Math.floor(Math.random() * symbols.length)];
      const r2 = symbols[Math.floor(Math.random() * symbols.length)];
      const r3 = symbols[Math.floor(Math.random() * symbols.length)];

      setReels([r1.icon, r2.icon, r3.icon]);
      setIsSpinning(false);

      if (r1.icon === r2.icon && r2.icon === r3.icon) {
        const win = Math.floor(betAmount * (r1.mult * 5));
        const finalBal = currentBal + win;
        setBalance(finalBal);
        setGameResult(`🔥 JACKPOT 3X ${r1.name.toUpperCase()}! Ganhou R$ ${win.toLocaleString('pt-BR')}!`);
      } else if (r1.icon === r2.icon || r2.icon === r3.icon || r1.icon === r3.icon) {
        const matched = r1.icon === r2.icon ? r1 : r3;
        const win = Math.floor(betAmount * matched.mult * 1.5);
        const finalBal = currentBal + win;
        setBalance(finalBal);
        setGameResult(`🎉 DUPLA DE ${matched.name.toUpperCase()}! Ganhou R$ ${win.toLocaleString('pt-BR')}`);
      } else {
        setGameResult(`❌ Tente novamente! Sem combinações.`);
      }
    }, 1200);
  };

  // Motor Guerra das Américas (Duelo de Cartas)
  const handlePlayGuerra = () => {
    if (balance < betAmount) return alert("Saldo insuficiente!");
    const playerCard = Math.floor(Math.random() * 12) + 1;
    const houseCard = Math.floor(Math.random() * 12) + 1;

    if (playerCard > houseCard) {
      const win = betAmount * 2;
      setBalance(b => b + betAmount);
      setGameResult(`⚔️ Vitória da sua tropa! (${playerCard} vs ${houseCard}). Ganhou R$ ${win.toLocaleString('pt-BR')}`);
    } else if (playerCard < houseCard) {
      setBalance(b => b - betAmount);
      setGameResult(`🛡️ Derrota na batalha! (${playerCard} vs ${houseCard}). Perdeu R$ ${betAmount.toLocaleString('pt-BR')}`);
    } else {
      setGameResult(`⚖️ Empate! Saldo mantido. (${playerCard} vs ${houseCard})`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 pt-16 flex flex-col items-center">
      
      {!selectedGame ? (
        /* LOBBY EM DUAS COLUNAS */
        <div className="w-full max-w-md space-y-6 text-center animate-fade-in">
          <div className="bg-[#111] p-6 rounded-3xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 rounded-2xl flex items-center justify-center font-black text-2xl text-black shadow-lg mb-2">RP</div>
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">REDE PAMPAS</p>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 uppercase tracking-wider mt-1">
              CASSINO DIPLOMÁTICO
            </h1>
            <div className="mt-3 bg-black/80 px-5 py-2 rounded-xl border border-amber-500/40">
              <span className="text-[10px] text-zinc-400 uppercase font-black block">Saldo VIP</span>
              <span className="text-lg font-black text-emerald-400">R$ {balance.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {gamesList.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGame(g)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer ${
                  g.highlight
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black border-amber-300 hover:scale-[1.02]'
                    : 'bg-[#12100d] border-amber-900/40 text-amber-400 hover:border-amber-500'
                }`}
              >
                <span className="text-base">{g.icon}</span>
                <span>{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* TELA DE JOGO ATIVO */
        <div className="w-full max-w-md bg-[#0e0c0a] border border-amber-500/40 p-6 rounded-3xl space-y-5 text-center shadow-2xl relative">
          <button onClick={() => { setSelectedGame(null); setGameResult(''); }} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-black cursor-pointer">✕</button>

          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{selectedGame.icon}</span>
            <h2 className="text-xl font-black text-amber-400 uppercase">{selectedGame.name}</h2>
          </div>

          {/* MOTOR CAÇA-NÍQUEL DOS PAMPAS */}
          {selectedGame.id === 'slots' ? (
            <div className="space-y-5">
              <div className="flex justify-center gap-3 bg-black/90 p-5 rounded-2xl border border-amber-500/50 shadow-inner">
                {reels.map((s, i) => (
                  <div key={i} className={`w-20 h-24 bg-[#1a140f] border-2 border-amber-400 rounded-xl flex items-center justify-center text-4xl shadow-2xl ${isSpinning ? 'animate-bounce' : ''}`}>
                    {s}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[30000, 60000, 100000, 300000, 500000, 1000000].map((v) => (
                  <button key={v} onClick={() => setBetAmount(v)} className={`py-2 rounded-xl text-[10px] font-black uppercase border cursor-pointer ${betAmount === v ? 'bg-amber-500 text-black border-amber-300' : 'bg-black text-zinc-400 border-zinc-800'}`}>
                    R$ {(v / 1000)}k
                  </button>
                ))}
              </div>

              <button onClick={handleSpinSlots} disabled={isSpinning} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-4 rounded-2xl uppercase tracking-wider text-sm shadow-lg cursor-pointer">
                {isSpinning ? "GIRANDO ROLETAS..." : "🎰 GIRAR (R$ " + betAmount.toLocaleString('pt-BR') + ")"}
              </button>
            </div>
          ) : (
            /* DEMAIS MODALIDADES (GUERRA DAS AMÉRICAS E OUTROS) */
            <div className="space-y-5">
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

              <button onClick={handlePlayGuerra} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-4 rounded-2xl uppercase tracking-wider text-sm shadow-lg cursor-pointer">
                ⚔️ JOGAR MODALIDADE
              </button>
            </div>
          )}

          {gameResult && (
            <div className="p-3 bg-black/80 rounded-xl border border-amber-500/40 text-xs font-black animate-fade-in">
              {gameResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
