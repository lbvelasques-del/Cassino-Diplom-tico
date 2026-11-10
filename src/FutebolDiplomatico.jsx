import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function FutebolDiplomatico() {
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_current_user')) || null; } catch { return null; }
  });

  const [balance, setBalance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_current_user'))?.balance || 0; } catch { return 0; }
  });

  const [activeTab, setActiveTab] = useState('home'); // home, taticas, elenco, estatisticas, mercado, jornal
  const [statsSubTab, setStatsSubTab] = useState('tabela'); // tabela, calendario, artilharia
  const [myTeam, setMyTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  
  // Táticas e Substituições Dinâmicas
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [tacticalStyle, setTacticalStyle] = useState('Tiki-Taka');
  const [selectedStarterForSub, setSelectedStarterForSub] = useState(null);

  // Amistosos e Relatório Avançado
  const [selectedFriendlyOpponent, setSelectedFriendlyOpponent] = useState('');
  const [isSimulatingFriendly, setIsSimulatingFriendly] = useState(false);
  const [lastMatchReport, setLastMatchReport] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_last_match_report')) || null; } catch { return null; }
  });

  // Tabela Dinâmica do Campeonato (Inicia do Zero: 0 pts, 0 jogos)
  const [leagueTable, setLeagueTable] = useState([
    { club: 'Flamengo', pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 },
    { club: 'Palmeiras', pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 },
    { club: 'Internacional', pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 },
    { club: 'Grêmio', pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 },
    { club: 'Atlético-MG', pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 },
    { club: 'São Paulo', pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 },
  ]);

  const [topScorers, setTopScorers] = useState([
    { name: 'Gabigol', club: 'Flamengo', goals: 0 },
    { name: 'Valencia', club: 'Internacional', goals: 0 },
    { name: 'Hulk', club: 'Atlético-MG', goals: 0 },
    { name: 'Veiga', club: 'Palmeiras', goals: 0 },
  ]);

  const [currentRound, setCurrentRound] = useState(1);
  const [roundResultsHistory, setRoundResultsHistory] = useState([]);

  // Coordenadas visuais das 5 formações táticas (% no campo)
  const formationLayouts = {
    '4-3-3': [
      { top: '88%', left: '50%' }, // GOL
      { top: '72%', left: '15%' }, { top: '75%', left: '38%' }, { top: '75%', left: '62%' }, { top: '72%', left: '85%' }, // DEF
      { top: '50%', left: '25%' }, { top: '52%', left: '50%' }, { top: '50%', left: '75%' }, // MEI
      { top: '22%', left: '20%' }, { top: '15%', left: '50%' }, { top: '22%', left: '80%' }  // ATA
    ],
    '4-4-2': [
      { top: '88%', left: '50%' },
      { top: '72%', left: '15%' }, { top: '75%', left: '38%' }, { top: '75%', left: '62%' }, { top: '72%', left: '85%' },
      { top: '48%', left: '15%' }, { top: '50%', left: '38%' }, { top: '50%', left: '62%' }, { top: '48%', left: '85%' },
      { top: '18%', left: '35%' }, { top: '18%', left: '65%' }
    ],
    '3-5-2': [
      { top: '88%', left: '50%' },
      { top: '75%', left: '25%' }, { top: '77%', left: '50%' }, { top: '75%', left: '75%' },
      { top: '50%', left: '12%' }, { top: '52%', left: '32%' }, { top: '54%', left: '50%' }, { top: '52%', left: '68%' }, { top: '50%', left: '88%' },
      { top: '18%', left: '35%' }, { top: '18%', left: '65%' }
    ],
    '4-2-3-1': [
      { top: '88%', left: '50%' },
      { top: '72%', left: '15%' }, { top: '75%', left: '38%' }, { top: '75%', left: '62%' }, { top: '72%', left: '85%' },
      { top: '58%', left: '35%' }, { top: '58%', left: '65%' },
      { top: '36%', left: '20%' }, { top: '34%', left: '50%' }, { top: '36%', left: '80%' },
      { top: '15%', left: '50%' }
    ],
    '5-3-2': [
      { top: '88%', left: '50%' },
      { top: '72%', left: '12%' }, { top: '75%', left: '30%' }, { top: '77%', left: '50%' }, { top: '75%', left: '70%' }, { top: '72%', left: '88%' },
      { top: '48%', left: '25%' }, { top: '50%', left: '50%' }, { top: '48%', left: '75%' },
      { top: '18%', left: '35%' }, { top: '18%', left: '65%' }
    ]
  };

  useEffect(() => {
    if (currentUser) {
      setMyTeam({ name: currentUser.team || "Flamengo", manager: currentUser.username, overall: 75 });
    }
  }, [currentUser]);

  const fetchGameData = async (clubName) => {
    if (!clubName) return;
    try {
      const { data: playersData } = await supabase.from('players').select('*').eq('current_club', clubName).order('overall', { ascending: false });
      if (playersData && playersData.length > 0) {
        setSquad(playersData);
      } else {
        setSquad(Array.from({ length: 16 }, (_, i) => ({
          id: i + 1,
          name: `Jogador ${i + 1}`,
          overall: 75 + (i % 5),
          position: i === 0 ? 'GOL' : i < 5 ? 'DEF' : i < 9 ? 'MC' : 'ATA'
        })));
      }

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
        if (clubsList.length > 0 && !selectedFriendlyOpponent) setSelectedFriendlyOpponent(clubsList[0].name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (myTeam?.name) fetchGameData(myTeam.name);
  }, [myTeam]);

  // Troca de Jogadores Titular x Reserva
  const handleSwapPlayers = (reserveIdx) => {
    if (selectedStarterForSub === null) {
      alert("Clique primeiro num jogador titular no campo!");
      return;
    }
    const newSquad = [...squad];
    const starterRealIdx = selectedStarterForSub;
    const reserveRealIdx = 11 + reserveIdx;

    const temp = newSquad[starterRealIdx];
    newSquad[starterRealIdx] = newSquad[reserveRealIdx];
    newSquad[reserveRealIdx] = temp;

    setSquad(newSquad);
    setSelectedStarterForSub(null);
    alert("Substituição realizada!");
  };

  // Motor de Amistosos (R$ 500k)
  const handlePlayFriendly = async () => {
    const FRIENDLY_COST = 500000;
    if (balance < FRIENDLY_COST) {
      alert("Saldo insuficiente! O custo é de R$ 500.000.");
      return;
    }

    const newBal = balance - FRIENDLY_COST;
    setBalance(newBal);
    setIsSimulatingFriendly(true);

    setTimeout(() => {
      const myGoals = Math.floor(Math.random() * 3) + 1;
      const oppGoals = Math.floor(Math.random() * 2);

      const report = {
        type: 'Amistoso Interclubes',
        homeTeam: myTeam?.name || "Meu Clube",
        awayTeam: selectedFriendlyOpponent || "Adversário",
        homeGoals: myGoals,
        awayGoals: oppGoals,
        possessionHome: 55,
        possessionAway: 45,
        xGHome: (myGoals * 0.88).toFixed(2),
        xGAway: (oppGoals * 0.65).toFixed(2),
        shotsOnTargetHome: myGoals + 3,
        shotsOnTargetAway: oppGoals + 1,
        mvp: squad[0]?.name || "Craque da Partida",
        tacticalAnalysis: `Atuação tática sob o esquema ${selectedFormation} (${tacticalStyle}). Transições rápidas garantiram o controle do jogo.`,
        date: new Date().toLocaleDateString('pt-BR')
      };

      setLastMatchReport(report);
      localStorage.setItem('pampas_last_match_report', JSON.stringify(report));
      setIsSimulatingFriendly(false);
      alert(`Amistoso Fim de Jogo! ${report.homeTeam} ${myGoals} x ${oppGoals} ${report.awayTeam}`);
    }, 1500);
  };// Simulação de Rodada Oficial pelo ADM
  const handleSimulateOfficialRound = () => {
    const newTable = leagueTable.map(team => {
      const gFor = Math.floor(Math.random() * 4);
      const gAgainst = Math.floor(Math.random() * 3);
      const win = gFor > gAgainst;
      const draw = gFor === gAgainst;

      return {
        ...team,
        j: team.j + 1,
        v: team.v + (win ? 1 : 0),
        e: team.e + (draw ? 1 : 0),
        d: team.d + (!win && !draw ? 1 : 0),
        pts: team.pts + (win ? 3 : draw ? 1 : 0),
        gp: team.gp + gFor,
        gc: team.gc + gAgainst,
        sg: team.sg + (gFor - gAgainst)
      };
    }).sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg);

    setLeagueTable(newTable);

    const newScorers = topScorers.map(s => ({
      ...s, goals: s.goals + Math.floor(Math.random() * 2)
    })).sort((a, b) => b.goals - a.goals);
    setTopScorers(newScorers);

    setRoundResultsHistory(prev => [
      { round: currentRound, results: `${newTable[0].club} 2x1 ${newTable[1].club} | ${newTable[2].club} 0x0 ${newTable[3].club}` },
      ...prev
    ]);

    setCurrentRound(r => r + 1);
    alert(`Rodada ${currentRound} Simulada! Tabela e Estatísticas atualizadas.`);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased pb-28">
      {/* Header */}
      <div className="w-full bg-[#0a1210] border-b border-emerald-500/30 px-4 py-5 text-center shadow-2xl">
        <h1 className="text-xl font-black tracking-widest text-emerald-400 uppercase">FUTEBOL DIPLOMÁTICO</h1>
        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Liga Oficial 2026</p>
        
        {myTeam && (
          <div className="mt-3 bg-[#0d1612] border border-emerald-500/40 px-5 py-2.5 rounded-2xl shadow-lg flex justify-between items-center max-w-[95%] mx-auto">
            <div className="text-left">
              <p className="text-white font-black text-sm uppercase">{myTeam.name}</p>
              <p className="text-[9px] text-zinc-400">Manager: <span className="text-emerald-400">{myTeam.manager}</span></p>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-zinc-500 font-black uppercase block">Cofre</span>
              <span className="text-xs text-emerald-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu Inferior */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0e]/95 backdrop-blur-md border-t border-emerald-500/30 p-2 z-40 shadow-2xl overflow-x-auto hide-scrollbar">
        <div className="flex gap-1.5 min-w-max px-2">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'taticas', label: 'Táticas', icon: '📋' },
            { id: 'elenco', label: 'Elenco', icon: '👕' },
            { id: 'estatisticas', label: 'Campeonato', icon: '📊' },
            { id: 'mercado', label: 'Mercado', icon: '🤝' },
            { id: 'jornal', label: 'Gazeta', icon: '📰' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[58px] cursor-pointer ${
                activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-zinc-500'
              }`}
            >
              <span className="text-base mb-0.5">{tab.icon}</span>
              <span className="text-[8px] font-black uppercase">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 text-center">
        
        {/* ABA HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4 text-left">
            <div className="bg-[#0f1412] border border-emerald-900/40 rounded-3xl p-5 shadow-xl">
              <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider mb-2 flex justify-between">
                <span>⚔️ Amistoso Interclubes</span>
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[9px]">Custo R$ 500k</span>
              </h3>
              <select value={selectedFriendlyOpponent} onChange={(e) => setSelectedFriendlyOpponent(e.target.value)} className="w-full bg-black border border-emerald-900/60 text-white text-xs p-3 rounded-xl outline-none font-semibold mb-3">
                {allClubs.map(c => <option key={c.name} value={c.name}>{c.name} (OVR: {c.avgOvr})</option>)}
              </select>
              <button onClick={handlePlayFriendly} disabled={isSimulatingFriendly} className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer">
                {isSimulatingFriendly ? "Simulando Partida..." : "Realizar Amistoso (R$ 500.000)"}
              </button>
            </div>

            {lastMatchReport && (
              <div className="bg-[#0f1412] border border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-900/30 pb-2">
                  <h3 className="text-xs font-black text-white uppercase">📊 Relatório Avançado</h3>
                  <span className="text-[9px] text-zinc-400 font-bold">{lastMatchReport.date}</span>
                </div>
                <div className="bg-black/50 p-3 rounded-2xl text-center border border-emerald-900/20">
                  <p className="text-xl font-black text-white">{lastMatchReport.homeTeam} <span className="text-emerald-400">{lastMatchReport.homeGoals}</span> x <span className="text-emerald-400">{lastMatchReport.awayGoals}</span> {lastMatchReport.awayTeam}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
                  <div className="bg-black/40 p-2 rounded-xl border border-zinc-800"><span className="text-zinc-500 block font-bold">Posse de Bola</span><span className="text-emerald-400 font-black">{lastMatchReport.possessionHome}% x {lastMatchReport.possessionAway}%</span></div>
                  <div className="bg-black/40 p-2 rounded-xl border border-zinc-800"><span className="text-zinc-500 block font-bold">Gols Esperados (xG)</span><span className="text-amber-400 font-black">{lastMatchReport.xGHome} x {lastMatchReport.xGAway}</span></div>
                  <div className="bg-black/40 p-2 rounded-xl border border-zinc-800"><span className="text-zinc-500 block font-bold">Chutes no Alvo</span><span className="text-white font-black">{lastMatchReport.shotsOnTargetHome} vs {lastMatchReport.shotsOnTargetAway}</span></div>
                  <div className="bg-black/40 p-2 rounded-xl border border-zinc-800"><span className="text-zinc-500 block font-bold">Destaque (MVP)</span><span className="text-emerald-400 font-black">{lastMatchReport.mvp}</span></div>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl">
                  <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Análise Tática:</p>
                  <p className="text-[10px] text-zinc-300 italic">{lastMatchReport.tacticalAnalysis}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA TÁTICAS */}
        {activeTab === 'taticas' && (
          <div className="space-y-4 text-left">
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-emerald-400 font-black text-xs uppercase">Esquema & Estilo Tático</h3>
                <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Efeito Imediato</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={selectedFormation} onChange={(e) => setSelectedFormation(e.target.value)} className="bg-black border border-emerald-500/40 text-xs text-white p-2.5 rounded-xl font-bold outline-none cursor-pointer">
                  <option value="4-3-3">4-3-3 Ofensivo</option>
                  <option value="4-4-2">4-4-2 Clássico</option>
                  <option value="3-5-2">3-5-2 Domínio</option>
                  <option value="4-2-3-1">4-2-3-1 Equilibrado</option>
                  <option value="5-3-2">5-3-2 Contenção</option>
                </select>
                <select value={tacticalStyle} onChange={(e) => setTacticalStyle(e.target.value)} className="bg-black border border-emerald-500/40 text-xs text-white p-2.5 rounded-xl font-bold outline-none cursor-pointer">
                  <option value="Tiki-Taka">Tiki-Taka (Posse)</option>
                  <option value="Contra-Ataque Rápido">Contra-Ataque Rápido</option>
                  <option value="Gegenpressing">Gegenpressing (Pressão)</option>
                  <option value="Bloco Baixo">Bloco Baixo (Ônibus)</option>
                  <option value="Futebol Direto">Futebol Direto</option>
                </select>
              </div>
            </div>

            {/* Campo Tático Interativo */}
            <div className="relative w-full h-[420px] bg-gradient-to-b from-emerald-950 via-green-900 to-emerald-950 rounded-3xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl p-2">
              <div className="absolute inset-2 border border-white/20 rounded-2xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2 pointer-events-none"></div>

              {formationLayouts[selectedFormation].map((pos, idx) => {
                const p = squad[idx] || { name: `Titular ${idx+1}`, overall: 75 };
                const isSelected = selectedStarterForSub === idx;

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedStarterForSub(idx)}
                    style={{ top: pos.top, left: pos.left }} 
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-500 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[8px] font-black shadow-lg text-white ${isSelected ? 'bg-amber-500 border-white' : 'bg-emerald-600 border-white'}`}>
                      {p.overall}
                    </div>
                    <span className={`text-[7px] font-black px-1 rounded mt-0.5 max-w-[55px] truncate ${isSelected ? 'bg-amber-400 text-black' : 'bg-black/80 text-white'}`}>
                      {p.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Banco de Reservas */}
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
              <h4 className="text-emerald-400 font-black text-xs uppercase">Banco de Reservas (Clique para Substituir)</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {squad.slice(11).map((reserve, idx) => (
                  <div key={reserve.id || idx} className="bg-black/50 border border-zinc-800 p-2.5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white font-bold uppercase">{reserve.name}</p>
                      <p className="text-[9px] text-zinc-500">Pos: {reserve.position || "RES"} | OVR: <span className="text-emerald-400 font-bold">{reserve.overall}</span></p>
                    </div>
                    <button onClick={() => handleSwapPlayers(idx)} className="bg-emerald-600 text-black text-[9px] font-black px-3 py-1.5 rounded-xl uppercase cursor-pointer hover:bg-emerald-500">
                      Entrar em Campo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}{/* ABA CAMPEONATO */}
        {activeTab === 'estatisticas' && (
          <div className="space-y-4 text-left">
            <div className="flex bg-[#0f1412] p-1.5 rounded-2xl border border-emerald-900/40">
              {['tabela', 'calendario', 'artilharia'].map(sub => (
                <button key={sub} onClick={() => setStatsSubTab(sub)} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl cursor-pointer ${statsSubTab === sub ? 'bg-emerald-600 text-black' : 'text-zinc-400'}`}>
                  {sub}
                </button>
              ))}
            </div>

            {statsSubTab === 'tabela' && (
              <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl">
                <h3 className="text-emerald-400 font-black text-xs uppercase mb-3">Tabela de Classificação do Brasileirão</h3>
                <table className="w-full text-[10px] text-left">
                  <thead>
                    <tr className="border-b border-emerald-900/40 text-zinc-500 uppercase font-black">
                      <th className="py-2">Clube</th><th className="py-2 text-center">P</th><th className="py-2 text-center">J</th><th className="py-2 text-center">V</th><th className="py-2 text-center">E</th><th className="py-2 text-center">SG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {leagueTable.map((t, i) => (
                      <tr key={t.club} className="hover:bg-emerald-950/30">
                        <td className="py-2.5 font-black text-white uppercase">{i + 1}. {t.club}</td>
                        <td className="py-2.5 text-center font-black text-emerald-400">{t.pts}</td>
                        <td className="py-2.5 text-center text-zinc-400">{t.j}</td>
                        <td className="py-2.5 text-center text-zinc-300">{t.v}</td>
                        <td className="py-2.5 text-center text-zinc-400">{t.e}</td>
                        <td className="py-2.5 text-center font-bold text-emerald-400">{t.sg > 0 ? `+${t.sg}` : t.sg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {statsSubTab === 'calendario' && (
              <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
                <h3 className="text-emerald-400 font-black text-xs uppercase">Calendário Oficial de Jogos</h3>
                <div className="space-y-2">
                  <div className="bg-black/50 p-3 rounded-xl border border-zinc-800 text-xs">
                    <p className="text-[9px] text-emerald-400 font-bold uppercase">Rodada {currentRound} (Próxima)</p>
                    <p className="text-white font-bold mt-1">Flamengo x Internacional • Estádio Maracanã</p>
                    <p className="text-white font-bold">Palmeiras x Grêmio • Allianz Parque</p>
                  </div>
                </div>
              </div>
            )}

            {statsSubTab === 'artilharia' && (
              <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
                <h3 className="text-emerald-400 font-black text-xs uppercase">Líderes de Gols</h3>
                <div className="space-y-2">
                  {topScorers.map((s, idx) => (
                    <div key={idx} className="bg-black/50 p-2.5 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-black text-white uppercase">{idx + 1}. {s.name}</p>
                        <p className="text-[9px] text-zinc-400">{s.club}</p>
                      </div>
                      <span className="text-emerald-400 font-black text-sm">{s.goals} Gols</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentUser?.username?.toLowerCase() === 'lvelasques' && (
              <button onClick={handleSimulateOfficialRound} className="w-full bg-red-600 hover:bg-red-500 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer">
                ⚡ Simular Rodada Oficial nº {currentRound} (ADM)
              </button>
            )}
          </div>
        )}

        {/* ABA GAZETA (AUTOMATIZADA) */}
        {activeTab === 'jornal' && (
          <div className="space-y-4 text-left">
            <div className="bg-[#e5e5e5] text-black p-5 rounded-sm border-t-8 border-black font-serif shadow-xl">
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-3xl font-black uppercase tracking-tighter">A GAZETA DIPLOMÁTICA</h1>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">Edição Oficial da Liga • 2026</p>
              </div>

              <article className="space-y-3">
                <span className="bg-black text-white text-[8px] font-black px-1.5 py-0.5 uppercase">Cobertura Oficial</span>
                <h2 className="text-lg font-black leading-tight">Rodada {currentRound - 1} agita a classificação do campeonato!</h2>
                <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                  As equipes entraram em campo em busca dos três pontos. Os treinadores aplicaram esquemas táticos arrojados para surpreender os adversários.
                </p>

                <div className="border-t border-black/40 pt-3 mt-3">
                  <h4 className="text-xs font-black uppercase mb-1">Resultados da Última Rodada:</h4>
                  {roundResultsHistory.length > 0 ? (
                    <p className="text-xs font-bold text-zinc-900">{roundResultsHistory[0].results}</p>
                  ) : (
                    <p className="text-xs text-zinc-600 italic">Nenhuma rodada oficial foi disputada ainda nesta temporada.</p>
                  )}
                </div>
              </article>
            </div>
          </div>
        )}

        {/* ABA ELENCO */}
        {activeTab === 'elenco' && (
          <div className="text-left space-y-3">
            <h3 className="text-emerald-400 font-black text-xs uppercase">Plantel Principal ({squad.length} Atletas)</h3>
            {squad.map((player, idx) => (
              <div key={player.id || idx} className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-xs uppercase">{player.name} <span className="text-[9px] text-amber-400">({player.position || 'MC'})</span></p>
                  <p className="text-[10px] text-zinc-400">Passe: <span className="text-emerald-400 font-bold">R$ {((player.overall || 75) * 350000).toLocaleString('pt-BR')}</span></p>
                </div>
                <span className="text-sm font-black text-emerald-400">{player.overall || 75} OVR</span>
              </div>
            ))}
          </div>
        )}

        {/* ABA MERCADO */}
        {activeTab === 'mercado' && (
          <div className="text-left space-y-3">
            <h3 className="text-emerald-400 font-black text-xs uppercase">Mercado de Transferências 🤝</h3>
            <div className="bg-[#0f1412] border border-emerald-900/30 p-4 rounded-3xl text-center">
              <p className="text-xs text-zinc-400 font-bold">Novos jogadores criados pelo ADM ficarão disponíveis nesta central para compra e leilão.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
