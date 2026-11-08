import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import CassinoCostaRica from './CassinoCostaRica';
import DiamondStriker from './DiamondStriker';
import PampasCrash from './PampasCrash';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function App() {
  const [activeGame, setActiveGame] = useState('lobby'); // 'lobby', 'costarica', 'diamond', 'crash'

  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem('pampas_users_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
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
  const [newPassword, setNewPassword] = useState(''); 
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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
      } catch (e) { console.warn("Supabase falhou, usando local"); }
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
    setPasswordSuccess(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 3) return alert('Senha muito curta.');
    
    if (isSupabaseConfigured) {
      try { await supabase.from('users').update({ password: newPassword }).eq('id', currentUser.id); } catch (e) {}
    }
    
    setUsersDb(prev => {
      const updated = prev.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
      localStorage.setItem('pampas_users_db', JSON.stringify(updated));
      return updated;
    });
    
    setCurrentUser(prev => ({ ...prev, password: newPassword }));
    setPasswordSuccess(true);
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleSelfDelete = async () => {
    const confirmar = window.confirm(`ATENÇÃO! Deseja realmente excluir a sua conta de forma permanente?`);
    if (!confirmar) return;

    if (isSupabaseConfigured) {
      try { await supabase.from('users').delete().eq('id', currentUser.id); } catch (e) {}
    }

    const updatedList = usersDb.filter(u => u.id !== currentUser.id);
    setUsersDb(updatedList);
    localStorage.setItem('pampas_users_db', JSON.stringify(updatedList));
    handleLogout();
    alert('A sua conta foi excluída com sucesso.');
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) return alert('Insira um valor válido.');
    if (amountNum > balance) return alert('Saldo insuficiente.');
    
    const finalBal = balance - amountNum;
    setBalance(finalBal);
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, balance: finalBal }));
    }
    setWithdrawSuccess(true);
    setWithdrawAmount('');
  };

  const handleAdminBalanceUpdate = async (e, type) => {
    e.preventDefault();
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
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Excluir ${username} (#${id})?`)) return;
    if (isSupabaseConfigured) {
      try { await supabase.from('users').delete().eq('id', id); } catch (e) { }
    }
    const updatedList = usersDb.filter(u => u.id !== id);
    setUsersDb(updatedList);
    localStorage.setItem('pampas_users_db', JSON.stringify(updatedList));
    if (currentUser && currentUser.id === id) handleLogout();
  };
                if (activeGame === 'costarica') {
    return (
      <div>
        <div className="bg-black px-4 py-2.5 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-50">
          <button onClick={() => setActiveGame('lobby')} className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs border border-zinc-700 transition-all">
            🏠 Voltar ao Lobby
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <CassinoCostaRica />
      </div>
    );
  }

  if (activeGame === 'diamond') {
    return (
      <div>
        <div className="bg-black px-4 py-2.5 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-50">
          <button onClick={() => setActiveGame('lobby')} className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs border border-zinc-700 transition-all">
            🏠 Voltar ao Lobby
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <DiamondStriker />
      </div>
    );
  }

  if (activeGame === 'crash') {
    return (
      <div>
        <div className="bg-black px-4 py-2.5 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-50">
          <button onClick={() => setActiveGame('lobby')} className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs border border-zinc-700 transition-all">
            🏠 Voltar ao Lobby
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <PampasCrash />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center py-1 cursor-pointer" onClick={() => setActiveGame('lobby')}>
          <img src="/Grupopampas.png" alt="Patrocinador" className="h-12 w-auto max-w-[180px] object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-[#0f0f12] border border-zinc-800 px-3 py-1.5 rounded-2xl shadow-inner">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[11px] text-amber-300 font-bold">{currentUser.username}</span>
                  {(currentUser.isAdmin || currentUser.username.toLowerCase() === 'lvelasques') && (
                    <button onClick={() => setIsAdminPanelOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow transition-all">ADMIN ⚙️</button>
                  )}
                </div>
                <p className="text-amber-400 font-black text-sm">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setIsUserPanelOpen(true)} className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-black text-xs px-3 py-2 rounded-xl transition-all shadow-lg active:scale-95">⚙️ Perfil</button>
            </div>
          ) : (
            <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all">👤 Criar Conta / Entrar</button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 pt-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
          <img 
            src="/CassinaCR.png" 
            alt="Logótipo Cassino" 
            className="h-28 w-auto max-w-[320px] object-contain drop-shadow-[0_10px_25px_rgba(245,158,11,0.5)] animate-pulse" 
          />
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 drop-shadow-[0_5px_15px_rgba(245,158,11,0.6)]">
            LOBBY DE ELITE
          </h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Escolha a sua plataforma de apostas unificadas</p>
        </div>

        {/* Os 3 Jogos Oficiais do Portal */}
        <div className="space-y-4 pt-2">
          <div onClick={() => setActiveGame('costarica')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all hover:scale-105 group space-y-2">
            <h3 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_3px_10px_rgba(245,158,11,0.5)]">
              👑 CAÇA-NÍQUEL DOS PAMPAS
            </h3>
            <p className="text-xs text-zinc-300 font-medium">O caça-níqueis oficial com roleta de bônus e símbolos diplomáticos.</p>
            <div className="pt-2">
              <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs px-5 py-2 rounded-xl shadow-[0_5px_15px_rgba(245,158,11,0.4)]">JOGAR AGORA ▶</span>
            </div>
          </div>

          <div onClick={() => setActiveGame('diamond')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all hover:scale-105 group space-y-2">
            <h3 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_3px_10px_rgba(245,158,11,0.5)]">
              ⚔️ GUERRA DAS AMÉRICAS
            </h3>
            <p className="text-xs text-zinc-300 font-medium">O emocionante jogo de estratégia tática e multiplicadores em campo minado.</p>
            <div className="pt-2">
              <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs px-5 py-2 rounded-xl shadow-[0_5px_15px_rgba(245,158,11,0.4)]">JOGAR AGORA ▶</span>
            </div>
          </div>

          <div onClick={() => setActiveGame('crash')} className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all hover:scale-105 group space-y-2">
            <h3 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_3px_10px_rgba(245,158,11,0.5)]">
              🚀 PAMPAS CRASH
            </h3>
            <p className="text-xs text-zinc-300 font-medium">O voo dos campeões com multiplicadores exponenciais em tempo real.</p>
            <div className="pt-2">
              <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs px-5 py-2 rounded-xl shadow-[0_5px_15px_rgba(245,158,11,0.4)]">JOGAR AGORA ▶</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modais */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">{authMode === 'login' ? 'Entrar no Portal' : 'Criar Conta Oficial'}</h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-4">
              <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Utilizador" />
              <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Senha" />
              <button type="submit" className="w-full bg-amber-500 text-black font-black py-3.5 rounded-xl text-sm shadow-lg">Confirmar</button>
            </form>
          </div>
        </div>
      )}

      {isUserPanelOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsUserPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <div className="flex items-center gap-3 mb-5 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-black">👤</div>
              <div>
                <h2 className="text-white font-bold text-lg">{currentUser.username}</h2>
                <p className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded inline-block mt-1">ID da Conta: #{currentUser.id}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#0b0b0e] border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs text-amber-300 font-bold uppercase">Solicitar Saque</h3>
                <form onSubmit={handleWithdrawSubmit} className="flex gap-2">
                  <input type="number" placeholder="Valor (R$)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs outline-none" />
                  <button type="submit" className="bg-amber-500 text-black font-black px-4 rounded-xl text-xs whitespace-nowrap">Solicitar</button>
                </form>
              </div>
              <button onClick={handleLogout} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-xs border border-zinc-700">🚪 Sair da Conta</button>
            </div>
          </div>
        </div>
      )}

      {isAdminPanelOpen && currentUser && (currentUser.isAdmin || currentUser.username.toLowerCase() === 'lvelasques') && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#141418] border-2 border-amber-500 w-full max-w-2xl rounded-3xl p-6 relative shadow-[0_0_50px_rgba(245,158,11,0.2)] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-4">Painel Admin - Grupo Pampas</h2>
            <form onSubmit={(e) => handleAdminBalanceUpdate(e, 'add')} className="space-y-3 bg-[#0b0b0e] p-4 rounded-2xl border border-amber-500/30">
              <input type="text" placeholder="ID da Conta" value={adminTargetId} onChange={(e) => setAdminTargetId(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs outline-none font-mono" />
              <input type="number" placeholder="Valor (R$)" value={adminDepositAmount} onChange={(e) => setAdminDepositAmount(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs outline-none" />
              <button type="submit" className="w-full bg-emerald-500 text-black font-black py-2.5 rounded-xl text-xs">➕ Adicionar Dinheiro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
