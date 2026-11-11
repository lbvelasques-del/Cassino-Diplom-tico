import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Importações oficiais unificadas
import FutebolDiplomatico from './FutebolDiplomatico';
import CassinoDiplomatico from './Cassinodiplomatico';
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
const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 10;
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function App() {
  const [activeGame, setActiveGame] = useState('lobby_principal');

  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem('pampas_users_db');
    if (saved) { try { return JSON.parse(saved); } catch (e) { } }
    return [{ id: 1, username: 'LVelasques', password: 'Lucas123!', balance: 99999999, isAdmin: true }];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved).balance : 150000;
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [adminTargetId, setAdminTargetId] = useState('');
  const [adminDepositAmount, setAdminDepositAmount] = useState('');

  const fetchUsersDb = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          setUsersDb(data);
          localStorage.setItem('pampas_users_db', JSON.stringify(data));
          if (currentUser) {
            const updatedMe = data.find(u => u.id === currentUser.id);
            if (updatedMe) setBalance(Number(updatedMe.balance));
          }
          return;
        }
      } catch (e) { }
    }
    const local = localStorage.getItem('pampas_users_db');
    if (local) setUsersDb(JSON.parse(local));
  };

  useEffect(() => {
    fetchUsersDb();
    const interval = setInterval(fetchUsersDb, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('pampas_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('pampas_current_user');
  }, [currentUser]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const trimmedUser = inputUsername.trim();
    if (authMode === 'register') {
      if (inputPassword !== confirmPassword) return setAuthError('As senhas não coincidem!');
      if (inputPassword.length < 3) return setAuthError('A senha é muito curta.');
      const existing = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase());
      if (existing) return setAuthError('Este nome de utilizador já está em uso.');
      const isAdmin = trimmedUser.toLowerCase() === 'lvelasques';
      const newUser = { id: Date.now(), username: trimmedUser, password: inputPassword, balance: 150000, isAdmin };
      let registeredOnCloud = false;
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('users').insert([{ username: trimmedUser, password: inputPassword, balance: 150000, isAdmin }]).select();
          if (!error && data && data[0]) {
            setCurrentUser(data[0]);
            setBalance(Number(data[0].balance));
            registeredOnCloud = true;
          }
        } catch (err) { }
      }
      if (!registeredOnCloud) {
        const updated = [...usersDb, newUser];
        setUsersDb(updated);
        localStorage.setItem('pampas_users_db', JSON.stringify(updated));
        setCurrentUser(newUser);
        setBalance(newUser.balance);
      }
      setIsAuthOpen(false);
      resetAuthForm();
      fetchUsersDb();
    } else {
      let foundUser = null;
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('users').select('*').ilike('username', trimmedUser).eq('password', inputPassword);
          if (!error && data && data.length > 0) foundUser = data[0];
        } catch (e) { }
      }
      if (!foundUser) foundUser = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === inputPassword);
      if (foundUser) {
        setCurrentUser(foundUser);
        setBalance(Number(foundUser.balance));
        setIsAuthOpen(false);
        resetAuthForm();
      } else setAuthError('Utilizador ou senha incorretos.');
    }
  };

  const resetAuthForm = () => { setInputUsername(''); setInputPassword(''); setConfirmPassword(''); setAuthError(''); };

  const handleLogout = () => {
    setCurrentUser(null); localStorage.removeItem('pampas_current_user');
    setIsUserPanelOpen(false); setWithdrawSuccess(false); setActiveGame('lobby_principal');
  };

  const handleSelfDelete = async () => {
    if (!window.confirm(`Deseja realmente excluir a sua conta de forma permanente?`)) return;
    if (isSupabaseConfigured) { try { await supabase.from('users').delete().eq('id', currentUser.id); } catch (e) {} }
    const updatedList = usersDb.filter(u => u.id !== currentUser.id);
    setUsersDb(updatedList); localStorage.setItem('pampas_users_db', JSON.stringify(updatedList));
    handleLogout();
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) return alert('Insira um valor válido.');
    if (amountNum > balance) return alert('Saldo insuficiente.');
    const finalBal = balance - amountNum;
    setBalance(finalBal);
    if (currentUser) setCurrentUser(prev => ({ ...prev, balance: finalBal }));
    setWithdrawSuccess(true); setWithdrawAmount('');
  };

  const handleAdminBalanceUpdate = async (type) => {
    const targetIdVal = adminTargetId.trim();
    const amountVal = parseFloat(adminDepositAmount);
    if (!targetIdVal || isNaN(amountVal) || amountVal <= 0) return alert('Insira ID válida e valor > 0.');
    const targetUser = usersDb.find(u => String(u.id) === targetIdVal);
    if (!targetUser) return alert('Conta não encontrada.');
    let newBal = type === 'add' ? Number(targetUser.balance) + amountVal : Number(targetUser.balance) - amountVal;
    if (type === 'remove' && newBal < 0) return alert('Saldo insuficiente na conta alvo.');
    if (isSupabaseConfigured) { try { await supabase.from('users').update({ balance: newBal }).eq('id', targetUser.id); } catch (e) { } }
    setUsersDb(prev => {
      const updated = prev.map(u => String(u.id) === targetIdVal ? { ...u, balance: newBal } : u);
      localStorage.setItem('pampas_users_db', JSON.stringify(updated));
      return updated;
    });
    if (currentUser && String(currentUser.id) === targetIdVal) {
      setBalance(newBal); setCurrentUser(prev => ({ ...prev, balance: newBal }));
    }
    alert(`Sucesso! Saldo atualizado.`); setAdminTargetId(''); setAdminDepositAmount(''); fetchUsersDb();
  };const HeaderGlobal = () => (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between shadow-2xl">
      <div className="flex items-center py-1 cursor-pointer" onClick={() => setActiveGame('lobby_principal')}>
        <img src="/Grupopampas.png" alt="Rede Pampas" className="h-10 sm:h-12 w-auto object-contain" />
      </div>
      <div className="flex items-center gap-2">
        {currentUser ? (
          <div className="flex items-center gap-2.5 bg-[#0f0f12] border border-zinc-800 px-3 py-1.5 rounded-2xl shadow-inner">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[11px] text-amber-300 font-bold">{currentUser.username}</span>
                {(currentUser.isAdmin || currentUser.username.toLowerCase() === 'lvelasques') && (
                  <button onClick={() => setIsAdminPanelOpen(true)} className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded cursor-pointer">ADMIN</button>
                )}
              </div>
              <p className="text-amber-400 font-black text-xs sm:text-sm">R$ {balance.toLocaleString('pt-BR')}</p>
            </div>
            <button onClick={() => setIsUserPanelOpen(true)} className="bg-amber-500 text-black font-black text-xs px-3 py-2 rounded-xl shadow-lg cursor-pointer">Perfil</button>
          </div>
        ) : (
          <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="bg-amber-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg cursor-pointer">Entrar</button>
        )}
      </div>
    </header>
  );

  const renderGameRoute = (GameComponent, isFootball = false) => (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="bg-[#0b0b0e] px-4 py-2.5 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-50 shadow-md">
        <button onClick={() => setActiveGame(isFootball ? 'lobby_principal' : 'cassino_diplomatico')} className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs border border-zinc-700 transition-all cursor-pointer shadow">
          {isFootball ? '⬅ Voltar ao Portal' : '⬅ Voltar ao Cassino'}
        </button>
        <div className="flex items-center gap-2 bg-[#141418] px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">Saldo</span>
          <span className="text-xs text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
        </div>
      </div>
      <div className="flex-1">
        <GameComponent currentUser={currentUser} balance={balance} setBalance={setBalance} />
      </div>
    </div>
  );

  if (activeGame === 'futebol') return renderGameRoute(FutebolDiplomatico, true);
  if (activeGame === 'hub_cassino_geral') return <CassinoDiplomatico currentUser={currentUser} balance={balance} setBalance={setBalance} setActiveGame={setActiveGame} />;
  
  const gamesMap = {
    costarica: CassinoCostaRica, crash: PampasCrash, roleta: RoletaDiplomatica, 
    goal: PampasGoal, towers: PampasTowers, hilo: PampasHiLo, 
    dice: PampasDice, diamond: DiamondStriker, holdandwin: PampasHoldAndWin
  };
  
  if (gamesMap[activeGame]) return renderGameRoute(gamesMap[activeGame]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <HeaderGlobal />

      {activeGame === 'lobby_principal' && (
        <main className="max-w-lg mx-auto p-4 space-y-6 pt-10 text-center">
          <div className="space-y-3 mb-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 drop-shadow-lg">
              PORTAL REDE PAMPAS
            </h1>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Plataforma de Apostas Unificadas</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div onClick={() => { if(!currentUser) return alert('Faça login para aceder ao Futebol Diplomático'); setActiveGame('futebol'); }} className="bg-gradient-to-b from-[#0a1f12] to-[#040a06] border border-emerald-500/50 rounded-[2rem] p-8 cursor-pointer shadow-2xl shadow-emerald-900/20 hover:border-emerald-400 transition-all hover:-translate-y-2 flex flex-col items-center justify-center space-y-4">
              <span className="text-6xl drop-shadow-xl">⚽</span>
              <h2 className="text-2xl font-black text-emerald-400 uppercase">Futebol Diplomático</h2>
              <p className="text-sm text-zinc-300">Acede ao simulador de clubes, gere o teu plantel e conquista a Série A.</p>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-xl mt-2 w-full max-w-xs shadow-lg transition-all">ENTRAR NO SIMULADOR</button>
            </div>

            <div onClick={() => setActiveGame('cassino_diplomatico')} className="bg-gradient-to-b from-[#1a140a] to-[#0a0804] border border-amber-500/50 rounded-[2rem] p-8 cursor-pointer shadow-2xl shadow-amber-900/20 hover:border-amber-400 transition-all hover:-translate-y-2 flex flex-col items-center justify-center space-y-4">
              <span className="text-6xl drop-shadow-xl">🎰</span>
              <h2 className="text-2xl font-black text-amber-400 uppercase">Cassino Diplomático</h2>
              <p className="text-sm text-zinc-300">Entra no hub oficial de apostas com multiplicadores e jackpots.</p>
              <button className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-xl mt-2 w-full max-w-xs shadow-lg transition-all">ABRIR CASSINO</button>
            </div>
          </div>
        </main>
      )}

      {activeGame === 'cassino_diplomatico' && (
        <main className="max-w-md mx-auto p-4 space-y-4 pt-6 text-center">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setActiveGame('lobby_principal')} className="text-zinc-400 text-xs font-bold border border-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-900 transition-all cursor-pointer">⬅ Voltar</button>
            <span className="text-amber-500 font-black text-sm bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">HUB CASSINO</span>
          </div>

          <div className="space-y-4">
            {[{id: 'costarica', name: 'CASSINO COSTA RICA 🌴', desc: 'O caça-níqueis oficial com multiplicadores e jackpots.'},
              {id: 'crash', name: 'PAMPAS CRASH 🚀', desc: 'O voo dos campeões com multiplicadores exponenciais.'},
              {id: 'roleta', name: 'ROLETA DIPLOMÁTICA 🎡', desc: 'A clássica roleta adaptada à diplomacia do Grupo Pampas.'},
              {id: 'goal', name: 'PAMPAS GOAL ⚽', desc: 'A batalha de penáltis contra o guarda-redes de elite.'},
              {id: 'towers', name: 'PAMPAS TOWERS 🗼', desc: 'Suba os andares acumulando multiplicadores sem cair.'},
              {id: 'hilo', name: 'PAMPAS HILO 📊', desc: 'Adivinhe se a carta seguinte é mais alta ou mais baixa.'},
              {id: 'dice', name: 'PAMPAS DICE 🎲', desc: 'Acerte se o resultado fica acima ou abaixo do alvo.'}
            ].map(game => (
              <div key={game.id} onClick={() => setActiveGame(game.id)} className="bg-[#0b0b0e] border border-amber-500/30 rounded-3xl p-6 cursor-pointer shadow-xl transition-all hover:border-amber-400 hover:-translate-y-1">
                <h3 className="text-lg font-black text-amber-400 mb-1">{game.name}</h3>
                <p className="text-xs text-zinc-400 mb-4">{game.desc}</p>
                <button className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-6 py-2.5 rounded-xl w-3/4 shadow-md transition-all">JOGAR AGORA</button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* MODAL AUTH */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg cursor-pointer transition-colors">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">{authMode === 'login' ? 'Entrar no Portal' : 'Criar Conta Oficial'}</h2>
            {authError && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-4 font-semibold">{authError}</div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Nome de Utilizador</label>
                <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Senha</label>
                <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all" />
              </div>
              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-semibold">Confirmar Senha</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all" />
                </div>
              )}
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20">{authMode === 'login' ? 'Entrar' : 'Criar Conta'}</button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-xs text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer transition-colors">
                  {authMode === 'login' ? 'Não tem conta? Crie uma agora' : 'Já tem conta? Faça login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERFIL */}
      {isUserPanelOpen && currentUser && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setIsUserPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg cursor-pointer transition-colors">✕</button>
            <h2 className="text-white font-bold text-lg">{currentUser.username} <span className="text-xs text-amber-400">(#ID {currentUser.id})</span></h2>
            
            <form onSubmit={handleWithdrawSubmit} className="bg-[#0b0b0e] border border-zinc-800 p-4 rounded-2xl space-y-3">
              <span className="text-xs text-amber-300 font-bold uppercase block">Solicitar Saque</span>
              {withdrawSuccess ? (
                <p className="text-emerald-400 text-xs font-bold">Pedido de saque enviado ao admin com sucesso!</p>
              ) : (
                <div className="flex gap-2">
                  <input type="number" placeholder="Valor (R$)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required className="w-full bg-[#141418] border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs outline-none transition-all" />
                  <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-black px-4 rounded-xl text-xs transition-all cursor-pointer">Pedir</button>
                </div>
              )}
            </form>
            <button onClick={handleLogout} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer">Sair da Conta</button>
            <button onClick={handleSelfDelete} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer">Apagar Conta Permanentemente</button>
          </div>
        </div>
      )}

      {/* MODAL ADMIN PROFISSIONAL */}
      {isAdminPanelOpen && currentUser && (currentUser.isAdmin || currentUser.username.toLowerCase() === 'lvelasques') && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#141418] border-2 border-amber-500 w-full max-w-xl rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <button onClick={() => setIsAdminPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold cursor-pointer transition-colors">✕</button>
            
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-amber-400 font-black text-xl">Painel Admin - Grupo Pampas</h2>
              <p className="text-xs text-zinc-400">Controlo de saldos e utilizadores</p>
            </div>
            
            <div className="bg-[#0b0b0e] border border-amber-500/40 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs text-amber-300 font-bold uppercase tracking-wider">Gestão de Saldo</h3>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="ID da Conta" value={adminTargetId} onChange={(e) => setAdminTargetId(e.target.value)} className="bg-[#141418] border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs outline-none transition-all" />
                <input type="number" placeholder="Valor (R$)" value={adminDepositAmount} onChange={(e) => setAdminDepositAmount(e.target.value)} className="bg-[#141418] border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs outline-none transition-all" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAdminBalanceUpdate('add')} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer">Adicionar Saldo</button>
                <button onClick={() => handleAdminBalanceUpdate('remove')} className="flex-1 bg-red-500 hover:bg-red-400 text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-red-500/20 cursor-pointer">Remover Saldo</button>
              </div>
            </div>

            <div className="bg-[#0b0b0e] border border-zinc-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs text-amber-400 font-bold uppercase tracking-wider">Contas Registadas ({usersDb.length})</h3>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {usersDb.map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-[#141418] p-3 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors text-xs group">
                    <div>
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        {u.username} {u.isAdmin && <span className="bg-amber-500 text-black text-[8px] px-1 rounded uppercase">Admin</span>}
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">ID: {u.id}</span>
                    </div>
                    <span className="text-emerald-400 font-black group-hover:scale-105 transition-transform">R$ {Number(u.balance || 0).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
            }
