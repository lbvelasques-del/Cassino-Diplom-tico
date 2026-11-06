import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './supabaseClient';
import { 
  Shield, Coins, Sparkles, User, LogOut, 
  Wallet, CheckCircle2, XCircle, 
  RefreshCw, Zap, UserPlus, Trash2, Flame, UserCheck
} from 'lucide-react';

const SYMBOLS = [
  { id: 'couro', char: '🫎', name: 'Couro', mult: 0.5, weight: 120 },
  { id: 'trm', char: '⚗️', name: 'TRM', mult: 0.8, weight: 100 },
  { id: 'petroleo', char: '🛢️', name: 'Petróleo', mult: 1, weight: 80 },
  { id: 'ouro', char: '🪙', name: 'Ouro', mult: 1.5, weight: 50 },
  { id: 'brasil', char: '🇧🇷', name: 'Brasil', mult: 2, weight: 35 },
  { id: 'costarica', char: '🇨🇷', name: 'Costa Rica', mult: 3, weight: 20 },
  { id: 'mundo', char: '🌎', name: 'Mundo', mult: 2.5, weight: 25 },
  { id: 'diamante', char: '💎', name: 'Diamante Bônus', mult: 0, weight: 6, isBonus: true }
];

const BET_LEVELS = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

const PAYLINES = [
  { id: 0, name: 'Linha Superior', coords: [0, 1, 2] },
  { id: 1, name: 'Linha Central', coords: [3, 4, 5] },
  { id: 2, name: 'Linha Inferior', coords: [6, 7, 8] },
  { id: 3, name: 'Diagonal Principal', coords: [0, 4, 8] },
  { id: 4, name: 'Diagonal Invertida', coords: [2, 4, 6] }
];

const MULTIPLIER_WHEEL = [
  { mult: 2, weight: 90 },
  { mult: 3, weight: 70 },
  { mult: 4, weight: 40 },
  { mult: 5, weight: 25 },
  { mult: 6, weight: 15 },
  { mult: 8, weight: 8 },
  { mult: 10, weight: 4 },
  { mult: 15, weight: 2 }
];
function App() {
  const [usersDB, setUsersDB] = useState({});
  const [user, setUser] = useState({ username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 });

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTab, setWalletTab] = useState('deposit');
  const [transactionAmount, setTransactionAmount] = useState('');

  const [betIndex, setBetIndex] = useState(0);
  const currentBet = BET_LEVELS[betIndex];
  const [grid, setGrid] = useState(['🪙','🇧🇷','🌎','🫎','🪙','⚗️','🇨🇷','🛢️','🪙']);
  const [spinning, setSpinning] = useState(false);
  const [activePaylines, setActivePaylines] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  const [isTurbo, setIsTurbo] = useState(false);

  const [showBonus, setShowBonus] = useState(false);
  const [bonusMult, setBonusMult] = useState(0);
  const [spinningBonus, setSpinningBonus] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState('transactions');
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newBalanceInput, setNewBalanceInput] = useState('');

  const [createNickInput, setCreateNickInput] = useState('');
  const [createPassInput, setCreatePassInput] = useState('');
  const [createBalanceInput, setCreateBalanceInput] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const [houseStats, setHouseStats] = useState({ totalBets: 0, totalPayouts: 0 });
    const fetchCloudData = async () => {
    try {
      const { data: userData, error: userError } = await supabase.from('users').select('*');
      if (!userError && userData) {
        const dbMap = {};
        userData.forEach(u => {
          dbMap[u.username] = {
            username: u.username,
            password: u.password,
            balance: u.balance || 0,
            isAdmin: u.is_admin || false,
            totalDeposited: u.total_deposited || 0,
            totalWon: u.total_won || 0
          };
        });
        setUsersDB(dbMap);

        if (user.username !== 'Visitante' && dbMap[user.username]) {
          setUser(dbMap[user.username]);
        }
      }

      const { data: txData, error: txError } = await supabase.from('transactions').select('*').order('id', { ascending: false });
      if (!txError && txData) {
        setTransactions(txData.map(t => ({
          id: t.id,
          username: t.username,
          type: t.type,
          amount: t.amount,
          status: t.status,
          date: t.date
        })));
      }
    } catch (err) {
      console.error('Erro ao sincronizar com o Supabase:', err);
    }
  };

  useEffect(() => {
    fetchCloudData();
    const interval = setInterval(fetchCloudData, 2000);
    return () => clearInterval(interval);
  }, [user.username]);
    const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const cleanNick = loginUsername.trim().replace('@', '');
    if (!cleanNick || !loginPassword) return;

    const isAdmin = cleanNick.toLowerCase() === 'lvelasques' && loginPassword === 'Lucas123!';

    if (authMode === 'register') {
      if (usersDB[cleanNick]) {
        alert('Este nome de utilizador já existe!');
        return;
      }
      const newUserObj = {
        username: cleanNick,
        password: loginPassword,
        balance: 0,
        is_admin: false,
        total_deposited: 0,
        total_won: 0
      };

      const { error } = await supabase.from('users').insert([newUserObj]);
      if (error) {
        alert('Erro ao criar conta na nuvem.');
        return;
      }

      const localObj = { username: cleanNick, password: loginPassword, balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 };
      setUser(localObj);
      alert(`Conta @${cleanNick} criada com sucesso! Faça um pedido de depósito.`);
    } else {
      let currentUserData = usersDB[cleanNick];
      if (!currentUserData) {
        if (isAdmin) {
          currentUserData = { username: cleanNick, password: loginPassword, balance: 10000000, isAdmin: true, totalDeposited: 10000000, totalWon: 0 };
          await supabase.from('users').upsert([{ username: cleanNick, password: loginPassword, balance: 10000000, is_admin: true, total_deposited: 10000000, total_won: 0 }]);
        } else {
          alert('Utilizador não encontrado! Registe uma conta.');
          return;
        }
      } else {
        if (currentUserData.password !== loginPassword && !isAdmin) {
          alert('Senha incorreta!');
          return;
        }
      }
      setUser(currentUserData);
    }

    setLoginUsername('');
    setLoginPassword('');
    setShowAuthModal(false);
    fetchCloudData();
  };
    const handleAdminCreateUser = async (e) => {
    e.preventDefault();
    const cleanNick = createNickInput.trim().replace('@', '');
    if (!cleanNick) return;

    const initialBal = parseFloat(createBalanceInput) || 0;
    const newUserObj = {
      username: cleanNick,
      password: createPassInput || '123456',
      balance: initialBal,
      is_admin: false,
      total_deposited: initialBal,
      total_won: 0
    };

    await supabase.from('users').upsert([newUserObj]);
    alert(`Conta do jogador @${cleanNick} criada com sucesso!`);
    
    setCreateNickInput('');
    setCreatePassInput('');
    setCreateBalanceInput('');
    setShowAddUserForm(false);
    fetchCloudData();
  };

  const handleDeleteUser = async (usernameToDelete) => {
    if (usernameToDelete === 'LVelasques') {
      alert('Não podes apagar a conta do Admin Master!');
      return;
    }
    if (confirm(`Tens a certeza que pretendes eliminar @${usernameToDelete}?`)) {
      await supabase.from('users').delete().eq('username', usernameToDelete);
      if (user.username === usernameToDelete) {
        setUser({ username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 });
      }
      fetchCloudData();
    }
  };
    const getDynamicRtp = (currentUser, currentBal) => {
    const deposited = currentUser.totalDeposited || 1;
    const wonRatio = currentUser.totalWon / deposited;
    if (wonRatio >= 0.35) return 0.10; 
    if (currentBal >= 500000 || currentBet >= 500000) return 0.18;
    if (currentBal < 40000 && currentBal > 0) return 0.65; 
    return isTurbo ? 0.22 : 0.30;
  };

  const getRandomSymbol = (isTurboMode = false) => {
    let pool = SYMBOLS;
    if (isTurboMode) {
      const lowTierWeights = SYMBOLS.map(s => {
        if (s.id === 'couro' || s.id === 'trm' || s.id === 'petroleo') {
          return { ...s, weight: s.weight * 4 };
        }
        return { ...s, weight: s.weight * 0.4 };
      });
      const totalW = lowTierWeights.reduce((acc, s) => acc + s.weight, 0);
      let rnd = Math.random() * totalW;
      for (let sym of lowTierWeights) {
        if (rnd < sym.weight) return sym.char;
        rnd -= sym.weight;
      }
    }

    const totalWeight = pool.reduce((acc, s) => acc + s.weight, 0);
    let rnd = Math.random() * totalWeight;
    for (let sym of pool) {
      if (rnd < sym.weight) return sym.char;
      rnd -= sym.weight;
    }
    return pool[0].char;
  };

  const executeSpin = async () => {
    if (user.balance < currentBet) {
      alert('Saldo insuficiente! Faça um depósito para continuar.');
      setWalletTab('deposit');
      setShowWalletModal(true);
      return;
    }

    const updatedBalance = user.balance - currentBet;
    const updatedUserObj = { ...user, balance: updatedBalance };
    setUser(updatedUserObj);

    await supabase.from('users').update({ balance: updatedBalance }).eq('username', user.username);

    setSpinning(true);
    setActivePaylines([]);
    setLastWin(0);

    const rtpTarget = getDynamicRtp(user, updatedBalance);
    const forceWin = Math.random() < rtpTarget;

    let finalGrid = [];
    let winLines = [];
    let totalMultiplier = 0;
    let hasBonus = false;

    if (forceWin) {
      const allowedSymbols = SYMBOLS.filter(s => !s.isBonus && s.mult <= (isTurbo ? 1 : 2.5));
      const winningSymbol = allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)];
      const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];

      finalGrid = Array(9).fill(null).map(() => getRandomSymbol(isTurbo));
      targetLine.coords.forEach(idx => { finalGrid[idx] = winningSymbol.char; });

      if (Math.random() < 0.04) {
        const bonusLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
        bonusLine.coords.forEach(idx => { finalGrid[idx] = '💎'; });
        hasBonus = true;
      }
    } else {
      finalGrid = Array(9).fill(null).map(() => getRandomSymbol(isTurbo));
    }

    PAYLINES.forEach(line => {
      const [a, b, c] = line.coords;
      const isBonusMatch = finalGrid[a] === '💎' && finalGrid[b] === '💎' && finalGrid[c] === '💎';
      if (isBonusMatch) {
        hasBonus = true;
        winLines.push(line);
        return;
      }

      const matchChar = [finalGrid[a], finalGrid[b], finalGrid[c]].find(char => char !== '💎');
      if (!matchChar) return;

      const baseSym = SYMBOLS.find(s => s.char === matchChar);
      const isLineWin = [finalGrid[a], finalGrid[b], finalGrid[c]].every(char => char === matchChar);

      if (isLineWin && baseSym) {
        winLines.push(line);
        totalMultiplier += baseSym.mult;
      }
    });

    // Velocidade mais lenta e emocionante
    const spinDuration = isTurbo ? 40 : 120;
    const maxSteps = isTurbo ? 6 : 18;
    let currentInterval = 0;

    const spinTimer = setInterval(async () => {
      setGrid(Array(9).fill(null).map(() => getRandomSymbol(isTurbo)));
      currentInterval++;
      if (currentInterval >= maxSteps) {
        clearInterval(spinTimer);
        setGrid(finalGrid);
        setSpinning(false);

        if (winLines.length > 0 && totalMultiplier > 0) {
          const totalWin = currentBet * totalMultiplier;
          const winBalance = updatedBalance + totalWin;
          const wonAdded = (user.totalWon || 0) + totalWin;

          const finalUserObj = { ...updatedUserObj, balance: winBalance, totalWon: wonAdded };
          setActivePaylines(winLines);
          setLastWin(totalWin);
          setUser(finalUserObj);

          await supabase.from('users').update({ balance: winBalance, total_won: wonAdded }).eq('username', user.username);
        }

        if (hasBonus) {
          setTimeout(() => { 
            setShowBonus(true); 
            setBonusMult(0); 
          }, 300);
        }
      }
    }, spinDuration);
  };
    const spinBonusWheel = async () => {
    if (spinningBonus) return;
    setSpinningBonus(true);

    const totalWeight = MULTIPLIER_WHEEL.reduce((acc, m) => acc + m.weight, 0);
    let rnd = Math.random() * totalWeight;
    let selectedMult = 3;
    for (let item of MULTIPLIER_WHEEL) {
      if (rnd < item.weight) {
        selectedMult = item.mult;
        break;
      }
      rnd -= item.weight;
    }

    setTimeout(async () => {
      setBonusMult(selectedMult);
      setSpinningBonus(false);
      const bonusPrize = currentBet * selectedMult;
      const newBal = user.balance + bonusPrize;
      const wonAdded = (user.totalWon || 0) + bonusPrize;

      const finalUserObj = { ...user, balance: newBal, totalWon: wonAdded };
      setUser(finalUserObj);
      await supabase.from('users').update({ balance: newBal, total_won: wonAdded }).eq('username', user.username);
    }, 1800);
  };

  const handleTransactionRequest = async (e) => {
    e.preventDefault();
    const val = parseFloat(transactionAmount);
    if (!val || val <= 0) return;

    if (walletTab === 'withdraw') {
      if (user.balance < val) {
        alert('Saldo insuficiente para saque!');
        return;
      }
      const newBal = user.balance - val;
      setUser({ ...user, balance: newBal });
      await supabase.from('users').update({ balance: newBal }).eq('username', user.username);
    }

    const newTx = {
      username: user.username,
      type: walletTab,
      amount: val,
      status: 'pending',
      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    await supabase.from('transactions').insert([newTx]);

    setTransactionAmount('');
    setShowWalletModal(false);
    alert(walletTab === 'deposit' ? 'Depósito solicitado com sucesso!' : 'Saque solicitado com sucesso!');
    fetchCloudData();
  };

  const handleApproveTransaction = async (tx) => {
    await supabase.from('transactions').update({ status: 'approved' }).eq('id', tx.id);

    if (tx.type === 'deposit') {
      const { data } = await supabase.from('users').select('*').eq('username', tx.username).single();
      if (data) {
        const newBal = (data.balance || 0) + tx.amount;
        const newDep = (data.total_deposited || 0) + tx.amount;
        await supabase.from('users').update({ balance: newBal, total_deposited: newDep }).eq('username', tx.username);
      }
    }
    fetchCloudData();
  };

  const handleRejectTransaction = async (tx) => {
    await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);

    if (tx.type === 'withdraw') {
      const { data } = await supabase.from('users').select('*').eq('username', tx.username).single();
      if (data) {
        const newBal = (data.balance || 0) + tx.amount;
        await supabase.from('users').update({ balance: newBal }).eq('username', tx.username);
      }
    }
    fetchCloudData();
  };

  const handleSaveUserEdit = async () => {
    if (!selectedUserToEdit) return;
    const targetNick = selectedUserToEdit.username;
    const newPass = newPasswordInput.trim() || selectedUserToEdit.password;
    const newBal = newBalanceInput !== '' ? parseFloat(newBalanceInput) : selectedUserToEdit.balance;

    await supabase.from('users').update({ password: newPass, balance: newBal }).eq('username', targetNick);

    alert(`Utilizador @${targetNick} atualizado com sucesso!`);
    setSelectedUserToEdit(null);
    setNewPasswordInput('');
    setNewBalanceInput('');
    fetchCloudData();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };
    return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* HEADER PROFISSIONAL */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/30">
            <Coins className="w-6 h-6 text-slate-950 font-black" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-wider bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow">
              REDE PAMPAS CASINO
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase Cloud Ativo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {user.username !== 'Visitante' ? (
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-inner">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] text-amber-400 font-bold">@{user.username}</p>
                <p className="text-xs font-black tracking-tight text-white">{formatCurrency(user.balance)}</p>
              </div>
              <div className="sm:hidden text-right">
                <p className="text-xs font-black text-amber-400">{formatCurrency(user.balance)}</p>
              </div>
              <button 
                onClick={() => { setShowWalletModal(true); setWalletTab('deposit'); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition shadow-md flex items-center justify-center active:scale-95"
                title="Carteira / Depósito"
              >
                <Wallet className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setUser({ username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 }); }}
                className="bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white p-2 rounded-xl transition active:scale-95"
                title="Terminar Sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Entrar / Registar
            </button>
          )}

          {user.isAdmin && (
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold px-3 py-2.5 rounded-2xl text-xs sm:text-sm shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* SLOT MACHINE PRINCIPAL */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col justify-center items-center">
        <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 text-xs text-slate-400 bg-slate-950/80 px-3 py-2.5 rounded-2xl border border-slate-800/60 shadow-inner">
            <span className="flex items-center gap-1.5 font-bold text-amber-400"><Sparkles className="w-4 h-4" /> 5 Linhas Ativas</span>
            <span className="text-emerald-400 font-black tracking-wide">MODO EMOÇÃO ON</span>
          </div>

          <div className="relative bg-slate-950 border-4 border-slate-800/90 rounded-2xl p-4 shadow-2xl mb-5 overflow-hidden">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {grid.map((symbolChar, idx) => {
                const isWinningSlot = activePaylines.some(line => line.coords.includes(idx));
                return (
                  <div 
                    key={idx}
                    className={`h-24 sm:h-28 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl shadow-lg transition-all duration-300 ${
                      spinning ? 'animate-pulse scale-95 border-slate-700 opacity-80' : 
                      isWinningSlot ? 'border-amber-400 shadow-amber-500/50 scale-105 bg-amber-500/10' : 'border-slate-800/80'
                    }`}
                  >
                    <span className={spinning ? 'blur-[1px]' : 'drop-shadow-md'}>{symbolChar}</span>
                  </div>
                );
              })}
            </div>

            {lastWin > 0 && !spinning && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in z-20 p-4 text-center">
                <span className="text-amber-400 font-black text-2xl sm:text-3xl uppercase tracking-widest drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">🔥 GRANDE PRÉMIO! 🔥</span>
                <span className="text-white font-black text-3xl sm:text-4xl mt-2 tracking-tight">{formatCurrency(lastWin)}</span>
              </div>
            )}
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 shadow-inner">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Aposta Atual</p>
                <p className="text-lg sm:text-xl font-black text-amber-400 tracking-tight">{formatCurrency(currentBet)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  disabled={betIndex === 0 || spinning}
                  onClick={() => setBetIndex(prev => Math.max(0, prev - 1))}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white w-10 h-10 rounded-xl font-black text-lg transition shadow active:scale-95 flex items-center justify-center"
                >-</button>
                <span className="text-xs font-bold text-slate-300 px-2">Nível {betIndex + 1}</span>
                <button 
                  disabled={betIndex === BET_LEVELS.length - 1 || spinning}
                  onClick={() => setBetIndex(prev => Math.min(BET_LEVELS.length - 1, prev + 1))}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white w-10 h-10 rounded-xl font-black text-lg transition shadow active:scale-95 flex items-center justify-center"
                >+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setIsTurbo(!isTurbo)}
                className={`py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition shadow-md active:scale-95 ${
                  isTurbo ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-amber-500/20' : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Zap className="w-5 h-5" />
                TURBO {isTurbo ? 'ON' : 'OFF'}
              </button>

              <button 
                disabled={spinning}
                onClick={() => executeSpin()}
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-4 rounded-2xl text-lg sm:text-xl shadow-xl shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                {spinning ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Flame className="w-6 h-6 text-red-600" />}
                {spinning ? 'A Girar...' : 'Girar'}
              </button>
            </div>
          </div>
        </div>
      </main>
                        {/* MODAL DE AUTENTICAÇÃO (LOGIN E SENHA) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-1 flex items-center gap-2">
              <UserCheck className="w-6 h-6" />
              {authMode === 'login' ? 'Entrar no Casino' : 'Registar Conta'}
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-medium">Insira o seu login e senha para aceder.</p>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Nome de Utilizador (Login)</label>
                <input 
                  type="text"
                  placeholder="Ex: JogadorPampas"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 text-sm font-medium shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Senha</label>
                <input 
                  type="password"
                  placeholder="********"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 text-sm font-medium shadow-inner"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-4 rounded-2xl shadow-lg transition text-sm uppercase tracking-wide active:scale-95"
              >
                {authMode === 'login' ? 'Entrar na Conta' : 'Criar Conta Agora'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button 
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                {authMode === 'login' ? 'Não tem conta? Registe-se aqui' : 'Já tem conta? Faça login'}
              </button>
            </div>

            <button onClick={() => setShowAuthModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/60 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>
      )}

      {/* MODAL DE CARTEIRA */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-4 flex items-center gap-2"><Wallet className="w-6 h-6" /> Gestão de Saldo</h2>
            <div className="flex gap-2 mb-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button onClick={() => setWalletTab('deposit')} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${walletTab === 'deposit' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'}`}>Depositar</button>
              <button onClick={() => setWalletTab('withdraw')} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${walletTab === 'withdraw' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'}`}>Levantar / Saque</button>
            </div>
            <form onSubmit={handleTransactionRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{walletTab === 'deposit' ? 'Valor do Depósito (R$)' : 'Valor do Saque (R$)'}</label>
                <input type="number" placeholder="Ex: 50000" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white text-sm font-medium shadow-inner" required />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg transition text-sm uppercase">Solicitar</button>
            </form>
            <button onClick={() => setShowWalletModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/60 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>
      )}

      {/* RODA DE BÓNUS */}
      {showBonus && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 w-full max-w-md rounded-3xl p-6 shadow-2xl text-center relative">
            <h2 className="text-2xl font-black text-amber-400 mb-1">💎 RODA DE BÓNUS 💎</h2>
            <div className="my-6 py-8 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-amber-400 mb-2">{bonusMult > 0 ? `${bonusMult}x` : '???'}</span>
            </div>
            <button disabled={spinningBonus || bonusMult > 0} onClick={spinBonusWheel} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-4 rounded-2xl text-lg">
              {spinningBonus ? 'A Girar...' : bonusMult > 0 ? 'Recebido!' : 'Rodar Bónus'}
            </button>
            {bonusMult > 0 && (
              <button onClick={() => setShowBonus(false)} className="mt-3.5 w-full bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm">Continuar</button>
            )}
          </div>
        </div>
      )}

      {/* PAINEL ADMIN */}
      {showAdminPanel && user.isAdmin && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-black text-purple-400 flex items-center gap-2"><Shield className="w-6 h-6" /> Painel Admin - Rede Pampas</h2>
              <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white font-bold bg-slate-800/60 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>
            <div className="flex gap-2 my-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button onClick={() => setAdminTab('transactions')} className={`flex-1 py-2.5 rounded-xl text-xs font-black ${adminTab === 'transactions' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Transações ({transactions.length})</button>
              <button onClick={() => setAdminTab('users')} className={`flex-1 py-2.5 rounded-xl text-xs font-black ${adminTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Utilizadores ({Object.keys(usersDB).length})</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {adminTab === 'transactions' && (
                <div className="space-y-3">
                  {transactions.length === 0 ? <p className="text-center text-slate-500 py-8 text-sm">Sem transações pendentes.</p> : (
                    transactions.map(tx => (
                      <div key={tx.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-white">@{tx.username} - <span className={tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'}>{tx.type.toUpperCase()}</span></p>
                          <p className="text-xs text-slate-400 font-bold">{formatCurrency(tx.amount)} • {tx.date}</p>
                        </div>
                        <div className="flex gap-2">
                          {tx.status === 'pending' ? (
                            <>
                              <button onClick={() => handleApproveTransaction(tx)} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-black">Aprovar</button>
                              <button onClick={() => handleRejectTransaction(tx)} className="bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-black">Rejeitar</button>
                            </>
                          ) : <span className={`text-xs font-black px-3 py-1 rounded-xl ${tx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{tx.status.toUpperCase()}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {adminTab === 'users' && (
                <div className="space-y-3">
                  <button onClick={() => setShowAddUserForm(!showAddUserForm)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2"><UserPlus className="w-4 h-4" /> Adicionar Jogador</button>
                  {showAddUserForm && (
                    <form onSubmit={handleAdminCreateUser} className="bg-slate-950 p-4 rounded-2xl space-y-3">
                      <input type="text" placeholder="Utilizador" value={createNickInput} onChange={(e) => setCreateNickInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white w-full" required />
                      <input type="password" placeholder="Senha" value={createPassInput} onChange={(e) => setCreatePassInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white w-full" required />
                      <input type="number" placeholder="Saldo Inicial" value={createBalanceInput} onChange={(e) => setCreateBalanceInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white w-full" />
                      <button type="submit" className="bg-emerald-600 text-white w-full py-3 rounded-xl text-xs font-black uppercase">Criar</button>
                    </form>
                  )}
                  {Object.values(usersDB).map(u => (
                    <div key={u.username} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                      <div><p className="text-sm font-black text-white">@{u.username} {u.isAdmin && <span className="bg-purple-600/20 text-purple-400 text-[10px] px-2 py-0.5 rounded">Admin</span>}</p><p className="text-xs text-amber-400 font-bold">{formatCurrency(u.balance)}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedUserToEdit(u)} className="bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-black">Editar</button>
                        {u.username !== 'LVelasques' && <button onClick={() => handleDeleteUser(u.username)} className="bg-red-600/20 text-red-400 p-2.5 rounded-xl"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR UTILIZADOR */}
      {selectedUserToEdit && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-base font-black text-purple-400 mb-4">Editar @{selectedUserToEdit.username}</h3>
            <div className="space-y-3.5">
              <input type="text" placeholder="Nova Senha" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white" />
              <input type="number" defaultValue={selectedUserToEdit.balance} onChange={(e) => setNewBalanceInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white" />
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveUserEdit} className="flex-1 bg-purple-600 text-white font-black py-3 rounded-2xl text-xs uppercase">Guardar</button>
                <button onClick={() => setSelectedUserToEdit(null)} className="flex-1 bg-slate-800 text-slate-300 font-black py-3 rounded-2xl text-xs uppercase">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
                                
