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

  // Estados para o motor de partida
  const [matchState, setMatchState] = useState('menu'); // 'menu', 'simulating', 'result'
  const [matchResult, setMatchResult] = useState(null);
  const [liveLog, setLiveLog] = useState([]);

  // Estado para preço personalizado de venda
  const [sellingPlayer, setSellingPlayer] = useState(null);
  const [customPrice, setCustomPrice] = useState('');

  // Estado para ADM criar leilão
  const [admName, setAdmName] = useState('');
  const [admPos, setAdmPos] = useState('MEI');
  const [admOvr, setAdmOvr] = useState(80);

  useEffect(() => {
    if (currentUser) {
      setMyTeam({
        name: currentUser.team || "Sem Clube Atribuído", 
        stadium: "Estádio Municipal",
        manager: currentUser.username,
        overall: 78
      });
    }
  }, [currentUser]);

  const fetchGameData = async (clubName) => {
    if (!clubName || clubName === "Sem Clube Atribuído") return;
    
    // Buscar elenco do clube
    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('current_club', clubName)
      .order('overall', { ascending: false });

    if (playersData) setSquad(playersData);

    // Buscar jogadores na Área de Transferências
    const { data: marketData } = await supabase
      .from('players')
      .select('*')
      .eq('is_listed', true);

    if (marketData) setTransferMarket(marketData);
  };

  useEffect(() => {
    if (myTeam) {
      fetchGameData(myTeam.name);
    }
  }, [myTeam]);

  // Cálculo do valor mínimo baseado no OVR
  const getMinMarketValue = (overall) => {
    return overall * 250000; // Ex: OVR 80 = 20 Milhões mínimo
  };

  // Colocar jogador à venda com preço personalizado
  const handleListPlayer = async () => {
    if (!sellingPlayer) return;
    const minVal = getMinMarketValue(sellingPlayer.overall);
    const finalPrice = Number(customPrice);

    if (finalPrice < minVal) {
      alert(`O preço de venda não pode ser inferior ao mínimo de R$ ${minVal.toLocaleString('pt-BR')} para este OVR.`);
      return;
    }

    const { error } = await supabase
      .from('players')
      .update({ is_listed: true, sale_price: finalPrice })
      .eq('id', sellingPlayer.id);

    if (!error) {
      alert(`${sellingPlayer.name} foi colocado na Área de Transferências por R$ ${finalPrice.toLocaleString('pt-BR')}!`);
      setSellingPlayer(null);
      setCustomPrice('');
      fetchGameData(myTeam.name);
    } else {
      alert('Erro ao listar jogador.');
    }
  };

  // Comprar jogador do mercado (com 15% para a casa)
  const handleBuyPlayer = async (player) => {
    const price = player.sale_price || player.market_value;
    if (balance < price) {
      alert('Saldo insuficiente na sua conta unificada!');
      return;
    }

    const houseCommission = price * 0.15;
    const sellerRevenue = price * 0.85;

    // Atualizar clube do jogador para o meu time e deslistar
    const { error } = await supabase
      .from('players')
      .update({ current_club: myTeam.name, is_listed: false, sale_price: 0 })
      .eq('id', player.id);

    if (!error) {
      const newBalance = balance - price;
      setBalance(newBalance);
      localStorage.setItem('pampas_current_user', JSON.stringify({ ...currentUser, balance: newBalance }));
      alert(`Contratação efetuada com sucesso! 15% (R$ ${houseCommission.toLocaleString('pt-BR')}) retido pela casa.`);
      fetchGameData(myTeam.name);
    }
  };

  // ADM cria jogador para leilão
  const handleAdmCreateAuction = async (e) => {
    e.preventDefault();
    const tier = admOvr >= 85 ? 'Diamante' : admOvr >= 75 ? 'Ouro' : admOvr >= 65 ? 'Prata' : 'Bronze';
    const { error } = await supabase.from('players').insert([{
      name: admName,
      position: admPos,
      overall: Number(admOvr),
      class_tier: tier,
      current_club: 'Leilão ADM',
      is_listed: true,
      sale_price: getMinMarketValue(Number(admOvr)),
      market_value: getMinMarketValue(Number(admOvr))
    }]);

    if (!error) {
      alert('Jogador criado e enviado para a Área de Transferências com sucesso!');
      setAdmName('');
      fetchGameData(myTeam.name);
    }
  };

  // Simulação de Partida e Contratos (A cada 5 partidas)
  const startMatchSimulation = () => {
    setMatchState('simulating');
    setLiveLog(['Apito inicial! A bola está a rolar...', 'A equipa pressiona na saída de bola...']);

    setTimeout(() => {
      setLiveLog(prev => [...prev, 'Grande jogada de ataque e remate perigoso!']);
    }, 1500);

    setTimeout(() => {
      const teamOverall = myTeam?.overall || 78;
      const rivalOverall = 77; 
      
      const myGoals = Math.floor(Math.random() * 3) + (teamOverall >= rivalOverall ? 1 : 0);
      const rivalGoals = Math.floor(Math.random() * 2);

      const newMatchCount = matchesCount + 1;
      setMatchesCount(newMatchCount);

      // Verificação de Contrato a cada 5 partidas
      if (newMatchCount % 5 === 0) {
        alert('⚠️ Ciclo de 5 partidas concluído! Os contratos do plantel precisam de renovação para evitar que atletas saiam para o mercado.');
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

  const getClassStyle = (tier, overall) => {
    const t = tier ? tier.toLowerCase() : (overall >= 85 ? 'diamante' : overall >= 70 ? 'ouro' : overall >= 60 ? 'prata' : 'bronze');
    switch(t) {
      case 'diamante': return 'from-cyan-300 via-blue-500 to-purple-600 text-white border-cyan-300';
      case 'ouro': return 'from-yellow-300 via-amber-500 to-orange-500 text-black border-yellow-300';
      case 'prata': return 'from-gray-100 via-gray-300 to-gray-500 text-black border-gray-300';
      default: return 'from-orange-300 via-orange-600 to-amber-900 text-white border-orange-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased pb-24 selection:bg-emerald-500 selection:text-black">
      <div className="w-full bg-gradient-to-b from-[#0a1210] via-[#050a08] to-[#050507] border-b border-emerald-500/30 px-4 py-6 text-center relative shadow-2xl">
        <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-100 to-emerald-500">
          FUTEBOL DIPLOMÁTICO
        </h1>
        <p className="text-xs text-emerald-500/70 font-bold uppercase mt-1 tracking-widest">Manager & Mercado 2026</p>
        
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
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0e]/95 backdrop-blur-md border-t border-emerald-500/30 p-2.5 z-40 flex justify-between shadow-2xl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}>
          <span className="text-xl mb-1">🏠</span>
          <span className="text-[9px] font-black uppercase">Clube</span>
        </button>
        <button onClick={() => setActiveTab('elenco')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'elenco' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}>
          <span className="text-xl mb-1">👕</span>
          <span className="text-[9px] font-black uppercase">Elenco</span>
        </button>
        <button onClick={() => setActiveTab('mercado')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'mercado' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}>
          <span className="text-xl mb-1">🤝</span>
          <span className="text-[9px] font-black uppercase">Mercado</span>
        </button>
        <button onClick={() => setActiveTab('adm')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'adm' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'}`}>
          <span className="text-xl mb-1">⚙️</span>
          <span className="text-[9px] font-black uppercase">Painel ADM</span>
        </button>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 text-center">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 text-left">
            <div className="bg-[#0f1412] border border-emerald-900/30 rounded-3xl p-5 shadow-xl">
              <h3 className="text-emerald-400 font-black text-sm uppercase mb-3 flex items-center justify-between">
                <span>⚽ Próxima Partida</span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Ciclo: {matchesCount % 5}/5 jogos</span>
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
            <h3 className="text-emerald-400 font-black text-lg uppercase">Plantel ({squad.length} Atletas)</h3>
            {squad.map((player) => (
              <div key={player.id} className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-xs uppercase">{player.name}</p>
                  <p className="text-[10px] text-zinc-400">OVR: <span className="text-emerald-400 font-bold">{player.overall}</span> | Pos: {player.position} | Mín: R$ {getMinMarketValue(player.overall).toLocaleString('pt-BR')}</p>
                </div>
                <button 
                  onClick={() => setSellingPlayer(player)}
                  className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black py-1.5 px-3 rounded-xl hover:bg-emerald-600 hover:text-black cursor-pointer"
                >
                  VENDER
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Preço de Venda */}
        {sellingPlayer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1412] border border-emerald-500/50 p-5 rounded-3xl w-full max-w-sm text-left space-y-3">
              <h4 className="text-sm font-black text-emerald-400 uppercase">Vender Atleta: {sellingPlayer.name}</h4>
              <p className="text-[11px] text-zinc-400">Valor mínimo sugerido: <span className="text-amber-400 font-bold">R$ {getMinMarketValue(sellingPlayer.overall).toLocaleString('pt-BR')}</span></p>
              <input 
                type="number" 
                placeholder="Defina seu preço de venda" 
                value={customPrice} 
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full bg-black border border-emerald-900 p-2.5 rounded-xl text-white text-xs"
              />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setSellingPlayer(null)} className="flex-1 bg-zinc-800 text-zinc-300 text-xs py-2 rounded-xl font-bold cursor-pointer">Cancelar</button>
                <button onClick={handleListPlayer} className="flex-1 bg-emerald-600 text-black text-xs py-2 rounded-xl font-black cursor-pointer">Confirmar Venda</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mercado' && (
          <div className="text-left space-y-4">
            <h3 className="text-emerald-400 font-black text-lg uppercase">Área de Transferências 🤝</h3>
            {transferMarket.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6">Nenhum jogador listado no mercado de transferências no momento.</p>
            ) : (
              transferMarket.map((player) => (
                <div key={player.id} className="bg-[#0f1412] border border-emerald-900/30 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-white font-black text-xs uppercase">{player.name} <span className="text-[9px] text-amber-400">({player.current_club})</span></p>
                    <p className="text-[10px] text-zinc-400">OVR: <span className="text-emerald-400 font-bold">{player.overall}</span> | Preço: <span className="text-emerald-400 font-bold">R$ {(player.sale_price || player.market_value).toLocaleString('pt-BR')}</span></p>
                  </div>
                  <button 
                    onClick={() => handleBuyPlayer(player)}
                    className="bg-emerald-600 text-black text-[10px] font-black py-1.5 px-3 rounded-xl hover:bg-emerald-500 cursor-pointer"
                  >
                    COMPRAR
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'adm' && (
          <div className="text-left space-y-4 bg-[#0f1412] border border-emerald-900/30 p-5 rounded-3xl">
            <h3 className="text-emerald-400 font-black text-sm uppercase">Painel do Administrador ⚙️</h3>
            <form onSubmit={handleAdmCreateAuction} className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Nome do Jogador</label>
                <input type="text" value={admName} onChange={(e) => setAdmName(e.target.value)} required placeholder="Ex: Novo Craque" className="w-full bg-black border border-emerald-900 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Posição</label>
                  <select value={admPos} onChange={(e) => setAdmPos(e.target.value)} className="w-full bg-black border border-emerald-900 p-2 rounded-xl text-xs text-white">
                    <option value="GOL">GOL</option>
                    <option value="ZAG">ZAG</option>
                    <option value="VOL">VOL</option>
                    <option value="MEI">MEI</option>
                    <option value="ATA">ATA</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Overall (OVR)</label>
                  <input type="number" value={admOvr} onChange={(e) => setAdmOvr(e.target.value)} min="60" max="95" className="w-full bg-black border border-emerald-900 p-2 rounded-xl text-xs text-white" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-2.5 rounded-xl text-xs uppercase cursor-pointer">
                Criar e Enviar para Leilão ➔
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
  }
