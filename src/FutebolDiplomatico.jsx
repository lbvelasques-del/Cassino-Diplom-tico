import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function FutebolDiplomatico() {
  const [currentUser] = useState(() => {
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
  const [transferMarket, setTransferMarket] = useState([]);
  const [matchesCount, setMatchesCount] = useState(0);

  // Estados para a Tabela Geral de Clubes e Relatório
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubSquad, setClubSquad] = useState([]);

  // Estados para o motor de partida
  const [matchState, setMatchState] = useState('menu'); 
  const [matchResult, setMatchResult] = useState(null);
  const [liveLog, setLiveLog] = useState([]);

  // Estado para preço personalizado de venda
  const [sellingPlayer, setSellingPlayer] = useState(null);
  const [customPrice, setCustomPrice] = useState('');

  // Estado para Proposta Direta a Jogador de outro time
  const [proposingPlayer, setProposingPlayer] = useState(null);
  const [proposalOffer, setProposalOffer] = useState('');

  useEffect(() => {
    if (currentUser) {
      setMyTeam({
        name: currentUser.team || "Flamengo", 
        stadium: "Estádio Municipal",
        manager: currentUser.username,
        overall: 80
      });
    }
  }, [currentUser]);

  const fetchGameData = async (clubName) => {
    if (!clubName) return;
    
    // Buscar elenco do meu clube
    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('current_club', clubName)
      .order('overall', { ascending: false });

    if (playersData) setSquad(playersData);

    // Buscar mercado de transferências
    const { data: marketData } = await supabase
      .from('players')
      .select('*')
      .eq('is_listed', true);

    if (marketData) setTransferMarket(marketData);

    // Buscar lista de todos os clubes únicos na base
    const { data: allPlayers } = await supabase.from('players').select('current_club, overall');
    if (allPlayers) {
      const clubsMap = {};
      allPlayers.forEach(p => {
        if (!clubsMap[p.current_club]) {
          clubsMap[p.current_club] = { name: p.current_club, totalOvr: 0, count: 0 };
        }
        clubsMap[p.current_club].totalOvr += p.overall;
        clubsMap[p.current_club].count += 1;
      });
      const clubsList = Object.values(clubsMap).map(c => ({
        ...c,
        avgOvr: Math.round(c.totalOvr / c.count)
      })).sort((a, b) => b.avgOvr - a.avgOvr);
      setAllClubs(clubsList);
    }
  };

  useEffect(() => {
    if (myTeam) {
      fetchGameData(myTeam.name);
    }
  }, [myTeam]);

  // Carregar plantel de um clube específico ao clicar na tabela geral
  const handleSelectClubReport = async (clubName) => {
    setSelectedClub(clubName);
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('current_club', clubName)
      .order('overall', { ascending: false });
    if (data) setClubSquad(data);
  };

  const getMinMarketValue = (overall) => overall * 250000;

  // Cálculo de contrato (Classe Diamante mínimo 1.2M, outros por OVR)
  const getContractValue = (tier, overall) => {
    if (tier && tier.toLowerCase() === 'diamante') return 1200000;
    return Math.max(800000, overall * 30000);
  };

  // Enviar proposta direta por jogador de outro clube (mesmo sem estar listado)
  const handleSendDirectProposal = async () => {
    if (!proposingPlayer) return;
    const offer = Number(proposalOffer);
    const minVal = getMinMarketValue(proposingPlayer.overall);

    if (offer < minVal) {
      alert(`A proposta não pode ser inferior ao valor mínimo de mercado: R$ ${minVal.toLocaleString('pt-BR')}`);
      return;
    }

    if (balance < offer) {
      alert('Saldo insuficiente na sua conta unificada para esta proposta!');
      return;
    }

    const houseCommission = offer * 0.15;
    const sellerRevenue = offer * 0.85;

    // Transfere o jogador imediatamente para o meu clube
    const { error } = await supabase
      .from('players')
      .update({ current_club: myTeam.name, is_listed: false, sale_price: 0 })
      .eq('id', proposingPlayer.id);

    if (!error) {
      const newBalance = balance - offer;
      setBalance(newBalance);
      localStorage.setItem('pampas_current_user', JSON.stringify({ ...currentUser, balance: newBalance }));
      alert(`Proposta aceite! ${proposingPlayer.name} contratado por R$ ${offer.toLocaleString('pt-BR')}. (Taxa da casa de 15%: R$ ${houseCommission.toLocaleString('pt-BR')})`);
      setProposingPlayer(null);
      setProposalOffer('');
      fetchGameData(myTeam.name);
      handleSelectClubReport(selectedClub);
    } else {
      alert('Erro ao processar transferência.');
    }
  };

  // Simulação de Partida
  const startMatchSimulation = () => {
    setMatchState('simulating');
    setLiveLog(['Apito inicial! A bola está a rolar...', 'A equipa pressiona no meio-campo...']);

    setTimeout(() => {
      setLiveLog(prev => [...prev, 'Jogada envolvente pelo flanco e remate com perigo!']);
    }, 1500);

    setTimeout(() => {
      const teamOverall = myTeam?.overall || 80;
      const rivalOverall = 78; 
      
      const myGoals = Math.floor(Math.random() * 3) + (teamOverall >= rivalOverall ? 1 : 0);
      const rivalGoals = Math.floor(Math.random() * 2);

      const newMatchCount = matchesCount + 1;
      setMatchesCount(newMatchCount);

      if (newMatchCount % 5 === 0) {
        alert('⚠️ ATENÇÃO: Ciclo de 5 partidas atingido! Os contratos do seu plantel precisam de renovação para evitar que atletas saiam para o mercado.');
      }

      setMatchResult({
        homeTeam: myTeam?.name || "Minha Equipa",
        awayTeam: "Rival FC",
        homeGoals: myGoals,
        awayGoals: rivalGoals,
        points: myGoals > rivalGoals ? 3 : myGoals === rivalGoals ? 1 : 0
      });
      setMatchState('result');
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased pb-24 selection:bg-emerald-500 selection:text-black">
      <div className="w-full bg-gradient-to-b from-[#0a1210] via-[#050a08] to-[#050507] border-b border-emerald-500/30 px-4 py-6 text-center relative shadow-2xl">
        <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-100 to-emerald-500">
          FUTEBOL DIPLOMÁTICO
        </h1>
        <p className="text-xs text-emerald-500/70 font-bold uppercase mt-1 tracking-widest">Manager & Relatórios 2026</p>
        
        {myTeam && (
          <div className="mt-4 inline-block bg-[#0d1612] border border-emerald-500/40 px-6 py-3 rounded-2xl shadow-lg w-full max-w-[90%]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                <div className="text-left">
                  <p className="text-white font-black text-lg leading-tight">{myTeam.name}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold">Técnico: <span className="text-emerald-400">{myTeam.manager}</span></p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-zinc-500 font-black block uppercase">Saldo Unificado</span>
                <span className="text-xs text-emerald-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Inferior */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0e]/95 backdrop-blur-md border-t border-emerald-500/30 p-2 z-40 flex justify-between shadow-2xl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}>
          <span className="text-lg mb-0.5">🏠</span>
          <span className="text-[8px] font-black uppercase">Clube</span>
        </button>
        <button onClick={() => setActiveTab('elenco')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'elenco' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}>
          <span className="text-lg mb-0.5">👕</span>
          <span className="text-[8px] font-black uppercase">Elenco</span>
        </button>
        <button onClick={() => setActiveTab('clubes')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'clubes' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}>
          <span className="text-lg mb-0.5">📊</span>
          <span className="text-[8px] font-black uppercase">Série A</span>
        </button>
        <button onClick={() => setActiveTab('mercado')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'mercado' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}>
          <span className="text-lg mb-0.5">🤝</span>
          <span className="text-[8px] font-black uppercase">Mercado</span>
        </button>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 text-center">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 text-left">
            <div className="bg-[#0f1412] border border-emerald-900/30 rounded-3xl p-5 shadow-xl">
              <h3 className="text-emerald-400 font-black text-sm uppercase mb-3 flex items-center justify-between">
                <span>⚽ Próxima Partida</span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Ciclo Contrato: {matchesCount % 5}/5</span>
              </h3>

              {matchState === 'menu' && (
                <button 
                  onClick={startMatchSimulation}
                  className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-400 text-black font-black py-4 rounded-xl text-sm shadow-lg uppercase tracking-wider cursor-pointer"
                >
                  Entrar em Campo
                </button>
              )}

              {matchState === 'simulating' && (
                <div className="bg-black/60 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-2">
                  <div className="inline-block w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-emerald-400 uppercase">Simulando partida...</p>
                  {liveLog.map((log, idx) => <p key={idx} className="text-[11px] text-zinc-300">{log}</p>)}
                </div>
              )}

              {matchState === 'result' && matchResult && (
                <div className="bg-[#0d1612] border border-emerald-500/50 p-4 rounded-2xl text-center space-y-3">
                  <p className="text-xs font-black text-emerald-400 uppercase">Fim de Jogo</p>
                  <p className="text-lg font-black text-white">{matchResult.homeGoals} - {matchResult.awayGoals}</p>
                  <button onClick={() => setMatchState('menu')} className="w-full bg-emerald-600 text-black font-black py-2 rounded-xl text-xs uppercase cursor-pointer">
                    Continuar Temporada
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'elenco' && (
          <div className="text-left space-y-3">
            <h3 className="text-emerald-400 font-black text-lg uppercase">Meu Plantel ({squad.length} Atletas)</h3>
            {squad.map((player) => (
              <div key={player.id} className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-xs uppercase">{player.name} <span className="text-[9px] text-cyan-400">({player.class_tier})</span></p>
                  <p className="text-[10px] text-zinc-400">OVR: <span className="text-emerald-400 font-bold">{player.overall}</span> | Contrato: <span className="text-amber-400 font-bold">R$ {getContractValue(player.class_tier, player.overall).toLocaleString('pt-BR')}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabela de Clubes da Série A e Relatórios */}
        {activeTab === 'clubes' && (
          <div className="text-left space-y-4">
            <h3 className="text-emerald-400 font-black text-lg uppercase">Clubes da Série A 📊</h3>
            {!selectedClub ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">Clique num clube para ver o relatório completo do plantel e fazer propostas:</p>
                {allClubs.map((club, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleSelectClubReport(club.name)}
                    className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-emerald-500">{idx + 1}º</span>
                      <div>
                        <p className="text-white font-black text-xs uppercase">{club.name}</p>
                        <p className="text-[10px] text-zinc-400">{club.count} Atletas no Plantel</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-500 font-black block uppercase">Média OVR</span>
                      <span className="text-xs text-emerald-400 font-black">{club.avgOvr}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#0f1412] p-3 rounded-2xl border border-emerald-500/40">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase">{selectedClub}</h4>
                    <p className="text-[10px] text-emerald-400">Relatório Completo de Atletas</p>
                  </div>
                  <button 
                    onClick={() => setSelectedClub(null)}
                    className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    ⬅️ Voltar aos Clubes
                  </button>
                </div>

                {clubSquad.map((player) => (
                  <div key={player.id} className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-black text-xs uppercase">{player.name} <span className="text-[9px] text-cyan-400">({player.class_tier})</span></p>
                      <p className="text-[10px] text-zinc-400">OVR: <span className="text-emerald-400 font-bold">{player.overall}</span> | Pos: {player.position} | Val. Mín: R$ {getMinMarketValue(player.overall).toLocaleString('pt-BR')}</p>
                    </div>
                    {player.current_club !== myTeam?.name && (
                      <button 
                        onClick={() => setProposingPlayer(player)}
                        className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black py-1.5 px-3 rounded-xl hover:bg-emerald-600 hover:text-black cursor-pointer"
                      >
                        PROPOSTA
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Proposta Direta a Jogador */}
        {proposingPlayer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1412] border border-emerald-500/50 p-5 rounded-3xl w-full max-w-sm text-left space-y-3">
              <h4 className="text-sm font-black text-emerald-400 uppercase">Proposta por: {proposingPlayer.name}</h4>
              <p className="text-[11px] text-zinc-400">Clube atual: <span className="text-white font-bold">{proposingPlayer.current_club}</span></p>
              <p className="text-[11px] text-zinc-400">Valor mínimo de mercado: <span className="text-amber-400 font-bold">R$ {getMinMarketValue(proposingPlayer.overall).toLocaleString('pt-BR')}</span></p>
              <input 
                type="number" 
                placeholder="Digite o valor da sua proposta" 
                value={proposalOffer} 
                onChange={(e) => setProposalOffer(e.target.value)}
                className="w-full bg-black border border-emerald-900 p-2.5 rounded-xl text-white text-xs"
              />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setProposingPlayer(null)} className="flex-1 bg-zinc-800 text-zinc-300 text-xs py-2 rounded-xl font-bold cursor-pointer">Cancelar</button>
                <button onClick={handleSendDirectProposal} className="flex-1 bg-emerald-600 text-black text-xs py-2 rounded-xl font-black cursor-pointer">Enviar Proposta</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mercado' && (
          <div className="text-left space-y-4">
            <h3 className="text-emerald-400 font-black text-lg uppercase">Área de Transferências 🤝</h3>
            {transferMarket.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6">Nenhum jogador listado no mercado no momento. (Lembre-se que agora pode fazer propostas diretas na aba Série A!)</p>
            ) : (
              transferMarket.map((player) => (
                <div key={player.id} className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-white font-black text-xs uppercase">{player.name} <span className="text-[9px] text-amber-400">({player.current_club})</span></p>
                    <p className="text-[10px] text-zinc-400">OVR: <span className="text-emerald-400 font-bold">{player.overall}</span> | Preço: <span className="text-emerald-400 font-bold">R$ {(player.sale_price || player.market_value).toLocaleString('pt-BR')}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
                    }
