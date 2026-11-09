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
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function App() {
  const [activeGame, setActiveGame] = useState('lobby'); 
  
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
  });const fetchUsersDb = async () => {
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
  }, [currentUser]);const goBack = () => setActiveGame('lobby');

  if (activeGame !== 'lobby') {
    return (
      <div className="min-h-screen bg-black">
        <div className="p-4 bg-black flex justify-between items-center border-b border-zinc-900 sticky top-0 z-50">
           <button onClick={goBack} className="px-4 py-2 bg-zinc-800 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/30 active:scale-95 transition-all">
             🏠 Voltar ao Lobby
           </button>
           <span className="text-amber-500 font-black text-sm">R$ {Number(balance).toLocaleString('pt-BR', {maximumFractionDigits: 0})}</span>
        </div>
        {activeGame === 'crash' && <PampasCrash />}
        {activeGame === 'towers' && <PampasTowers />}
        {activeGame === 'diamond' && <DiamondStriker onBack={goBack} />}
        {activeGame === 'hold' && <PampasHoldAndWin onBack={goBack} />}
        {activeGame === 'dice' && <PampasDice onBack={goBack} />}
        {activeGame === 'goal' && <PampasGoal onBack={goBack} />}
        {activeGame === 'hilo' && <PampasHiLo onBack={goBack} />}
        {activeGame === 'roleta' && <RoletaDiplomatica onBack={goBack} />}
        {activeGame === 'costarica' && <CassinoCostaRica onBack={goBack} />}
      </div>
    );
  }return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-md mx-auto space-y-6 text-center">
        <img src="/Grupopampas.png" alt="Grupo Pampas" className="h-20 mx-auto object-contain my-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 tracking-wider">CASSINO DA COSTA RICA</h1>
        <p className="text-sm text-zinc-400 font-bold">Saldo: <span className="text-emerald-400">R$ {Number(balance).toLocaleString('pt-BR', {maximumFractionDigits: 0})}</span></p>

        <div className="grid grid-cols-2 gap-3 pt-4 pb-8">
          <button onClick={() => setActiveGame('crash')} className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]">🚀 Pampas Crash</button>
          <button onClick={() => setActiveGame('towers')} className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]">🏰 Pampas Towers</button>
          <button onClick={() => setActiveGame('diamond')} className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]">💎 Diamond Striker</button>
          <button onClick={() => setActiveGame('hold')} className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]">🫎 Hold & Win</button>
          <button onClick={() => setActiveGame('dice')} className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]">🎲 Pampas Dice</button>
          <button onClick={() => setActiveGame('goal')} className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]">⚽ Pampas Goal</button>
          <button onClick={() => setActiveGame('hilo')} className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]">🃏 Pampas HiLo</button>
          <button onClick={() => setActiveGame('roleta')} className="p-4 bg-zinc-900 border border-amber-500/50 rounded-2xl text-amber-400 font-black text-sm active:scale-95 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]">🎡 Roleta Diplomática</button>
          <button onClick={() => setActiveGame('costarica')} className="col-span-2 p-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border border-amber-400 rounded-2xl text-black font-black text-sm active:scale-95 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.4)]">⚔️ Guerra das Américas</button>
        </div>
      </div>
    </div>
  );
}
