import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function AvalancheDiplomatica() {
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

  const [grid, setGrid] = useState(() => Array(30).fill(null).map(() => getRandomSymbol()));
  const [betAmount, setBetAmount] = useState(30000);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('Encontre 9+ símbolos iguais em qualquer lugar!');
  const [totalWin, setTotalWin] = useState(0);
  const [accumulatedMultiplier, setAccumulatedMultiplier] = useState(1);

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

  function getRandomSymbol() {
    const symbols = [
      { id: 'pampas', icon: '/pampas.png', mult: 0.2 },
      { id: 'petroleo', icon: '/petroleo.png', mult: 0.4 },
      { id: 'brasil', icon: '/brasil.png', mult: 0.8 },
      { id: 'diamante', icon: '/diamante.png', mult: 1.5 },
      { id: 'bola', icon: '/bola.png', mult: 3.0 }
    ];
    // Orbes extremamente raros e controlados (1.5% de chance, valor fixo de +1x)
    if (Math.random() < 0.015) {
      return { id: 'orb', icon: '💎', isOrb: true, multValue: 1 };
    }
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  const handleSpin = () => {
    if (!currentUser) return alert("Faça login para jogar!");
    if (balance < betAmount) return alert("Saldo insuficiente!");
    if (spinning) return;

    setSpinning(true);
    setTotalWin(0);
    setAccumulatedMultiplier(1);
    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setMessage('🌪️ Avalanche a iniciar...');

    let currentGrid = Array(30).fill(null).map(() => getRandomSymbol());
    setGrid(currentGrid);

    setTimeout(() => {
      processAvalanche(currentGrid, betAmount, 0, 1, 0);
    }, 600);
  };

  const processAvalanche = (currentGrid, bet, currentRoundWin, currentMult, cascadeCount) => {
    // 🛡️ TRAVA RÍGIDA: Máximo de 3 cascatas por rodada para esmagar loops de lavagem
    if (cascadeCount >= 3) {
      finalizePayout(currentRoundWin, currentMult, bet);
      return;
    }

    const counts = {};
    let orbValuesInThisDrop = 0;

    currentGrid.forEach(cell => {
      if (cell.id === 'orb') {
        orbValuesInThisDrop += cell.multValue;
      } else {
        counts[cell.id] = (counts[cell.id] || 0) + 1;
      }
    });

    let winningSymbols = [];
    let roundPrize = 0;

    Object.keys(counts).forEach(symId => {
      // Exige rigorosamente 10 símbolos iguais para dificultar os prémios
      if (counts[symId] >= 10) {
        winningSymbols.push(symId);
        const baseSymbol = currentGrid.find(c => c.id === symId);
        const symbolMultiplier = baseSymbol ? baseSymbol.mult : 1;
        roundPrize += bet * symbolMultiplier * (counts[symId] / 10);
      }
    });

    // 🛡️ TETO ABSOLUTO DO MULTIPLICADOR NA QUEDAS: Nunca passa de 5x acumulados no total da rodada
    if (orbValuesInThisDrop > 0) {
      currentMult = Math.min(currentMult + orbValuesInThisDrop, 5);
      setAccumulatedMultiplier(currentMult);
    }

    if (winningSymbols.length > 0 || orbValuesInThisDrop > 0) {
      const multipliedPrize = roundPrize > 0 ? roundPrize * currentMult : 0;
      const newTotalWin = currentRoundWin + multipliedPrize;
      setTotalWin(newTotalWin);
      setMessage(`💥 CASCATA #${cascadeCount + 1}! R$ ${newTotalWin.toLocaleString('pt-BR')}`);

      setTimeout(() => {
        let nextGrid = currentGrid.map(cell => {
          if (winningSymbols.includes(cell.id) || cell.id === 'orb') {
            return getRandomSymbol();
          }
          return cell;
        });
        setGrid(nextGrid);
        
        processAvalanche(nextGrid, bet, newTotalWin, currentMult, cascadeCount + 1);
      }, 800);

    } else {
      finalizePayout(currentRoundWin, currentMult, bet);
    }
  };

  // 🛡️ BLINDAGEM FINANCEIRA DA CASA POR ESCALÃO DE APOSTA
  const finalizePayout = (currentRoundWin, currentMult, bet) => {
    let maxAllowedMult = 10; // Até 500k paga no máximo 10x
    if (bet >= 1000000 && bet < 5000000) {
      maxAllowedMult = 5;  // 1M paga no máximo 5x
    } else if (bet >= 5000000) {
      maxAllowedMult = 3;  // 5M paga no máximo 3x
    }

    const cappedMult = Math.min(currentMult, maxAllowedMult);
    let finalPayout = currentRoundWin > 0 ? currentRoundWin * cappedMult : 0;

    // Teto absoluto intransigível
    const absoluteMaxWin = bet * maxAllowedMult;
    if (finalPayout > absoluteMaxWin) {
      finalPayout = absoluteMaxWin;
    }

    if (finalPayout > 0) {
      updateBalanceOnDb(currentUser.id, balance - bet + finalPayout);
      setMessage(`🏆 FIM DA AVALANCHE! Prémio: R$ ${finalPayout.toLocaleString('pt-BR')}`);
    } else {
      setMessage('Tente novamente na próxima avalanche!');
    }
    setSpinning(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-3">
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
          AVALANCHE DIPLOMÁTICA
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Multiplicadores em Cascata & Pay Anywhere
        </p>
      </div>

      <main className="max-w-lg mx-auto p-4 space-y-4 pt-4">
        
        <div className="bg-black border-2 border-amber-500/60 rounded-3xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4 text-center relative overflow-hidden">
          
          <div className="flex justify-between items-center bg-[#0a0a0e] border border-amber-500/40 p-3 rounded-xl">
            <div className="text-left">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Multiplicador Atual</span>
              <span className="text-amber-400 font-black text-base">{accumulatedMultiplier}x</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Ganho Total</span>
              <span className="text-amber-400 font-black text-base">R$ {totalWin.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className={`p-3 border text-center rounded-xl font-black text-xs uppercase tracking-wide h-10 flex items-center justify-center transition-all duration-300 ${totalWin > 0 ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-[#0a0a0e] border-amber-500/40 text-amber-400'}`}>
            {message}
          </div>

          <div className="grid grid-cols-6 gap-1.5 p-2 bg-black border-2 border-zinc-800 rounded-xl shadow-inner relative z-10">
            {grid.map((cell, i) => {
              let cellStyle = "h-14 rounded-lg flex flex-col items-center justify-center text-xl transition-all duration-300 ";
              
              if (spinning) {
                cellStyle += "opacity-40 scale-90 blur-[1px] ";
              } else if (cell.id === 'orb') {
                cellStyle += "bg-gradient-to-br from-purple-600 to-indigo-900 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.7)] animate-pulse ";
              } else {
                cellStyle += "bg-black border-2 border-amber-500/70 shadow-[inset_0_0_5px_rgba(0,0,0,1)] ";
              }

              return (
                <div key={i} className={cellStyle}>
                  {cell.id === 'orb' ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs">💎</span>
                      <span className="text-[9px] font-black text-amber-300">+{cell.multValue}x</span>
                    </div>
                  ) : (
                    <img src={cell.icon} alt="símbolo" className="w-8 h-8 object-contain drop-shadow-md" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center bg-[#0a0a0e] border border-amber-500/30 rounded-2xl p-3 relative z-10">
            <div className="text-left">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Aposta</span>
              <select disabled={spinning} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="bg-transparent text-amber-400 font-black outline-none text-xs appearance-none cursor-pointer">
                <option value={1000}>R$ 1k</option>
                <option value={5000}>R$ 5k</option>
                <option value={10000}>R$ 10k</option>
                <option value={30000}>R$ 30k</option>
                <option value={50000}>R$ 50k</option>
                <option value={100000}>R$ 100k</option>
                <option value={500000}>R$ 500k</option>
                <option value={1000000}>R$ 1M</option>
                <option value={5000000}>R$ 5M</option>
              </select>
            </div>
          </div>

          <button 
            disabled={spinning} 
            onClick={handleSpin} 
            className="w-full font-black text-sm py-4 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 relative z-10 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black border border-yellow-300"
          >
            {spinning ? 'AVALANCHE A CAIR...' : '🌪️ GIRAR AVALANCHE'}
          </button>
          
        </div>
      </main>
    </div>
  );
}
