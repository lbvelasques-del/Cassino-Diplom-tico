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
      </div>
