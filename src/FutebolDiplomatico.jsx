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
  const [selectedStarterForSub, setSelectedStarterForSub] = useState(null);

  // Mercado de Transferências
  const [marketPlayers, setMarketPlayers] = useState([]);
  const [sellPriceInput, setSellPriceInput] = useState({});

  // Táticas
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [tacticalStyle, setTacticalStyle] = useState('Tiki-Taka');

  // Amistosos
  const [selectedFriendlyOpponent, setSelectedFriendlyOpponent] = useState('Palmeiras');
  const [isSimulatingFriendly, setIsSimulatingFriendly] = useState(false);
  const [lastMatchReport, setLastMatchReport] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pampas_last_match_report')) || null; } catch { return null; }
  });

  // OS 20 TIMES OFICIAIS DA SÉRIE A (TABELA INICIA EM 0 PTS)
  const initial20Teams = [
    'Flamengo', 'Palmeiras', 'Internacional', 'Grêmio', 'Atlético-MG',
    'São Paulo', 'Fluminense', 'Botafogo', 'Corinthians', 'Vasco',
    'Cruzeiro', 'Bahia', 'Athletico-PR', 'Fortaleza', 'Santos',
    'Juventude', 'Red Bull Bragantino', 'Criciúma', 'Cuiabá', 'Vitória'
  ];

  const [leagueTable, setLeagueTable] = useState(() => {
    return initial20Teams.map(name => ({
      club: name, pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
    }));
  });

  const [currentRound, setCurrentRound] = useState(1);

  // Mapeamento das 11 Posições Requeridas por Formação
  const formationRoles = {
    '4-3-3': ['GOL', 'LAT', 'ZAG', 'ZAG', 'LAT', 'VOL', 'MC', 'MEI', 'EXT', 'CA', 'EXT'],
    '4-4-2': ['GOL', 'LAT', 'ZAG', 'ZAG', 'LAT', 'MC', 'MC', 'MEI', 'MEI', 'CA', 'CA'],
    '3-5-2': ['GOL', 'ZAG', 'ZAG', 'ZAG', 'LAT', 'VOL', 'MC', 'MC', 'LAT', 'CA', 'CA'],
    '4-2-3-1': ['GOL', 'LAT', 'ZAG', 'ZAG', 'LAT', 'VOL', 'VOL', 'EXT', 'MEI', 'EXT', 'CA'],
    '5-3-2': ['GOL', 'LAT', 'ZAG', 'ZAG', 'ZAG', 'LAT', 'MC', 'MC', 'MC', 'CA', 'CA']
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
    if (currentUser) setMyTeam({ name: currentUser.team || "Flamengo", manager: currentUser.username });
  }, [currentUser]);

  const fetchGameData = async () => {
    if (!myTeam?.name) return;
    const { data: pData } = await supabase.from('players').select('*').eq('current_club', myTeam.name);
    if (pData && pData.length > 0) {
      setSquad(pData);
    } else {
      // Plantel com Posições Diversificadas para Teste de Química
      const defaultPositions = ['GOL', 'LAT', 'ZAG', 'ZAG', 'LAT', 'VOL', 'MC', 'MEI', 'EXT', 'CA', 'EXT', 'MC', 'ZAG', 'CA', 'GOL', 'LAT'];
      setSquad(Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        name: `Atleta ${i + 1}`,
        overall: 74 + (i % 6),
        position: defaultPositions[i]
      })));
    }

    // Mercado
    const { data: mData } = await supabase.from('players').select('*').eq('current_club', 'Mercado Livre');
    if (mData) setMarketPlayers(mData);
  };

  useEffect(() => { fetchGameData(); }, [myTeam]);

  // Checagem Imediata de Posição Errada (Retorna true se fora de posição)
  const isPlayerOutOfPosition = (playerPos, slotRole) => {
    if (!playerPos || !slotRole) return false;
    const posMap = {
      'GOL': ['GOL'],
      'ZAG': ['ZAG', 'DEF'],
      'LAT': ['LAT', 'DEF'],
      'VOL': ['VOL', 'MC'],
      'MC': ['MC', 'VOL', 'MEI'],
      'MEI': ['MEI', 'MC', 'EXT'],
      'EXT': ['EXT', 'MEI', 'CA'],
      'CA': ['CA', 'EXT']
    };
    const allowed = posMap[slotRole] || [slotRole];
    return !allowed.includes(playerPos.toUpperCase());
  };

  // Troca de Posição Titular x Reserva
  const handleSwapPlayers = (reserveIdx) => {
    if (selectedStarterForSub === null) return alert("Selecione primeiro um titular no campo!");
    const newSquad = [...squad];
    const sIdx = selectedStarterForSub;
    const rIdx = 11 + reserveIdx;

    const temp = newSquad[sIdx];
    newSquad[sIdx] = newSquad[rIdx];
    newSquad[rIdx] = temp;

    setSquad(newSquad);
    setSelectedStarterForSub(null);
  };

  // Colocar Jogador à Venda no Mercado
  const handleListPlayerForSale = async (player) => {
    const price = Number(sellPriceInput[player.id]);
    if (!price || price <= 0) return alert("Digite um valor válido para venda!");

    const { error } = await supabase.from('players').update({ current_club: 'Mercado Livre', price: price }).eq('id', player.id);
    if (!error) {
      alert(`${player.name} foi anunciado no Mercado Livre por R$ ${price.toLocaleString('pt-BR')}!`);
      fetchGameData();
    } else {
      // Fallback Local
      setSquad(squad.filter(p => p.id !== player.id));
      setMarketPlayers([...marketPlayers, { ...player, current_club: 'Mercado Livre', price }]);
      alert(`${player.name} colocado no Mercado por R$ ${price.toLocaleString('pt-BR')}!`);
    }
  };// Simular Rodada Oficial para os 20 Times
  const handleSimulateOfficialRound = () => {
    const updated = leagueTable.map(t => {
      const gFor = Math.floor(Math.random() * 4);
      const gAgainst = Math.floor(Math.random() * 3);
      const win = gFor > gAgainst;
      const draw = gFor === gAgainst;

      return {
        ...t,
        j: t.j + 1,
        v: t.v + (win ? 1 : 0),
        e: t.e + (draw ? 1 : 0),
        d: t.d + (!win && !draw ? 1 : 0),
        pts: t.pts + (win ? 3 : draw ? 1 : 0),
        gp: t.gp + gFor,
        gc: t.gc + gAgainst,
        sg: t.sg + (gFor - gAgainst)
      };
    }).sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg);

    setLeagueTable(updated);
    setCurrentRound(r => r + 1);
    alert(`Rodada nº ${currentRound} de 38 executada! Tabela atualizada.`);
  };

  // Amistoso
  const handlePlayFriendly = () => {
    const FRIENDLY_COST = 500000;
    if (balance < FRIENDLY_COST) return alert("Saldo insuficiente (R$ 500.000).");
    setBalance(b => b - FRIENDLY_COST);
    setIsSimulatingFriendly(true);

    setTimeout(() => {
      const report = {
        type: 'Amistoso Profissional',
        homeTeam: myTeam?.name, awayTeam: selectedFriendlyOpponent,
        homeGoals: Math.floor(Math.random() * 3) + 1, awayGoals: Math.floor(Math.random() * 2),
        possessionHome: 56, xGHome: '2.10', xGAway: '0.85',
        mvp: squad[0]?.name || "Craque", date: new Date().toLocaleDateString('pt-BR')
      };
      setLastMatchReport(report);
      setIsSimulatingFriendly(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans pb-28">
      {/* Header */}
      <div className="w-full bg-[#0a1210] border-b border-emerald-500/30 px-4 py-4 text-center">
        <h1 className="text-xl font-black text-emerald-400 uppercase tracking-widest">FUTEBOL DIPLOMÁTICO</h1>
        <p className="text-[9px] text-zinc-400 font-bold uppercase">Liga Oficial 2026 • 20 Equipas</p>
      </div>

      {/* Navegação */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0e]/95 border-t border-emerald-500/30 p-2 z-40 overflow-x-auto hide-scrollbar">
        <div className="flex gap-1.5 min-w-max px-2">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'taticas', label: 'Táticas', icon: '📋' },
            { id: 'elenco', label: 'Elenco', icon: '👕' },
            { id: 'estatisticas', label: 'Série A (20)', icon: '📊' },
            { id: 'mercado', label: 'Mercado', icon: '🤝' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-3 rounded-xl min-w-[60px] text-[8px] font-black uppercase cursor-pointer ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-zinc-500'}`}>
              <span className="text-base block mb-0.5">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 text-center">
        
        {/* ABA: TÁTICAS (COM ALERTA VERMELHO IMEDIATO DE POSIÇÃO ERRADA) */}
        {activeTab === 'taticas' && (
          <div className="space-y-4 text-left">
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl flex justify-between items-center">
              <div>
                <h3 className="text-emerald-400 font-black text-xs uppercase">Prancheta & Formações</h3>
                <p className="text-[9px] text-zinc-400">Vermelho = Jogador fora de posição</p>
              </div>
              <select value={selectedFormation} onChange={(e) => setSelectedFormation(e.target.value)} className="bg-black border border-emerald-500/40 text-xs text-white p-2.5 rounded-xl font-bold cursor-pointer">
                <option value="4-3-3">4-3-3 Ofensivo</option>
                <option value="4-4-2">4-4-2 Clássico</option>
                <option value="3-5-2">3-5-2 Domínio</option>
                <option value="4-2-3-1">4-2-3-1 Equilibrado</option>
                <option value="5-3-2">5-3-2 Contenção</option>
              </select>
            </div>

            {/* O Campo com Checagem de Química Instantânea */}
            <div className="relative w-full h-[430px] bg-gradient-to-b from-emerald-950 via-green-900 to-emerald-950 rounded-3xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl p-2">
              <div className="absolute inset-2 border border-white/20 rounded-2xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2 pointer-events-none"></div>

              {formationLayouts[selectedFormation].map((pos, idx) => {
                const player = squad[idx] || { name: `Titular ${idx+1}`, overall: 75, position: formationRoles[selectedFormation][idx] };
                const reqRole = formationRoles[selectedFormation][idx];
                const outOfPos = isPlayerOutOfPosition(player.position, reqRole);
                const isSelected = selectedStarterForSub === idx;

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedStarterForSub(idx)}
                    style={{ top: pos.top, left: pos.left }} 
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
                  >
                    {/* Ficha com Sinalização de Erro Tático em Vermelho */}
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

                    {/* Alerta Visual de Função */}
                    <span className="text-[6px] text-zinc-400 font-bold uppercase">{reqRole}</span>
                  </div>
                );
              })}
            </div>

            {/* Banco de Reservas */}
            <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-2">
              <h4 className="text-emerald-400 font-black text-xs uppercase">Banco (Clique no Titular e no Reserva para Trocar)</h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {squad.slice(11).map((res, idx) => (
                  <div key={res.id || idx} className="bg-black/50 p-2.5 rounded-2xl flex items-center justify-between border border-zinc-800 text-xs">
                    <div>
                      <p className="font-bold text-white uppercase">{res.name} <span className="text-amber-400">({res.position || 'MC'})</span></p>
                      <p className="text-[9px] text-zinc-400">OVR: <span className="text-emerald-400 font-bold">{res.overall}</span></p>
                    </div>
                    <button onClick={() => handleSwapPlayers(idx)} className="bg-emerald-600 text-black text-[9px] font-black px-3 py-1.5 rounded-xl uppercase cursor-pointer">
                      Trocar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}{/* ABA: ELENCO (COM OPÇÃO DE COLOCAR À VENDA NO MERCADO DE TRANSFERÊNCIAS) */}
        {activeTab === 'elenco' && (
          <div className="text-left space-y-3">
            <h3 className="text-emerald-400 font-black text-xs uppercase">Gestão do Plantel ({squad.length} Atletas)</h3>
            <div className="space-y-2">
              {squad.map((player) => (
                <div key={player.id} className="bg-[#0f1412] border border-emerald-900/30 p-3.5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <p className="text-white font-black text-xs uppercase">{player.name} <span className="text-[9px] text-amber-400 ml-1">({player.position || 'MC'})</span></p>
                    <p className="text-[9px] text-zinc-400">Nível OVR: <span className="text-emerald-400 font-bold">{player.overall}</span></p>
                  </div>

                  {/* Formulário Integrado de Anúncio de Venda */}
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      placeholder="Valor R$" 
                      value={sellPriceInput[player.id] || ''} 
                      onChange={(e) => setSellPriceInput({ ...sellPriceInput, [player.id]: e.target.value })}
                      className="w-24 bg-black border border-zinc-800 text-white text-[10px] p-2 rounded-xl outline-none focus:border-emerald-500" 
                    />
                    <button onClick={() => handleListPlayerForSale(player)} className="bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-black px-3 py-2 rounded-xl uppercase cursor-pointer">
                      Anunciar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: MERCADO DE TRANSFERÊNCIAS */}
        {activeTab === 'mercado' && (
          <div className="text-left space-y-3">
            <h3 className="text-emerald-400 font-black text-xs uppercase">Mercado Livre & Leilões ({marketPlayers.length})</h3>
            <div className="space-y-2">
              {marketPlayers.map(m => (
                <div key={m.id} className="bg-[#0f1412] border border-amber-900/30 p-3.5 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold text-xs uppercase">{m.name} <span className="text-amber-400">({m.position})</span></p>
                    <p className="text-[9px] text-zinc-400">Passe: <span className="text-emerald-400 font-bold">R$ {(m.price || 5000000).toLocaleString('pt-BR')}</span></p>
                  </div>
                  <button onClick={() => alert(`Proposta enviada para aquisição de ${m.name}!`)} className="bg-emerald-600 text-black font-black text-[9px] px-3 py-2 rounded-xl uppercase cursor-pointer">
                    Comprar
                  </button>
                </div>
              ))}
              {marketPlayers.length === 0 && (
                <div className="bg-[#0f1412] p-4 rounded-3xl text-center text-xs text-zinc-500">Nenhum jogador à venda no momento.</div>
              )}
            </div>
          </div>
        )}

        {/* ABA: CAMPEONATO (TABELA DOS 20 TIMES & CALENDÁRIO UNIVERSAL) */}
        {activeTab === 'estatisticas' && (
          <div className="space-y-4 text-left">
            <div className="flex bg-[#0f1412] p-1.5 rounded-2xl border border-emerald-900/40">
              {['tabela', 'calendario'].map(sub => (
                <button key={sub} onClick={() => setStatsSubTab(sub)} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl cursor-pointer ${statsSubTab === sub ? 'bg-emerald-600 text-black' : 'text-zinc-400'}`}>
                  {sub}
                </button>
              ))}
            </div>

            {statsSubTab === 'tabela' && (
              <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
                <h3 className="text-emerald-400 font-black text-xs uppercase">Classificação Oficial da Série A (20 Equipas)</h3>
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-[10px] text-left">
                    <thead>
                      <tr className="border-b border-emerald-900/40 text-zinc-500 uppercase font-black">
                        <th className="py-2">Clube</th><th className="py-2 text-center">P</th><th className="py-2 text-center">J</th><th className="py-2 text-center">V</th><th className="py-2 text-center">E</th><th className="py-2 text-center">SG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-900/20">
                      {leagueTable.map((t, i) => (
                        <tr key={t.club} className="hover:bg-emerald-950/30">
                          <td className="py-2 font-black text-white uppercase">{i + 1}. {t.club}</td>
                          <td className="py-2 text-center font-black text-emerald-400">{t.pts}</td>
                          <td className="py-2 text-center text-zinc-400">{t.j}</td>
                          <td className="py-2 text-center text-zinc-300">{t.v}</td>
                          <td className="py-2 text-center text-zinc-400">{t.e}</td>
                          <td className="py-2 text-center font-bold text-emerald-400">{t.sg > 0 ? `+${t.sg}` : t.sg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {statsSubTab === 'calendario' && (
              <div className="bg-[#0f1412] border border-emerald-900/40 p-4 rounded-3xl shadow-xl space-y-3">
                <h3 className="text-emerald-400 font-black text-xs uppercase">Calendário Universal • Rodada {currentRound} de 38</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
                  {initial20Teams.slice(0, 10).map((t, i) => (
                    <div key={i} className="bg-black/50 p-2.5 rounded-xl border border-zinc-800 flex justify-between font-bold">
                      <span>🏠 {t}</span>
                      <span className="text-zinc-500">VS</span>
                      <span>✈️ {initial20Teams[19 - i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentUser?.username?.toLowerCase() === 'lvelasques' && (
              <button onClick={handleSimulateOfficialRound} className="w-full bg-red-600 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer">
                ⚡ Simular Rodada Oficial nº {currentRound} (ADM)
              </button>
            )}
          </div>
        )}

        {/* ABA: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4 text-left">
            <div className="bg-[#0f1412] border border-emerald-900/40 rounded-3xl p-5 shadow-xl">
              <h3 className="text-emerald-400 font-black text-xs uppercase tracking-wider mb-2 flex justify-between">
                <span>⚔️ Amistoso Interclubes</span>
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[9px]">R$ 500k</span>
              </h3>
              <button onClick={handlePlayFriendly} disabled={isSimulatingFriendly} className="w-full bg-emerald-600 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer">
                {isSimulatingFriendly ? "Simulando..." : "Realizar Amistoso (R$ 500.000)"}
              </button>
            </div>

            {lastMatchReport && (
              <div className="bg-[#0f1412] border border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-2 text-xs">
                <p className="font-black text-white text-center">{lastMatchReport.homeTeam} {lastMatchReport.homeGoals} x {lastMatchReport.awayGoals} {lastMatchReport.awayTeam}</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
