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
  const renderGameRoute = (GameComponent) => (
    <div>
      <div className="bg-black px-4 py-2.5 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-50">
        <button onClick={() => setActiveGame('lobby')} className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs border border-zinc-700 transition-all">
          🏠 Voltar ao Lobby
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
        </div>
      </div>
      <GameComponent />
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
  if (activeGame === 'quedadiplomatica') return renderGameRoute(QuedaDiplomatica);
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center py-1 cursor-pointer" onClick={() => setActiveGame('lobby')}>
          <img src="/Grupopampas.png" alt="Patrocinador" className="h-12 w-auto max-w-[180px] object-contain" />
        </div>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-[#0f0f12] border border-zinc-800 px-3 py-1.5 rounded-2xl shadow-inner">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[11px] text-amber-300 font-bold">{currentUser.username}</span>
                  {(currentUser.isAdmin || currentUser.username.toLowerCase() === 'lvelasques') && (
                    <button onClick={() => setIsAdminPanelOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow transition-all">ADMIN ⚙️</button>
                  )}
                </div>
                <p className="text-amber-400 font-black text-sm">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setIsUserPanelOpen(true)} className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs px-3 py-2 rounded-xl transition-all shadow-lg active:scale-95">⚙️ Perfil</button>
            </div>
          ) : (
            <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all">👤 Criar Conta / Entrar</button>
          )}
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

        {/* 10 Cartões de Jogos no Lobby */}
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

          <div onClick={() => setActiveGame('quedadiplomatica')} className="bg-gradient-to-b from-[#14141a] to-[#120a1a] border-2 border-purple-500/60 hover:border-purple-400 rounded-3xl p-5 cursor-pointer shadow-xl transition-all hover:scale-105 space-y-2">
            <h3 className="text-lg font-black text-purple-300">🌪️ QUEDA DIPLOMÁTICA</h3>
            <p className="text-xs text-zinc-300">Símbolos em cascata e orbes com multiplicadores progressivos até 5x.</p>
            <span className="inline-block bg-purple-600 text-white font-black text-xs px-5 py-2 rounded-xl mt-2">JOGAR AGORA ▶</span>
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
            {/* Modais */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">{authMode === 'login' ? 'Entrar no Portal' : 'Criar Conta Oficial'}</h2>
            {authError && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-4 font-semibold">{authError}</div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Nome de Utilizador</label>
                <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Senha</label>
                <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" />
              </div>
              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-semibold">Confirmar Senha</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" />
                </div>
              )}
              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3.5 rounded-xl text-sm">{authMode === 'login' ? 'Entrar' : 'Criar Conta'}</button>
            </form>
          </div>
        </div>
      )}

      {isUserPanelOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsUserPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 text-lg">✕</button>
            <h2 className="text-white font-bold text-lg mb-4">{currentUser.username} (#ID {currentUser.id})</h2>
            <div className="space-y-4">
              <form onSubmit={handleWithdrawSubmit} className="bg-[#0b0b0e] p-4 rounded-2xl space-y-2">
                <span className="text-xs text-amber-300 font-bold uppercase">Solicitar Saque</span>
                {withdrawSuccess ? <p className="text-emerald-400 text-xs font-bold">✅ Pedido enviado!</p> : (
                  <div className="flex gap-2">
                    <input type="number" placeholder="Valor (R$)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs" />
                    <button type="submit" className="bg-amber-500 text-black font-black px-4 rounded-xl text-xs">Pedir</button>
                  </div>
                )}
              </form>
              <button onClick={handleLogout} className="w-full bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs">🚪 Sair da Conta</button>
              <button onClick={handleSelfDelete} className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-xl text-xs">🗑️ Apagar Conta</button>
            </div>
          </div>
        </div>
      )}

      {isAdminPanelOpen && currentUser && (currentUser.isAdmin || currentUser.username.toLowerCase() === 'lvelasques') && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#141418] border-2 border-amber-500 w-full max-w-2xl rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-4">Painel Admin - Grupo Pampas</h2>
            <div className="space-y-4">
              <div className="bg-[#0b0b0e] border border-amber-500/40 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs text-amber-300 font-bold uppercase">Gestão de Saldo por ID</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="ID da Conta" value={adminTargetId} onChange={(e) => setAdminTargetId(e.target.value)} className="bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs" />
                  <input type="number" placeholder="Valor (R$)" value={adminDepositAmount} onChange={(e) => setAdminDepositAmount(e.target.value)} className="bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAdminBalanceUpdate('add')} className="flex-1 bg-emerald-500 text-black font-black py-2 rounded-xl text-xs">➕ Adicionar</button>
                  <button onClick={() => handleAdminBalanceUpdate('remove')} className="flex-1 bg-red-500 text-black font-black py-2 rounded-xl text-xs">➖ Remover</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
