import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Shield, Coins, Sparkles, User, LogOut, 
  Wallet, CheckCircle2, XCircle, 
  RefreshCw, Zap, UserPlus, Trash2, Flame, FastForward, Play, UserCheck, Square
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
  const [usersDB, setUsersDB] = useState(() => {
    const saved = localStorage.getItem('rp_users_db');
    return saved ? JSON.parse(saved) : {
      'LVelasques': { username: 'LVelasques', password: 'Lucas123!', balance: 10000000, isAdmin: true, totalDeposited: 10000000, totalWon: 0 }
    };
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rp_current_user');
    return saved ? JSON.parse(saved) : { username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 };
  });

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

  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [isTurbo, setIsTurbo] = useState(false);

  const [showBonus, setShowBonus] = useState(false);
  const [bonusMult, setBonusMult] = useState(0);
  const [spinningBonus, setSpinningBonus] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('rp_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState('transactions');
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newBalanceInput, setNewBalanceInput] = useState('');

  const [createNickInput, setCreateNickInput] = useState('');
  const [createPassInput, setCreatePassInput] = useState('');
  const [createBalanceInput, setCreateBalanceInput] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const [houseStats, setHouseStats] = useState(() => {
    const saved = localStorage.getItem('rp_house_stats');
    return saved ? JSON.parse(saved) : { totalBets: 150000000, totalPayouts: 50000000 };
  });
    useEffect(() => {
    const interval = setInterval(() => {
      const savedUsers = localStorage.getItem('rp_users_db');
      if (savedUsers) setUsersDB(JSON.parse(savedUsers));

      const savedTx = localStorage.getItem('rp_transactions');
      if (savedTx) setTransactions(JSON.parse(savedTx));

      const savedStats = localStorage.getItem('rp_house_stats');
      if (savedStats) setHouseStats(JSON.parse(savedStats));

      if (user.username !== 'Visitante') {
        const currentDb = savedUsers ? JSON.parse(savedUsers) : usersDB;
        if (currentDb[user.username]) {
          setUser(currentDb[user.username]);
        }
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [user.username]);

  useEffect(() => { localStorage.setItem('rp_users_db', JSON.stringify(usersDB)); }, [usersDB]);
  useEffect(() => { localStorage.setItem('rp_current_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('rp_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('rp_house_stats', JSON.stringify(houseStats)); }, [houseStats]);

  const handleAuthSubmit = (e) => {
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
        isAdmin: false,
        totalDeposited: 0,
        totalWon: 0
      };
      const updatedDb = { ...usersDB, [cleanNick]: newUserObj };
      setUsersDB(updatedDb);
      localStorage.setItem('rp_users_db', JSON.stringify(updatedDb));

      setUser(newUserObj);
      localStorage.setItem('rp_current_user', JSON.stringify(newUserObj));
      alert(`Conta @${cleanNick} criada com sucesso!`);
    } else {
      let currentUserData = usersDB[cleanNick];
      if (!currentUserData) {
        if (isAdmin) {
          currentUserData = { username: cleanNick, password: loginPassword, balance: 10000000, isAdmin: true, totalDeposited: 10000000, totalWon: 0 };
          const updatedDb = { ...usersDB, [cleanNick]: currentUserData };
          setUsersDB(updatedDb);
          localStorage.setItem('rp_users_db', JSON.stringify(updatedDb));
        } else {
          alert('Utilizador não encontrado!');
          return;
        }
      } else {
        if (currentUserData.password !== loginPassword && !isAdmin) {
          alert('Senha incorreta!');
          return;
        }
      }
      setUser(currentUserData);
      localStorage.setItem('rp_current_user', JSON.stringify(currentUserData));
    }

    setLoginUsername('');
    setLoginPassword('');
    setShowAuthModal(false);
  };
    const handleAdminCreateUser = (e) => {
    e.preventDefault();
    const cleanNick = createNickInput.trim().replace('@', '');
    if (!cleanNick) return;

    const initialBal = parseFloat(createBalanceInput) || 0;
    const newUserObj = {
      username: cleanNick,
      password: createPassInput || '123456',
      balance: initialBal,
      isAdmin: false,
      totalDeposited: initialBal,
      totalWon: 0
    };

    const updatedDb = { ...usersDB, [cleanNick]: newUserObj };
    setUsersDB(updatedDb);
    localStorage.setItem('rp_users_db', JSON.stringify(updatedDb));
    alert(`Conta do jogador @${cleanNick} criada com sucesso!`);
    
    setCreateNickInput('');
    setCreatePassInput('');
    setCreateBalanceInput('');
    setShowAddUserForm(false);
  };

  const handleDeleteUser = (usernameToDelete) => {
    if (usernameToDelete === 'LVelasques') {
      alert('Não podes apagar a conta do Admin Master!');
      return;
    }
    if (confirm(`Tens a certeza que pretendes eliminar @${usernameToDelete}?`)) {
      const copy = { ...usersDB };
      delete copy[usernameToDelete];
      setUsersDB(copy);
      localStorage.setItem('rp_users_db', JSON.stringify(copy));

      if (user.username === usernameToDelete) {
        const guest = { username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 };
        setUser(guest);
        localStorage.setItem('rp_current_user', JSON.stringify(guest));
      }
    }
  };

  const handleResetReports = () => {
    if (confirm('Queres zerar todos os relatórios financeiros?')) {
      const resetStats = { totalBets: 0, totalPayouts: 0 };
      setHouseStats(resetStats);
      setTransactions([]);
      localStorage.setItem('rp_house_stats', JSON.stringify(resetStats));
      localStorage.setItem('rp_transactions', JSON.stringify([]));
      alert('Relatórios zerados!');
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

  const executeSpin = (overrideTurbo = isTurbo) => {
    if (user.balance < currentBet) {
      alert('Saldo insuficiente! Faça um depósito para continuar.');
      setWalletTab('deposit');
      setShowWalletModal(true);
      setAutoSpinsLeft(0);
      return;
    }

    const updatedBalance = user.balance - currentBet;
    const updatedUserObj = { ...user, balance: updatedBalance };
    setUser(updatedUserObj);
    localStorage.setItem('rp_current_user', JSON.stringify(updatedUserObj));

    setUsersDB(prev => {
      const newDb = { ...prev, [user.username]: updatedUserObj };
      localStorage.setItem('rp_users_db', JSON.stringify(newDb));
      return newDb;
    });

    const newStats = { ...houseStats, totalBets: houseStats.totalBets + currentBet };
    setHouseStats(newStats);
    localStorage.setItem('rp_house_stats', JSON.stringify(newStats));

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
      const allowedSymbols = SYMBOLS.filter(s => !s.isBonus && s.mult <= (overrideTurbo ? 1 : 2.5));
      const winningSymbol = allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)];
      const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];

      finalGrid = Array(9).fill(null).map(() => getRandomSymbol(overrideTurbo));
      targetLine.coords.forEach(idx => { finalGrid[idx] = winningSymbol.char; });

      if (Math.random() < 0.04) {
        const bonusLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
        bonusLine.coords.forEach(idx => { finalGrid[idx] = '💎'; });
        hasBonus = true;
      }
    } else {
      finalGrid = Array(9).fill(null).map(() => getRandomSymbol(overrideTurbo));
      if (Math.random() < 0.40) {
        const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
        const nearSym = getRandomSymbol(overrideTurbo);
        finalGrid[targetLine.coords[0]] = nearSym;
        finalGrid[targetLine.coords[1]] = nearSym;
        finalGrid[targetLine.coords[2]] = SYMBOLS.find(s => s.char !== nearSym && !s.isBonus)?.char || '🪙';
      }
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

    const spinDuration = overrideTurbo ? 20 : 65;
    const maxSteps = overrideTurbo ? 4 : 12;
    let currentInterval = 0;

    const spinTimer = setInterval(() => {
      setGrid(Array(9).fill(null).map(() => getRandomSymbol(overrideTurbo)));
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
          localStorage.setItem('rp_current_user', JSON.stringify(finalUserObj));

          setUsersDB(prev => {
            const newDb = { ...prev, [user.username]: finalUserObj };
            localStorage.setItem('rp_users_db', JSON.stringify(newDb));
            return newDb;
          });

          const finalStats = { ...newStats, totalPayouts: newStats.totalPayouts + totalWin };
          setHouseStats(finalStats);
          localStorage.setItem('rp_house_stats', JSON.stringify(finalStats));
        }

        if (hasBonus) {
          setTimeout(() => { 
            setShowBonus(true); 
            setBonusMult(0); 
            setAutoSpinsLeft(0);
          }, 300);
        } else if (autoSpinsLeft > 1) {
          setAutoSpinsLeft(prev => prev - 1);
          setTimeout(() => executeSpin(overrideTurbo), overrideTurbo ? 80 : 300);
        } else {
          setAutoSpinsLeft(0);
        }
      }
    }, spinDuration);
  };

  const startAutoSpins = (count) => {
    if (spinning) return;
    setAutoSpinsLeft(count);
  };

  const stopAutoSpins = () => {
    setAutoSpinsLeft(0);
  };

  useEffect(() => {
    if (autoSpinsLeft > 0 && !spinning && !showBonus) {
      const timer = setTimeout(() => executeSpin(), isTurbo ? 100 : 350);
      return () => clearTimeout(timer);
    }
  }, [autoSpinsLeft, spinning, showBonus]);
          const spinBonusWheel = () => {
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

    setTimeout(() => {
      setBonusMult(selectedMult);
      setSpinningBonus(false);
      const bonusPrize = currentBet * selectedMult;
      const newBal = user.balance + bonusPrize;
      const wonAdded = (user.totalWon || 0) + bonusPrize;

      const finalUserObj = { ...user, balance: newBal, totalWon: wonAdded };
      setUser(finalUserObj);
      localStorage.setItem('rp_current_user', JSON.stringify(finalUserObj));

      setUsersDB(prev => {
        const newDb = { ...prev, [user.username]: finalUserObj };
        localStorage.setItem('rp_users_db', JSON.stringify(newDb));
        return newDb;
      });

      const finalStats = { ...houseStats, totalPayouts: houseStats.totalPayouts + bonusPrize };
      setHouseStats(finalStats);
      localStorage.setItem('rp_house_stats', JSON.stringify(finalStats));
    }, 1500);
  };

  const handleTransactionRequest = (e) => {
    e.preventDefault();
    const val = parseFloat(transactionAmount);
    if (!val || val <= 0) return;

    if (walletTab === 'withdraw') {
      if (user.balance < val) {
        alert('Saldo insuficiente para saque!');
        return;
      }
      const newBal = user.balance - val;
      const updatedUserObj = { ...user, balance: newBal };
      setUser(updatedUserObj);
      localStorage.setItem('rp_current_user', JSON.stringify(updatedUserObj));

      setUsersDB(prev => {
        const newDb = { ...prev, [user.username]: updatedUserObj };
        localStorage.setItem('rp_users_db', JSON.stringify(newDb));
        return newDb;
      });
    }

    const newTx = {
      id: Date.now(),
      username: user.username,
      type: walletTab,
      amount: val,
      status: 'pending',
      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem('rp_transactions', JSON.stringify(updatedTxs));

    setTransactionAmount('');
    setShowWalletModal(false);
    alert(walletTab === 'deposit' ? 'Depósito solicitado com sucesso!' : 'Saque solicitado com sucesso!');
  };

  const handleApproveTransaction = (tx) => {
    const updatedTxs = transactions.map(t => t.id === tx.id ? { ...t, status: 'approved' } : t);
    setTransactions(updatedTxs);
    localStorage.setItem('rp_transactions', JSON.stringify(updatedTxs));

    if (tx.type === 'deposit') {
      setUsersDB(prev => {
        const u = prev[tx.username];
        const currentBal = u ? u.balance : 0;
        const depAdded = (u?.totalDeposited || 0) + tx.amount;
        const updatedUserObj = { ...(u || { username: tx.username, password: '123', isAdmin: false, totalWon: 0 }), balance: currentBal + tx.amount, totalDeposited: depAdded };
        const newDb = { ...prev, [tx.username]: updatedUserObj };
        localStorage.setItem('rp_users_db', JSON.stringify(newDb));
        return newDb;
      });
    }
  };

  const handleRejectTransaction = (tx) => {
    const updatedTxs = transactions.map(t => t.id === tx.id ? { ...t, status: 'rejected' } : t);
    setTransactions(updatedTxs);
    localStorage.setItem('rp_transactions', JSON.stringify(updatedTxs));

    if (tx.type === 'withdraw') {
      setUsersDB(prev => {
        const u = prev[tx.username];
        const currentBal = u ? u.balance : 0;
        const updatedUserObj = { ...u, balance: currentBal + tx.amount };
        const newDb = { ...prev, [tx.username]: updatedUserObj };
        localStorage.setItem('rp_users_db', JSON.stringify(newDb));
        return newDb;
      });
    }
  };

  const handleSaveUserEdit = () => {
    if (!selectedUserToEdit) return;
    const targetNick = selectedUserToEdit.username;
    const newPass = newPasswordInput.trim() || selectedUserToEdit.password;
    const newBal = newBalanceInput !== '' ? parseFloat(newBalanceInput) : selectedUserToEdit.balance;

    const updatedUserObj = { ...selectedUserToEdit, password: newPass, balance: newBal };
    const updatedDb = { ...usersDB, [targetNick]: updatedUserObj };
    setUsersDB(updatedDb);
    localStorage.setItem('rp_users_db', JSON.stringify(updatedDb));

    if (user.username === targetNick) {
      setUser(updatedUserObj);
      localStorage.setItem('rp_current_user', JSON.stringify(updatedUserObj));
    }

    alert(`Utilizador @${targetNick} atualizado com sucesso!`);
    setSelectedUserToEdit(null);
    setNewPasswordInput('');
    setNewBalanceInput('');
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
              Servidor Cloud Ativo
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center active:scale-95"
                title="Carteira / Depósito"
              >
                <Wallet className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const guest = { username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 };
                  setUser(guest);
                  localStorage.setItem('rp_current_user', JSON.stringify(guest));
                }}
                className="bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white p-2 rounded-xl transition active:scale-95"
                title="Terminar Sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Entrar / Registar
            </button>
          )}

          {user.isAdmin && (
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold px-3 py-2.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition active:scale-95 flex items-center gap-1.5"
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
            <span className="text-emerald-400 font-black tracking-wide">RTP PRO ON</span>
          </div>

          <div className="relative bg-slate-950 border-4 border-slate-800/90 rounded-2xl p-4 shadow-2xl mb-5 overflow-hidden">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {grid.map((symbolChar, idx) => {
                const isWinningSlot = activePaylines.some(line => line.coords.includes(idx));
                return (
                  <div 
                    key={idx}
                    className={`h-24 sm:h-28 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl shadow-lg transition-all duration-200 ${
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

            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={() => setIsTurbo(!isTurbo)}
                className={`py-3 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 border transition shadow-md active:scale-95 ${
                  isTurbo ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-amber-500/20' : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Zap className="w-4 h-4" />
                TURBO
              </button>

              <button 
                disabled={spinning || autoSpinsLeft > 0}
                onClick={() => startAutoSpins(10)}
                className="bg-slate-800/80 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 py-3 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 text-slate-300 transition shadow-md active:scale-95"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                AUTO 10
              </button>

              <button 
                disabled={spinning || autoSpinsLeft > 0}
                onClick={() => startAutoSpins(25)}
                className="bg-slate-800/80 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 py-3 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 text-slate-300 transition shadow-md active:scale-95"
              >
                <FastForward className="w-4 h-4 text-amber-400" />
                AUTO 25
              </button>

              {autoSpinsLeft > 0 ? (
                <button 
                  onClick={stopAutoSpins}
                  className="col-span-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wider animate-pulse"
                >
                  <Square className="w-5 h-5 fill-current" />
                  Parar Rodadas ({autoSpinsLeft})
                </button>
              ) : (
                <button 
                  disabled={spinning}
                  onClick={() => executeSpin()}
                  className="col-span-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-4 rounded-2xl text-xl shadow-xl shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2.5 uppercase tracking-wide"
                >
                  {spinning ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Flame className="w-6 h-6 text-red-600" />}
                  {spinning ? 'A Girar...' : 'Girar Agora'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
                          {/* MODAL DE AUTENTICAÇÃO (LOGIN E SENHA APENAS) */}
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
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-4 rounded-2xl shadow-lg shadow-amber-500/25 transition text-sm uppercase tracking-wide active:scale-95"
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

            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/60 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CARTEIRA */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-4 flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Gestão de Saldo
            </h2>

            <div className="flex gap-2 mb-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button 
                onClick={() => setWalletTab('deposit')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${walletTab === 'deposit' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Depositar
              </button>
              <button 
                onClick={() => setWalletTab('withdraw')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${walletTab === 'withdraw' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Levantar / Saque
              </button>
            </div>

            <form onSubmit={handleTransactionRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  {walletTab === 'deposit' ? 'Valor do Depósito (R$)' : 'Valor do Saque (R$)'}
                </label>
                <input 
                  type="number"
                  placeholder="Ex: 50000"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 text-sm font-medium shadow-inner"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition text-sm uppercase tracking-wide active:scale-95"
              >
                {walletTab === 'deposit' ? 'Solicitar Depósito' : 'Solicitar Saque'}
              </button>
            </form>

            <button 
              onClick={() => setShowWalletModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/60 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* RODA DE BÓNUS */}
      {showBonus && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative">
            <h2 className="text-2xl font-black text-amber-400 mb-1">💎 RODA DE BÓNUS 💎</h2>
            <p className="text-xs text-slate-300 mb-6 font-medium">Gire a roda para multiplicar a sua aposta!</p>

            <div className="my-6 py-8 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <span className="text-5xl sm:text-6xl font-black text-amber-400 mb-2 drop-shadow">
                {bonusMult > 0 ? `${bonusMult}x` : '???'}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {bonusMult > 0 ? `Prémio: ${formatCurrency(currentBet * bonusMult)}` : 'Pronto para rodar!'}
              </span>
            </div>

            <button 
              disabled={spinningBonus || bonusMult > 0}
              onClick={spinBonusWheel}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-4 rounded-2xl text-lg shadow-xl shadow-amber-500/30 transition disabled:opacity-50 active:scale-95"
            >
              {spinningBonus ? 'A Girar Roda...' : bonusMult > 0 ? 'Bónus Recebido!' : 'Rodar Bónus Agora'}
            </button>

            {bonusMult > 0 && (
              <button 
                onClick={() => { setShowBonus(false); setBonusMult(0); }}
                className="mt-3.5 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-sm transition active:scale-95"
              >
                Continuar a Jogar
              </button>
            )}
          </div>
        </div>
      )}
            {/* PAINEL ADMIN */}
      {showAdminPanel && user.isAdmin && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg sm:text-xl font-black text-purple-400 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Painel Administrativo - Rede Pampas
              </h2>
              <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white font-bold text-lg bg-slate-800/60 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>

            <div className="flex gap-2 my-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button onClick={() => setAdminTab('transactions')} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${adminTab === 'transactions' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'}`}>Transações ({transactions.length})</button>
              <button onClick={() => setAdminTab('users')} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${adminTab === 'users' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'}`}>Utilizadores ({Object.keys(usersDB).length})</button>
              <button onClick={() => setAdminTab('stats')} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${adminTab === 'stats' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'}`}>Estatísticas</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {adminTab === 'transactions' && (
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <p className="text-center text-slate-500 py-8 text-sm">Sem transações pendentes.</p>
                  ) : (
                    transactions.map(tx => (
                      <div key={tx.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                        <div>
                          <p className="text-sm font-black text-white">@{tx.username} - <span className={tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'}>{tx.type.toUpperCase()}</span></p>
                          <p className="text-xs text-slate-400 font-bold mt-0.5">{formatCurrency(tx.amount)} • {tx.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {tx.status === 'pending' ? (
                            <>
                              <button onClick={() => handleApproveTransaction(tx)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 shadow">
                                <CheckCircle2 className="w-4 h-4" /> Aprovar
                              </button>
                              <button onClick={() => handleRejectTransaction(tx)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 shadow">
                                <XCircle className="w-4 h-4" /> Rejeitar
                              </button>
                            </>
                          ) : (
                            <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${tx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {tx.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {adminTab === 'users' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => setShowAddUserForm(!showAddUserForm)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition shadow"
                    >
                      <UserPlus className="w-4 h-4" />
                      {showAddUserForm ? 'Fechar' : 'Adicionar Jogador'}
                    </button>
                  </div>

                  {showAddUserForm && (
                    <form onSubmit={handleAdminCreateUser} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 mb-4 shadow-inner">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Criar Nova Conta Manualmente</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" placeholder="Utilizador" value={createNickInput} onChange={(e) => setCreateNickInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" required />
                        <input type="password" placeholder="Senha" value={createPassInput} onChange={(e) => setCreatePassInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" required />
                        <input type="number" placeholder="Saldo Inicial" value={createBalanceInput} onChange={(e) => setCreateBalanceInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                      </div>
                      <button type="submit" className="bg-emerald-600 text-white w-full py-3 rounded-xl text-xs font-black uppercase">Criar Jogador</button>
                    </form>
                  )}

                  {Object.values(usersDB).map(u => (
                    <div key={u.username} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                      <div>
                        <p className="text-sm font-black text-white flex items-center gap-2">
                          @{u.username} {u.isAdmin && <span className="bg-purple-600/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-lg">Admin</span>}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">Saldo: <span className="text-amber-400 font-bold">{formatCurrency(u.balance)}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedUserToEdit(u)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-black transition">Editar</button>
                        {u.username !== 'LVelasques' && (
                          <button onClick={() => handleDeleteUser(u.username)} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-2.5 rounded-xl transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'stats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-inner">
                      <p className="text-xs text-slate-400 font-bold">Total de Apostas</p>
                      <p className="text-lg sm:text-xl font-black text-amber-400 mt-1">{formatCurrency(houseStats.totalBets)}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-inner">
                      <p className="text-xs text-slate-400 font-bold">Total Prémios Pagos</p>
                      <p className="text-lg sm:text-xl font-black text-emerald-400 mt-1">{formatCurrency(houseStats.totalPayouts)}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleResetReports}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 font-black w-full py-3.5 rounded-2xl text-xs uppercase tracking-wider transition"
                  >
                    Zerar Relatórios e Estatísticas
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDITAR UTILIZADOR */}
      {selectedUserToEdit && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-base sm:text-lg font-black text-purple-400 mb-4">Editar @{selectedUserToEdit.username}</h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nova Senha</label>
                <input type="text" placeholder="Deixar em branco para manter" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Novo Saldo (R$)</label>
                <input type="number" defaultValue={selectedUserToEdit.balance} onChange={(e) => setNewBalanceInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white" />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button onClick={handleSaveUserEdit} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase transition shadow">Guardar</button>
                <button onClick={() => setSelectedUserToEdit(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-3.5 rounded-2xl text-xs uppercase transition">Cancelar</button>
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
