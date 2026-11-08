import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function App() {
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

  const [betAmount, setBetAmount] = useState(30000);
  const [turbo, setTurbo] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winningLines, setWinningLines] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  
  const [bonusWheelActive, setBonusWheelActive] = useState(false);
  const [wheelMultiplier, setWheelMultiplier] = useState(null);
  const [spinningWheel, setSpinningWheel] = useState(false);
  
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

  // ✅ Caminhos ajustados para as imagens que subiste na raiz do repositório
  const symbols = [
    { id: 'pampas', icon: '/pampas.png', name: 'Pampas', mult: 0.5, weight: 25, isBonus: false },
    { id: 'alquimia', icon: '/alquimia.png', name: 'Alquimia', mult: 0.8, weight: 24, isBonus: false },
    { id: 'petroleo', icon: '/petroleo.png', name: 'Petróleo', mult: 1.0, weight: 22, isBonus: false },
    { id: 'brasil', icon: '/brasil.png', name: 'Brasil', mult: 2.0, weight: 20, isBonus: false },
    { id: 'moeda', icon: '/moeda.png', name: 'Moeda', mult: 1.5, weight: 19, isBonus: false },
    { id: 'costarica', icon: '/costarica.png', name: 'Costa Rica', mult: 3.0, weight: 16, isBonus: false },
    { id: 'diamante', icon: '/diamante.png', name: 'Diamante', mult: 5.0, weight: 10, isBonus: true }
  ];

  const totalWeight = symbols.reduce((acc, s) => acc + s.weight, 0);

  const [grid, setGrid] = useState([symbols[0], symbols[1], symbols[2], symbols[3], symbols[4], symbols[5], symbols[6], symbols[0], symbols[1]]);
  const bets = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

  const getDetailedWinningLines = (currentGrid) => {
    let winningLinesList = [];
    if (currentGrid[0].id === currentGrid[1].id && currentGrid[1].id === currentGrid[2].id) {
      winningLinesList.push({ indices: [0, 1, 2], symbol: currentGrid[0] });
    }
    if (currentGrid[3].id === currentGrid[4].id && currentGrid[4].id === currentGrid[5].id) {
      winningLinesList.push({ indices: [3, 4, 5], symbol: currentGrid[3] });
    }
    if (currentGrid[6].id === currentGrid[7].id && currentGrid[7].id === currentGrid[8].id) {
      winningLinesList.push({ indices: [6, 7, 8], symbol: currentGrid[6] });
    }
    if (currentGrid[0].id === currentGrid[4].id && currentGrid[4].id === currentGrid[8].id) {
      winningLinesList.push({ indices: [0, 4, 8], symbol: currentGrid[0] });
    }
    if (currentGrid[2].id === currentGrid[4].id && currentGrid[4].id === currentGrid[6].id) {
      winningLinesList.push({ indices: [2, 4, 6], symbol: currentGrid[2] });
    }
    return winningLinesList;
  };

  const getRandomSymbolByWeight = () => {
    let randomNum = Math.random() * totalWeight;
    for (let sym of symbols) {
      if (randomNum < sym.weight) return sym;
      randomNum -= sym.weight;
    }
    return symbols[0];
  };

  const updateBalanceOnDb = async (userId, newBal) => {
    setBalance(newBal);
    setCurrentUser(prev => prev ? { ...prev, balance: newBal } : null);
    
    if (isSupabaseConfigured) {
      try { await supabase.from('users').update({ balance: newBal }).eq('id', userId); } catch (e) { }
    }
    setUsersDb(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, balance: newBal } : u);
      localStorage.setItem('pampas_users_db', JSON.stringify(updated));
      return updated;
    });
  };

  const spin = () => {
    if (!currentUser) return setIsAuthOpen(true);
    if (balance < betAmount || spinning || bonusWheelActive) return;
    
    const newBal = balance - betAmount;
    updateBalanceOnDb(currentUser.id, newBal);

    setSpinning(true);
    setWinningLines([]);
    setLastWin(0);

    setTimeout(() => {
      const globalWinChance = 0.34; 
      let newGrid = Array.from({ length: 9 }, () => getRandomSymbolByWeight());

      if (Math.random() < globalWinChance) {
        const chosenSym = getRandomSymbolByWeight();
        const winLinesMatrix = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        const primaryLine = winLinesMatrix[Math.floor(Math.random() * winLinesMatrix.length)];
        primaryLine.forEach(idx => { newGrid[idx] = chosenSym; });

        if (Math.random() < 0.35) {
          const secondaryLine = winLinesMatrix[Math.floor(Math.random() * winLinesMatrix.length)];
          secondaryLine.forEach(idx => { newGrid[idx] = chosenSym; });
        }
      } else {
        while (getDetailedWinningLines(newGrid).length > 0) {
          newGrid = Array.from({ length: 9 }, () => getRandomSymbolByWeight());
        }
      }

      setGrid(newGrid);
      setSpinning(false);

      const detailedWins = getDetailedWinningLines(newGrid);
      if (detailedWins.length > 0) {
        let totalPrize = 0;
        let allWinningIndices = [];

        detailedWins.forEach(win => {
          allWinningIndices.push(...win.indices);
          if (win.symbol.isBonus) {
            setBonusWheelActive(true);
          } else {
            totalPrize += betAmount * win.symbol.mult;
          }
        });

        setWinningLines([...new Set(allWinningIndices)]);

        if (totalPrize > 0) {
          const finalBal = balance - betAmount + totalPrize;
          updateBalanceOnDb(currentUser.id, finalBal);
          setLastWin(totalPrize);
        }
      }
    }, turbo ? 180 : 550);
  };

  const triggerBonusWheel = () => {
    setSpinningWheel(true);
    setTimeout(() => {
      const randomMult = Math.floor(Math.random() * 10) + 1; 
      const prize = betAmount * randomMult;
      const finalBal = balance + prize;
      updateBalanceOnDb(currentUser.id, finalBal);
      setLastWin(prize);
      setSpinningWheel(false);
      setBonusWheelActive(false);
    }, 1500);
  };const handleAuthSubmit = async (e) => {
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
    updateBalanceOnDb(currentUser.id, finalBal);
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
  };return (
    <div className="min-h-screen bg-[#070709] text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <header className="sticky top-0 z-50 bg-[#0c0c0f]/95 backdrop-blur-xl border-b border-amber-500/20 px-4 py-3 flex items-center justify-between shadow-2xl shadow-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30 text-black font-black text-lg border border-amber-200/40 animate-pulse">👑</div>
          <div>
            <h1 className="text-amber-400 font-black text-sm tracking-wider uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">Cassino da Costa Rica</h1>
            <p className="text-[10px] text-zinc-400 font-semibold tracking-wide">REDE PAMPAS • DIPLOMACIA OFICIAL</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-[#141418] border border-amber-500/30 px-3 py-1.5 rounded-2xl shadow-inner">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[11px] text-amber-300 font-bold">{currentUser.username}</span>
                  {(currentUser.isAdmin || currentUser.username.toLowerCase() === 'lvelasques') && (
                    <button onClick={() => setIsAdminPanelOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow transition-all">ADMIN ⚙️</button>
                  )}
                </div>
                <p className="text-amber-400 font-black text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setIsUserPanelOpen(true)} className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-black text-xs px-3 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95">⚙️ Perfil</button>
            </div>
          ) : (
            <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all">👤 Criar Conta / Entrar</button>
          )}
        </div>
      </header>

      <div className="bg-gradient-to-r from-amber-950/70 via-[#121216] to-amber-950/70 border-y border-amber-500/40 py-3 px-4 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-black tracking-widest uppercase drop-shadow-md">✨ <span>REDE PAMPAS — PATROCINADOR MASTER OFICIAL</span> ✨</div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        {bonusWheelActive && (
          <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 border-2 border-amber-400 rounded-3xl p-5 text-center shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-pulse space-y-3">
            <p className="text-xs text-amber-300 font-black uppercase tracking-wider">💎 LINHA DE DIAMANTE ATIVA! 💎</p>
            <p className="text-white font-bold text-sm">Gire a Roleta de Bônus (1x a 10x a aposta)</p>
            {wheelMultiplier && <p className="text-2xl text-amber-400 font-black">🎉 Multiplicador: {wheelMultiplier}x (+R$ {(betAmount * wheelMultiplier).toLocaleString('pt-BR')})</p>}
            <button disabled={spinningWheel} onClick={triggerBonusWheel} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3 rounded-2xl shadow-lg text-sm hover:scale-105 transition-all">{spinningWheel ? '🔄 A RODAR A ROLETA...' : '🎰 RODAR ROLETA DE BÔNUS'}</button>
          </div>
        )}

        <div className="relative bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/40 rounded-3xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] mt-2">
          <div className="grid grid-cols-3 gap-3 my-2">
            {grid.map((sym, idx) => {
              const isWinningCell = winningLines.includes(idx);
              return (
                <div key={idx} className={`h-24 rounded-2xl bg-[#0b0b0e] border flex flex-col items-center justify-center shadow-inner transition-all duration-300 ${spinning ? 'animate-pulse opacity-50 scale-95 border-zinc-800' : ''} ${isWinningCell ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce' : 'border-zinc-800/80 hover:border-amber-500/40'}`}>
                  <img 
                    src={sym.icon} 
                    alt={sym.name} 
                    className="w-14 h-14 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]" 
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 font-bold tracking-wider">{sym.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#121216] border border-amber-500/20 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Valor da Aposta</span>
            <span className="text-amber-400 font-black text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">R$ {betAmount.toLocaleString('pt-BR')}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {bets.map((val) => (
              <button key={val} disabled={spinning} onClick={() => setBetAmount(val)} className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${betAmount === val ? 'bg-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/30 scale-105 font-black' : 'bg-[#18181e] text-zinc-300 border-zinc-800 hover:border-amber-500/30'}`}>
                {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {lastWin > 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/60 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
            <p className="text-xs text-amber-300 font-extrabold uppercase tracking-widest">🎉 MÚLTIPLAS LINHAS / VITÓRIA ACUMULADA!</p>
            <p className="text-amber-400 font-black text-xl drop-shadow-md">+ R$ {lastWin.toLocaleString('pt-BR')}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={() => setTurbo(!turbo)} className={`py-4 px-5 rounded-2xl font-bold text-xs border transition-all shadow-md ${turbo ? 'bg-amber-500/20 text-amber-400 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-[#141418] text-zinc-400 border-zinc-800'}`}>⚡ TURBO {turbo ? 'ON' : 'OFF'}</button>
          <button disabled={spinning || (currentUser && balance < betAmount) || bonusWheelActive} onClick={spin} className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-lg py-4 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all border border-amber-200/50">▶️ {spinning ? 'A GIRAR...' : 'GIRAR'}</button>
        </div>
      </main>

      {/* Modal de Autenticação */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">{authMode === 'login' ? 'Entrar no Cassino' : 'Criar Conta Oficial'}</h2>
            <p className="text-xs text-zinc-400 mb-6">Registo obrigatório para jogar</p>

            {authError && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-4 font-semibold">{authError}</div>}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Nome de Utilizador</label>
                <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Ex: Usuário Diplomático" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Senha</label>
                <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="••••••••" />
              </div>
              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-semibold">Confirmar Senha</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="••••••••" />
                </div>
              )}
              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3.5 rounded-xl text-sm shadow-lg">{authMode === 'login' ? 'Entrar na Plataforma' : 'Criar Nova Conta'}</button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-xs text-amber-400 hover:underline font-semibold">{authMode === 'login' ? 'Não tem conta? Registe-se aqui' : 'Já tem conta? Faça login'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Painel do Utilizador */}
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
                <h3 className="text-xs text-amber-300 font-bold uppercase">Fazer Saque para Diplomacia</h3>
                {withdrawSuccess ? (
                  <div className="text-center py-2 text-emerald-400 text-xs font-bold">✅ Pedido enviado com sucesso!</div>
                ) : (
                  <form onSubmit={handleWithdrawSubmit} className="flex gap-2">
                    <input type="number" placeholder="Valor (R$)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs outline-none" />
                    <button type="submit" className="bg-amber-500 text-black font-black px-4 rounded-xl text-xs whitespace-nowrap">Solicitar</button>
                  </form>
                )}
              </div>

              <div className="bg-[#0b0b0e] border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs text-zinc-400 font-bold uppercase">Trocar Senha</h3>
                {passwordSuccess ? (
                  <div className="text-center py-2 text-emerald-400 text-xs font-bold">✅ Senha atualizada!</div>
                ) : (
                  <form onSubmit={handleChangePassword} className="flex gap-2">
                    <input type="password" placeholder="Nova Senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs outline-none" />
                    <button type="submit" className="bg-zinc-700 text-white font-bold px-4 rounded-xl text-xs whitespace-nowrap">Atualizar</button>
                  </form>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button onClick={handleLogout} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-xs border border-zinc-700">🚪 Sair da Conta</button>
                <button onClick={handleSelfDelete} className="w-full bg-red-500/10 hover:bg-red-500 hover:text-black text-red-500 font-bold py-3 rounded-xl text-xs border border-red-500/30 transition-all">🗑️ Apagar Minha Conta Definitivamente</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Painel Admin */}
      {isAdminPanelOpen && currentUser && (currentUser.isAdmin || currentUser.username.toLowerCase() === 'lvelasques') && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#141418] border-2 border-amber-500 w-full max-w-2xl rounded-3xl p-6 relative shadow-[0_0_50px_rgba(245,158,11,0.2)] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center text-xl shadow-lg">⚙️</div>
              <div>
                <h2 className="text-amber-400 font-black text-xl">Painel Admin (Gestão por ID)</h2>
                <p className="text-xs text-zinc-400">Depósitos, saques e contas atualizadas</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-[#0b0b0e] border border-amber-500/40 rounded-2xl p-4">
                <h3 className="text-xs text-amber-300 font-bold uppercase mb-3">💰 Gestão de Saldo por ID da Conta</h3>
                <form className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="text" placeholder="ID da Conta (ex: 1)" value={adminTargetId} onChange={(e) => setAdminTargetId(e.target.value)} className="bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-xs outline-none font-mono" />
                    <input type="number" placeholder="Valor (R$)" value={adminDepositAmount} onChange={(e) => setAdminDepositAmount(e.target.value)} className="bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-xs outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleAdminBalanceUpdate(e, 'add')} className="flex-1 bg-emerald-500 text-black font-black py-2.5 rounded-xl text-xs">➕ Adicionar Dinheiro</button>
                    <button onClick={(e) => handleAdminBalanceUpdate(e, 'remove')} className="flex-1 bg-red-500 text-black font-black py-2.5 rounded-xl text-xs">➖ Remover Dinheiro</button>
                  </div>
                </form>
              </div>

              <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs text-amber-300 font-bold uppercase">👥 Utilizadores ({usersDb.length})</h3>
                  <button onClick={fetchUsersDb} className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded">🔄 Atualizar Lista</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {usersDb.map((u, idx) => (
                    <div key={idx} className="bg-[#141418] border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-amber-500/60 font-mono text-[10px] mr-1">#{u.id}</span>
                        <span className="font-bold text-white">{u.username}</span>
                        {(u.isAdmin || u.username.toLowerCase() === 'lvelasques') && <span className="ml-2 bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded">ADMIN</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-bold">R$ {Number(u.balance).toLocaleString('pt-BR')}</span>
                        <button onClick={() => handleDeleteUser(u.id, u.username)} className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all" title="Excluir Conta">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
              <button onClick={() => setIsAdminPanelOpen(false)} className="w-full bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs">Fechar Painel Admin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }
