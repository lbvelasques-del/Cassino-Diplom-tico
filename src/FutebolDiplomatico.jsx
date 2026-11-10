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

  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [myTeam, setMyTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [transferMarket, setTransferMarket] = useState([]);
  const [matchesCount, setMatchesCount] = useState(0);

  // Estados da Tabela Geral e Relatório
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubSquad, setClubSquad] = useState([]);

  // Estados da Caixa de Entrada (Propostas)
  const [inboxOffers, setInboxOffers] = useState([]);

  // Estados do Motor de Partida
  const [matchState, setMatchState] = useState('menu'); 
  const [matchResult, setMatchResult] = useState(null);
  const [liveLog, setLiveLog] = useState([]);

  // Estado para Proposta Direta
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
    
    // Plantel
    const { data: playersData } = await supabase.from('players').select('*').eq('current_club', clubName).order('overall', { ascending: false });
    if (playersData) setSquad(playersData);

    // Mercado
    const { data: marketData } = await supabase.from('players').select('*').eq('is_listed', true);
    if (marketData) setTransferMarket(marketData);

    // Propostas Recebidas (Mock visual ou leitura real futura)
    const { data: offersData } = await supabase.from('transfer_offers').select('*, players(*)').eq('receiver_club', clubName).eq('status', 'pendente');
    if (offersData) setInboxOffers(offersData);

    // Lista de Clubes
    const { data: allPlayers } = await supabase.from('players').select('current_club, overall');
    if (allPlayers) {
      const clubsMap = {};
      allPlayers.forEach(p => {
        if (!clubsMap[p.current_club]) clubsMap[p.current_club] = { name: p.current_club, totalOvr: 0, count: 0 };
        clubsMap[p.current_club].totalOvr += p.overall;
        clubsMap[p.current_club].count += 1;
      });
      const clubsList = Object.values(clubsMap).map(c => ({
        ...c, avgOvr: Math.round(c.totalOvr / c.count)
      })).sort((a, b) => b.avgOvr - a.avgOvr);
      setAllClubs(clubsList);
    }
  };

  useEffect(() => {
    if (myTeam) fetchGameData(myTeam.name);
  }, [myTeam]);const handleSelectClubReport = async (clubName) => {
    setSelectedClub(clubName);
    const { data } = await supabase.from('players').select('*').eq('current_club', clubName).order('overall', { ascending: false });
    if (data) setClubSquad(data);
  };

  const getMinMarketValue = (overall) => overall * 250000;
  const getContractValue = (tier, overall) => tier && tier.toLowerCase() === 'diamante' ? 1200000 : Math.max(800000, overall * 30000);

  const handleSendDirectProposal = async () => {
    if (!proposingPlayer) return;
    const offer = Number(proposalOffer);
    const minVal = getMinMarketValue(proposingPlayer.overall);

    if (offer < minVal) {
      alert(`A proposta mínima deve ser de R$ ${minVal.toLocaleString('pt-BR')}`);
      return;
    }
    if (balance < offer) {
      alert('Saldo insuficiente na conta unificada!');
      return;
    }

    const houseCommission = offer * 0.15;
    
    // Transferência direta imediata (para times BOTs)
    const { error } = await supabase.from('players').update({ current_club: myTeam.name, is_listed: false, sale_price: 0 }).eq('id', proposingPlayer.id);

    if (!error) {
      const newBalance = balance - offer;
      setBalance(newBalance);
      localStorage.setItem('pampas_current_user', JSON.stringify({ ...currentUser, balance: newBalance }));
      alert(`Craque contratado por R$ ${offer.toLocaleString('pt-BR')}! Taxa da casa (15%): R$ ${houseCommission.toLocaleString('pt-BR')}`);
      setProposingPlayer(null);
      setProposalOffer('');
      fetchGameData(myTeam.name);
      handleSelectClubReport(selectedClub);
    }
  };

  const startMatchSimulation = () => {
    setMatchState('simulating');
    setLiveLog(['Apito inicial! A bola rola no gramado...', 'A sua equipe troca passes no meio-campo...']);
    setTimeout(() => setLiveLog(prev => [...prev, 'Lançamento na área, cabeçada perigosa!']), 1500);

    setTimeout(() => {
      const teamOverall = myTeam?.overall || 80;
      const rivalOverall = 78; 
      const myGoals = Math.floor(Math.random() * 3) + (teamOverall >= rivalOverall ? 1 : 0);
      const rivalGoals = Math.floor(Math.random() * 2);

      setMatchesCount(prev => {
        const next = prev + 1;
        if (next % 5 === 0) alert('⚠️ AVISO DE CONTRATO: Ciclo de 5 partidas atingido! Renove os contratos ou seus atletas irão para o mercado!');
        return next;
      });

      setMatchResult({
        homeTeam: myTeam?.name, awayTeam: "Rival FC",
        homeGoals: myGoals, awayGoals: rivalGoals,
        victory: myGoals > rivalGoals
      });
      setMatchState('result');
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased pb-28 selection:bg-emerald-500 selection:text-black">
      {/* Cabeçalho */}
      <div className="w-full bg-gradient-to-b from-[#0a1210] via-[#050a08] to-[#050507] border-b border-emerald-500/30 px-4 py-6 text-center relative shadow-2xl">
        <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-100 to-emerald-500">
          FUTEBOL DIPLOMÁTICO
        </h1>
        <p className="text-xs text-emerald-500/70 font-bold uppercase mt-1 tracking-widest">Liga Oficial 2026</p>
        
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
                <span className="text-[9px] text-zinc-500 font-black block uppercase">Caixa</span>
                <span className="text-xs text-emerald-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navegação Inferior (Scroll Horizontal para caber tudo) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0e]/95 backdrop-blur-md border-t border-emerald-500/30 p-2 z-40 shadow-2xl overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-max px-2">
          {['dashboard', 'taticas', 'elenco', 'clubes', 'mercado', 'inbox', 'jornal'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px] ${activeTab === tab ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500'}`}>
              <span className="text-lg mb-0.5">
                {tab === 'dashboard' ? '🏠' : tab === 'taticas' ? '📋' : tab === 'elenco' ? '👕' : tab === 'clubes' ? '📊' : tab === 'mercado' ? '🤝' : tab === 'inbox' ? '📩' : '📰'}
              </span>
              <span className="text-[8px] font-black uppercase">{tab}</span>
            </button>
          ))}
        </div>
      </div><main className="max-w-md mx-auto p-4 space-y-4 text-center">
        
        {/* ABA: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 text-left">
            <div className="bg-[#0f1412] border border-emerald-900/30 rounded-3xl p-5 shadow-xl">
              <h3 className="text-emerald-400 font-black text-sm uppercase mb-3 flex items-center justify-between">
                <span>⚽ Próxima Partida</span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Ciclo: {matchesCount % 5}/5</span>
              </h3>

              {matchState === 'menu' && (
                <button onClick={startMatchSimulation} className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-400 text-black font-black py-4 rounded-xl text-sm shadow-lg uppercase cursor-pointer">
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

        {/* ABA: TÁTICAS (PRANCHETA) */}
        {activeTab === 'taticas' && (
          <div className="space-y-4 text-left animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-emerald-400 font-black text-lg uppercase">Prancheta Tática 📋</h3>
              <select className="bg-black border border-emerald-900 text-xs text-white p-1.5 rounded-lg">
                <option>4-3-3 Ofensivo</option>
                <option>4-4-2 Clássico</option>
              </select>
            </div>
            <div className="relative w-full h-[400px] bg-green-900 rounded-lg border-2 border-white/40 overflow-hidden shadow-2xl mt-4">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-black/80 border-2 border-emerald-400 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">GOL</div>
              </div>
              <div className="absolute bottom-24 left-8 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-400 rounded-full flex items-center justify-center text-[10px] font-black">LAE</div>
              </div>
              <div className="absolute bottom-20 left-1/3 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-400 rounded-full flex items-center justify-center text-[10px] font-black">ZAG</div>
              </div>
              <div className="absolute bottom-20 right-1/3 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-400 rounded-full flex items-center justify-center text-[10px] font-black">ZAG</div>
              </div>
              <div className="absolute bottom-24 right-8 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-400 rounded-full flex items-center justify-center text-[10px] font-black">LAD</div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-400 rounded-full flex items-center justify-center text-[10px] font-black">MEI</div>
              </div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-10 h-10 bg-amber-600 border border-amber-300 rounded-full flex items-center justify-center text-[10px] font-black text-white">ATA</div>
              </div>
              <p className="absolute bottom-1 right-2 text-[8px] text-white/50">Clique nas posições para escalar</p>
            </div>
          </div>
        )}

        {/* ABA: ELENCO */}
        {activeTab === 'elenco' && (
          <div className="text-left space-y-3">
            <h3 className="text-emerald-400 font-black text-lg uppercase">Plantel ({squad.length})</h3>
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

        {/* ABA: CLUBES (SÉRIE A) & PROPOSTAS */}
        {activeTab === 'clubes' && (
          <div className="text-left space-y-4">
            <h3 className="text-emerald-400 font-black text-lg uppercase">Clubes da Série A 📊</h3>
            {!selectedClub ? (
              <div className="space-y-2">
                {allClubs.map((club, idx) => (
                  <div key={idx} onClick={() => handleSelectClubReport(club.name)} className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-emerald-500">{idx + 1}º</span>
                      <div>
                        <p className="text-white font-black text-xs uppercase">{club.name}</p>
                        <p className="text-[10px] text-zinc-400">{club.count} Atletas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-500 font-black uppercase">Média OVR</span>
                      <span className="text-xs text-emerald-400 font-black">{club.avgOvr}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between bg-[#0f1412] p-3 rounded-2xl border border-emerald-500/40">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase">{selectedClub}</h4>
                    <p className="text-[10px] text-emerald-400">Relatório Completo</p>
                  </div>
                  <button onClick={() => setSelectedClub(null)} className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-3 py-1.5 rounded-xl">⬅️ Voltar</button>
                </div>
                {clubSquad.map((player) => (
                  <div key={player.id} className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-black text-xs uppercase">{player.name}</p>
                      <p className="text-[10px] text-zinc-400">OVR: <span className="text-emerald-400 font-bold">{player.overall}</span> | Pos: {player.position} | Val. Mín: R$ {getMinMarketValue(player.overall).toLocaleString('pt-BR')}</p>
                    </div>
                    {player.current_club !== myTeam?.name && (
                      <button onClick={() => setProposingPlayer(player)} className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black py-1.5 px-3 rounded-xl hover:bg-emerald-600 hover:text-black">
                        PROPOSTA
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Proposta */}
        {proposingPlayer && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1412] border border-emerald-500/50 p-5 rounded-3xl w-full max-w-sm text-left space-y-3">
              <h4 className="text-sm font-black text-emerald-400 uppercase">Proposta por: {proposingPlayer.name}</h4>
              <p className="text-[11px] text-zinc-400">Valor Mínimo: <span className="text-amber-400 font-bold">R$ {getMinMarketValue(proposingPlayer.overall).toLocaleString('pt-BR')}</span></p>
              <input type="number" placeholder="Sua oferta" value={proposalOffer} onChange={(e) => setProposalOffer(e.target.value)} className="w-full bg-black border border-emerald-900 p-2.5 rounded-xl text-white text-xs" />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setProposingPlayer(null)} className="flex-1 bg-zinc-800 text-zinc-300 text-xs py-2 rounded-xl font-bold">Cancelar</button>
                <button onClick={handleSendDirectProposal} className="flex-1 bg-emerald-600 text-black text-xs py-2 rounded-xl font-black">Comprar</button>
              </div>
            </div>
          </div>
        )}

        {/* ABA: CAIXA DE ENTRADA (MENSAGENS) */}
        {activeTab === 'inbox' && (
          <div className="space-y-4 text-left">
            <h3 className="text-emerald-400 font-black text-lg uppercase">Caixa de Entrada 📩</h3>
            {inboxOffers.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Caixa vazia. Nenhuma proposta recebida recentemente.</p>
            ) : (
              inboxOffers.map(offer => (
                <div key={offer.id} className="bg-[#0f1412] border border-amber-500/50 p-4 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-black text-sm uppercase">Proposta Recebida</h4>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded font-bold">PENDENTE</span>
                  </div>
                  <p className="text-xs text-zinc-300 mb-3">
                    O <span className="text-white font-bold">{offer.sender_club}</span> fez uma oferta pelo seu atleta <span className="text-emerald-400 font-bold">{offer.players?.name || 'Jogador'}</span>.
                  </p>
                  <div className="bg-black/50 p-3 rounded-xl border border-emerald-900/30 mb-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-zinc-400">Oferta Bruta:</span><span className="text-white font-bold">R$ {offer.offer_value.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-red-400">Taxa (15%):</span><span className="text-red-400 font-bold">- R$ {(offer.offer_value * 0.15).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2 pt-2 border-t border-emerald-900/50">
                      <span className="text-emerald-400 font-black uppercase">Receita Líquida:</span><span className="text-emerald-400 font-black">R$ {(offer.offer_value * 0.85).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-red-900/40 text-red-400 border border-red-900/50 text-xs py-2 rounded-xl font-bold hover:bg-red-900/60">Recusar</button>
                    <button className="flex-1 bg-emerald-600 text-black text-xs py-2 rounded-xl font-black hover:bg-emerald-500">Aceitar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA: JORNAL (GAZETA) */}
        {activeTab === 'jornal' && (
          <div className="space-y-4 text-left animate-fade-in">
            <div className="bg-[#e5e5e5] text-black p-5 rounded-sm border-t-8 border-black font-serif shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 rotate-45 translate-x-8 -translate-y-8 flex items-end justify-center pb-1"><span className="text-[8px] text-white font-black uppercase tracking-widest">HOT</span></div>
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-3xl font-black uppercase tracking-tighter">A Gazeta</h1>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Edição Oficial da Liga • 2026</p>
              </div>
              <div className="space-y-4">
                <article>
                  <span className="bg-black text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider mb-1 inline-block">Resumo da Rodada</span>
                  <h2 className="text-lg font-black leading-tight mb-1">
                    {matchResult ? 
                      (matchResult.victory ? `${myTeam?.name} domina adversário e arranca vitória crucial!` : `${myTeam?.name} tropeça no campeonato e frustra torcedores.`) 
                      : "Campeonato prestes a começar: Clubes preparam-se para a primeira rodada!"}
                  </h2>
                  <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                    {matchResult ? 
                      `A última partida terminou em ${matchResult.homeGoals} a ${matchResult.awayGoals}. O treinador ${myTeam?.manager} ${matchResult.victory ? 'foi ovacionado pela torcida após excelente plano tático' : 'terá que rever suas táticas para a próxima rodada após duras críticas'}.`
                      : `A expectativa é alta. O mercado está agitado e os dirigentes esperam grandes emoções.`}
                  </p>
                </article>
                <div className="h-px bg-zinc-400 w-full my-2"></div>
                <article className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-amber-500 rounded flex items-center justify-center flex-shrink-0 text-xl shadow-inner">💰</div>
                  <div>
                    <h3 className="text-xs font-black uppercase leading-tight mb-0.5">Mercado Aquecido</h3>
                    <p className="text-[10px] text-zinc-700 font-medium">RUMOR: Um novo jogador Lenda (OVR 100+) poderá aparecer na área de leilões a qualquer momento!</p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        )}

        {/* ABA: MERCADO (Listados Padrão) */}
        {activeTab === 'mercado' && (
          <div className="text-left space-y-4">
            <h3 className="text-emerald-400 font-black text-lg uppercase">Mercado 🤝</h3>
            {transferMarket.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6">Nenhum jogador na lista. Vá na aba "Série A" para fazer propostas diretas!</p>
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
