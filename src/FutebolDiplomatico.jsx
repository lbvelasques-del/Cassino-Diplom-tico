import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function FutebolDiplomatico() {
  // Carregamento de utilizador com bloco try-catch de segurança (evita erros se o cache falhar)
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_current_user')) || null; } 
    catch { return null; }
  });

  const [balance, setBalance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_current_user'))?.balance || 0; } 
    catch { return 0; }
  });

  // Estados Base
  const [activeTab, setActiveTab] = useState('home'); 
  const [myTeam, setMyTeam] = useState(null);
  const [squad, setSquad] = useState([]); // Garante que começa sempre como array vazio
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  
  // Estados de Amistosos
  const [selectedFriendlyOpponent, setSelectedFriendlyOpponent] = useState('');
  const [isSimulatingFriendly, setIsSimulatingFriendly] = useState(false);
  const [lastMatchReport, setLastMatchReport] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_last_match_report')) || null; } 
    catch { return null; }
  });

  // Partida Oficial Falsa/Aguardando (ADM)
  const [upcomingOfficialMatch] = useState({
    opponent: "Internacional",
    isHome: true,
    stadium: "Estádio Municipal",
    round: 1
  });

  useEffect(() => {
    if (currentUser) {
      setMyTeam({
        name: currentUser.team || "Clube Livre", 
        manager: currentUser.username,
        overall: 75
      });
    }
  }, [currentUser]);

  // Função para buscar dados da liga de forma segura
  const fetchGameData = async (clubName) => {
    if (!clubName) return;
    
    try {
      const { data: playersData } = await supabase.from('players').select('*').eq('current_club', clubName).order('overall', { ascending: false });
      if (playersData) setSquad(playersData);

      const { data: allPlayers } = await supabase.from('players').select('current_club, overall');
      if (allPlayers) {
        const clubsMap = {};
        allPlayers.forEach(p => {
          if (!p.current_club) return;
          if (!clubsMap[p.current_club]) clubsMap[p.current_club] = { name: p.current_club, totalOvr: 0, count: 0 };
          clubsMap[p.current_club].totalOvr += p.overall;
          clubsMap[p.current_club].count += 1;
        });
        const clubsList = Object.values(clubsMap).map(c => ({
          ...c, avgOvr: Math.round(c.totalOvr / c.count) || 75
        })).filter(c => c.name !== clubName);
        
        setAllClubs(clubsList);
        if (clubsList.length > 0 && !selectedFriendlyOpponent) {
          setSelectedFriendlyOpponent(clubsList[0].name);
        }
      }
    } catch (error) {
      console.error("Erro no carregamento:", error);
    }
  };

  useEffect(() => {
    if (myTeam?.name) fetchGameData(myTeam.name);
  }, [myTeam]);

  // 🔥 A FUNÇÃO SALVA-VIDAS QUE IMPEDE A TELA PRETA 🔥
  // Se o jogador não existir, retorna um "jogador vazio" em vez de quebrar o jogo
  const getPlayer = (idx) => {
    if (squad && squad[idx]) return squad[idx];
    return { name: "Vazio", overall: 75, position: "N/A" };
  };

  // Motor de Amistosos (R$ 500k)
  const handlePlayFriendly = async () => {
    const FRIENDLY_COST = 500000;

    if (balance < FRIENDLY_COST) {
      alert("Saldo insuficiente! Custa R$ 500.000 organizar um amistoso.");
      return;
    }
    if (!selectedFriendlyOpponent) {
      alert("Selecione um adversário para o amistoso!");
      return;
    }

    const newBalance = balance - FRIENDLY_COST;
    setBalance(newBalance);
    
    try {
      const savedUser = JSON.parse(localStorage.getItem('pampas_current_user')) || currentUser;
      localStorage.setItem('pampas_current_user', JSON.stringify({ ...savedUser, balance: newBalance }));
      await supabase.from('users').update({ balance: newBalance }).eq('username', currentUser.username);
    } catch (e) {
      console.error(e);
    }

    setIsSimulatingFriendly(true);

    setTimeout(() => {
      const opponentClub = allClubs.find(c => c.name === selectedFriendlyOpponent);
      const opponentOvr = opponentClub?.avgOvr || 75;
      const myOvr = myTeam?.overall || 75;

      const myGoals = Math.floor(Math.random() * 3) + (myOvr >= opponentOvr ? 1 : 0);
      const opponentGoals = Math.floor(Math.random() * 2) + (opponentOvr > myOvr ? 1 : 0);

      const report = {
        type: 'Amistoso',
        homeTeam: myTeam?.name || "Meu Clube",
        awayTeam: selectedFriendlyOpponent,
        homeGoals: myGoals,
        awayGoals: opponentGoals,
        possession: Math.floor(Math.random() * 20) + 40,
        shotsHome: Math.floor(Math.random() * 8) + myGoals + 2,
        shotsAway: Math.floor(Math.random() * 6) + opponentGoals + 1,
        tacticalSummary: myGoals > opponentGoals 
          ? "A equipe dominou o meio-campo com excelente controle tático."
          : myGoals === opponentGoals 
          ? "Partida travada, as duas defesas sobressaíram sobre os ataques."
          : "Faltou cobertura defensiva, o adversário encontrou muitos espaços.",
        date: new Date().toLocaleDateString('pt-BR')
      };

      setLastMatchReport(report);
      localStorage.setItem('pampas_last_match_report', JSON.stringify(report));
      setIsSimulatingFriendly(false);
      alert(`Fim de Jogo! ${myTeam?.name} ${myGoals} x ${opponentGoals} ${selectedFriendlyOpponent}`);
    }, 2000);
  };return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased pb-28 selection:bg-emerald-500 selection:text-black">
      {/* Cabeçalho do Simulador */}
      <div className="w-full bg-gradient-to-b from-[#0a1210] via-[#050a08] to-[#050507] border-b border-emerald-500/30 px-4 py-5 text-center relative shadow-2xl">
        <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-100 to-emerald-500 uppercase">
          FUTEBOL DIPLOMÁTICO
        </h1>
        <p className="text-[9px] text-emerald-500/70 font-black uppercase mt-0.5 tracking-widest">Liga Oficial 2026</p>
        
        {myTeam && (
          <div className="mt-3 inline-block bg-[#0d1612] border border-emerald-500/40 px-5 py-2.5 rounded-2xl shadow-lg w-full max-w-[95%]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <div className="text-left">
                  <p className="text-white font-black text-sm leading-tight uppercase">{myTeam.name}</p>
                  <p className="text-[9px] text-zinc-400 font-bold">Manager: <span className="text-emerald-400">{myTeam.manager}</span></p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-zinc-500 font-black block uppercase tracking-wider">Cofre do Clube</span>
                <span className="text-xs text-emerald-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navegação Inferior */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0e]/95 backdrop-blur-md border-t border-emerald-500/30 p-2 z-40 shadow-2xl overflow-x-auto hide-scrollbar">
        <div className="flex gap-1.5 min-w-max px-2">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'taticas', label: 'Táticas', icon: '📋' },
            { id: 'elenco', label: 'Elenco', icon: '👕' },
            { id: 'clubes', label: 'Série A', icon: '📊' },
            { id: 'mercado', label: 'Mercado', icon: '🤝' },
            { id: 'inbox', label: 'Inbox', icon: '📩' },
            { id: 'jornal', label: 'Gazeta', icon: '📰' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[58px] transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-base mb-0.5">{tab.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 text-center">
        
        {/* ABA: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4 text-left animate-fade-in">
            
            {/* Próxima Partida Oficial */}
            <div className="bg-[#0f1412] border border-emerald-900/40 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  Rodada {upcomingOfficialMatch.round} • Brasileirão
                </span>
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                  {upcomingOfficialMatch.isHome ? "🏠 Em Casa" : "✈️ Fora de Casa"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-2 border-y border-emerald-900/20 my-2">
                <div className="text-center flex-1">
                  <p className="text-2xl mb-1">🛡️</p>
                  <p className="text-xs font-black text-white uppercase">{myTeam?.name}</p>
                </div>
                <div className="text-center px-3">
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">VS</span>
                  <p className="text-[8px] text-zinc-400 mt-1 font-bold">{upcomingOfficialMatch.stadium}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl mb-1">⚽</p>
                  <p className="text-xs font-black text-white uppercase">{upcomingOfficialMatch.opponent}</p>
                </div>
              </div>

              <p className="text-[9px] text-zinc-500 text-center font-semibold mt-2">
                Aguardando simulação da rodada oficial pelo Administrador.
              </p>
            </div>

            {/* Central de Amistosos (R$ 500k) */}
            <div className="bg-[#0f1412] border border-emerald-900/40 rounded-3xl p-5 shadow-xl">
              <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>⚔️ Organizar Amistoso</span>
                <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Custo: R$ 500k</span>
              </h3>
              <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed">
                Realize testes táticos imediatos contra clubes da Série A. O valor é debitado no ato.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Adversário:</label>
                  <select 
                    value={selectedFriendlyOpponent} 
                    onChange={(e) => setSelectedFriendlyOpponent(e.target.value)}
                    className="w-full bg-black border border-emerald-900/60 text-white text-xs p-3 rounded-xl outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                  >
                    {allClubs.map(c => (
                      <option key={c.name} value={c.name}>{c.name} (Média OVR: {c.avgOvr})</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handlePlayFriendly} 
                  disabled={isSimulatingFriendly}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 text-black font-black py-3.5 rounded-xl text-xs shadow-lg uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isSimulatingFriendly ? "Simulando Amistoso..." : "Jogar Amistoso (R$ 500.000)"}
                </button>
              </div>
            </div>

            {/* Relatório Avançado da Última Partida */}
            {lastMatchReport && (
              <div className="bg-[#0f1412] border border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-900/30 pb-2">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    📊 Relatório • {lastMatchReport.type}
                  </h3>
                  <span className="text-[9px] text-zinc-400 font-bold">{lastMatchReport.date}</span>
                </div>

                <div className="bg-black/40 p-3 rounded-2xl text-center border border-emerald-900/20">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-1">Placar Final</p>
                  <p className="text-xl font-black text-white">
                    {lastMatchReport.homeTeam} <span className="text-emerald-400">{lastMatchReport.homeGoals}</span> x <span className="text-emerald-400">{lastMatchReport.awayGoals}</span> {lastMatchReport.awayTeam}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                  <div className="bg-black/30 p-2 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 font-black block uppercase">Posse</span>
                    <span className="text-emerald-400 font-bold text-xs">{lastMatchReport.possession}%</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 font-black block uppercase">Finalizações</span>
                    <span className="text-white font-bold text-xs">{lastMatchReport.shotsHome} vs {lastMatchReport.shotsAway}</span>
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl">
                  <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mb-1">Análise do Técnico:</p>
                  <p className="text-[10px] text-zinc-300 leading-relaxed italic">{lastMatchReport.tacticalSummary}</p>
                </div>
              </div>
            )}

          </div>
        )}{/* ABA: TÁTICAS (PRANCHETA INTERATIVA & SUBSTITUIÇÕES) */}
        {activeTab === 'taticas' && (
          <div className="space-y-4 text-left animate-fade-in">
            {/* Topo: Seleção de Formação Tática */}
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl flex items-center justify-between">
              <div>
                <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Prancheta Tática 📋</h3>
                <p className="text-[9px] text-zinc-400 font-semibold">Defina o esquema e faça as substituições</p>
              </div>
              <select className="bg-black border border-emerald-500/40 text-xs text-white p-2 rounded-xl outline-none font-bold cursor-pointer">
                <option value="4-3-3">4-3-3 Ofensivo</option>
                <option value="4-4-2">4-4-2 Clássico</option>
                <option value="3-5-2">3-5-2 Domínio</option>
                <option value="4-2-3-1">4-2-3-1 Equilibrado</option>
              </select>
            </div>

            {/* O Campo Tático Visual (11 Titulares Protegidos com getPlayer) */}
            <div className="relative w-full h-[420px] bg-gradient-to-b from-emerald-950 via-green-900 to-emerald-950 rounded-3xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl p-2">
              {/* Linhas do Campo */}
              <div className="absolute inset-2 border border-white/20 rounded-2xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-16 border-b border-x border-white/20 pointer-events-none"></div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-16 border-t border-x border-white/20 pointer-events-none"></div>

              {/* 11 Posicionamentos no Relvado */}
              <div className="relative w-full h-full">
                {/* Guarda-Redes (Índice 0) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-9 h-9 bg-amber-500/90 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black shadow-lg text-black">
                    {getPlayer(0).overall}
                  </div>
                  <span className="text-[8px] font-black text-white bg-black/70 px-1.5 py-0.5 rounded mt-0.5 max-w-[70px] truncate">
                    {getPlayer(0).name}
                  </span>
                </div>

                {/* Linha Defensiva (Índices 1, 2, 3, 4) */}
                <div className="absolute bottom-20 left-4 flex flex-col items-center">
                  <div className="w-8 h-8 bg-emerald-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(1).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(1).name}</span>
                </div>
                <div className="absolute bottom-16 left-1/3 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 bg-emerald-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(2).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(2).name}</span>
                </div>
                <div className="absolute bottom-16 right-1/3 translate-x-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 bg-emerald-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(3).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(3).name}</span>
                </div>
                <div className="absolute bottom-20 right-4 flex flex-col items-center">
                  <div className="w-8 h-8 bg-emerald-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(4).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(4).name}</span>
                </div>

                {/* Meio-Campo (Índices 5, 6, 7) */}
                <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 bg-cyan-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(5).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(5).name}</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 bg-cyan-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(6).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(6).name}</span>
                </div>
                <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 bg-cyan-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(7).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(7).name}</span>
                </div>

                {/* Ataque (Índices 8, 9, 10) */}
                <div className="absolute top-16 left-10 flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(8).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(8).name}</span>
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-9 h-9 bg-red-600 border-2 border-amber-400 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg">
                    {getPlayer(9).overall}
                  </div>
                  <span className="text-[8px] font-black text-amber-300 bg-black/80 px-1.5 py-0.5 rounded mt-0.5 max-w-[65px] truncate">{getPlayer(9).name}</span>
                </div>
                <div className="absolute top-16 right-10 flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-600 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md">
                    {getPlayer(10).overall}
                  </div>
                  <span className="text-[7px] font-bold text-zinc-300 bg-black/70 px-1 rounded mt-0.5 max-w-[50px] truncate">{getPlayer(10).name}</span>
                </div>
              </div>
            </div>

            {/* Banco de Reservas */}
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-emerald-400 font-black text-xs uppercase tracking-wider">
                  🪑 Banco de Reservas ({Math.max(0, squad.length - 11)})
                </h4>
                <span className="text-[9px] text-zinc-500 font-bold uppercase">Total: {squad.length} Atletas</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 hide-scrollbar">
                {squad.slice(11).map((reserve, idx) => (
                  <div key={reserve.id || idx} className="bg-black/50 border border-zinc-800 p-2.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-zinc-800 text-zinc-400 font-black px-2 py-0.5 rounded">RES</span>
                      <div>
                        <p className="text-xs text-white font-bold uppercase">{reserve.name}</p>
                        <p className="text-[9px] text-zinc-500">Pos: {reserve.position || "SUBL"} | OVR: <span className="text-emerald-400 font-bold">{reserve.overall}</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Substituição efetuada! ${reserve.name} pronto para entrar.`)} 
                      className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-3 py-1.5 rounded-xl hover:bg-emerald-600 hover:text-black transition-colors cursor-pointer"
                    >
                      SUBSTITUIR
                    </button>
                  </div>
                ))}
                {squad.length <= 11 && (
                  <p className="text-[10px] text-zinc-500 text-center py-4">Sem reservas no momento. Adquira atletas no Mercado!</p>
                )}
              </div>
            </div>
          </div>
        )}{/* ABA: ELENCO (PLANTEL COMPLETO) */}
        {activeTab === 'elenco' && (
          <div className="text-left space-y-3 animate-fade-in">
            <div className="flex justify-between items-center bg-[#0f1412] p-4 rounded-2xl border border-emerald-900/40 shadow-lg">
              <div>
                <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Plantel Titular e Reservas</h3>
                <p className="text-[9px] text-zinc-400 font-bold">Base Nivelada: <span className="text-emerald-400">75 OVR</span></p>
              </div>
              <span className="text-xs font-black text-white bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800">
                {squad.length} Atletas
              </span>
            </div>

            {squad.map((player, idx) => (
              <div key={player.id || idx} className="bg-[#0f1412] border border-emerald-900/30 p-3.5 rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-emerald-500 w-5">#{idx + 1}</span>
                  <div>
                    <p className="text-white font-black text-xs uppercase tracking-wide">
                      {player.name} <span className="text-[9px] text-amber-400 ml-1">({player.position || 'MC'})</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Passe: <span className="text-emerald-400 font-bold">R$ {((player.overall || 75) * 350000).toLocaleString('pt-BR')}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-zinc-500 font-black uppercase block">Overall</span>
                  <span className="text-sm font-black text-emerald-400">{player.overall || 75}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA: SÉRIE A (CLASSIFICAÇÃO E RANKING DE MERCADO) */}
        {activeTab === 'clubes' && (
          <div className="text-left space-y-4 animate-fade-in">
            {/* Tabela do Brasileirão */}
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl">
              <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider mb-1">
                Tabela do Brasileirão 2026 🏆
              </h3>
              <p className="text-[9px] text-zinc-400 mb-3 font-semibold">Regras: V: 3pts | E: 1pt | D: 0pts</p>

              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-[10px] text-left">
                  <thead>
                    <tr className="border-b border-emerald-900/40 text-zinc-500 uppercase font-black">
                      <th className="py-2">Clube</th>
                      <th className="py-2 text-center">P</th>
                      <th className="py-2 text-center">J</th>
                      <th className="py-2 text-center">V</th>
                      <th className="py-2 text-center">E</th>
                      <th className="py-2 text-center">SG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {allClubs.map((club, idx) => (
                      <tr key={club.name} onClick={() => setSelectedClub(club)} className="hover:bg-emerald-950/30 cursor-pointer transition-colors">
                        <td className="py-2.5 font-black text-white uppercase flex items-center gap-1.5">
                          <span className="text-[8px] text-emerald-500 font-bold w-3">{idx + 1}</span>
                          {club.name}
                        </td>
                        <td className="py-2.5 text-center font-black text-emerald-400">{((allClubs.length - idx) * 3) + 12}</td>
                        <td className="py-2.5 text-center text-zinc-400">10</td>
                        <td className="py-2.5 text-center text-zinc-300">{(allClubs.length - idx) + 3}</td>
                        <td className="py-2.5 text-center text-zinc-400">3</td>
                        <td className="py-2.5 text-center font-bold text-emerald-400">+{15 - idx * 2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ranking de Valor de Mercado */}
            <div className="bg-[#0f1412] border border-amber-900/30 p-4 rounded-3xl shadow-xl space-y-3">
              <h3 className="text-amber-400 font-black text-xs uppercase tracking-wider">
                Ranking de Valor de Mercado 💰
              </h3>
              <div className="space-y-2">
                {allClubs.map((club, idx) => (
                  <div key={idx} onClick={() => setSelectedClub(club)} className="bg-black/50 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition-all">
                    <div>
                      <p className="text-white font-black text-xs uppercase">{club.name}</p>
                      <p className="text-[9px] text-zinc-400">Manager: <span className="text-amber-400">Técnico Oficial</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-zinc-500 font-black block uppercase">Valor Elenco</span>
                      <span className="text-xs text-emerald-400 font-black">R$ {((club.avgOvr || 75) * 4500000).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAINEL DE ADM DENTRO DO FUTEBOL */}
        {currentUser?.username?.toLowerCase() === 'lvelasques' && (
          <div className="bg-[#140a0a] border border-red-900/50 p-4 rounded-3xl text-left space-y-3 my-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-red-900/40 pb-2">
              <h3 className="text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                <span>⚡ Painel ADM (Futebol)</span>
              </h3>
              <span className="text-[8px] bg-red-950 text-red-400 font-black px-2 py-0.5 rounded border border-red-800">MASTER</span>
            </div>

            <div className="space-y-2 pt-1">
              <button 
                onClick={() => alert("Rodada Oficial nº 1 Simulada com sucesso! Tabela de pontos atualizada.")} 
                className="w-full bg-red-600 hover:bg-red-500 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                🎮 Simular Rodada Oficial da Liga
              </button>
            </div>
          </div>
        )}

        {/* ABA: MERCADO */}
        {activeTab === 'mercado' && (
          <div className="text-left space-y-4 animate-fade-in">
            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Mercado de Transferências 🤝</h3>
            <div className="bg-[#0f1412] border border-emerald-900/30 p-4 rounded-3xl text-center space-y-2">
              <p className="text-xs text-white font-bold">Nenhum jogador listado no leilão no momento.</p>
              <p className="text-[10px] text-zinc-400">Acesse a aba "Série A" para visualizar os clubes.</p>
            </div>
          </div>
        )}

        {/* ABA: INBOX */}
        {activeTab === 'inbox' && (
          <div className="text-left space-y-4 animate-fade-in">
            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Caixa de Entrada 📩</h3>
            <div className="bg-[#0f1412] border border-emerald-900/30 p-4 rounded-3xl text-center">
              <p className="text-xs text-zinc-500 py-4">Nenhuma mensagem ou proposta pendente.</p>
            </div>
          </div>
        )}

        {/* ABA: GAZETA */}
        {activeTab === 'jornal' && (
          <div className="space-y-4 text-left animate-fade-in">
            <div className="bg-[#e5e5e5] text-black p-5 rounded-sm border-t-8 border-black font-serif shadow-xl relative overflow-hidden">
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-3xl font-black uppercase tracking-tighter">A Gazeta</h1>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Edição Oficial da Liga • 2026</p>
              </div>
              <article>
                <span className="bg-black text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider mb-1 inline-block">Destaque</span>
                <h2 className="text-lg font-black leading-tight mb-1">Equipes prontas para o início da temporada!</h2>
                <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                  Os clubes movimentam os amistosos enquanto aguardam a simulação da primeira rodada oficial do campeonato.
                </p>
              </article>
            </div>
          </div>
        )}

        {/* MODAL DE RAIO-X DO CLUBE */}
        {selectedClub && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#0f1412] border border-emerald-500/40 p-6 rounded-3xl w-full max-w-sm text-left space-y-4 shadow-2xl relative">
              <button onClick={() => setSelectedClub(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-black cursor-pointer">✕</button>

              <div>
                <h4 className="text-base font-black text-white uppercase">{selectedClub.name}</h4>
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Relatório Técnico & Estatísticas</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="bg-black/50 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 font-black block uppercase">Média OVR</span>
                  <span className="text-emerald-400 font-black text-sm">{selectedClub.avgOvr || 75}</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 font-black block uppercase">Destaque</span>
                  <span className="text-amber-400 font-bold text-xs">Atleta Star</span>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mb-1">Análise do Plantel:</p>
                <p className="text-[10px] text-zinc-300 leading-relaxed">
                  Boa consistência defensiva e excelente aproveitamento nas bolas paradas.
                </p>
              </div>

              <button onClick={() => setSelectedClub(null)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black py-3 rounded-xl uppercase tracking-wider cursor-pointer">
                Fechar Relatório
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
                }
