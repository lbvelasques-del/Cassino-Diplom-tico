import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import PampasCrash from './PampasCrash';
import PampasTowers from './PampasTowers';
import DiamondStriker from './DiamondStriker';
import PampasHoldAndWin from './PampasHoldAndWin';
import PampasDice from './PampasDice';
import PampasGoal from './PampasGoal';
import PampasHiLo from './PampasHiLo';
import RoletaDiplomatica from './RoletaDiplomatica';
import CassinoCostaRica from './CassinoCostaRica';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;export default function App() {
  const [activeGame, setActiveGame] = useState('lobby'); // 'lobby', 'crash', 'towers', etc.
  
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
  }, [currentUser]);// Renderização condicional garantindo que cada botão chama o jogo exato correto
  if (activeGame === 'crash') {
    return (
      <div>
        <button 
          onClick={() => setActiveGame('lobby')} 
          className="m-3 px-4 py-2 bg-zinc-800 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/30"
        >
          🏠 Voltar ao Lobby
        </button>
        <PampasCrash />
      </div>
    );
  }

  if (activeGame === 'towers') {
    return (
      <div>
        <button 
          onClick={() => setActiveGame('lobby')} 
          className="m-3 px-4 py-2 bg-zinc-800 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/30"
        >
          🏠 Voltar ao Lobby
        </button>
        <PampasTowers />
      </div>
    );
  }

  if (activeGame === 'diamond') return <DiamondStriker onBack={() => setActiveGame('lobby')} />;
  if (activeGame === 'hold') return <PampasHoldAndWin onBack={() => setActiveGame('lobby')} />;
  if (activeGame === 'dice') return <PampasDice onBack={() => setActiveGame('lobby')} />;
  if (activeGame === 'goal') return <PampasGoal onBack={() => setActiveGame('lobby')} />;
  if (activeGame === 'hilo') return <PampasHiLo onBack={() => setActiveGame('lobby')} />;
  if (activeGame === 'roleta') return <RoletaDiplomatica onBack={() => setActiveGame('lobby')} />;
  if (activeGame === 'costarica') return <CassinoCostaRica onBack={() => setActiveGame('lobby')} />;return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-md mx-auto space-y-6 text-center">
        <img src="/Grupopampas.png" alt="Grupo Pampas" className="h-16 mx-auto object-contain my-4" />
        <h1 className="text-2xl font-black text-amber-400">CASSINO DA COSTA RICA</h1>
        <p className="text-xs text-zinc-400">Saldo: R$ {Number(balance).toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <button 
            onClick={() => setActiveGame('crash')}
            className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-lg"
          >
            🚀 Pampas Crash
          </button>

          <button 
            onClick={() => setActiveGame('towers')}
            className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-lg"
          >
            🏰 Pampas Towers
          </button>
        </div>
      </div>
    </div>
  );
}
