import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function PampasTowers() {
  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem('pampas_users_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [{ id: 1, username: 'LVelasques', password: 'Lucas123!', balance: 99999999, isAdmin: true }];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved).balance : 150000;
  });

  const [betAmount, setBetAmount] = useState(30000);
  const [gameActive, setGameActive] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(0); // 0 a 7 (8 andares)
  const [revealedDoors, setRevealedDoors] = useState({}); // { floorIndex: chosenDoorIndex }
  const [trapDoors, setTrapDoors] = useState({}); // { floorIndex: trapDoorIndex }
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);

  // Multiplicadores por andar (8 andares de pura adrenalina)
  const multipliers = [1.35, 1.80, 2.50, 3.50, 5.00, 7.50, 12.00, 25.00];

  const fetchUsersDb = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          setUsersDb(data);
          localStorage.setItem('pampas_users_db', JSON.stringify(data));
          if (currentUser) {
            const updatedMe = data.find(u => u.id === currentUser.id);
            if (updatedMe) setBalance(Number(updatedMe.balance));
          }
          return;
        }
      } catch (e) { }
    }
  };

  useEffect(() => {
    fetchUsersDb();
    const interval = setInterval(fetchUsersDb, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('pampas_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('pampas_current_user');
  }, [currentUser]);

  const updateBalanceOnDb = async (userId, newBal) => {
    setBalance(newBal);
    setCurrentUser(prev => prev ? { ...prev, balance: newBal } : null);
    if (isSupabaseConfigured) {
      try { await supabase.from('users').update({ balance: newBal }).eq('id', userId); } catch (e) { }
    }
    setUsersDb(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, balance: newBal } : u);
      localStorage.setItem('pampas_users_db', JSON.stringify(updated));
      return updated;
    });
  };

  const startGame = () => {
    if (!currentUser) return alert("Faça login para jogar!");
    if (balance < betAmount) return alert("Saldo insuficiente para iniciar a escalada!");

    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setGameActive(true);
    setCurrentFloor(0);
    setRevealedDoors({});
    setGameOver(false);
    
    // Sortear antecipadamente a porta armadilha (0, 1 ou 2) para cada um dos 8 andares
    const newTraps = {};
    for (let i = 0; i < 8; i++) {
      newTraps[i] = Math.floor(Math.random() * 3);
    }
    setTrapDoors(newTraps);
    setMessage('🏰 Torre iniciada! Escolha uma porta segura no 1º Andar.');
  };

  const chooseDoor = (doorIndex) => {
    if (!gameActive || gameOver) return;

    const trapIndex = trapDoors[currentFloor];
    const isTrap = doorIndex === trapIndex;

    const newRevealed = { ...revealedDoors, [currentFloor]: doorIndex };
    setRevealedDoors(newRevealed);

    if (isTrap) {
      // Bateu na armadilha - Perdeu
      setGameOver(true);
      setGameActive(false);
      setMessage(`💥 ARMADILHA! A porta ${doorIndex + 1} escondeu o perigo. Aposta perdida.`);
    } else {
      // Acertou! Pode subir ou resgatar
      if (currentFloor === 7) {
        // Chegou ao topo! Vitória máxima automática
        const prize = Math.floor(betAmount * multipliers[7]);
        updateBalanceOnDb(currentUser.id, balance + prize);
        setGameOver(true);
        setGameActive(false);
        setMessage(`👑 TOPO DA TORRE ALCANÇADO! Prémio máximo: R$ ${prize.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`);
      } else {
        setCurrentFloor(prev => prev + 1);
        setMessage(`✅ Andar ${currentFloor + 1} superado! Escolha a porta no próximo andar ou resgate o lucro.`);
      }
    }
  };

  const cashOutTowers = () => {
    if (!gameActive || currentFloor === 0) return;
    const activeMultiplier = multipliers[currentFloor - 1];
    const prize = Math.floor(betAmount * activeMultiplier);
    
    updateBalanceOnDb(currentUser.id, balance + prize);
    setGameActive(false);
    setGameOver(true);
    setMessage(`🏆 LUCRO RESGATADO! +R$ ${prize.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`);
  };
    return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      {/* Topo Global */}
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-3">
        <img 
          src="/Grupopampas.png" 
          alt="Patrocinador Grupo Pampas" 
          className="h-14 w-auto max-w-[200px] object-contain" 
        />
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500">
          🏰 PAMPAS TOWERS 🏰
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">A Escada de Risco de Elite</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-4">
        <div className="bg-black border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
          
          {message && (
            <div className={`p-3 text-center rounded-xl font-black text-xs uppercase tracking-wide ${message.includes('ALCANÇADO') || message.includes('RESGATADO') || message.includes('superado') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : message.includes('ARMADILHA') ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-black text-amber-400 border border-amber-500/40'}`}>
              {message}
            </div>
          )}

          {/* Torre de Andares (Exibida de cima para baixo: Andar 8 até Andar 1) */}
          <div className="bg-black border border-amber-500/40 rounded-2xl p-3 space-y-2">
            <h3 className="text-[11px] text-amber-300 font-bold uppercase tracking-wider mb-2">Estrutura da Torre</h3>
            
            {[...Array(8)].map((_, index) => {
              const floorNum = 7 - index; // De 7 (topo) até 0 (base)
              const isCurrent = gameActive && currentFloor === floorNum;
              const isPassed = currentFloor > floorNum || (gameOver && !message.includes('ARMADILHA') && floorNum < currentFloor);

              return (
                <div 
                  key={floorNum} 
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                    isCurrent ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-[1.02] shadow-lg' :
                    isPassed ? 'bg-zinc-900/80 border-emerald-500/40 text-emerald-400 opacity-90' :
                    'bg-black border-zinc-900 text-zinc-600'
                  }`}
                >
                  <span>Andar {floorNum + 1}</span>
                  <span className="font-mono text-amber-400">{multipliers[floorNum]}x</span>
                </div>
              );
            })}
          </div>

          {/* Seleção de Aposta */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] text-zinc-400 font-bold uppercase block">Valor da Aposta (R$)</label>
            <select disabled={gameActive} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-black text-amber-400 border border-zinc-800 rounded-xl px-3 py-2.5 font-black outline-none text-xs">
              <option value={30000}>R$ 30k</option>
              <option value={100000}>R$ 100k</option>
              <option value={500000}>R$ 500k</option>
              <option value={1000000}>R$ 1M</option>
            </select>
          </div>

          {/* Área de Escolha de Portas para o Andar Atual */}
          {gameActive && (
            <div className="space-y-3 bg-black border border-amber-500/30 rounded-2xl p-4">
              <p className="text-xs text-amber-400 font-bold uppercase">Escolha 1 de 3 Portas (Andar {currentFloor + 1})</p>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((doorIdx) => (
                  <button 
                    key={doorIdx}
                    onClick={() => chooseDoor(doorIdx)}
                    className="py-4 bg-black border-2 border-amber-500/60 hover:bg-amber-500 hover:text-black text-amber-400 font-black text-sm rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    🚪 Porta {doorIdx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          {!gameActive ? (
            <button onClick={startGame} className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95">
              🏰 INICIAR ESCALADA DA TORRE
            </button>
          ) : (
            currentFloor > 0 && (
              <button onClick={cashOutTowers} className="w-full bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(16,185,129,0.4)] animate-bounce transition-all">
                💰 RESGATAR LUCRO (R$ {(betAmount * multipliers[currentFloor - 1]).toLocaleString('pt-BR', {maximumFractionDigits: 0})})
              </button>
            )
          )}

        </div>
      </main>
    </div>
  );
}

