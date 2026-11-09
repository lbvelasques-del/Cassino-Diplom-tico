// Forçar novo build limpo do Lobby - Queda Diplomática removido
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
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
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [activeGame, setActiveGame] = useState('lobby');
  const [balance, setBalance] = useState(150000);

  const renderGameRoute = (Comp) => (
    <div>
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-50">
        <button onClick={() => setActiveGame('lobby')} className="bg-zinc-800 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs border border-zinc-700">
          🏠 Voltar ao Lobby
        </button>
        <span className="text-xs text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
      </div>
      <Comp />
    </div>
  );

  if (activeGame === 'costarica') return renderGameRoute(CassinoCostaRica);
  if (activeGame === 'diamond') return renderGameRoute(DiamondStriker);
  if (activeGame === 'crash') return renderGameRoute(PampasCrash);
  if (activeGame === 'roleta') return renderGameRoute(RoletaDiplomatica);
  if (activeGame === 'goal') return renderGameRoute(PampasGoal);
  if (activeGame === 'towers') return renderGameRoute(PampasTowers);
  if (activeGame === 'hilo') return renderGameRoute(PampasHiLo);
  if (activeGame === 'dice') return renderGameRoute(PampasDice);
  if (activeGame === 'holdandwin') return renderGameRoute(PampasHoldAndWin);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center py-1 cursor-pointer" onClick={() => setActiveGame('lobby')}>
          <img src="/Grupopampas.png" alt="Patrocinador" className="h-12 w-auto max-w-[180px] object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#0f0f12] border border-zinc-800 px-3 py-1.5 rounded-2xl">
            <span className="text-amber-400 font-black text-sm">R$ {balance.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 pt-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
          <img src="/CassinaCR.png" alt="Logótipo Cassino" className="h-28 w-auto max-w-[320px] object-contain" />
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500">
            LOBBY DE ELITE
          </h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Escolha a sua plataforma de apostas unificadas</p>
        </div>

        {/* 9 Cartões de Jogos no Lobby */}
        <div className="space-y-4 pt-2">
          <div onClick={() => setActiveGame('costarica')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-amber-300">👑 CAÇA-NÍQUEL DOS PAMPAS</h3>
            <p className="text-xs text-zinc-300">O caça-níqueis oficial com roleta de bônus e símbolos diplomáticos.</p>
            <span className="inline-block bg-amber-500 text-black font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>

          <div onClick={() => setActiveGame('holdandwin')} className="bg-gradient-to-b from-[#14141a] to-[#260f0f] border-2 border-red-500/60 hover:border-red-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-red-400">🪙 O COFRE DO BARÃO</h3>
            <p className="text-xs text-zinc-300">Caça-níquel Hold & Win. Tranca 6 moedas para ativar os Respins e o Jackpot!</p>
            <span className="inline-block bg-red-600 text-white font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>

          <div onClick={() => setActiveGame('diamond')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-amber-300">⚔️ GUERRA DAS AMÉRICAS</h3>
            <p className="text-xs text-zinc-300">Estratégia tática e multiplicadores em campo minado.</p>
            <span className="inline-block bg-amber-500 text-black font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>

          <div onClick={() => setActiveGame('crash')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-amber-300">🚀 PAMPAS CRASH</h3>
            <p className="text-xs text-zinc-300">O voo dos campeões com multiplicadores exponenciais em tempo real.</p>
            <span className="inline-block bg-amber-500 text-black font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>

          <div onClick={() => setActiveGame('roleta')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-amber-300">🎡 ROLETA DIPLOMÁTICA</h3>
            <p className="text-xs text-zinc-300">A clássica roleta da fortuna adaptada à diplomacia do Grupo Pampas.</p>
            <span className="inline-block bg-amber-500 text-black font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>

          <div onClick={() => setActiveGame('goal')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-amber-300">⚽ PAMPAS GOAL</h3>
            <p className="text-xs text-zinc-300">A batalha defensiva de pênaltis com o goleiro de elite.</p>
            <span className="inline-block bg-amber-500 text-black font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>

          <div onClick={() => setActiveGame('towers')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-amber-300">🏰 PAMPAS TOWERS</h3>
            <p className="text-xs text-zinc-300">A escada de risco e portas multiplicadoras até ao topo da torre.</p>
            <span className="inline-block bg-amber-500 text-black font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>

          <div onClick={() => setActiveGame('hilo')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-amber-300">🃏 PAMPAS HI-LO</h3>
            <p className="text-xs text-zinc-300">A adivinhação rápida de cartas altas ou baixas em sequência.</p>
            <span className="inline-block bg-amber-500 text-black font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>

          <div onClick={() => setActiveGame('dice')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-amber-300">🎲 PAMPAS DICE</h3>
            <p className="text-xs text-zinc-300">O seletor de probabilidade e dados com multiplicador personalizado.</p>
            <span className="inline-block bg-amber-500 text-black font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-zinc-600 text-[10px]">
        Grupo Pampas © 2026 - Todos os direitos reservados.
      </footer>
    </div>
  );
}
