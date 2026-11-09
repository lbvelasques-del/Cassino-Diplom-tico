import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
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

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function App() {
  const [activeGame, setActiveGame] = useState('lobby'); 
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
    if (currentUser) {
      localStorage.setItem('pampas_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pampas_current_user');
    }
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

      if (!foundUser) {
        foundUser = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === inputPassword);
      }

      if (foundUser) {
        setCurrentUser(foundUser);
        setBalance(Number(foundUser.balance));
        setIsAuthOpen(false);
        resetAuthForm();
      } else {
        setAuthError('Utilizador ou senha incorretos.');
      }
    }
  };

  const resetAuthForm = () => {
    setInputUsername('');
    setInputPassword('');
    setConfirmPassword('');
    setAuthError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pampas_current_user');
    setIsUserPanelOpen(false);
    setWithdrawSuccess(false);
  };

  const handleSelfDelete = async () => {
    if (!window.confirm(`Deseja realmente excluir a sua conta de forma permanente?`)) return;
    if (isSupabaseConfigured) {
      try { await supabase.from('users').delete().eq('id', currentUser.id); } catch (e) {}
    }
    const updatedList = usersDb.filter(u => u.id !== currentUser.id);
    setUsersDb(updatedList);
    localStorage.setItem('pampas_users_db', JSON.stringify(updatedList));
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
    setWithdrawSuccess(true);
    setWithdrawAmount('');
  };

  const handleAdminBalanceUpdate = async (type) => {
    const targetIdVal = adminTargetId.trim();
    const amountVal = parseFloat(adminDepositAmount);
    if (!targetIdVal || isNaN(amountVal) || amountVal <= 0) return alert('Insira ID válida e valor > 0.');
    const targetUser = usersDb.find(u => String(u.id) === targetIdVal);
    if (!targetUser) return alert('Conta não encontrada.');

    let newBal = type === 'add' ? Number(targetUser.balance) + amountVal : Number(targetUser.balance) - amountVal;
    if (type === 'remove' && newBal < 0) return alert('Saldo insuficiente na conta alvo.');

    if (isSupabaseConfigured) {
      try { await supabase.from('users').update({ balance: newBal }).eq('id', targetUser.id); } catch (e) { }
    }

    setUsersDb(prev => {
      const updated = prev.map(u => String(u.id) === targetIdVal ? { ...u, balance: newBal } : u);
      localStorage.setItem('pampas_users_db', JSON.stringify(updated));
      return updated;
    });

    if (currentUser && String(currentUser.id) === targetIdVal) {
      setBalance(newBal);
      setCurrentUser(prev => ({ ...prev, balance: newBal }));
    }

    alert(`Sucesso! Saldo atualizado.`);
    setAdminTargetId('');
    setAdminDepositAmount('');
    fetchUsersDb();
  };
          const renderGameRoute = (GameComponent) => (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-50">
        <button onClick={() => setActiveGame('lobby')} className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-2">
          ← Voltar ao Lobby
        </button>
        <div className="text-right">
          <span className="text-[10px] text-zinc-400 block">SALDO ATUAL</span>
          <span className="text-amber-400 font-black text-sm">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <GameComponent currentUser={currentUser} balance={balance} setBalance={setBalance} />
      </div>
    </div>
  );

  if (activeGame === 'hilo') return renderGameRoute(PampasHiLo);
  if (activeGame === 'dice') return renderGameRoute(PampasDice);
  if (activeGame === 'holdandwin') return renderGameRoute(PampasHoldAndWin);
  if (activeGame === 'costarica') return renderGameRoute(CassinoCostaRica);
  if (activeGame === 'diamond') return renderGameRoute(DiamondStriker);
  if (activeGame === 'crash') return renderGameRoute(PampasCrash);
  if (activeGame === 'roleta') return renderGameRoute(RoletaDiplomatica);
  if (activeGame === 'goal') return renderGameRoute(PampasGoal);
  if (activeGame === 'towers') return renderGameRoute(PampasTowers);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveGame('lobby')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
            P
          </div>
          <div>
            <h1 className="font-black tracking-wider text-amber-500 text-sm">PAMPAS</h1>
            <p className="text-[9px] text-zinc-400 tracking-widest">PORTAL DE JOGOS</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsUserPanelOpen(true)} className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all">
                <div className="text-right">
                  <div className="text-[10px] text-amber-400 font-bold">{currentUser.username}</div>
                  <div className="text-xs font-black text-white">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </button>
              {currentUser.isAdmin && (
                <button onClick={() => setIsAdminPanelOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-3 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20">
                  ⚙️ Admin
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="text-xs font-bold text-zinc-300 hover:text-white px-3 py-2">
                Entrar
              </button>
              <button onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }} className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20">
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </header>
            <main className="max-w-6xl mx-auto px-4 pt-6">
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-black border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Bem-vindo ao Pampas Portal</h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl">Escolha a sua plataforma de jogos favorita e divirta-se com segurança e rapidez.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            { id: 'costarica', name: 'Cassino Costa Rica', desc: 'Aposta & Sorte', icon: '🎰' },
            { id: 'diamond', name: 'Diamond Striker', desc: 'Mineração Premiada', icon: '💎' },
            { id: 'crash', name: 'Pampas Crash', desc: 'Multiplicador Explosivo', icon: '🚀' },
            { id: 'roleta', name: 'Roleta Diplomática', desc: 'Gire e Ganhe', icon: '🎡' },
            { id: 'goal', name: 'Pampas Goal', desc: 'Futebol & Prêmios', icon: '⚽' },
            { id: 'towers', name: 'Pampas Towers', desc: 'Suba na Torre', icon: '🗼' },
            { id: 'hilo', name: 'Pampas HiLo', desc: 'Maior ou Menor', icon: '📊' },
            { id: 'dice', name: 'Pampas Dice', desc: 'Dados da Sorte', icon: '🎲' },
            { id: 'holdandwin', name: 'Hold & Win', desc: 'Prêmios Acumulados', icon: '💰' },
          ].map(game => (
            <div key={game.id} onClick={() => setActiveGame(game.id)} className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/50 p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{game.icon}</span>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">{game.name}</h3>
                <p className="text-[10px] text-zinc-400 mt-1">{game.desc}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-amber-500">
                <span>JOGAR AGORA</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isAuthOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsAuthOpen(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h3 className="text-lg font-black text-white mb-4">{authMode === 'login' ? 'Entrar na Conta' : 'Criar Nova Conta'}</h3>
            {authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">{authError}</div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Utilizador</label>
                <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" placeholder="O seu nome de utilizador" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Senha</label>
                <input type="password" value={inputPassword} onChange={e => setInputPassword(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" placeholder="••••••••" />
              </div>
              {authMode === 'register' && (
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Confirmar Senha</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" placeholder="••••••••" />
                </div>
              )}
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-xs">
                {authMode === 'login' ? 'ACEDER À CONTA' : 'REGISTAR CONTA'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isUserPanelOpen && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsUserPanelOpen(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h3 className="text-lg font-black text-white mb-2">Painel do Utilizador</h3>
            <p className="text-xs text-zinc-400 mb-6">ID da Conta: <span className="text-amber-400 font-mono">{currentUser.id}</span></p>

            <div className="space-y-4">
              <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">SALDO DISPONÍVEL</span>
                <span className="text-xl font-black text-amber-400">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Levantamento / Saque</label>
                <input type="number" step="0.01" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Valor a retirar" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" />
                <button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs">
                  Solicitar Levantamento
                </button>
              </form>

              {withdrawSuccess && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center">Saque simulado com sucesso!</div>}

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button onClick={handleLogout} className="text-xs text-zinc-400 hover:text-white font-bold">Terminar Sessão</button>
                <button onClick={handleSelfDelete} className="text-xs text-red-400 hover:text-red-300 font-bold">Excluir Conta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdminPanelOpen && currentUser?.isAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsAdminPanelOpen(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h3 className="text-lg font-black text-white mb-4">Painel de Administração</h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">ID do Utilizador Alvo</label>
                <input type="text" value={adminTargetId} onChange={e => setAdminTargetId(e.target.value)} placeholder="Ex: 1" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Valor</label>
                <input type="number" step="0.01" value={adminDepositAmount} onChange={e => setAdminDepositAmount(e.target.value)} placeholder="0.00" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={() => handleAdminBalanceUpdate('add')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all text-xs">
                  Adicionar Saldo
                </button>
                <button onClick={() => handleAdminBalanceUpdate('remove')} className="bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl transition-all text-xs">
                  Remover Saldo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

