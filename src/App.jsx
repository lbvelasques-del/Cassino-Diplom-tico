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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem('pampas_users_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [{ id: 1, username: 'LVelasques', password: 'Lucas123!', balance: 150000, isAdmin: true }];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved) : { id: 1, username: 'LVelasques', balance: 150000 };
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
  }, [currentUser]);

  const goBack = () => setActiveGame('lobby');

  if (activeGame !== 'lobby') {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="p-4 bg-[#08080c] flex justify-between items-center border-b border-amber-500/40 sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
           <button onClick={goBack} className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-black rounded-xl text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all">
             🏠 Voltar ao Lobby
           </button>
           <div className="text-right">
             <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Saldo Atual</span>
             <span className="text-amber-400 font-black text-sm tracking-wide">R$ {Number(balance).toLocaleString('pt-BR', {maximumFractionDigits: 0})}</span>
           </div>
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
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      
      {/* Topo Estilizado com Logo e Perfil do Utilizador */}
      <div className="w-full bg-gradient-to-b from-[#121218] via-[#08080c] to-[#050507] border-b border-amber-500/30 px-4 py-6 text-center relative shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        
        {/* Botão de Perfil / Painel do Utilizador */}
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="absolute top-4 right-4 bg-gradient-to-r from-amber-600/30 to-amber-500/20 border border-amber-500/60 px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95 transition-all"
        >
          <span className="text-amber-400 text-xs font-black">👤 {currentUser?.username || 'Utilizador'}</span>
        </button>

        <img 
          src="/Grupopampas.png" 
          alt="Rede Pampas" 
          className="h-16 mx-auto object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.7)] mb-2" 
        />
        
        <div className="flex items-center justify-center space-x-2 my-1">
          <span className="text-amber-400 text-lg">👑</span>
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
            CASSINO DA COSTA RICA
          </h1>
          <span className="text-amber-400 text-lg">👑</span>
        </div>

        {/* Display de Saldo Estilo Imagem */}
        <div className="mt-4 inline-block bg-gradient-to-r from-[#1a1a24] via-[#111118] to-[#1a1a24] border-2 border-amber-500/70 px-8 py-2.5 rounded-full shadow-[0_0_25px_rgba(245,158,11,0.3)]">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mr-2">Saldo:</span>
          <span className="text-emerald-400 font-black text-base tracking-wider drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
            R$ {Number(balance).toLocaleString('pt-BR', {maximumFractionDigits: 0})}
          </span>
        </div>
      </div>

      {/* Grid de Jogos Secundários (Exatamente como na imagem de referência) */}
      <main className="max-w-md mx-auto p-4 space-y-3.5 pt-6">
        
        <div className="grid grid-cols-2 gap-3">
          
          <button onClick={() => setActiveGame('crash')} className="group relative p-3.5 bg-gradient-to-b from-[#181822] to-[#0d0d12] border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center space-x-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] active:scale-95 transition-all">
            <span className="text-2xl">🚀</span>
            <div className="text-left">
              <span className="text-xs font-black text-amber-300 block tracking-wide group-hover:text-amber-200">Pampas Crash</span>
            </div>
          </button>

          <button onClick={() => setActiveGame('towers')} className="group relative p-3.5 bg-gradient-to-b from-[#181822] to-[#0d0d12] border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center space-x-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] active:scale-95 transition-all">
            <span className="text-2xl">🏰</span>
            <div className="text-left">
              <span className="text-xs font-black text-amber-300 block tracking-wide group-hover:text-amber-200">Pampas Towers</span>
            </div>
          </button>

          <button onClick={() => setActiveGame('costarica')} className="group relative p-3.5 bg-gradient-to-b from-[#181822] to-[#0d0d12] border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center space-x-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] active:scale-95 transition-all">
            <span className="text-2xl">💎</span>
            <div className="text-left">
              <span className="text-xs font-black text-amber-300 block tracking-wide group-hover:text-amber-200">Guerra das Américas</span>
            </div>
          </button>

          <button onClick={() => setActiveGame('hold')} className="group relative p-3.5 bg-gradient-to-b from-[#181822] to-[#0d0d12] border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center space-x-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] active:scale-95 transition-all">
            <span className="text-2xl">🫎</span>
            <div className="text-left">
              <span className="text-xs font-black text-amber-300 block tracking-wide group-hover:text-amber-200">Hold & Win</span>
            </div>
          </button>

          <button onClick={() => setActiveGame('dice')} className="group relative p-3.5 bg-gradient-to-b from-[#181822] to-[#0d0d12] border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center space-x-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] active:scale-95 transition-all">
            <span className="text-2xl">🎲</span>
            <div className="text-left">
              <span className="text-xs font-black text-amber-300 block tracking-wide group-hover:text-amber-200">Pampas Dice</span>
            </div>
          </button>

          <button onClick={() => setActiveGame('goal')} className="group relative p-3.5 bg-gradient-to-b from-[#181822] to-[#0d0d12] border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center space-x-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] active:scale-95 transition-all">
            <span className="text-2xl">⚽</span>
            <div className="text-left">
              <span className="text-xs font-black text-amber-300 block tracking-wide group-hover:text-amber-200">Pampas Goal</span>
            </div>
          </button>

          <button onClick={() => setActiveGame('hilo')} className="group relative p-3.5 bg-gradient-to-b from-[#181822] to-[#0d0d12] border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center space-x-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] active:scale-95 transition-all">
            <span className="text-2xl">🃏</span>
            <div className="text-left">
              <span className="text-xs font-black text-amber-300 block tracking-wide group-hover:text-amber-200">Pampas HiLo</span>
            </div>
          </button>

          <button onClick={() => setActiveGame('roleta')} className="group relative p-3.5 bg-gradient-to-b from-[#181822] to-[#0d0d12] border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center space-x-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] active:scale-95 transition-all">
            <span className="text-2xl">🎡</span>
            <div className="text-left">
              <span className="text-xs font-black text-amber-300 block tracking-wide group-hover:text-amber-200">Roleta Diplomática</span>
            </div>
          </button>

        </div>

        {/* Botão Master / Destaque Inferior (Guerra das Américas) */}
        <div className="pt-2">
          <button 
            onClick={() => setActiveGame('costarica')}
            className="w-full p-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-2 border-amber-300 rounded-2xl text-black font-black text-sm flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95 transition-all"
          >
            <span className="text-xl">⚔️</span>
            <span className="tracking-widest uppercase">Guerra das Américas (Destaque Master)</span>
          </button>
        </div>

      </main>

      {/* Modal de Painel do Utilizador / Perfil */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121218] border-2 border-amber-500/60 w-full max-w-md rounded-3xl p-6 relative shadow-[0_0_40px_rgba(0,0,0,0.9)] space-y-4">
            <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold">✕</button>
            
            <div className="text-center border-b border-zinc-800 pb-3">
              <h2 className="text-amber-400 font-black text-xl">Painel do Utilizador</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Gestão de Conta e Saldo</p>
            </div>

            <div className="space-y-3 bg-[#08080c] p-4 rounded-2xl border border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-bold">Utilizador:</span>
                <span className="text-white font-black">{currentUser?.username || 'LVelasques'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-bold">Saldo Disponível:</span>
                <span className="text-emerald-400 font-black">R$ {Number(balance).toLocaleString('pt-BR', {maximumFractionDigits: 0})}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => {
                  const add = prompt("Valor a adicionar ao saldo (R$):", "50000");
                  if (add && !isNaN(add)) {
                    const newB = balance + Number(add);
                    setBalance(newB);
                    setCurrentUser(prev => ({ ...prev, balance: newB }));
                  }
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3 rounded-xl text-xs shadow-md active:scale-95 transition-all"
              >
                💳 Adicionar Créditos / Depósito
              </button>

              <button 
                onClick={() => setIsProfileOpen(false)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl text-xs active:scale-95 transition-all"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
