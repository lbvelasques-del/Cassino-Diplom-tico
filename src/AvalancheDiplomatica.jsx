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
  const [message, setMessage] = useState('Encontre 12+ símbolos iguais!');
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
      { id: 'pampas', icon: '/pampas.png', mult: 0.1 },
      { id: 'petroleo', icon: '/petroleo.png', mult: 0.2 },
      { id: 'brasil', icon: '/brasil.png', mult: 0.4 },
      { id: 'diamante', icon: '/diamante.png', mult: 0.8 },
      { id: 'bola', icon: '/bola.png', mult: 1.2 }
    ];
    // Sem orbes de soma loucos: apenas símbolos normais limpos
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
    setMessage('🌪️ A girar...');

    let currentGrid = Array(30).fill(null).map(() => getRandomSymbol());
    setGrid(currentGrid);

    setTimeout(() => {
      processAvalanche(currentGrid, betAmount, 0, 0);
    }, 600);
  };

  const processAvalanche = (currentGrid, bet, currentRoundWin, cascadeCount) => {
    // Máximo rigoroso de 2 cascatas curtas
    if (cascadeCount >= 2) {
      finalizePayout(currentRoundWin, bet);
      return;
    }

    const counts = {};
    currentGrid.forEach(cell => {
      counts[cell.id] = (counts[cell.id] || 0) + 1;
    });

    let winningSymbols = [];
    let roundPrize = 0;

    Object.keys(counts).forEach(symId => {
      // Exigência ultra rigorosa de 12 símbolos idênticos na grelha 6x5
      if (counts[symId] >= 12) {
        winningSymbols.push(symId);
        const baseSymbol = currentGrid.find(c => c.id === symId);
        const symbolMultiplier = baseSymbol ? baseSymbol.mult : 0.1;
        roundPrize += bet * symbolMultiplier * (counts[symId] / 12);
      }
    });

    if (winningSymbols.length > 0) {
      const newTotalWin = currentRoundWin + roundPrize;
      setTotalWin(newTotalWin);
      setMessage(`💥 CASCATA! R$ ${newTotalWin.toLocaleString('pt-BR')}`);

      setTimeout(() => {
        let nextGrid = currentGrid.map(cell => {
          if (winningSymbols.includes(cell.id)) {
            return getRandomSymbol();
          }
          return cell;
        });
        setGrid(nextGrid);
        
        processAvalanche(nextGrid, bet, newTotalWin, cascadeCount + 1);
      }, 800);

    } else {
      finalizePayout(currentRoundWin, bet);
    }
  };

  // 🛡️ TETO ABSOLUTO DE SEGURANÇA DA CASA POR APOSTA (Impossível lavar dinheiro)
  const finalizePayout = (currentRoundWin, bet) => {
    let maxMultiplier = 2; // Apostas baixas pagam no máximo 2x
    if (bet >= 100000 && bet < 1000000) {
      maxMultiplier = 1.5;
    } else if (bet >= 1000000) {
      maxMultiplier = 1.2; // Apostas de 1M e 5M pagam quase nada de lucro extra para travar lavagem
    }

    // O prémio final é estritamente limitado ao teto da aposta
    let finalPayout = currentRoundWin > 0 ? Math.min(currentRoundWin, bet * maxMultiplier) : 0;

    if (finalPayout > 0) {
      updateBalanceOnDb(currentUser.id, balance - bet + finalPayout);
      setMessage(`🏆 PRÉMIO: R$ ${finalPayout.toLocaleString('pt-BR')}`);
    } else {
      setMessage('Não premiado. Tente novamente!');
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
          Modo Seguro & Blindado contra Falência
        </p>
      </div>

      <main className="max-w-lg mx-auto p-4 space-y-4 pt-4">
        
        <div className="bg-black border-2 border-amber-500/60 rounded-3xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4 text-center relative overflow-hidden">
          
          <div className="flex justify-between items-center bg-[#0a0a0e] border border-amber-500/40 p-3 rounded-xl">
            <div className="text-left">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Estado</span>
              <span className="text-amber-400 font-black text-base">Blindado</span>
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
              let cellStyle = "h-14 rounded-lg flex flex-col items-center justify-center text-xl transition-all duration-300 bg-black border-2 border-amber-500/70 shadow-[inset_0_0_5px_rgba(0,0,0,1)] ";
              if (spinning) cellStyle += "opacity-40 scale-90 blur-[1px] ";

              return (
                <div key={i} className={cellStyle}>
                  <img src={cell.icon} alt="símbolo" className="w-8 h-8 object-contain drop-shadow-md" />
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
            {spinning ? 'A AVALANCHE CAI...' : '🌪️ GIRAR AVALANCHE'}
          </button>
          
        </div>
      </main>
    </div>
  );
}
