import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function DiamondStriker() {
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
  }, [currentUser]);const symbols = [
    { id: 'ruby', icon: '/ruby.png', name: 'Ruby', mult: 0.5, weight: 25, isBonus: false },
    { id: 'safira', icon: '/safira.png', name: 'Safira', mult: 0.8, weight: 24, isBonus: false },
    { id: 'esmeralda', icon: '/esmeralda.png', name: 'Esmeralda', mult: 1.0, weight: 22, isBonus: false },
    { id: 'ouro', icon: '/ouro.png', name: 'Barra Ouro', mult: 2.0, weight: 20, isBonus: false },
    { id: 'estrela', icon: '/estrela.png', name: 'Estrela', mult: 1.5, weight: 19, isBonus: false },
    { id: 'coroa', icon: '/coroa.png', name: 'Coroa', mult: 3.0, weight: 16, isBonus: false },
    { id: 'diamante_st', icon: '/diamantest.png', name: 'Diamond Striker', mult: 6.0, weight: 10, isBonus: true }
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
      const globalWinChance = 0.35; 
      let newGrid = Array.from({ length: 9 }, () => getRandomSymbolByWeight());

      if (Math.random() < globalWinChance) {
        const chosenSym = getRandomSymbolByWeight();
        const winLinesMatrix = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        const primaryLine = winLinesMatrix[Math.floor(Math.random() * winLinesMatrix.length)];
        primaryLine.forEach(idx => { newGrid[idx] = chosenSym; });
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
      const randomMult = Math.floor(Math.random() * 10) + 2; 
      const prize = betAmount * randomMult;
      const finalBal = balance + prize;
      updateBalanceOnDb(currentUser.id, finalBal);
      setLastWin(prize);
      setSpinningWheel(false);
      setBonusWheelActive(false);
    }, 1500);
  };

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
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-cyan-500 selection:text-black">
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-2">
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
          💎 DIAMOND STRIKER 💎
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Plataforma Oficial - Grupo Pampas</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        {bonusWheelActive && (
          <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-cyan-500/20 border-2 border-cyan-400 rounded-3xl p-5 text-center shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-pulse space-y-3">
            <p className="text-xs text-cyan-300 font-black uppercase tracking-wider">⚡ STRIKE DIAMOND ATIVO! ⚡</p>
            <p className="text-white font-bold text-sm">Gire a Super Roleta (2x a 10x a aposta)</p>
            {wheelMultiplier && <p className="text-2xl text-cyan-400 font-black">🎉 Multiplicador: {wheelMultiplier}x (+R$ {(betAmount * wheelMultiplier).toLocaleString('pt-BR')})</p>}
            <button disabled={spinningWheel} onClick={triggerBonusWheel} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black py-3 rounded-2xl shadow-lg text-sm hover:scale-105 transition-all">{spinningWheel ? '🔄 A GIRAR ROLETA...' : '🎰 RODAR ROLETA DIAMOND'}</button>
          </div>
        )}

        <div className="relative bg-[#0a0a0e] border-2 border-cyan-500/40 rounded-3xl p-4 shadow-2xl mt-2">
          <div className="grid grid-cols-3 gap-3 my-2">
            {grid.map((sym, idx) => {
              const isWinningCell = winningLines.includes(idx);
              return (
                <div key={idx} className={`h-24 rounded-2xl bg-[#0b0b0e] border flex flex-col items-center justify-center shadow-inner transition-all duration-300 ${spinning ? 'animate-pulse opacity-50 scale-95 border-zinc-800' : ''} ${isWinningCell ? 'border-cyan-400 bg-cyan-500/20 scale-105 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-bounce' : 'border-zinc-800/80 hover:border-cyan-500/40'}`}>
                  <img 
                    src={sym.icon} 
                    alt={sym.name} 
                    className="w-14 h-14 object-contain" 
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 font-bold tracking-wider">{sym.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0f0f12] border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Valor da Aposta</span>
            <span className="text-cyan-400 font-black text-sm">R$ {betAmount.toLocaleString('pt-BR')}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {bets.map((val) => (
              <button key={val} disabled={spinning} onClick={() => setBetAmount(val)} className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${betAmount === val ? 'bg-cyan-500 text-black border-cyan-300 shadow-lg scale-105 font-black' : 'bg-[#18181e] text-zinc-300 border-zinc-800 hover:border-cyan-500/30'}`}>
                {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {lastWin > 0 && (
          <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-cyan-500/20 border border-cyan-500/60 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse">
            <p className="text-xs text-cyan-300 font-extrabold uppercase tracking-widest">🎉 VITÓRIA STRIKE ACUMULADA!</p>
            <p className="text-cyan-400 font-black text-xl drop-shadow-md">+ R$ {lastWin.toLocaleString('pt-BR')}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={() => setTurbo(!turbo)} className={`py-4 px-5 rounded-2xl font-bold text-xs border transition-all shadow-md ${turbo ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-[#141418] text-zinc-400 border-zinc-800'}`}>⚡ TURBO {turbo ? 'ON' : 'OFF'}</button>
          <button disabled={spinning || (currentUser && balance < betAmount) || bonusWheelActive} onClick={spin} className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-500 hover:from-cyan-400 hover:to-blue-300 text-black font-black text-lg py-4 rounded-2xl shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all border border-cyan-200/50">▶️ {spinning ? 'A GIRAR...' : 'GIRAR'}</button>
        </div>
      </main>
    </div>
  );
}
