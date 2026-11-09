import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Importação dos 9 Jogos de Elite
import CassinoCostaRica from './CassinoCostaRica';
import DiamondStriker from './DiamondStriker';
import PampasCrash from './PampasCrash';
import RoletaDiplomatica from './RoletaDiplomatica';
import PampasGoal from './PampasGoal';
import PampasTowers from './PampasTowers';
import PampasHiLo from './PampasHiLo';
import PampasDice from './PampasDice';
import PampasHoldAndWin from './PampasHoldAndWin';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';
const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function App() {
  const [activeGame, setActiveGame] = useState('lobby');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved).balance : 0;
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
          if (!error && data) {
            setBalance(Number(data.balance));
            localStorage.setItem('pampas_current_user', JSON.stringify(data));
          }
        } catch (e) {}
      }
    };
    fetchUserData();
    const interval = setInterval(fetchUserData, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);// Função para renderizar o jogo com o botão de voltar
  const renderGameRoute = (GameComponent) => (
    <div className="relative min-h-screen bg-black">
      <div className="absolute top-4 left-4 z-[100]">
        <button 
          onClick={() => setActiveGame('lobby')} 
          className="bg-zinc-900 border border-amber-500/50 hover:bg-amber-500 hover:text-black text-amber-500 font-black px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          <span>⬅️</span> VOLTAR AO LOBBY
        </button>
      </div>
      <GameComponent />
    </div>
  );

  // Roteamento dos Jogos
  if (activeGame === 'costarica') return renderGameRoute(CassinoCostaRica);
  if (activeGame === 'diamond') return renderGameRoute(DiamondStriker);
  if (activeGame === 'crash') return renderGameRoute(PampasCrash);
  if (activeGame === 'roleta') return renderGameRoute(RoletaDiplomatica);
  if (activeGame === 'goal') return renderGameRoute(PampasGoal);
  if (activeGame === 'towers') return renderGameRoute(PampasTowers);
  if (activeGame === 'hilo') return renderGameRoute(PampasHiLo);
  if (activeGame === 'dice') return renderGameRoute(PampasDice);
  if (activeGame === 'holdandwin') return renderGameRoute(PampasHoldAndWin);
  // LOBBY PRINCIPAL
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      {/* Topo / Header Global */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveGame('lobby')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
            P
          </div>
          <div>
            <h1 className="font-black tracking-wider text-amber-500 text-sm">GRUPO PAMPAS</h1>
            <p className="text-[9px] text-zinc-400 tracking-widest">PORTAL DE ELITE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <div className="text-right">
                <div className="text-[10px] text-amber-400 font-bold">{currentUser.username}</div>
                <div className="text-xs font-black text-white">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs font-bold text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-xl bg-amber-500/10">
              Visitante
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {/* Banner Principal */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-black border border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <img src="/Grupopampas.png" alt="Grupo Pampas" className="h-20 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-widest">PAMPAS PORTAL</h2>
          <p className="text-amber-400 text-xs sm:text-sm max-w-xl font-bold uppercase tracking-wider">A Fortuna e o Domínio à tua espera</p>
        </div>

        {/* Grelha de Jogos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            { id: 'costarica', name: 'Cassino Costa Rica', desc: 'Aposta & Sorte', icon: '🎰' },
            { id: 'diamond', name: 'Guerra das Américas', desc: 'Estratégia & Domínio', icon: '⚔️' },
            { id: 'crash', name: 'Pampas Crash', desc: 'O Voo dos Campeões', icon: '🚀' },
            { id: 'roleta', name: 'Roleta Diplomática', desc: 'A Fortuna Gira', icon: '🎡' },
            { id: 'holdandwin', name: 'O Cofre do Barão', desc: 'Hold & Win Slots', icon: '💰' },
            { id: 'goal', name: 'Pampas Goal', desc: 'Defesa de Elite', icon: '⚽' },
            { id: 'towers', name: 'Pampas Towers', desc: 'A Escada de Risco', icon: '🏰' },
            { id: 'hilo', name: 'Pampas Hi-Lo', desc: 'Adivinhação', icon: '🃏' },
            { id: 'dice', name: 'Pampas Dice', desc: 'Probabilidade', icon: '🎲' },
          ].map(game => (
            <div 
              key={game.id} 
              onClick={() => setActiveGame(game.id)} 
              className="bg-[#0a0a0e] hover:bg-[#14141a] border border-amber-500/20 hover:border-amber-500/80 p-5 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:-translate-y-1"
            >
              <div className="text-center">
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform drop-shadow-md">{game.icon}</span>
                <h3 className="font-black text-sm text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">{game.name}</h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-bold">{game.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-center text-[10px] font-black text-amber-500 group-hover:text-amber-300">
                <span className="tracking-widest">JOGAR </span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
