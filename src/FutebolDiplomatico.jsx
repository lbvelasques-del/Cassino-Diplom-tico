import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function FutebolDiplomatico() {
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_current_user')) || null; } catch { return null; }
  });

  const [balance, setBalance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_current_user'))?.balance || 0; } catch { return 0; }
  });

  const [activeTab, setActiveTab] = useState('home');
  const [serieASubTab, setSerieASubTab] = useState('tabela');
  const [myTeam, setMyTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedStarterForSub, setSelectedStarterForSub] = useState(null);

  // Mercado de Transferências
  const [marketPlayers, setMarketPlayers] = useState([]);
  const [sellPriceInput, setSellPriceInput] = useState({});

  // Táticas (Salvas em localStorage para persistência imediata)
  const [selectedFormation, setSelectedFormation] = useState(() => {
    return localStorage.getItem('pampas_formation') || '4-4-2';
  });
  const [tacticalStyle, setTacticalStyle] = useState(() => {
    return localStorage.getItem('pampas_tactical_style') || 'Tiki-Taka';
  });

  useEffect(() => {
    localStorage.setItem('pampas_formation', selectedFormation);
  }, [selectedFormation]);

  useEffect(() => {
    localStorage.setItem('pampas_tactical_style', tacticalStyle);
  }, [tacticalStyle]);

  // Amistosos
  const [selectedFriendlyOpponent, setSelectedFriendlyOpponent] = useState('Palmeiras');
  const [isSimulatingFriendly, setIsSimulatingFriendly] = useState(false);
  const [lastMatchReport, setLastMatchReport] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_last_match_report')) || null; } catch { return null; }
  });

  // Relatório e Histórico da Partida Oficial (Persistente)
  const [lastOfficialReport, setLastOfficialReport] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_last_official_report')) || null; } catch { return null; }
  });

  // 20 Clubes da Série A
  const initial20Clubs = [
    'Flamengo', 'Palmeiras', 'Internacional', 'Grêmio', 'Atlético-MG',
    'São Paulo', 'Fluminense', 'Botafogo', 'Corinthians', 'Vasco',
    'Cruzeiro', 'Bahia', 'Athletico-PR', 'Fortaleza', 'Santos',
    'Juventude', 'Red Bull Bragantino', 'Criciúma', 'Cuiabá', 'Vitória'
  ];

  // Tabela e Rodada Persistentes via localStorage
  const [leagueTable, setLeagueTable] = useState(() => {
    try {
      const saved = localStorage.getItem('pampas_league_table');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initial20Clubs.map(name => ({
      club: name, pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
    }));
  });

  const [currentRound, setCurrentRound] = useState(() => {
    return Number(localStorage.getItem('pampas_current_round')) || 1;
  });

  const [roundResultsHistory, setRoundResultsHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('pampas_round_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('pampas_league_table', JSON.stringify(leagueTable));
  }, [leagueTable]);

  useEffect(() => {
    localStorage.setItem('pampas_current_round', currentRound);
  }, [currentRound]);

  useEffect(() => {
    localStorage.setItem('pampas_round_history', JSON.stringify(roundResultsHistory));
  }, [roundResultsHistory]);

  // Posições no Relvado
  const formationRoles = {
    '4-3-3': ['GOL', 'LAE', 'ZAG', 'ZAG', 'LAD', 'VOL', 'MC', 'MEI', 'ATA', 'ATA', 'ATA'],
    '4-4-2': ['GOL', 'LAE', 'ZAG', 'ZAG', 'LAD', 'MC', 'MC', 'MEI', 'MEI', 'ATA', 'ATA'],
    '3-5-2': ['GOL', 'ZAG', 'ZAG', 'ZAG', 'LAE', 'VOL', 'MC', 'MEI', 'LAD', 'ATA', 'ATA'],
    '4-2-3-1': ['GOL', 'LAE', 'ZAG', 'ZAG', 'LAD', 'VOL', 'VOL', 'ATA', 'MEI', 'ATA', 'ATA'],
    '5-3-2': ['GOL', 'LAE', 'ZAG', 'ZAG', 'ZAG', 'LAD', 'MC', 'MC', 'MEI', 'ATA', 'ATA']
  };

  const formationLayouts = {
    '4-3-3': [
      { top: '88%', left: '50%' },
      { top: '72%', left: '15%' }, { top: '75%', left: '38%' }, { top: '75%', left: '62%' }, { top: '72%', left: '85%' },
      { top: '50%', left: '25%' }, { top: '52%', left: '50%' }, { top: '50%', left: '75%' },
      { top: '22%', left: '20%' }, { top: '15%', left: '50%' }, { top: '22%', left: '80%' }
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
    if (currentUser) setMyTeam({ name: currentUser.team || "Internacional", manager: currentUser.username });
  }, [currentUser]);

  const fetchGameData = async () => {
    if (!myTeam?.name) return;
    const { data: pData } = await supabase.from('players').select('*').eq('current_club', myTeam.name);
    if (pData && pData.length > 0) {
      setSquad(pData);
    } else {
      const defaultPositions = ['GOL', 'LAE', 'ZAG', 'ZAG', 'LAD', 'MC', 'MC', 'MEI', 'MEI', 'ATA', 'ATA', 'MC', 'ZAG', 'ATA', 'GOL', 'LAD'];
      setSquad(Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        name: `Atleta ${i + 1}`,
        overall: 75 + (i % 5),
        position: defaultPositions[i]
      })));
    }

    const { data: mData } = await supabase.from('players').select('*').eq('current_club', 'Mercado Livre');
    if (mData) setMarketPlayers(mData);
  };

  useEffect(() => { fetchGameData(); }, [myTeam]);

  // Validação de Posições
  const isOutOfPosition = (playerPos, slotRole) => {
    if (!playerPos || !slotRole) return false;
    const p = playerPos.toUpperCase();
    const s = slotRole.toUpperCase();
    const equivalences = {
      'GOL': ['GOL'],
      'ZAG': ['ZAG', 'DEF'],
      'LAD': ['LAD', 'LAT', 'LD', 'DEF'],
      'LAE': ['LAE', 'LAT', 'LE', 'DEF'],
      'VOL': ['VOL', 'MC'],
      'MC': ['MC', 'VOL', 'MEI'],
      'MEI': ['MEI', 'MC', 'EXT', 'ATA'],
      'ATA': ['ATA', 'CA', 'EXT', 'SA']
    };
    const allowedList = equivalences[s] || [s];
    return !allowedList.includes(p);
  };

  // Substituição
  const handleSwapPlayers = (reserveIdx) => {
    if (selectedStarterForSub === null) return alert("Clique primeiro num titular no relvado!");
    const newSquad = [...squad];
    const sIdx = selectedStarterForSub;
    const rIdx = 11 + reserveIdx;
    const temp = newSquad[sIdx];
    newSquad[sIdx] = newSquad[rIdx];
    newSquad[rIdx] = temp;
    setSquad(newSquad);
    setSelectedStarterForSub(null);
  };

  // Venda Mercado
  const handleListPlayerForSale = async (player) => {
    const price = Number(sellPriceInput[player.id]);
    if (!price || price <= 0) return alert("Insira um valor válido para venda!");
    const { error } = await supabase.from('players').update({ current_club: 'Mercado Livre', price }).eq('id', player.id);
    if (!error) {
      alert(`${player.name} anunciado por R$ ${price.toLocaleString('pt-BR')}!`);
      fetchGameData();
    } else {
      setSquad(squad.filter(p => p.id !== player.id));
      setMarketPlayers([...marketPlayers, { ...player, current_club: 'Mercado Livre', price }]);
      alert(`${player.name} anunciado por R$ ${price.toLocaleString('pt-BR')}!`);
    }
  };

  // Amistoso
  const handlePlayFriendly = async () => {
    const FRIENDLY_COST = 500000;
    if (balance < FRIENDLY_COST) return alert("Saldo insuficiente (R$ 500.000).");
    const newBal = balance - FRIENDLY_COST;
    setBalance(newBal);
    setIsSimulatingFriendly(true);

    setTimeout(() => {
      const report = {
        type: 'Amistoso Profissional',
        homeTeam: myTeam?.name, awayTeam: selectedFriendlyOpponent,
        homeGoals: Math.floor(Math.random() * 3) + 1, awayGoals: Math.floor(Math.random() * 2),
        possessionHome: 56, xGHome: '2.15', xGAway: '0.80',
        mvp: squad[0]?.name || "Craque", date: new Date().toLocaleDateString('pt-BR')
      };
      setLastMatchReport(report);
      localStorage.setItem('pampas_last_match_report', JSON.stringify(report));
      setIsSimulatingFriendly(false);
      alert(`Amistoso encerrado! ${report.homeTeam} ${report.homeGoals} x ${report.awayGoals} ${report.awayTeam}`);
    }, 1500);
  };

  // Simulação Oficial Automatizada (Com Relatório Oficial Profissional e Artigo no Jornal)
  const handleSimulateOfficialRound = () => {
    const opponentIndex = (currentRound - 1) % (initial20Clubs.length - 1);
    const opponentName = initial20Clubs.filter(c => c !== myTeam?.name)[opponentIndex] || "Flamengo";
    
    const myGoals = Math.floor(Math.random() * 4);
    const oppGoals = Math.floor(Math.random() * 3);
    const win = myGoals > oppGoals;
    const draw = myGoals === oppGoals;

    // Atualizar Tabela dos 20 Clubes
    const updated = leagueTable.map(t => {
      if (t.club === myTeam?.name) {
        return {
          ...t, j: t.j + 1, v: t.v + (win ? 1 : 0), e: t.e + (draw ? 1 : 0), d: t.d + (!win && !draw ? 1 : 0),
          pts: t.pts + (win ? 3 : draw ? 1 : 0), gp: t.gp + myGoals, gc: t.gc + oppGoals, sg: t.sg + (myGoals - oppGoals)
        };
      } else if (t.club === opponentName) {
        const oppWin = oppGoals > myGoals;
        const oppDraw = oppGoals === myGoals;
        return {
          ...t, j: t.j + 1, v: t.v + (oppWin ? 1 : 0), e: t.e + (oppDraw ? 1 : 0), d: t.d + (!oppWin && !oppDraw ? 1 : 0),
          pts: t.pts + (oppWin ? 3 : oppDraw ? 1 : 0), gp: t.gp + oppGoals, gc: t.gc + myGoals, sg: t.sg + (oppGoals - myGoals)
        };
      } else {
        const gF = Math.floor(Math.random() * 3);
        const gA = Math.floor(Math.random() * 3);
        const w = gF > gA; const dr = gF === gA;
        return {
          ...t, j: t.j + 1, v: t.v + (w ? 1 : 0), e: t.e + (dr ? 1 : 0), d: t.d + (!w && !dr ? 1 : 0),
          pts: t.pts + (w ? 3 : dr ? 1 : 0), gp: t.gp + gF, gc: t.gc + gA, sg: t.sg + (gF - gA)
        };
      }
    }).sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg);

    setLeagueTable(updated);

    // Relatório Oficial Profissional
    const officialReport = {
      round: currentRound,
      homeTeam: myTeam?.name,
      awayTeam: opponentName,
      homeGoals: myGoals,
      awayGoals: oppGoals,
      possession: 54,
      xG: '1.95',
      passesCompleted: '88%',
      stadium: 'Estádio Municipal',
      mvp: squad[0]?.name || "Atleta Destaque",
      analysis: win 
        ? "Atuação soberba! A equipe dominou o setor intermediário e converteu as oportunidades criadas com extrema eficiência tática."
        : draw 
        ? "Partida equilibrada e de muita combatividade. As defesas superaram os ataques em um duelo tático intenso."
        : "Faltou consistência defensiva na retaguarda. O adversário aproveitou as brechas nas transições rápidas.",
      date: new Date().toLocaleDateString('pt-BR')
    };

    setLastOfficialReport(officialReport);
    localStorage.setItem('pampas_last_official_report', JSON.stringify(officialReport));

    // Artigo Automático para a Gazeta
    const summaryText = `Rodada ${currentRound}: ${myTeam?.name} ${myGoals}x${oppGoals} ${opponentName}. Destaques da jornada com grandes atuações coletivas e forte emoção na tabela da Série A.`;
    setRoundResultsHistory(prev => [{ round: currentRound, text: summaryText }, ...prev]);

    setCurrentRound(r => r + 1);
    alert(`Rodada Oficial nº ${currentRound} simulada com sucesso! Verifique a aba Home e a Gazeta.`);
  };return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased pb-28 selection:bg-emerald-500 selection:text-black">
      {/* Cabeçalho do Simulador */}
      <div className="w-full bg-gradient-to-b from-[#0a1210] via-[#050a08] to-[#050507] border-b border-emerald-500/30 px-4 py-5 text-center relative shadow-2xl">
        <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-100 to-emerald-500 uppercase">
          FUTEBOL DIPLOMÁTICO
        </h1>
        <p className="text-[9px] text-emerald-500/70 font-black uppercase mt-0.5 tracking-widest">Liga Oficial 2026</p>
        
        {myTeam && (
          <div className="mt-3 bg-[#0d1612] border border-emerald-500/40 px-5 py-2.5 rounded-2xl shadow-lg flex justify-between items-center max-w-[95%] mx-auto">
            <div className="text-left">
              <p className="text-white font-black text-sm uppercase">{myTeam.name}</p>
              <p className="text-[9px] text-zinc-400 font-bold">Manager: <span className="text-emerald-400">{myTeam.manager}</span></p>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-zinc-500 font-black uppercase block">Cofre</span>
              <span className="text-xs text-emerald-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navegação Inferior (As 7 Abas Originais Intactas) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0e]/95 backdrop-blur-md border-t border-emerald-500/30 p-2 z-40 shadow-2xl overflow-x-auto hide-scrollbar">
        <div className="flex gap-1 min-w-max px-1">
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
              className={`flex-1 flex flex-col items-center justify-center py-2 px-2.5 rounded-xl min-w-[50px] cursor-pointer transition-all ${
                activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-sm mb-0.5">{tab.icon}</span>
              <span className="text-[7px] font-black uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 text-center">
        
        {/* ABA: HOME (COM DESTAQUE PARA O JOGO OFICIAL E RELATÓRIO PROFISSIONAL) */}
        {activeTab === 'home' && (
          <div className="space-y-4 text-left animate-fade-in">
            
            {/* Bloco do Jogo Oficial / Relatório da Última Partida */}
            <div className="bg-[#0f1412] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-emerald-900/40 pb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                  Brasileirão • Rodada {currentRound}
                </span>
                <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                  Partida Oficial
                </span>
              </div>

              {lastOfficialReport ? (
                <div className="space-y-3">
                  <div className="bg-black/60 p-3.5 rounded-2xl text-center border border-emerald-900/30">
                    <p className="text-[9px] text-zinc-400 uppercase font-bold mb-1">Resultado Oficial • Rodada {lastOfficialReport.round}</p>
                    <p className="text-xl font-black text-white">
                      {lastOfficialReport.homeTeam} <span className="text-emerald-400">{lastOfficialReport.homeGoals}</span> x <span className="text-emerald-400">{lastOfficialReport.awayGoals}</span> {lastOfficialReport.awayTeam}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
                    <div className="bg-black/40 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block font-bold uppercase">Posse de Bola</span>
                      <span className="text-emerald-400 font-black">{lastOfficialReport.possession}% x {100 - lastOfficialReport.possession]%</span>
                    </div>
                    <div className="bg-black/40 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block font-bold uppercase">Homem do Jogo (MVP)</span>
                      <span className="text-amber-400 font-black truncate">{lastOfficialReport.mvp}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-2xl">
                    <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Relatório Técnico Oficial:</p>
                    <p className="text-[10px] text-zinc-300 italic leading-relaxed">{lastOfficialReport.analysis}</p>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center space-y-1">
                  <p className="text-xs font-bold text-white">Nenhuma partida oficial disputada ainda.</p>
                  <p className="text-[10px] text-zinc-400">O Administrador deve simular a rodada oficial na aba "Série A".</p>
                </div>
              )}
            </div>

            {/* Central de Amistosos (R$ 500k) */}
            <div className="bg-[#0f1412] border border-emerald-900/40 rounded-3xl p-5 shadow-xl">
              <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>⚔️ Organizar Amistoso</span>
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[9px]">Custo R$ 500k</span>
              </h3>
              <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed">
                Realize testes táticos contra clubes adversários. O valor é debitado no ato.
              </p>

              <div className="space-y-3">
                <select 
                  value={selectedFriendlyOpponent} 
                  onChange={(e) => setSelectedFriendlyOpponent(e.target.value)}
                  className="w-full bg-black border border-emerald-900/60 text-white text-xs p-3 rounded-xl outline-none font-semibold cursor-pointer"
                >
                  {initial20Clubs.filter(c => c !== myTeam?.name).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button 
                  onClick={handlePlayFriendly} 
                  disabled={isSimulatingFriendly}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer hover:opacity-95 disabled:opacity-50"
                >
                  {isSimulatingFriendly ? "Simulando Amistoso..." : "Jogar Amistoso (R$ 500.000)"}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ABA: TÁTICAS (PRANCHETA INTERATIVA COM SINALIZAÇÃO EM VERMELHO) */}
        {activeTab === 'taticas' && (
          <div className="space-y-4 text-left animate-fade-in">
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl flex justify-between items-center">
              <div>
                <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Prancheta Tática 📋</h3>
                <p className="text-[9px] text-zinc-400">Vermelho = Jogador fora da sua função primária</p>
              </div>
              <select value={selectedFormation} onChange={(e) => setSelectedFormation(e.target.value)} className="bg-black border border-emerald-500/40 text-xs text-white p-2.5 rounded-xl font-bold outline-none cursor-pointer">
                <option value="4-3-3">4-3-3 Ofensivo</option>
                <option value="4-4-2">4-4-2 Clássico</option>
                <option value="3-5-2">3-5-2 Domínio</option>
                <option value="4-2-3-1">4-2-3-1 Equilibrado</option>
                <option value="5-3-2">5-3-2 Contenção</option>
              </select>
            </div>

            {/* O Campo Tático */}
            <div className="relative w-full h-[430px] bg-gradient-to-b from-emerald-950 via-green-900 to-emerald-950 rounded-3xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl p-2">
              <div className="absolute inset-2 border border-white/20 rounded-2xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2 pointer-events-none"></div>

              {formationLayouts[selectedFormation].map((pos, idx) => {
                const player = squad[idx] || { name: `Titular ${idx+1}`, overall: 75, position: formationRoles[selectedFormation][idx] };
                const reqRole = formationRoles[selectedFormation][idx];
                const outOfPos = isOutOfPosition(player.position, reqRole);
                const isSelected = selectedStarterForSub === idx;

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedStarterForSub(idx)}
                    style={{ top: pos.top, left: pos.left }} 
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
                  >
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[9px] font-black shadow-2xl text-white transition-colors ${
                      outOfPos 
                        ? 'bg-red-600 border-red-300 animate-pulse' 
                        : isSelected ? 'bg-amber-500 border-white' : 'bg-emerald-600 border-white'
                    }`}>
                      {player.overall}
                    </div>

                    <span className={`text-[7px] font-black px-1 rounded mt-0.5 max-w-[60px] truncate ${
                      outOfPos ? 'bg-red-950 text-red-300 border border-red-600' : 'bg-black/80 text-white'
                    }`}>
                      {player.name}
                    </span>

                    <span className="text-[6px] text-zinc-400 font-bold uppercase">{reqRole}</span>
                  </div>
                );
              })}
            </div>

            {/* Banco de Reservas */}
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
              <h4 className="text-emerald-400 font-black text-xs uppercase tracking-wider">
                🪑 Banco de Reservas ({Math.max(0, squad.length - 11)})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
                {squad.slice(11).map((reserve, idx) => (
                  <div key={reserve.id || idx} className="bg-black/50 border border-zinc-800 p-2.5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white font-bold uppercase">{reserve.name} <span className="text-amber-400 text-[9px]">({reserve.position || 'RES'})</span></p>
                      <p className="text-[9px] text-zinc-500">OVR: <span className="text-emerald-400 font-bold">{reserve.overall}</span></p>
                    </div>
                    <button onClick={() => handleSwapPlayers(idx)} className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-3 py-1.5 rounded-xl hover:bg-emerald-600 hover:text-black transition-colors cursor-pointer">
                      SUBSTITUIR
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}{/* ABA: ELENCO (PLANTEL & VENDA DIRETA NO MERCADO) */}
        {activeTab === 'elenco' && (
          <div className="text-left space-y-3 animate-fade-in">
            <div className="flex justify-between items-center bg-[#0f1412] p-4 rounded-2xl border border-emerald-900/40 shadow-lg">
              <div>
                <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Gestão do Plantel</h3>
                <p className="text-[9px] text-zinc-400 font-bold">Defina o valor e coloque atletas à venda</p>
              </div>
              <span className="text-xs font-black text-white bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800">
                {squad.length} Atletas
              </span>
            </div>

            <div className="space-y-2">
              {squad.map((player) => (
                <div key={player.id} className="bg-[#0f1412] border border-emerald-900/30 p-3.5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <p className="text-white font-black text-xs uppercase">
                      {player.name} <span className="text-[9px] text-amber-400 font-bold">({player.position || 'MC'})</span>
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">
                      Nível OVR: <span className="text-emerald-400 font-bold">{player.overall || 75}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      placeholder="Valor R$" 
                      value={sellPriceInput[player.id] || ''} 
                      onChange={(e) => setSellPriceInput({ ...sellPriceInput, [player.id]: e.target.value })}
                      className="w-24 bg-black border border-zinc-800 text-white text-[10px] p-2 rounded-xl outline-none focus:border-emerald-500 font-semibold" 
                    />
                    <button 
                      onClick={() => handleListPlayerForSale(player)} 
                      className="bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-black px-3 py-2 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Anunciar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: SÉRIE A (TABELA DOS 20 TIMES & CALENDÁRIO UNIVERSAL) */}
        {activeTab === 'clubes' && (
          <div className="text-left space-y-4 animate-fade-in">
            <div className="flex bg-[#0f1412] p-1.5 rounded-2xl border border-emerald-900/40">
              <button 
                onClick={() => setSerieASubTab('tabela')} 
                className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all cursor-pointer ${
                  serieASubTab === 'tabela' ? 'bg-emerald-600 text-black shadow-md' : 'text-zinc-400'
                }`}
              >
                Tabela Oficial (20)
              </button>
              <button 
                onClick={() => setSerieASubTab('calendario')} 
                className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all cursor-pointer ${
                  serieASubTab === 'calendario' ? 'bg-emerald-600 text-black shadow-md' : 'text-zinc-400'
                }`}
              >
                Calendário (38 Rodadas)
              </button>
            </div>

            {serieASubTab === 'tabela' && (
              <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-900/40 pb-2">
                  <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">
                    Tabela da Série A 🏆
                  </h3>
                  <span className="text-[9px] text-zinc-400 font-bold">20 Equipas</span>
                </div>

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
                      {leagueTable.map((t, idx) => (
                        <tr key={t.club} onClick={() => setSelectedClub(t)} className="hover:bg-emerald-950/30 cursor-pointer transition-colors">
                          <td className="py-2.5 font-black text-white uppercase flex items-center gap-1.5">
                            <span className="text-[8px] text-emerald-500 font-bold w-3">{idx + 1}</span>
                            {t.club}
                          </td>
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
              </div>
            )}

            {serieASubTab === 'calendario' && (
              <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-900/40 pb-2">
                  <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">
                    Calendário de Jogos
                  </h3>
                  <span className="text-[9px] text-amber-400 font-bold">Rodada {currentRound} de 38</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 hide-scrollbar">
                  {initial20Clubs.slice(0, 10).map((t, i) => (
                    <div key={i} className="bg-black/50 p-2.5 rounded-2xl border border-zinc-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-white uppercase w-5/12 text-left">🏠 {t}</span>
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">VS</span>
                      <span className="font-bold text-white uppercase w-5/12 text-right">✈️ {initial20Clubs[19 - i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentUser?.username?.toLowerCase() === 'lvelasques' && (
              <button 
                onClick={handleSimulateOfficialRound} 
                className="w-full bg-red-600 hover:bg-red-500 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                ⚡ Simular Rodada Oficial nº {currentRound} (ADM)
              </button>
            )}
          </div>
        )}

        {/* ABA: MERCADO DE TRANSFERÊNCIAS */}
        {activeTab === 'mercado' && (
          <div className="text-left space-y-4 animate-fade-in">
            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Mercado de Transferências 🤝</h3>
            
            <div className="space-y-2">
              {marketPlayers.map(m => (
                <div key={m.id} className="bg-[#0f1412] border border-amber-900/30 p-3.5 rounded-2xl flex justify-between items-center shadow-md">
                  <div>
                    <p className="text-white font-black text-xs uppercase">{m.name} <span className="text-amber-400 text-[9px]">({m.position || 'MC'})</span></p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Passe: <span className="text-emerald-400 font-bold">R$ {(m.price || 5000000).toLocaleString('pt-BR')}</span></p>
                  </div>
                  <button onClick={() => alert(`Proposta de compra enviada para ${m.name}!`)} className="bg-emerald-600 text-black font-black text-[9px] px-3.5 py-2 rounded-xl uppercase tracking-wider cursor-pointer hover:bg-emerald-500">
                    Comprar
                  </button>
                </div>
              ))}
              {marketPlayers.length === 0 && (
                <div className="bg-[#0f1412] border border-emerald-900/30 p-5 rounded-3xl text-center space-y-1">
                  <p className="text-xs text-white font-bold">Nenhum jogador anunciado no momento.</p>
                  <p className="text-[10px] text-zinc-400">Aceda à aba "Elenco" para colocar os seus atletas à venda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: INBOX */}
        {activeTab === 'inbox' && (
          <div className="text-left space-y-4 animate-fade-in">
            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Caixa de Entrada 📩</h3>
            <div className="bg-[#0f1412] border border-emerald-900/30 p-5 rounded-3xl text-center">
              <p className="text-xs text-zinc-500 py-4 font-semibold">Caixa limpa. Nenhuma notificação ou proposta pendente.</p>
            </div>
          </div>
        )}

        {/* ABA: GAZETA (JORNAL OFICIAL AUTOMATIZADO COM OS DESTAQUES DA RODADA) */}
        {activeTab === 'jornal' && (
          <div className="space-y-4 text-left animate-fade-in">
            <div className="bg-[#e5e5e5] text-black p-5 rounded-sm border-t-8 border-black font-serif shadow-xl relative overflow-hidden">
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-3xl font-black uppercase tracking-tighter">A Gazeta Diplomática</h1>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Edição Oficial • 2026</p>
              </div>

              <div className="space-y-4">
                <article className="border-b border-black/30 pb-3">
                  <span className="bg-black text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider mb-1 inline-block">Editorial Destaque</span>
                  <h2 className="text-base font-black leading-tight mb-1">Emoção ao rubro na luta pelo título do Brasileirão!</h2>
                  <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">
                    As jornadas decorrem com alta competitividade. Os treinadores ajustam os esquemas táticos e os artilheiros disputam cada lance na tabela de classificação.
                  </p>
                </article>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-wide mb-2 text-black">🗞️ Crônicas e Resultados das Rodadas:</h3>
                  {roundResultsHistory.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {roundResultsHistory.map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-zinc-400 text-[11px] font-medium shadow-sm">
                          <p className="font-black text-emerald-900 mb-0.5">Rodada nº {item.round}:</p>
                          <p className="text-zinc-800">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-600 italic">Nenhuma rodada oficial foi simulada ainda. O Administrador deve avançar o campeonato na aba Série A.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE RAIO-X DO CLUBE */}
        {selectedClub && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#0f1412] border border-emerald-500/40 p-6 rounded-3xl w-full max-w-sm text-left space-y-4 shadow-2xl relative">
              <button onClick={() => setSelectedClub(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-black cursor-pointer">✕</button>

              <div>
                <h4 className="text-base font-black text-white uppercase">{selectedClub.club || selectedClub.name}</h4>
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Relatório Técnico do Clube</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="bg-black/50 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 font-black block uppercase">Pontos</span>
                  <span className="text-emerald-400 font-black text-sm">{selectedClub.pts || 0}</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 font-black block uppercase">Jogos</span>
                  <span className="text-white font-bold text-xs">{selectedClub.j || 0}</span>
                </div>
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
