import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Shield, Coins, Sparkles, User, Settings, LogOut, 
  ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, XCircle, Clock,
  Users, Key, Search, Activity, DollarSign, Lock, RefreshCw, Zap, UserPlus, Trash2, Flame, FastForward, Play
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
  { id: 0, name: 'Linha Superior', coords: [0, 1, 2], color: '#f59e0b' },
  { id: 1, name: 'Linha Central', coords: [3, 4, 5], color: '#06b6d4' },
  { id: 2, name: 'Linha Inferior', coords: [6, 7, 8], color: '#10b981' },
  { id: 3, name: 'Diagonal Principal', coords: [0, 4, 8], color: '#ec4899' },
  { id: 4, name: 'Diagonal Invertida', coords: [2, 4, 6], color: '#8b5cf6' }
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
    const saved = localStorage.getItem('cd_users_db');
    return saved ? JSON.parse(saved) : {
      'LVelasques': { username: 'LVelasques', password: 'Lucas123!', balance: 10000000, isAdmin: true, totalDeposited: 10000000, totalWon: 0 }
    };
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cd_current_user');
    return saved ? JSON.parse(saved) : { username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 };
  });

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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
  const [showFireworks, setShowFireworks] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('cd_transactions');
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
    const saved = localStorage.getItem('cd_house_stats');
    return saved ? JSON.parse(saved) : { totalBets: 150000000, totalPayouts: 50000000 };
  });

  useEffect(() => { localStorage.setItem('cd_users_db', JSON.stringify(usersDB)); }, [usersDB]);
  useEffect(() => { localStorage.setItem('cd_current_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('cd_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('cd_house_stats', JSON.stringify(houseStats)); }, [houseStats]);

  useEffect(() => {
    if (user.username !== 'Visitante' && usersDB[user.username]) {
      setUser(usersDB[user.username]);
    }
  }, [usersDB]);
    const handleLogin = (e) => {
    e.preventDefault();
    const cleanNick = loginUsername.trim().replace('@', '');
    if (!cleanNick) return;

    const isAdmin = cleanNick.toLowerCase() === 'lvelasques' && loginPassword === 'Lucas123!';
    let currentUserData = usersDB[cleanNick];

    if (!currentUserData) {
      currentUserData = {
        username: cleanNick,
        password: loginPassword,
        balance: isAdmin ? 10000000 : 0,
        isAdmin,
        totalDeposited: 0,
        totalWon: 0
      };
      setUsersDB(prev => ({ ...prev, [cleanNick]: currentUserData }));
    } else {
      if (currentUserData.password !== loginPassword && !isAdmin) {
        alert('Senha incorreta!');
        return;
      }
    }

    setUser(currentUserData);
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

    setUsersDB(prev => ({ ...prev, [cleanNick]: newUserObj }));
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
    if (confirm(`Tens a certeza que pretendes eliminar o utilizador @${usernameToDelete}?`)) {
      setUsersDB(prev => {
        const copy = { ...prev };
        delete copy[usernameToDelete];
        return copy;
      });
      if (user.username === usernameToDelete) {
        setUser({ username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 });
      }
    }
  };

  const handleResetReports = () => {
    if (confirm('Queres zerar todos os relatórios de entradas, saídas e estatísticas da casa?')) {
      setHouseStats({ totalBets: 0, totalPayouts: 0 });
      setTransactions([]);
      alert('Relatórios financeiros zerados com sucesso!');
    }
  };
    // RTP reduzido geral para garantir a lucratividade da casa (favorita as 3 primeiras imagens no modo Turbo)
  const getDynamicRtp = (currentUser, currentBal) => {
    const deposited = currentUser.totalDeposited || 1;
    const wonRatio = currentUser.totalWon / deposited;

    if (wonRatio >= 0.35) {
      return 0.10; // Trava estrita para proteger o ganho da casa
    }

    if (currentBal >= 500000 || currentBet >= 500000) {
      return 0.18;
    }

    if (currentBal < 40000 && currentBal > 0) {
      return 0.65; // Pequenos respiros para manter jogando
    }

    return isTurbo ? 0.22 : 0.30; // Modo turbo reduz a taxa geral e privilegia baixas pagas
  };

  const getRandomSymbol = (isTurboMode = false) => {
    let pool = SYMBOLS;
    if (isTurboMode) {
      // No modo Turbo, maior probabilidade de sair as 3 primeiras imagens (Couro, TRM, Petróleo)
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
    setUser(prev => ({ ...prev, balance: updatedBalance }));
    setUsersDB(prev => ({
      ...prev,
      [user.username]: { ...prev[user.username], balance: updatedBalance }
    }));
    setHouseStats(prev => ({ ...prev, totalBets: prev.totalBets + currentBet }));

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

      // O diamante agora ativa exclusivamente o bônus
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
      const isLineWin = [finalGrid[a], finalGrid[b], finalGrid[c]].every(
        char => char === matchChar
      );

      if (isLineWin && baseSym) {
        winLines.push(line);
        totalMultiplier += baseSym.mult;
      }
    });

    const spinDuration = overrideTurbo ? 25 : 70;
    const maxSteps = overrideTurbo ? 5 : 14;
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

          setActivePaylines(winLines);
          setLastWin(totalWin);
          setUser(prev => ({ ...prev, balance: winBalance, totalWon: wonAdded }));
          setUsersDB(prev => ({
            ...prev,
            [user.username]: { ...prev[user.username], balance: winBalance, totalWon: wonAdded }
          }));
          setHouseStats(prev => ({ ...prev, totalPayouts: prev.totalPayouts + totalWin }));
        }

        if (hasBonus) {
          setTimeout(() => { 
            setShowBonus(true); 
            setBonusMult(0); 
            setShowFireworks(true);
            setAutoSpinsLeft(0);
          }, 300);
        } else if (autoSpinsLeft > 1) {
          setAutoSpinsLeft(prev => prev - 1);
          setTimeout(() => executeSpin(overrideTurbo), overrideTurbo ? 100 : 350);
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

  useEffect(() => {
    if (autoSpinsLeft > 0 && !spinning && !showBonus) {
      const timer = setTimeout(() => executeSpin(), isTurbo ? 150 : 400);
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

      setUser(prev => ({ ...prev, balance: newBal, totalWon: wonAdded }));
      setUsersDB(prev => ({
        ...prev,
        [user.username]: { ...prev[user.username], balance: newBal, totalWon: wonAdded }
      }));
      setHouseStats(prev => ({ ...prev, totalPayouts: prev.totalPayouts + bonusPrize }));
    }, 1800);
  };

  const handleTransactionRequest = (e) => {
    e.preventDefault();
    const val = parseFloat(transactionAmount);
    if (!val || val <= 0) return;

    if (walletTab === 'withdraw') {
      if (user.balance < val) {
        alert('Saldo insuficiente para solicitar este saque!');
        return;
      }
      const newBal = user.balance - val;
      setUser(prev => ({ ...prev, balance: newBal }));
      setUsersDB(prev => ({
        ...prev,
        [user.username]: { ...prev[user.username], balance: newBal }
      }));
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
    localStorage.setItem('cd_transactions', JSON.stringify(updatedTxs));

    setTransactionAmount('');
    setShowWalletModal(false);
    alert(walletTab === 'deposit' 
      ? 'Depósito solicitado! O pedido foi enviado ao Administrador da Rede Pampas.' 
      : 'Saque solicitado com sucesso! O valor foi debitado e aguarda validação.'
    );
  };

  const handleApproveTransaction = (tx) => {
    const updatedTxs = transactions.map(t => t.id === tx.id ? { ...t, status: 'approved' } : t);
    setTransactions(updatedTxs);
    localStorage.setItem('cd_transactions', JSON.stringify(updatedTxs));

    if (tx.type === 'deposit') {
      setUsersDB(prev => {
        const u = prev[tx.username];
        const currentBal = u ? u.balance : 0;
        const depAdded = (u?.totalDeposited || 0) + tx.amount;
        const updatedUserObj = { ...(u || { username: tx.username, password: '123', isAdmin: false, totalWon: 0 }), balance: currentBal + tx.amount, totalDeposited: depAdded };
        const newDb = { ...prev, [tx.username]: updatedUserObj };
        localStorage.setItem('cd_users_db', JSON.stringify(newDb));
        return newDb;
      });
    }
  };

  const handleRejectTransaction = (tx) => {
    const updatedTxs = transactions.map(t => t.id === tx.id ? { ...t, status: 'rejected' } : t);
    setTransactions(updatedTxs);
    localStorage.setItem('cd_transactions', JSON.stringify(updatedTxs));

    if (tx.type === 'withdraw') {
      setUsersDB(prev => {
        const u = prev[tx.username];
        const currentBal = u ? u.balance : 0;
        const updatedUserObj = { ...u, balance: currentBal + tx.amount };
        const newDb = { ...prev, [tx.username]: updatedUserObj };
        localStorage.setItem('cd_users_db', JSON.stringify(newDb));
        return newDb;
      });
    }
  };

  const handleSaveUserEdit = () => {
    if (!selectedUserToEdit) return;
    const targetNick = selectedUserToEdit.username;

    setUsersDB(prev => {
      const u = prev[targetNick];
      const updatedUserObj = {
        ...u,
        password: newPasswordInput || u.password,
        balance: newBalanceInput !== '' ? parseFloat(newBalanceInput) : u.balance
      };
      const newDb = { ...prev, [targetNick]: updatedUserObj };
      localStorage.setItem('cd_users_db', JSON.stringify(newDb));
      return newDb;
    });

    alert(`Dados do utilizador @${targetNick} atualizados com sucesso!`);
    setSelectedUserToEdit(null);
    setNewPasswordInput('');
    setNewBalanceInput('');
  };

  const totalApprovedDeposits = transactions
    .filter(t => t.type === 'deposit' && t.status === 'approved')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalApprovedWithdrawals = transactions
    .filter(t => t.type === 'withdraw' && t.status === 'approved')
    .reduce((acc, t) => acc + t.amount, 0);

  const hasPendingTransactions = transactions.some(t => t.status === 'pending');
    return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-between font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-500/20 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none z-0" />

      {/* Header com Logotipo da Rede Pampas */}
      <header className="w-full max-w-md bg-slate-900/95 border-b border-amber-500/50 p-3 flex flex-col items-center gap-2 backdrop-blur-2xl sticky top-0 z-40 shadow-2xl shadow-amber-500/10">
        
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <span className="text-slate-950 font-black text-xs">RP</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">PROPRIEDADE DE</span>
              <span className="text-xs font-black text-slate-100 tracking-tight">REDE PAMPAS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.isAdmin && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="relative p-2 bg-amber-500/15 border border-amber-500/60 rounded-xl text-amber-400 hover:bg-amber-500/25 transition-all flex items-center gap-1 text-xs font-bold shadow-lg"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
                {hasPendingTransactions && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-bounce" title="Novos pedidos!" />
                )}
              </button>
            )}

            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-inner">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-black text-amber-300 font-mono">
                R$ {user.balance.toLocaleString('pt-BR')}
              </span>
            </div>

            <button 
              onClick={() => setShowWalletModal(true)}
              className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black hover:brightness-110 transition-all shadow-lg flex items-center gap-1"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Carteira</span>
            </button>
          </div>
        </div>

        {/* Logotipo Oficial Rede Pampas integrado na barra */}
        <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl py-1.5 px-3 flex items-center justify-center gap-2 shadow-inner">
          <span className="text-[11px] font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent tracking-widest">
            ⭐ REDE PAMPAS CASINO ⭐
          </span>
        </div>
      </header>

      {/* Main Game Interface */}
      <main className="w-full max-w-md p-4 flex flex-col items-center gap-3 my-auto z-10">
        
        <div className="w-full bg-slate-900/70 border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Utilizador: <strong className="text-amber-300 font-bold">@{user.username}</strong></span>
          </div>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="text-slate-400 hover:text-amber-400 flex items-center gap-1 text-[11px] font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{user.username === 'Visitante' ? 'Entrar' : 'Trocar Conta'}</span>
          </button>
        </div>

        {/* Slot Grid Ultra-Realista com Moldura Iluminada */}
        <div className="relative w-full aspect-square bg-slate-950/95 rounded-3xl border-2 border-amber-500/60 p-4 flex flex-col justify-between shadow-2xl shadow-amber-500/25 overflow-hidden backdrop-blur-xl">
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            {activePaylines.map(line => (
              <line
                key={line.id}
                x1={line.id === 3 ? "15%" : line.id === 4 ? "85%" : "15%"}
                y1={line.id === 0 ? "20%" : line.id === 1 ? "50%" : line.id === 2 ? "80%" : "20%"}
                x2={line.id === 3 ? "85%" : line.id === 4 ? "15%" : "85%"}
                y2={line.id === 0 ? "20%" : line.id === 1 ? "50%" : line.id === 2 ? "80%" : "80%"}
                stroke={line.color}
                strokeWidth="6"
                strokeLinecap="round"
                className="animate-pulse"
              />
            ))}
          </svg>

          <div className="grid grid-cols-3 gap-3 w-full h-full z-10">
            {grid.map((char, i) => (
              <div 
                key={i}
                className={`bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl shadow-inner transition-transform duration-100 ${
                  spinning ? 'scale-90 opacity-75 blur-[2px]' : 'scale-100 opacity-100 shadow-amber-500/10'
                }`}
              >
                {char}
              </div>
            ))}
          </div>

          {lastWin > 0 && (
            <div className="absolute inset-x-4 bottom-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black py-3 rounded-2xl text-center text-sm shadow-2xl shadow-amber-500/60 animate-bounce z-30 tracking-wider">
              PRÊMIO INCRÍVEL: R$ {lastWin.toLocaleString('pt-BR')}! 🚀
            </div>
          )}
        </div>

        {/* Controlo de Apostas, Rodadas Auto e Botão Turbo */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span className="tracking-wider">VALOR DA APOSTA</span>
            <span className="text-amber-400 font-mono text-sm font-black">
              R$ {currentBet.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {BET_LEVELS.map((lvl, idx) => (
              <button
                key={lvl}
                onClick={() => setBetIndex(idx)}
                className={`py-2 rounded-xl text-xs font-black transition-all border ${
                  betIndex === idx
                    ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/40 scale-105'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-amber-500/40'
                }`}
              >
                {lvl >= 1000000 ? `${lvl / 1000000}M` : `${lvl / 1000}k`}
              </button>
            ))}
          </div>

          {/* Opções de Rodadas Automáticas e Turbo */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <button
              onClick={() => setIsTurbo(!isTurbo)}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all border ${
                isTurbo 
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/30 animate-pulse' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>TURBO {isTurbo ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => startAutoSpins(10)}
              disabled={autoSpinsLeft > 0}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl text-[11px] font-bold text-amber-300"
            >
              Auto 10
            </button>
            <button
              onClick={() => startAutoSpins(30)}
              disabled={autoSpinsLeft > 0}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl text-[11px] font-bold text-amber-300"
            >
              Auto 30
            </button>
            <button
              onClick={() => startAutoSpins(50)}
              disabled={autoSpinsLeft > 0}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl text-[11px] font-bold text-amber-300"
            >
              Auto 50
            </button>
          </div>

          <button
            onClick={() => executeSpin()}
            disabled={spinning}
            className={`w-full py-4 rounded-2xl font-black text-base tracking-wider transition-all shadow-2xl ${
              spinning 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 text-slate-950 hover:brightness-110 active:scale-98 shadow-amber-500/40'
            }`}
          >
            {autoSpinsLeft > 0 ? `AUTO (${autoSpinsLeft}) GIRANDO...` : spinning ? 'GIRANDO...' : 'GIRAR AGORA'}
          </button>
        </div>
      </main>
            {/* Modal de Bônus com Fogos de Artifício */}
      {showBonus && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-2xl shadow-amber-500/40 relative overflow-hidden">
            
            {showFireworks && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-72 h-72 bg-gradient-to-tr from-amber-500/30 via-yellow-400/40 to-cyan-500/30 rounded-full blur-2xl animate-ping" />
              </div>
            )}

            <div className="flex items-center gap-2 text-amber-400">
              <Flame className="w-6 h-6 animate-bounce text-amber-400" />
              <h2 className="text-lg font-black tracking-wider">
                SUPER BÔNUS REDE PAMPAS 💎
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Gira a roleta de multiplicadores especiais e fatura um prêmio monumental!
            </p>

            <div className="w-32 h-32 rounded-full border-4 border-amber-400 flex items-center justify-center bg-slate-950 text-4xl font-black text-amber-300 shadow-2xl shadow-amber-500/30">
              {bonusMult > 0 ? `${bonusMult}x` : '🎰'}
            </div>

            <button
              onClick={spinBonusWheel}
              disabled={spinningBonus || bonusMult > 0}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded-xl hover:brightness-110 disabled:opacity-50 text-sm shadow-xl shadow-amber-500/30"
            >
              {spinningBonus ? 'SORTEANDO PRÊMIO...' : bonusMult > 0 ? 'PRÊMIO RESGATADO!' : 'GIRAR ROLETA DE BÔNUS'}
            </button>

            {bonusMult > 0 && (
              <button 
                onClick={() => { setShowBonus(false); setShowFireworks(false); }}
                className="text-xs text-amber-300 font-bold underline mt-2"
              >
                Continuar a Jogar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Carteira */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
            
            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button 
                onClick={() => setWalletTab('deposit')}
                className={`w-1/2 py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  walletTab === 'deposit' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>DEPÓSITO</span>
              </button>
              <button 
                onClick={() => setWalletTab('withdraw')}
                className={`w-1/2 py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  walletTab === 'withdraw' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>SAQUE</span>
              </button>
            </div>

            <form onSubmit={handleTransactionRequest} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-400">
                  {walletTab === 'deposit' ? 'Valor para Depositar (R$)' : 'Valor para Sacar (R$)'}
                </label>
                <input 
                  type="number"
                  required
                  min="1000"
                  value={transactionAmount}
                  onChange={e => setTransactionAmount(e.target.value)}
                  placeholder="Ex: 500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm mt-1 focus:border-amber-500 outline-none font-mono"
                />
                {walletTab === 'withdraw' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Saldo disponível: <strong className="text-amber-400">R$ {user.balance.toLocaleString('pt-BR')}</strong>
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
                  Enviar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Autenticação */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-base font-black text-amber-400">ACESSO À CONTA</h3>
            <div>
              <label className="text-xs text-slate-400">Utilizador / Nick</label>
              <input 
                type="text"
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Ex: TeuNome"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm mt-1 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Senha</label>
              <input 
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm mt-1 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Fechar
              </button>
              <button type="submit" className="w-2/3 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
                Entrar / Criar Conta
              </button>
            </div>
          </form>
        </div>
      )}
            {/* Painel Master Admin Detalhado */}
      {showAdminPanel && user.isAdmin && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-slate-900 border border-amber-500/50 rounded-3xl p-5 flex flex-col gap-5 my-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-black text-amber-400">
                  PAINEL MASTER REDE PAMPAS (@LVelasques)
                </h2>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white text-sm font-bold">
                ✕ Fechar
              </button>
            </div>

            <div className="flex gap-2 border-b border-slate-800 pb-3 flex-wrap">
              <button 
                onClick={() => setAdminTab('transactions')}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'transactions' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Transações
                {hasPendingTransactions && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                )}
              </button>
              <button 
                onClick={() => setAdminTab('users')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'users' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Jogadores
              </button>
              <button 
                onClick={() => setAdminTab('reports')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'reports' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Relatórios
              </button>
              <button 
                onClick={() => setAdminTab('rtp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'rtp' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Regras & RTP
              </button>
            </div>

            {adminTab === 'transactions' && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  SOLICITAÇÕES DE DEPÓSITO E SAQUE
                </h3>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                  {transactions.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Nenhuma transação registada.</p>
                  ) : (
                    transactions.map(tx => (
                      <div key={tx.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {tx.type === 'deposit' ? (
                            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                              <ArrowDownRight className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                              <ArrowUpRight className="w-4 h-4" />
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-200">@{tx.username}</strong>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {tx.type === 'deposit' ? 'Depósito' : 'Saque'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              R$ {tx.amount.toLocaleString('pt-BR')} • {tx.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {tx.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveTransaction(tx)}
                                className="bg-emerald-500 text-slate-950 px-2.5 py-1.5 rounded-xl font-black text-xs hover:brightness-110 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovar</span>
                              </button>
                              <button
                                onClick={() => handleRejectTransaction(tx)}
                                className="bg-rose-500/20 border border-rose-500/40 text-rose-400 px-2 py-1.5 rounded-xl font-bold text-xs hover:bg-rose-500/30 flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejeitar</span>
                              </button>
                            </>
                          ) : (
                            <span className={`font-bold text-xs px-2 py-1 rounded-lg ${
                              tx.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                            }`}>
                              {tx.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {adminTab === 'users' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    JOGADORES REGISTRADOS ({Object.keys(usersDB).length})
                  </h3>
                  <button 
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs hover:brightness-110 flex items-center gap-1 shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Criar Jogador</span>
                  </button>
                </div>

                {showAddUserForm && (
                  <form onSubmit={handleAdminCreateUser} className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 flex flex-col gap-3">
                    <h4 className="text-xs font-black text-amber-400">CRIAR CONTA PARA JOGADOR</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Nick</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: Pedro"
                          value={createNickInput}
                          onChange={e => setCreateNickInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs mt-1 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Senha</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: 123456"
                          value={createPassInput}
                          onChange={e => setCreatePassInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs mt-1 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Saldo Inicial</label>
                        <input 
                          type="number"
                          placeholder="Ex: 500000"
                          value={createBalanceInput}
                          onChange={e => setCreateBalanceInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs mt-1 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button 
                        type="button"
                        onClick={() => setShowAddUserForm(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-1.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl"
                      >
                        Criar Conta
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {Object.values(usersDB).map(u => (
                    <div key={u.username} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-amber-300">@{u.username} {u.isAdmin && '(Admin)'}</strong>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Saldo: R$ {u.balance.toLocaleString('pt-BR')} | Senha: <span className="text-slate-200">{u.password}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUserToEdit(u);
                            setNewPasswordInput(u.password);
                            setNewBalanceInput(u.balance);
                          }}
                          className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-xl font-bold text-xs hover:bg-amber-500/30"
                        >
                          Editar
                        </button>
                        {!u.isAdmin && (
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="bg-rose-500/20 border border-rose-500/40 text-rose-400 p-1.5 rounded-xl hover:bg-rose-500/30"
                            title="Excluir Jogador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedUserToEdit && (
                  <div className="mt-2 bg-slate-950 p-4 rounded-2xl border border-amber-500/40 flex flex-col gap-3">
                    <h4 className="text-xs font-black text-amber-400">
                      EDITAR CONTA: @{selectedUserToEdit.username}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Nova Senha</label>
                        <input 
                          type="text"
                          value={newPasswordInput}
                          onChange={e => setNewPasswordInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs mt-1 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Novo Saldo (R$)</label>
                        <input 
                          type="number"
                          value={newBalanceInput}
                          onChange={e => setNewBalanceInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs mt-1 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={() => setSelectedUserToEdit(null)}
                        className="w-1/2 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveUserEdit}
                        className="w-1/2 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl"
                      >
                        Guardar Alterações
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {adminTab === 'reports' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    ESTATÍSTICAS FINANCEIRAS
                  </h3>
                  <button 
                    onClick={handleResetReports}
                    className="bg-rose-500/20 border border-rose-500/40 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-rose-500/30 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Zerar Relatório</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase">TOTAL DEPÓSITOS APROVADOS</p>
                    <p className="text-base font-black text-emerald-400 font-mono mt-1">
                      R$ {totalApprovedDeposits.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-rose-500/30">
                    <p className="text-[10px] text-rose-400 font-bold uppercase">TOTAL SAQUES PAGOS</p>
                    <p className="text-base font-black text-rose-400 font-mono mt-1">
                      R$ {totalApprovedWithdrawals.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <p className="text-[9px] text-slate-400">VOLUME APOSTADO</p>
                    <p className="text-xs font-black text-slate-200 font-mono mt-1">
                      R$ {houseStats.totalBets.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <p className="text-[9px] text-slate-400">PRÊMIOS PAGOS</p>
                    <p className="text-xs font-black text-amber-400 font-mono mt-1">
                      R$ {houseStats.totalPayouts.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30">
                    <p className="text-[9px] text-amber-400">LUCRO DA CASA</p>
                    <p className="text-xs font-black text-emerald-400 font-mono mt-1">
                      R$ {(houseStats.totalBets - houseStats.totalPayouts).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'rtp' && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  DETALHES DE PAGAMENTO E RTP ATUAL
                </h3>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2 text-xs">
                  <p className="text-slate-300 font-bold">Tabela de Pagamento por Símbolo:</p>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-slate-400">
                    {SYMBOLS.map(s => (
                      <div key={s.id} className="bg-slate-900 p-2 rounded-xl flex items-center justify-between border border-slate-800">
                        <span>{s.char} {s.name}</span>
                        <strong className="text-amber-400">{s.isBonus ? 'Apenas Bônus' : `${s.mult}x`}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-slate-800 pt-2 flex flex-col gap-1 text-[11px] text-slate-400">
                    <p>• <strong className="text-emerald-400">Modo Turbo:</strong> Prioriza focar nas 3 primeiras imagens e acelera as rodadas.</p>
                    <p>• <strong className="text-emerald-400">Proteção de Lucro:</strong> Trava automática quando o jogador atinge 35% de lucro sobre o depósito.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <footer className="w-full text-center py-3 text-[10px] text-slate-600 border-t border-slate-900/80 backdrop-blur-md">
        Rede Pampas Cassino © 2026 - Todos os direitos reservados.
      </footer>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
