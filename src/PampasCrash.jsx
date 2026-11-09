import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function PampasCrash() {
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

  // Estados do Crash
  const [betAmount, setBetAmount] = useState(30000);
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'running', 'crashed', 'cashed'
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(1.00);
  const [winAmount, setWinAmount] = useState(0);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const animationRef = useRef(null);

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
    const startFlight = () => {
    if (!currentUser) return setIsAuthOpen(true);
    if (balance < betAmount) return alert("Saldo insuficiente para levantar voo!");

    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setGameState('running');
    setMultiplier(1.00);
    setWinAmount(0);

    // Gerar ponto de queda aleatório (ex: 5% chance de cair no 1.00x, senão sobe exponencialmente)
    const randomCrash = Math.random() < 0.08 ? 1.00 : parseFloat((1.01 + Math.random() * Math.random() * 15).toFixed(2));
    setCrashPoint(randomCrash);

    let currentM = 1.00;
    const startTime = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      currentM = parseFloat((1.00 + elapsed * 0.4 + elapsed * elapsed * 0.15).toFixed(2));

      if (currentM >= randomCrash) {
        setMultiplier(randomCrash);
        setGameState('crashed');
        cancelAnimationFrame(animationRef.current);
      } else {
        setMultiplier(currentM);
        animationRef.current = requestAnimationFrame(loop);
      }
    };

    animationRef.current = requestAnimationFrame(loop);
  };

  const cashOut = () => {
    if (gameState !== 'running') return;
    cancelAnimationFrame(animationRef.current);

    const prize = Math.floor(betAmount * multiplier);
    updateBalanceOnDb(currentUser.id, balance + prize);
    setWinAmount(prize);
    setGameState('cashed');
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
          🚀 PAMPAS CRASH 🚀
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">O Voo dos Campeões</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        <div className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] space-y-6 text-center">
          
          {/* Ecrã do Voo / Multiplicador */}
          <div className="relative h-48 bg-[#07070a] border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center shadow-inner overflow-hidden">
            {gameState === 'running' && (
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent animate-pulse pointer-events-none"></div>
            )}
            
            <span className={`text-5xl font-black tracking-wider transition-all ${
              gameState === 'crashed' ? 'text-red-500 scale-110' : 
              gameState === 'cashed' ? 'text-emerald-400 scale-110' : 
              'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]'
            }`}>
              {multiplier.toFixed(2)}x
            </span>

            <p className="text-xs text-zinc-400 font-bold uppercase mt-2">
              {gameState === 'waiting' && 'Pronto para descolar'}
              {gameState === 'running' && '✈️ Jato em voo...'}
              {gameState === 'crashed' && '💥 VOO CRASHOU!'}
              {gameState === 'cashed' && `🎉 RESGATADO COM SUCESSO!`}
            </p>

            {winAmount > 0 && gameState === 'cashed' && (
              <p className="text-emerald-400 font-black text-sm mt-1 animate-bounce">
                + R$ {winAmount.toLocaleString('pt-BR', {maximumFractionDigits: 0})}
              </p>
            )}
          </div>

          {/* Seleção de Aposta */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block">Valor da Aposta (R$)</label>
            <select disabled={gameState === 'running'} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-[#18181e] text-amber-400 border border-zinc-700 rounded-xl px-3 py-3 font-black outline-none text-sm">
              <option value={30000}>R$ 30k</option>
              <option value={100000}>R$ 100k</option>
              <option value={500000}>R$ 500k</option>
              <option value={1000000}>R$ 1M</option>
            </select>
          </div>

          {/* Botões de Ação do Jogo */}
          {gameState !== 'running' ? (
            <button onClick={startFlight} className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-base py-4 rounded-2xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95">
              🚀 INICIAR VOO
            </button>
          ) : (
            <button onClick={cashOut} className="w-full bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 text-black font-black text-lg py-4 rounded-2xl shadow-[0_5px_25px_rgba(16,185,129,0.5)] animate-bounce transition-all active:scale-95">
              💰 RESGATAR AGORA (R$ {(betAmount * multiplier).toLocaleString('pt-BR', {maximumFractionDigits: 0})})
            </button>
          )}

        </div>
      </main>

      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">Entrar no Pampas Crash</h2>
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
