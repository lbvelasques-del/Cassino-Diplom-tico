import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function PampasGoal() {
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
  const [message, setMessage] = useState('');
  const [shooting, setShooting] = useState(false);
  const [keeperPos, setKeeperPos] = useState('center'); // 'left', 'center', 'right'
  const [ballPos, setBallPos] = useState('center'); // 'left', 'center', 'right'

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
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
    if (!currentUser) return setIsAuthOpen(true);
    if (balance < betAmount) return alert("Saldo insuficiente para entrar em campo!");

    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setGameActive(true);
    setKeeperPos('center');
    setBallPos('center');
    setMessage('🛡️ O adversário vai chutar! Escolha o canto para defender!');
  };

  const defendCorner = (userChoiceIndex) => {
    if (!gameActive || shooting) return;
    setShooting(true);

    const corners = ['left', 'center', 'right'];
    const userChosenSide = corners[userChoiceIndex];
    
    // O utilizador comanda o goleiro para o lado que apertou
    setKeeper
      return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      {/* Patrocinador Global no Topo */}
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-3">
        <img 
          src="/Grupopampas.png" 
          alt="Patrocinador Grupo Pampas" 
          className="h-14 w-auto max-w-[200px] object-contain" 
        />
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500">
          ⚽ PAMPAS GOAL ⚽
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">A Defesa de Elite</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        <div className="bg-black border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
          
          {/* Ecrã da Baliza */}
          <div className="relative h-52 bg-black border-2 border-amber-500/50 rounded-2xl flex flex-col items-center justify-center overflow-hidden p-4 shadow-inner">
            
            {/* Trave e Redes da Baliza */}
            <div className="absolute inset-x-4 top-3 h-36 border-t-4 border-x-4 border-zinc-700 rounded-t-xl flex justify-between px-3 pt-2 opacity-80 pointer-events-none">
              <span className="text-[10px] text-amber-400/80 font-bold uppercase">Canto Esq</span>
              <span className="text-[10px] text-amber-400/80 font-bold uppercase">Canto Dir</span>
            </div>

            {/* Imagem do Goleiro (Vai exatamente para onde o utilizador clicou) */}
            <div className={`absolute z-20 transition-all duration-300 ease-out ${
              keeperPos === 'left' ? '-translate-x-20 -translate-y-1 scale-105' : 
              keeperPos === 'right' ? 'translate-x-20 -translate-y-1 scale-105' : 
              'translate-x-0 translate-y-2'
            }`}>
              <img 
                src="/goleiro.png" 
                alt="Goleiro" 
                className="w-24 h-24 object-contain bg-transparent" 
                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'; }}
              />
            </div>

            {/* Bola (Chutada pela máquina de forma aleatória) */}
            {shooting && (
              <div className={`absolute z-30 transition-all duration-500 ${
                ballPos === 'left' ? '-translate-x-20 translate-y-6' : 
                ballPos === 'right' ? 'translate-x-20 translate-y-6' : 
                'translate-x-0 translate-y-8'
              }`}>
                <img src="/bola.png" alt="Bola" className="w-10 h-10 object-contain bg-transparent animate-spin" />
              </div>
            )}
          </div>

          {message && (
            <div className={`p-3 text-center rounded-xl font-black text-xs uppercase tracking-wide animate-pulse ${message.includes('DEFESA ESPETACULAR') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : message.includes('GOOOOL') ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-black text-amber-400 border border-amber-500/40'}`}>
              {message}
            </div>
          )}

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

          {/* Controles para o Utilizador defender */}
          {!gameActive ? (
            <button onClick={startGame} className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95">
              🛡️ PREPARAR DEFESA (INICIAR)
            </button>
          ) : (
            <div className="space-y-3">
              <label className="text-[10px] text-zinc-400 font-bold uppercase block">Para onde o Goleiro deve saltar?</label>
              <div className="grid grid-cols-3 gap-2">
                <button disabled={shooting} onClick={() => defendCorner(0)} className="py-3.5 bg-black border border-amber-500/60 hover:bg-amber-500 hover:text-black rounded-xl font-black text-xs text-amber-400 transition-all shadow-md">
                  ⬅️ ESQUERDA
                </button>
                <button disabled={shooting} onClick={() => defendCorner(1)} className="py-3.5 bg-black border border-amber-500/60 hover:bg-amber-500 hover:text-black rounded-xl font-black text-xs text-amber-400 transition-all shadow-md">
                  ⬆️ CENTRO
                </button>
                <button disabled={shooting} onClick={() => defendCorner(2)} className="py-3.5 bg-black border border-amber-500/60 hover:bg-amber-500 hover:text-black rounded-xl font-black text-xs text-amber-400 transition-all shadow-md">
                  ➡️ DIREITA
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal de Autenticação */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-black border border-amber-500/50 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">Entrar no Pampas Goal</h2>
            {authError && <div className="text-red-400 text-xs mb-3 font-semibold">{authError}</div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-4">
              <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Utilizador" />
              <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Senha" />
              <button type="submit" className="w-full bg-amber-500 text-black font-black py-3.5 rounded-xl text-sm shadow-lg">Confirmar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  }
  
