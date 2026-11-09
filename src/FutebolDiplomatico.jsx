import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function FutebolDiplomatico() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved).balance : 0;
  });

  const [activeTab, setActiveTab] = useState('elenco'); 
  const [myTeam, setMyTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [loadingSquad, setLoadingSquad] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setMyTeam({
        name: "Unidos FC", 
        stadium: "Campo do São Leopoldo",
        manager: currentUser.username,
        overall: 78
      });
    }
  }, [currentUser]);

  const fetchSquad = async (clubName) => {
    setLoadingSquad(true);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('current_club', clubName)
          .order('overall', { ascending: false });

        if (!error && data) {
          setSquad(data);
        }
      } catch (e) { console.error(e); }
    }
    setLoadingSquad(false);
  };

  useEffect(() => {
    if (myTeam) {
      fetchSquad(myTeam.name);
    }
  }, [myTeam]);

  // Elenco Teste - Aparece apenas se o banco de dados estiver vazio
  const mockSquad = [
    { id: 'm1', name: 'Lucas Velasques', position: 'VOL', overall: 88, class_tier: 'Diamante', age: 26, nationality: 'Brasil' },
    { id: 'm2', name: 'Tiarles', position: 'ZAG', overall: 81, class_tier: 'Ouro', age: 28, nationality: 'Brasil' },
    { id: 'm3', name: 'Eduardo', position: 'ATA', overall: 75, class_tier: 'Ouro', age: 24, nationality: 'Brasil' },
    { id: 'm4', name: 'Alex', position: 'GOL', overall: 68, class_tier: 'Prata', age: 30, nationality: 'Brasil' }
  ];

  const displaySquad = squad.length > 0 ? squad : mockSquad;

  // Lógica Visual das Cartas por Classe
  const getClassStyle = (tier, overall) => {
    const t = tier ? tier.toLowerCase() : (overall >= 85 ? 'diamante' : overall >= 70 ? 'ouro' : overall >= 60 ? 'prata' : 'bronze');
    switch(t) {
      case 'diamante': return 'from-cyan-300 via-blue-500 to-purple-600 text-white border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]';
      case 'ouro': return 'from-yellow-300 via-amber-500 to-orange-500 text-black border-yellow-300 shadow-[0_0_15px_rgba(252,211,77,0.4)]';
      case 'prata': return 'from-gray-100 via-gray-300 to-gray-500 text-black border-gray-300 shadow-[0_0_10px_rgba(209,213,219,0.3)]';
      case 'bronze': return 'from-orange-300 via-orange-600 to-amber-900 text-white border-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)]';
      default: return 'from-zinc-700 to-zinc-900 text-white border-zinc-500';
    }
  };return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased pb-24 selection:bg-emerald-500 selection:text-black">
      
      {/* Cabeçalho do Treinador */}
      <div className="w-full bg-gradient-to-b from-[#0a1210] via-[#050a08] to-[#050507] border-b border-emerald-500/30 px-4 py-6 text-center relative shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-100 to-emerald-500 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]">
          FUTEBOL DIPLOMÁTICO
        </h1>
        <p className="text-xs text-emerald-500/70 font-bold uppercase mt-1 tracking-widest">Manager Oficial 2026</p>
        
        {myTeam && (
          <div className="mt-4 inline-block bg-gradient-to-r from-[#0d1612] via-[#080d0a] to-[#0d1612] border border-emerald-500/40 px-6 py-3 rounded-2xl shadow-lg w-full max-w-[90%]">
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-2">Clube Atual</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl drop-shadow-md">🛡️</span>
                <div className="text-left">
                  <p className="text-white font-black text-xl leading-tight tracking-wide">{myTeam.name}</p>
                  <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Téc: <span className="text-emerald-400">{myTeam.manager}</span></p>
                </div>
              </div>
              <div className="text-center bg-black/40 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <span className="text-[9px] text-zinc-500 font-black block uppercase">OVR</span>
                <span className="text-lg text-emerald-400 font-black leading-none">{myTeam.overall}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu de Navegação Inferior */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0e]/95 backdrop-blur-md border-t border-emerald-500/30 p-2.5 z-40 flex justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.9)] pb-safe">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <span className="text-xl mb-1">🏠</span>
          <span className="text-[9px] font-black uppercase tracking-wider">Clube</span>
        </button>
        <button onClick={() => setActiveTab('elenco')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'elenco' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <span className="text-xl mb-1">👕</span>
          <span className="text-[9px] font-black uppercase tracking-wider">Elenco</span>
        </button>
        <button onClick={() => setActiveTab('taticas')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'taticas' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <span className="text-xl mb-1">📋</span>
          <span className="text-[9px] font-black uppercase tracking-wider">Táticas</span>
        </button>
        <button onClick={() => setActiveTab('mercado')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'mercado' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <span className="text-xl mb-1">🤝</span>
          <span className="text-[9px] font-black uppercase tracking-wider">Mercado</span>
        </button>
      </div><main className="max-w-md mx-auto p-4 space-y-4 text-center">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-[#0f1412] border border-emerald-900/30 rounded-3xl p-5 shadow-xl text-left">
              <h3 className="text-emerald-400 font-black text-sm uppercase mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Próxima Partida
              </h3>
              <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-emerald-900/40">
                <div className="text-center flex-1">
                  <span className="text-3xl block mb-2 drop-shadow-md">🛡️</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-wide leading-tight block">{myTeam?.name}</span>
                </div>
                <div className="text-center px-2 flex flex-col items-center">
                  <span className="text-xs text-zinc-500 font-black block mb-1">VS</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded font-bold">19:00</span>
                </div>
                <div className="text-center flex-1">
                  <span className="text-3xl block mb-2 opacity-80 filter grayscale">🦅</span>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wide leading-tight block">Rival FC</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-black font-black py-4 rounded-xl text-sm shadow-[0_5px_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 uppercase tracking-wider">
                ⚽ Entrar em Campo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f1412] border border-emerald-900/30 rounded-2xl p-4 shadow-xl text-left flex flex-col justify-center">
                <span className="text-emerald-500/70 text-[10px] font-black uppercase tracking-wider mb-1 block">Orçamento (Saldo)</span>
                <span className="text-white font-black text-sm">R$ {balance.toLocaleString('pt-BR')}</span>
              </div>
              <div className="bg-[#0f1412] border border-emerald-900/30 rounded-2xl p-4 shadow-xl text-left flex flex-col justify-center">
                <span className="text-emerald-500/70 text-[10px] font-black uppercase tracking-wider mb-1 block">Posição na Liga</span>
                <span className="text-emerald-400 font-black text-sm">1º Lugar 🏆</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'taticas' && (
          <div className="bg-[#0f1412] border border-emerald-900/30 rounded-3xl p-5 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-emerald-400 font-black text-sm uppercase">Quadro Tático</h3>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">4-3-3 Ofensivo</span>
            </div>
            
            <div className="bg-gradient-to-b from-green-900/40 to-green-950/40 border border-emerald-800/30 h-56 rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center shadow-inner">
               <div className="absolute inset-0 border-2 border-white/10 m-3 rounded pointer-events-none"></div>
               <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/10 pointer-events-none"></div>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/10 rounded-full pointer-events-none"></div>
               
               {/* Posições Mockadas em campo */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">GOL</div>
               <div className="absolute bottom-16 left-1/4 -translate-x-1/2 bg-zinc-400 text-black text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">ZAG</div>
               <div className="absolute bottom-16 right-1/4 translate-x-1/2 bg-yellow-400 text-black text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">ZAG</div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-400 text-black text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">VOL</div>
               <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">ATA</div>
            </div>
            
            <div className="space-y-2 text-left">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Instruções da Equipa</p>
              <button className="w-full bg-black/40 border border-emerald-900/40 text-zinc-300 text-xs py-2.5 rounded-lg flex justify-between px-4">
                <span>Estilo de Jogo</span> <span className="text-emerald-400 font-bold">Posse de Bola ▼</span>
              </button>
              <button className="w-full bg-black/40 border border-emerald-900/40 text-zinc-300 text-xs py-2.5 rounded-lg flex justify-between px-4">
                <span>Mentalidade</span> <span className="text-emerald-400 font-bold">Ofensiva ▼</span>
              </button>
            </div>
          </div>
        )}{activeTab === 'elenco' && (
          <div className="animate-fade-in text-left space-y-4">
            <div className="flex justify-between items-end px-1">
              <div>
                <h3 className="text-emerald-400 font-black text-lg uppercase tracking-wide">Plantel Principal</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Gerencie os seus atletas e atributos.</p>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-500/20">
                {displaySquad.length} Atletas
              </span>
            </div>

            {loadingSquad ? (
              <div className="space-y-3 mt-4">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 bg-[#0f1412] p-4 rounded-2xl border border-emerald-900/20">
                    <div className="rounded bg-black/50 h-12 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-black/50 rounded w-2/3"></div>
                      <div className="h-2 bg-black/50 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {squad.length === 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-center mb-4">
                    <p className="text-amber-400 text-xs font-bold">O banco de dados de jogadores ainda está vazio, então geramos um elenco teste para você ver o layout! Vá ao Mercado para contratar.</p>
                  </div>
                )}
                
                {displaySquad.map((player) => (
                  <div key={player.id} className={`relative overflow-hidden flex items-center bg-gradient-to-r ${getClassStyle(player.class_tier, player.overall)} p-0.5 rounded-2xl transition-all active:scale-95`}>
                    {/* Fundo do Card */}
                    <div className="flex items-center w-full bg-[#0a0a0e] rounded-[14px] p-3 gap-3 relative z-10">
                      
                      {/* Rating Box */}
                      <div className={`flex flex-col items-center justify-center min-w-[45px] h-[55px] rounded-lg bg-gradient-to-br ${getClassStyle(player.class_tier, player.overall)} border-none shadow-inner`}>
                        <span className="text-[10px] font-black opacity-80 uppercase leading-none mt-1">{player.position}</span>
                        <span className="text-xl font-black leading-none mt-0.5">{player.overall}</span>
                      </div>
                      
                      {/* Info do Jogador */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-black text-sm truncate uppercase tracking-wide">{player.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] bg-black/50 text-zinc-300 px-1.5 py-0.5 rounded uppercase font-bold">{player.nationality || 'Brasil'}</span>
                          <span className="text-[9px] bg-black/50 text-zinc-300 px-1.5 py-0.5 rounded font-bold">{player.age ? `${player.age} anos` : 'Idade N/A'}</span>
                        </div>
                      </div>
                      
                      {/* Selo da Classe */}
                      <div className="text-right">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60 block mb-0.5">Classe</span>
                        <span className="text-xs font-black uppercase drop-shadow-md" style={{
                           color: player.class_tier === 'Diamante' ? '#67e8f9' : 
                                  player.class_tier === 'Ouro' ? '#fcd34d' : 
                                  player.class_tier === 'Prata' ? '#d1d5db' : '#fdba74'
                        }}>
                          {player.class_tier || (player.overall >= 85 ? 'Diamante' : player.overall >= 70 ? 'Ouro' : player.overall >= 60 ? 'Prata' : 'Bronze')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mercado' && (
          <div className="bg-[#0f1412] border border-emerald-900/30 rounded-3xl p-5 shadow-xl animate-fade-in text-left">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🤝</span>
              <div>
                <h3 className="text-emerald-400 font-black text-sm uppercase">Mercado da Série A</h3>
                <p className="text-zinc-400 text-[10px] font-bold uppercase mt-0.5">Janela de Transferências Aberta</p>
              </div>
            </div>
            
            <div className="bg-black/40 p-4 rounded-2xl border border-emerald-900/40 mb-4 text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Seu Orçamento Disponível</p>
              <p className="text-emerald-400 font-black text-xl">R$ {balance.toLocaleString('pt-BR')}</p>
            </div>
            
            <button className="w-full bg-zinc-800 border border-emerald-500/30 text-emerald-400 font-black py-3.5 rounded-xl text-xs shadow-lg active:scale-95 transition-all">
              🔍 PESQUISAR JOGADORES
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
