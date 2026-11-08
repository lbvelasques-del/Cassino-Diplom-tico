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
  const [message, setMessage] = useState('Encontre 9+ símbolos iguais ou orbes para vencer!');
  const [totalWin, setTotalWin] = useState(0);
  const [accumulatedMultiplier, setAccumulatedMultiplier] = useState(1);
  const [animatingCells, setAnimatingCells] = useState([]);

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
      { id: 'pampas', icon: '/pampas.png', mult: 0.3 },
      { id: 'petroleo', icon: '/petroleo.png', mult: 0.6 },
      { id: 'brasil', icon: '/brasil.png', mult: 1.2 },
      { id: 'diamante', icon: '/diamante.png', mult: 2.5 },
      { id: 'bola', icon: '/bola.png', mult: 5.0 }
    ];
    // Orbes multiplicadores equilibrados (3% de chance, +1x a +3x)
    if (Math.random() < 0.03) {
      const orbValues = [1, 2, 3];
      const val = orbValues[Math.floor(Math.random() * orbValues.length)];
      return { id: 'orb', icon: '💎', isOrb: true, multValue: val };
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
    setAnimatingCells([]);
    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setMessage('🌪️ A cascata diplomática começou...');

    let currentGrid = Array(30).fill(null).map(() => getRandomSymbol());
    setGrid(currentGrid);

    setTimeout(() => {
      processAvalanche(currentGrid, betAmount, 0, 1, 0);
    }, 500);
  };

  const processAvalanche = (currentGrid, bet, currentRoundWin, currentMult, cascadeCount) => {
    // 🛡️ Limite máximo de 5 cascatas por rodada
    if (cascadeCount >= 5) {
      finalizePayout(currentRoundWin, currentMult, bet);
      return;
    }

    const counts = {};
    let orbValuesInThisDrop = 0;
    let winningIndices = [];

    currentGrid.forEach((cell, idx) => {
      if (cell.id === 'orb') {
        orbValuesInThisDrop += cell.multValue;
        winningIndices.push(idx);
      } else {
        counts[cell.id] = (counts[cell.id] || 0) + 1;
      }
    });

    let winningSymbols = [];
    let roundPrize = 0;

    Object.keys(counts).forEach(symId => {
      // Requisito saudável de 9 símbolos iguais para Pay Anywhere
      if (counts[symId] >= 9) {
        winningSymbols.push(symId);
        const baseSymbol = currentGrid.find(c => c.id === symId);
        const symbolMultiplier = baseSymbol ? baseSymbol.mult : 1;
        roundPrize += bet * symbolMultiplier * (counts[symId] / 9);

        currentGrid.forEach((cell, idx) => {
          if (cell.id === symId) winningIndices.push(idx);
        });
      }
    });

    // Animação visual de destaque nas células vencedoras
    setAnimatingCells(winningIndices);

    // Orbes somam ao multiplicador com limite máximo acumulado de 15x por rodada
    if (orbValuesInThisDrop > 0) {
      currentMult = Math.min(currentMult + orbValuesInThisDrop, 15);
      setAccumulatedMultiplier(currentMult);
    }

    if (winningSymbols.length > 0 || orbValuesInThisDrop > 0) {
      const multipliedPrize = roundPrize > 0 ? roundPrize * currentMult : 0;
      const newTotalWin = currentRoundWin + multipliedPrize;
      setTotalWin(newTotalWin);
      setMessage(`✨ CASCATA #${cascadeCount + 1}! Prémio parcial: R$ ${newTotalWin.toLocaleString('pt-BR')}`);

      setTimeout(() => {
        let nextGrid = currentGrid.map((cell, idx) => {
          if (winningSymbols.includes(cell.id) || cell.id === 'orb') {
            return getRandomSymbol();
          }
          return cell;
        });
        setGrid(nextGrid);
        setAnimatingCells([]);
        
        processAvalanche(nextGrid, bet, newTotalWin, currentMult, cascadeCount + 1);
      }, 700);

    } else {
      finalizePayout(currentRoundWin, currentMult, bet);
    }
  };

  const finalizePayout = (currentRoundWin, currentMult, bet) => {
    let finalPayout = currentRoundWin > 0 ? currentRoundWin * currentMult : 0;

    // Teto máximo prudente para evitar valores astronómicos (máximo 50x a aposta da rodada)
    const maxAllowedWin = bet * 50;
    if (finalPayout > maxAllowedWin) {
      finalPayout = maxAllowedWin;
    }

    if (finalPayout > 0) {
      updateBalanceOnDb(currentUser.id, balance - bet + finalPayout);
      setMessage(`🏆 VITÓRIA TOTAL! R$ ${finalPayout.toLocaleString('pt-BR')}`);
    } else {
      setMessage('Não premiado. Tente novamente na avalanche!');
    }
    setSpinning(false);
    setAnimatingCells([]);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      
      <div className="py-5 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-2">
        <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
          AVALANCHE DIPLOMÁTICA
        </h1>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Orbes de Multiplicadores & Cascata Ativa
        </p>
      </div>

      <main className="max-w-lg mx-auto p-4 space-y-4 pt-3">
        
        <div className="bg-gradient-to-b from-[#121216] to-[#0a0a0e] border-2 border-amber-500/50 rounded-3xl p-4 shadow-[0_0_25px_rgba(245,158,11,0.15)] space-y-3 text-center relative overflow-hidden">
          
          <div className="flex justify-between items-center bg-black/60 border border-amber-500/30 p-2.5 rounded-xl">
            <div className="text-left">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Multiplicador</span>
              <span className="text-amber-400 font-black text-sm">{accumulatedMultiplier}x</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Ganho Total</span>
              <span className="text-amber-400 font-black text-sm">R$ {totalWin.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className={`p-2.5 border text-center rounded-xl font-black text-xs uppercase tracking-wide h-10 flex items-center justify-center transition-all duration-300 ${totalWin > 0 ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-black/40 border-amber-500/30 text-amber-400'}`}>
            {message}
          </div>

          {/* Grelha 6x5 com efeitos refinados de animação */}
          <div className="grid grid-cols-6 gap-1.5 p-2 bg-black border-2 border-zinc-800 rounded-xl shadow-inner relative z-10">
            {grid.map((cell, i) => {
              const isWinning = animatingCells.includes(i);
              let cellStyle = "h-13 rounded-lg flex flex-col items-center justify-center transition-all duration-300 relative ";
              
              if (spinning) {
                cellStyle += "opacity-40 scale-95 blur-[1px] ";
              } else if (cell.id === 'orb') {
                cellStyle += "bg-gradient-to-br from-purple-600 via-indigo-800 to-black border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.7)] animate-bounce ";
              } else if (isWinning) {
                cellStyle += "bg-amber-500/30 border-2 border-amber-300 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.8)] z-20 ";
              } else {
                cellStyle += "bg-[#0c0c10] border-2 border-amber-500/40 shadow-[inset_0_0_5px_rgba(0,0,0,0.8)] ";
              }

              return (
                <div key={i} className={cellStyle}>
                  {cell.id === 'orb' ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-sm animate-pulse">💎</span>
                      <span className="text-[9px] font-black text-amber-200">+{cell.multValue}x</span>
                    </div>
                  ) : (
                    <img src={cell.icon} alt="símbolo" className="w-7 h-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform duration-200 hover:scale-110" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center bg-black/60 border border-amber-500/30 rounded-2xl p-2.5 relative z-10">
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
            className="w-full font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 relative z-10 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black border border-yellow-200"
          >
            {spinning ? '🌪️ AVALANCHE A ROLAR...' : '🌪️ GIRAR AVALANCHE'}
          </button>
          
        </div>
      </main>
    </div>
  );
}
