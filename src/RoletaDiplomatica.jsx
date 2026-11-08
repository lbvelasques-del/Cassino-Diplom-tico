import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function RoletaDiplomatica() {
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
  const [selectedBetType, setSelectedBetType] = useState('gold'); // 'gold', 'oil', 'pampas', 'red', 'black'
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [winMessage, setWinMessage] = useState('');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Setores da Roleta
  const wheelSectors = [
    { id: 0, name: 'Zero Diplomático', type: 'green', mult: 14, icon: '👑' },
    { id: 1, name: 'Barra de Ouro', type: 'gold', mult: 5, icon: '🪙' },
    { id: 2, name: 'Petróleo', type: 'oil', mult: 3, icon: '🛢️' },
    { id: 3, name: 'Pampas', type: 'pampas', mult: 2, icon: '⭐' },
    { id: 4, name: 'Barra de Ouro', type: 'gold', mult: 5, icon: '🪙' },
    { id: 5, name: 'Setor Vermelho', type: 'red', mult: 2, icon: '🔴' },
    { id: 6, name: 'Petróleo', type: 'oil', mult: 3, icon: '🛢️' },
    { id: 7, name: 'Setor Preto', type: 'black', mult: 2, icon: '⚫' },
    { id: 8, name: 'Barra de Ouro', type: 'gold', mult: 5, icon: '🪙' },
    { id: 9, name: 'Pampas', type: 'pampas', mult: 2, icon: '⭐' },
    { id: 10, name: 'Setor Vermelho', type: 'red', mult: 2, icon: '🔴' },
    { id: 11, name: 'Setor Preto', type: 'black', mult: 2, icon: '⚫' }
  ];

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

  const spinWheel = () => {
    if (!currentUser) return setIsAuthOpen(true);
    if (balance < betAmount || spinning) return;

    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setSpinning(true);
    setWinMessage('');
    setLastResult(null);

    setTimeout(() => {
      const winningIndex = Math.floor(Math.random() * wheelSectors.length);
      const result = wheelSectors[winningIndex];
      setLastResult(result);
      setSpinning(false);

      // Verificar se venceu
      let isWinner = false;
      if (selectedBetType === 'red' && result.type === 'red') isWinner = true;
      else if (selectedBetType === 'black' && result.type === 'black') isWinner = true;
      else if (selectedBetType === 'gold' && result.type === 'gold') isWinner = true;
      else if (selectedBetType === 'oil' && result.type === 'oil') isWinner = true;
      else if (selectedBetType === 'pampas' && result.type === 'pampas') isWinner = true;

      if (isWinner) {
        const prize = betAmount * result.mult;
        updateBalanceOnDb(currentUser.id, balance - betAmount + prize);
        setWinMessage(`🎉 VITÓRIA! Acertaste em ${result.name} (+R$ ${prize.toLocaleString('pt-BR', {maximumFractionDigits: 0})})`);
      } else {
        setWinMessage(`❌ Não foi desta vez. Caiu em ${result.name}.`);
      }
    }, 2000);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const foundUser = usersDb.find(u => u.username.toLowerCase() === inputUsername.trim().toLowerCase() && u.password === inputPassword);
    if (foundUser) {
      setCurrentUser(foundUser);
      setBalance(Number(foundUser.balance));
      setIsAuthOpen(false);
      setInputUsername('');
      setInputPassword('');
    } else {
      setAuthError('Dados incorretos.');
    }
  };
                             return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      {/* Patrocinador Global no Topo */}
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-3">
        <img 
          src="/Grupopampas.png" 
          alt="Patrocinador Grupo Pampas" 
          className="h-14 w-auto max-w-[200px] object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
        />
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 drop-shadow-[0_5px_15px_rgba(245,158,11,0.6)]">
          🎡 ROLETA DIPLOMÁTICA 🎡
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">A Fortuna do Grupo Pampas</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        <div className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] space-y-5 text-center">
          
          {/* Ecrã de Resultado da Roleta */}
          <div className="relative h-40 bg-[#07070a] border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center shadow-inner overflow-hidden">
            <div className={`text-5xl transition-all duration-300 ${spinning ? 'animate-spin opacity-50' : 'scale-110 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]'}`}>
              {lastResult ? lastResult.icon : '🎡'}
            </div>
            <p className="text-sm font-black text-amber-400 mt-3">
              {spinning ? 'A RODAR A ROLETA...' : lastResult ? lastResult.name : 'FAÇA A SUA APOSTA'}
            </p>
            {lastResult && !spinning && (
              <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Multiplicador: {lastResult.mult}x</span>
            )}
          </div>

          {winMessage && (
            <div className={`p-3 text-center rounded-xl font-black text-xs uppercase tracking-wide animate-pulse ${winMessage.includes('VITÓRIA') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
              {winMessage}
            </div>
          )}

          {/* Seleção de Valor da Aposta */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block">Valor da Aposta (R$)</label>
            <select disabled={spinning} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-[#18181e] text-amber-400 border border-zinc-700 rounded-xl px-3 py-2.5 font-black outline-none text-xs">
              <option value={30000}>R$ 30k</option>
              <option value={100000}>R$ 100k</option>
              <option value={500000}>R$ 500k</option>
              <option value={1000000}>R$ 1M</option>
            </select>
          </div>

          {/* Escolha do Tipo de Aposta */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block">Escolha o Setor de Aposta</label>
            <div className="grid grid-cols-3 gap-2">
              <button disabled={spinning} onClick={() => setSelectedBetType('gold')} className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${selectedBetType === 'gold' ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>🪙 Ouro (5x)</button>
              <button disabled={spinning} onClick={() => setSelectedBetType('oil')} className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${selectedBetType === 'oil' ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>🛢️ Petróleo (3x)</button>
              <button disabled={spinning} onClick={() => setSelectedBetType('pampas')} className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${selectedBetType === 'pampas' ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>⭐ Pampas (2x)</button>
              <button disabled={spinning} onClick={() => setSelectedBetType('red')} className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${selectedBetType === 'red' ? 'bg-red-500 text-black border-red-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>🔴 Vermelho (2x)</button>
              <button disabled={spinning} onClick={() => setSelectedBetType('black')} className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${selectedBetType === 'black' ? 'bg-zinc-700 text-white border-zinc-500 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>⚫ Preto (2x)</button>
            </div>
          </div>

          {/* Botão de Rodar */}
          <button disabled={spinning} onClick={spinWheel} className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95">
            {spinning ? '🔄 A RODAR...' : '🎡 GIRAR A ROLETA'}
          </button>

        </div>
      </main>

      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">Entrar na Roleta Diplomática</h2>
            {authError && <div className="text-red-400 text-xs mb-3 font-semibold">{authError}</div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-4">
              <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Utilizador" />
              <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Senha" />
              <button type="submit" className="w-full bg-amber-500 text-black font-black py-3.5 rounded-xl text-sm shadow-lg">Confirmar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
