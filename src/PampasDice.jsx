import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function PampasDice() {
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
  const [targetNumber, setTargetNumber] = useState(50); // Número alvo (1 a 98)
  const [condition, setCondition] = useState('above'); // 'above' ou 'below'
  const [rolling, setRolling] = useState(false);
  const [rolledResult, setRolledResult] = useState(null);
  const [message, setMessage] = useState('');

  // Cálculo dinâmico do multiplicador com base na probabilidade escolhida (margem de 1% de casa)
  const getWinChance = () => {
    return condition === 'above' ? (100 - targetNumber) : targetNumber;
  };

  const getMultiplier = () => {
    const chance = getWinChance();
    if (chance <= 0 || chance >= 100) return 1.00;
    return parseFloat((99 / chance).toFixed(2));
  };

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

  const rollDice = () => {
    if (!currentUser) return alert("Faça login para jogar!");
    if (balance < betAmount) return alert("Saldo insuficiente para lançar os dados!");
    if (rolling) return;

    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setRolling(true);
    setMessage('🎲 A lançar os dados diplomáticos...');
    setRolledResult(null);

    setTimeout(() => {
      // Sorteia um número decimal entre 0.00 e 100.00
      const result = parseFloat((Math.random() * 100).toFixed(2));
      setRolledResult(result);
      setRolling(false);

      let won = false;
      if (condition === 'above' && result > targetNumber) won = true;
      if (condition === 'below' && result < targetNumber) won = true;

      if (won) {
        const mult = getMultiplier();
        const prize = Math.floor(betAmount * mult);
        updateBalanceOnDb(currentUser.id, balance - betAmount + prize);
        setMessage(`🎯 VITÓRIA! Número sorteado: ${result} | Prémio: R$ ${prize.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`);
      } else {
        setMessage(`❌ DERROTA! Número sorteado: ${result}. Tente novamente.`);
      }
    }, 1000);
  };
    return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-3">
        <img 
          src="/Grupopampas.png" 
          alt="Patrocinador Grupo Pampas" 
          className="h-14 w-auto max-w-[200px] object-contain" 
        />
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500">
          🎲 PAMPAS DICE 🎲
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">A Probabilidade de Elite</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-4">
        <div className="bg-black border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
          
          {message && (
            <div className={`p-3 text-center rounded-xl font-black text-xs uppercase tracking-wide ${message.includes('VITÓRIA') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : message.includes('DERROTA') ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-black text-amber-400 border border-amber-500/40'}`}>
              {message}
            </div>
          )}

          {/* Ecrã de Resultado do Dado */}
          <div className="relative h-36 bg-black border-2 border-amber-500/50 rounded-2xl flex flex-col items-center justify-center p-4 shadow-inner">
            <span className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Resultado do Sorteio</span>
            <div className="text-4xl font-black text-amber-400 font-mono tracking-wider">
              {rolledResult !== null ? rolledResult.toFixed(2) : '---'}
            </div>
            <div className="mt-2 text-xs text-zinc-400 flex gap-4">
              <span>Multiplicador: <strong className="text-amber-300">{getMultiplier()}x</strong></span>
              <span>Chance: <strong className="text-amber-300">{getWinChance().toFixed(1)}%</strong></span>
            </div>
          </div>

          {/* Controles de Condição e Slider */}
          <div className="space-y-3 bg-black border border-amber-500/30 rounded-2xl p-4 text-left">
            <div className="flex gap-2">
              <button 
                onClick={() => setCondition('above')} 
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${condition === 'above' ? 'bg-amber-500 text-black border-amber-400' : 'bg-black text-zinc-400 border-zinc-800'}`}
              >
                ROLAR ACIMA DE
              </button>
              <button 
                onClick={() => setCondition('below')} 
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${condition === 'below' ? 'bg-amber-500 text-black border-amber-400' : 'bg-black text-zinc-400 border-zinc-800'}`}
              >
                ROLAR ABAIXO DE
              </button>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs font-bold text-zinc-300">
                <span>Alvo: {targetNumber}</span>
                <span className="text-amber-400 font-mono">{getMultiplier()}x</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="95" 
                value={targetNumber} 
                onChange={(e) => setTargetNumber(Number(e.target.value))} 
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Seleção de Aposta */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] text-zinc-400 font-bold uppercase block">Valor da Aposta (R$)</label>
            <select disabled={rolling} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-black text-amber-400 border border-zinc-800 rounded-xl px-3 py-2.5 font-black outline-none text-xs">
              <option value={30000}>R$ 30k</option>
              <option value={100000}>R$ 100k</option>
              <option value={500000}>R$ 500k</option>
              <option value={1000000}>R$ 1M</option>
            </select>
          </div>

          {/* Botão de Ação */}
          <button 
            disabled={rolling} 
            onClick={rollDice} 
            className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95"
          >
            {rolling ? '🎲 A LANÇAR...' : '🎲 LANÇAR DADO (APOSTAR)'}
          </button>

        </div>
      </main>
    </div>
  );
}
