import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function DiamondStriker() {
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

  // Estados da Estratégia de Guerra
  const [betAmount, setBetAmount] = useState(30000);
  const [threatLevel, setThreatLevel] = useState(3); // Número de ameaças (bombas)
  const [grid, setGrid] = useState(Array(25).fill({ isThreat: false, revealed: false }));
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [territoriesWon, setTerritoriesWon] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [battleMessage, setBattleMessage] = useState('');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

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
      } catch (e) { console.warn("Supabase falhou, usando local"); }
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
  };const startBattle = () => {
    if (!currentUser) return setIsAuthOpen(true);
    if (balance < betAmount) return alert("Saldo insuficiente para iniciar a campanha!");

    updateBalanceOnDb(currentUser.id, balance - betAmount);
    
    // Posicionar ameaças militarmente pelo mapa de 25 setores
    let newGrid = Array(25).fill({ isThreat: false, revealed: false });
    let threatsPlaced = 0;
    while(threatsPlaced < threatLevel) {
      let rand = Math.floor(Math.random() * 25);
      if(!newGrid[rand].isThreat) {
        newGrid[rand] = { isThreat: true, revealed: false };
        threatsPlaced++;
      }
    }
    
    setGrid(newGrid);
    setGameActive(true);
    setGameOver(false);
    setTerritoriesWon(0);
    setCurrentMultiplier(1.00);
    setBattleMessage('');
  };

  const handleSectorClick = (index) => {
    if (!gameActive || grid[index].revealed) return;
    
    let newGrid = [...grid];
    newGrid[index] = { ...newGrid[index], revealed: true };
    setGrid(newGrid);

    if (newGrid[index].isThreat) {
      // EMBOSCADA!
      setGameActive(false);
      setGameOver(true);
      setBattleMessage('💥 EMBOSCADA GEOPOLÍTICA! Missão comprometida.');
      setGrid(newGrid.map(t => ({ ...t, revealed: true })));
    } else {
      // TERRITÓRIO CONQUISTADO COM SUCESSO
      const nextTerritories = territoriesWon + 1;
      setTerritoriesWon(nextTerritories);
      
      let m = 1;
      for (let i = 0; i < nextTerritories; i++) {
        m *= (25 - i) / (25 - threatLevel - i);
      }
      const nextMult = m * 0.95; 
      setCurrentMultiplier(nextMult);

      if (nextTerritories === 25 - threatLevel) {
        secureVictory(nextMult); 
      }
    }
  };

  const secureVictory = (overrideMult = currentMultiplier) => {
    if (!gameActive) return;
    const prize = betAmount * overrideMult;
    updateBalanceOnDb(currentUser.id, balance + prize);
    setGameActive(false);
    setGameOver(true);
    setBattleMessage(`🏆 VITÓRIA ABSOLUTA! Recompensa: R$ ${prize.toLocaleString('pt-BR', {maximumFractionDigits: 0})} (${overrideMult.toFixed(2)}x)`);
    setGrid(grid.map(t => ({ ...t, revealed: true })));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const trimmedUser = inputUsername.trim();

    if (authMode === 'register') {
      if (inputPassword !== confirmPassword) return setAuthError('As senhas não coincidem!');
      const existing = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase());
      if (existing) return setAuthError('Utilizador já em uso.');

      const newUser = { id: Date.now(), username: trimmedUser, password: inputPassword, balance: 150000, isAdmin: false };
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('users').insert([newUser]).select();
          if (!error && data) { setCurrentUser(data[0]); setBalance(Number(data[0].balance)); }
        } catch (err) { }
      } else {
        const updated = [...usersDb, newUser];
        setUsersDb(updated);
        localStorage.setItem('pampas_users_db', JSON.stringify(updated));
        setCurrentUser(newUser);
        setBalance(newUser.balance);
      }
      setIsAuthOpen(false); resetAuthForm();
    } else {
      const foundUser = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === inputPassword);
      if (foundUser) {
        setCurrentUser(foundUser); setBalance(Number(foundUser.balance)); setIsAuthOpen(false); resetAuthForm();
      } else setAuthError('Dados incorretos.');
    }
  };

  const resetAuthForm = () => { setInputUsername(''); setInputPassword(''); setConfirmPassword(''); setAuthError(''); };return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      {/* Cabeçalho de Destaque da Campanha */}
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-2">
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
          ⚔️ GUERRA DAS AMÉRICAS ⚔️
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Estratégia & Domínio Territorial - Grupo Pampas</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        <div className="bg-[#0f0f12] border border-amber-500/30 rounded-3xl p-4 shadow-2xl space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-zinc-400 font-bold uppercase">Poder de Multiplicação</span>
            <span className="text-amber-400 font-black text-xl">{currentMultiplier.toFixed(2)}x</span>
          </div>

          {/* Painel de Controlo de Tropas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Orçamento (R$)</label>
              <select disabled={gameActive} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-[#18181e] text-amber-400 border border-zinc-700 rounded-xl px-3 py-2.5 font-black outline-none text-xs">
                <option value={30000}>R$ 30k</option>
                <option value={100000}>R$ 100k</option>
                <option value={500000}>R$ 500k</option>
                <option value={1000000}>R$ 1M</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Ameaças no Mapa</label>
              <select disabled={gameActive} value={threatLevel} onChange={(e) => setThreatLevel(Number(e.target.value))} className="w-full bg-[#18181e] text-red-400 border border-zinc-700 rounded-xl px-3 py-2.5 font-black outline-none text-xs">
                <option value={1}>1 Setor Hostil</option>
                <option value={3}>3 Setores Hostis</option>
                <option value={5}>5 Setores Hostis</option>
                <option value={10}>10 Setores (HARD)</option>
              </select>
            </div>
          </div>

          {/* Tabuleiro de Operações 5x5 */}
          <div className="grid grid-cols-5 gap-2 my-3 p-3 bg-[#07070a] rounded-2xl border border-zinc-800/80 shadow-inner">
            {grid.map((tile, idx) => {
              let symbol = '';
              let tileStyle = "bg-[#14141a] hover:bg-[#1f1f28] cursor-pointer border-b-2 border-zinc-800 hover:border-amber-500/50";
              
              if (tile.revealed) {
                if (tile.isThreat) {
                  symbol = '💥';
                  tileStyle = "bg-red-500/20 border border-red-500/60 scale-95 opacity-90";
                } else {
                  symbol = '⭐';
                  tileStyle = "bg-amber-500/15 border border-amber-400 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]";
                }
              } else if (gameOver) {
                tileStyle = "bg-zinc-900 opacity-25 cursor-not-allowed";
              }

              return (
                <div 
                  key={idx} 
                  onClick={() => handleSectorClick(idx)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-300 select-none ${tileStyle}`}
                >
                  {symbol}
                </div>
              );
            })}
          </div>

          {battleMessage && (
            <div className={`p-3 text-center rounded-xl font-black text-xs uppercase tracking-wide animate-pulse ${battleMessage.includes('EMBOSCADA') ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
              {battleMessage}
            </div>
          )}

          {/* Botões de Comando */}
          {!gameActive ? (
            <button onClick={startBattle} className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
              🚀 LANÇAR CAMPANHA DE GUERRA
            </button>
          ) : (
            <button onClick={() => secureVictory()} className="w-full bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-bounce transition-all">
              💰 RESGATAR LUCRO (R$ {(betAmount * currentMultiplier).toLocaleString('pt-BR', {maximumFractionDigits: 0})})
            </button>
          )}
        </div>
      </main>

      {/* Modal de Autenticação Rápida */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">{authMode === 'login' ? 'Entrar na Campanha' : 'Criar Conta'}</h2>
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
