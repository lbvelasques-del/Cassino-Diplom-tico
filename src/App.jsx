import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Shield, Coins, Sparkles, User, Settings, LogOut, 
  ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, XCircle, Clock,
  Users, Key, Search, Activity, DollarSign, Lock, RefreshCw, Zap, UserPlus
} from 'lucide-react';

const SYMBOLS = [
  { id: 'couro', char: '🫎', name: 'Couro', mult: 1, weight: 100 },
  { id: 'trm', char: '⚗️', name: 'TRM', mult: 2, weight: 80 },
  { id: 'petroleo', char: '🛢️', name: 'Petróleo', mult: 3, weight: 50 },
  { id: 'ouro', char: '🪙', name: 'Ouro', mult: 4, weight: 30 },
  { id: 'brasil', char: '🇧🇷', name: 'Brasil', mult: 5, weight: 20 },
  { id: 'costarica', char: '🇨🇷', name: 'Costa Rica', mult: 6, weight: 15 },
  { id: 'mundo', char: '🌎', name: 'Mundo', mult: 8, weight: 10 },
  { id: 'diamante', char: '💎', name: 'Diamante', mult: 10, weight: 5, isWild: true }
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
  { mult: 10, weight: 2 }
];

function App() {
  const [usersDB, setUsersDB] = useState(() => {
    const saved = localStorage.getItem('cd_users_db');
    return saved ? JSON.parse(saved) : {
      'LVelasques': { username: 'LVelasques', password: 'Lucas123!', balance: 10000000, isAdmin: true }
    };
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cd_current_user');
    return saved ? JSON.parse(saved) : { username: 'Visitante', balance: 0, isAdmin: false };
  });

  const [onlineCount, setOnlineCount] = useState(142);
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTab, setWalletTab] = useState('deposit');
  const [transactionAmount, setTransactionAmount] = useState('');

  const [betIndex, setBetIndex] = useState(0);
  const currentBet = BET_LEVELS[betIndex];
  const [grid, setGrid] = useState(['🪙','🇧🇷','🌎','🫎','💎','⚗️','🇨🇷','🛢️','🪙']);
  const [spinning, setSpinning] = useState(false);
  const [activePaylines, setActivePaylines] = useState([]);
  const [lastWin, setLastWin] = useState(0);

  const [showBonus, setShowBonus] = useState(false);
  const [bonusMult, setBonusMult] = useState(0);
  const [spinningBonus, setSpinningBonus] = useState(false);

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
    return saved ? JSON.parse(saved) : { totalBets: 85000000, totalPayouts: 34000000 };
  });

  useEffect(() => { localStorage.setItem('cd_users_db', JSON.stringify(usersDB)); }, [usersDB]);
  useEffect(() => { localStorage.setItem('cd_current_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('cd_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('cd_house_stats', JSON.stringify(houseStats)); }, [houseStats]);

  useEffect(() => {
    if (user.username !== 'Visitante' && usersDB[user.username]) {
      setUser(prev => ({ ...prev, balance: usersDB[user.username].balance }));
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
        isAdmin
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
      isAdmin: false
    };

    setUsersDB(prev => ({ ...prev, [cleanNick]: newUserObj }));
    alert(`Conta do jogador @${cleanNick} criada com sucesso com R$ ${initialBal.toLocaleString('pt-BR')} de saldo!`);
    
    setCreateNickInput('');
    setCreatePassInput('');
    setCreateBalanceInput('');
    setShowAddUserForm(false);
  };

  const getRtpTarget = (bet) => {
    if (bet <= 60000) return 0.50;
    if (bet <= 500000) return 0.35;
    return 0.20;
  };

  const getRandomSymbol = () => {
    const totalWeight = SYMBOLS.reduce((acc, s) => acc + s.weight, 0);
    let rnd = Math.random() * totalWeight;
    for (let sym of SYMBOLS) {
      if (rnd < sym.weight) return sym.char;
      rnd -= sym.weight;
    }
    return SYMBOLS[0].char;
  };
      const spin = () => {
    if (spinning) return;
    if (user.balance < currentBet) {
      alert('Saldo insuficiente! Faça um depósito para jogar.');
      setWalletTab('deposit');
      setShowWalletModal(true);
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

    const rtpTarget = getRtpTarget(currentBet);
    const forceWin = Math.random() < rtpTarget;

    let finalGrid = [];
    let winLines = [];
    let totalMultiplier = 0;
    let hasBonus = false;

    if (forceWin) {
      const lowTierSymbols = SYMBOLS.filter(s => s.mult <= 4);
      const winningSymbol = lowTierSymbols[Math.floor(Math.random() * lowTierSymbols.length)];
      const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];

      finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
      targetLine.coords.forEach(idx => { finalGrid[idx] = winningSymbol.char; });

      if (Math.random() < 0.04) {
        const bonusLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
        bonusLine.coords.forEach(idx => { finalGrid[idx] = '💎'; });
        hasBonus = true;
      }
    } else {
      finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
      if (Math.random() < 0.65) {
        const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
        const nearSym = getRandomSymbol();
        finalGrid[targetLine.coords[0]] = nearSym;
        finalGrid[targetLine.coords[1]] = nearSym;
        finalGrid[targetLine.coords[2]] = SYMBOLS.find(s => s.char !== nearSym).char;
      }
    }

    PAYLINES.forEach(line => {
      const [a, b, c] = line.coords;
      const isBonusMatch = finalGrid[a] === '💎' && finalGrid[b] === '💎' && finalGrid[c] === '💎';
      if (isBonusMatch) {
        hasBonus = true;
        winLines.push(line);
        totalMultiplier += 10;
        return;
      }

      const matchChar = [finalGrid[a], finalGrid[b], finalGrid[c]].find(char => char !== '💎') || '💎';
      const baseSym = SYMBOLS.find(s => s.char === matchChar);
      const isLineWin = [finalGrid[a], finalGrid[b], finalGrid[c]].every(
        char => char === matchChar || char === '💎'
      );

      if (isLineWin && baseSym) {
        winLines.push(line);
        totalMultiplier += baseSym.mult;
      }
    });

    let currentInterval = 0;
    const spinTimer = setInterval(() => {
      setGrid(Array(9).fill(null).map(() => getRandomSymbol()));
      currentInterval++;
      if (currentInterval >= 14) {
        clearInterval(spinTimer);
        setGrid(finalGrid);
        setSpinning(false);

        if (winLines.length > 0) {
          const totalWin = currentBet * totalMultiplier;
          const winBalance = updatedBalance + totalWin;

          setActivePaylines(winLines);
          setLastWin(totalWin);
          setUser(prev => ({ ...prev, balance: winBalance }));
          setUsersDB(prev => ({
            ...prev,
            [user.username]: { ...prev[user.username], balance: winBalance }
          }));
          setHouseStats(prev => ({ ...prev, totalPayouts: prev.totalPayouts + totalWin }));
        }

        if (hasBonus) {
          setTimeout(() => { setShowBonus(true); setBonusMult(0); }, 500);
        }
      }
    }, 70);
  };

  const spinBonusWheel = () => {
    if (spinningBonus) return;
    setSpinningBonus(true);

    const totalWeight = MULTIPLIER_WHEEL.reduce((acc, m) => acc + m.weight, 0);
    let rnd = Math.random() * totalWeight;
    let selectedMult = 2;
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

      setUser(prev => ({ ...prev, balance: newBal }));
      setUsersDB(prev => ({
        ...prev,
        [user.username]: { ...prev[user.username], balance: newBal }
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

    setTransactions([newTx, ...transactions]);
    setTransactionAmount('');
    setShowWalletModal(false);
    alert(walletTab === 'deposit' 
      ? 'Depósito solicitado! Aguarde aprovação do Admin.' 
      : 'Saque solicitado! O valor foi congelado da conta até à aprovação do Admin.'
    );
  };

  const handleApproveTransaction = (tx) => {
    setTransactions(transactions.map(t => t.id === tx.id ? { ...t, status: 'approved' } : t));

    if (tx.type === 'deposit') {
      setUsersDB(prev => {
        const u = prev[tx.username];
        const currentBal = u ? u.balance : 0;
        return {
          ...prev,
          [tx.username]: { ...u, balance: currentBal + tx.amount }
        };
      });
    }
  };

  const handleRejectTransaction = (tx) => {
    setTransactions(transactions.map(t => t.id === tx.id ? { ...t, status: 'rejected' } : t));

    if (tx.type === 'withdraw') {
      setUsersDB(prev => {
        const u = prev[tx.username];
        const currentBal = u ? u.balance : 0;
        return {
          ...prev,
          [tx.username]: { ...u, balance: currentBal + tx.amount }
        };
      });
    }
  };

  const handleSaveUserEdit = () => {
    if (!selectedUserToEdit) return;
    const targetNick = selectedUserToEdit.username;

    setUsersDB(prev => {
      const u = prev[targetNick];
      return {
        ...prev,
        [targetNick]: {
          ...u,
          password: newPasswordInput || u.password,
          balance: newBalanceInput !== '' ? parseFloat(newBalanceInput) : u.balance
        }
      };
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

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-between font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-amber-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none z-0" />

      <header className="w-full max-w-md bg-slate-900/80 border-b border-amber-500/30 p-3 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 shadow-xl shadow-amber-500/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-cyan-400 p-0.5 shadow-lg shadow-amber-500/30 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
              CASSINO DIPLOMÁTICO
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1">
                <span>{onlineCount} ONLINE</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.isAdmin && (
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="p-2 bg-amber-500/10 border border-amber-500/50 rounded-xl text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1 text-xs font-bold shadow-lg shadow-amber-500/10"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
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
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Carteira</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-md p-4 flex flex-col items-center gap-3 my-auto z-10">
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between text-xs backdrop-blur-md">
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

        <div className="relative w-full aspect-square bg-slate-950/90 rounded-3xl border-2 border-amber-500/40 p-3.5 flex flex-col justify-between shadow-2xl shadow-amber-500/10 overflow-hidden backdrop-blur-md">
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

          <div className="grid grid-cols-3 gap-2.5 w-full h-full z-10">
            {grid.map((char, i) => (
              <div 
                key={i}
                className={`bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-inner transition-transform ${
                  spinning ? 'scale-95 opacity-80 blur-[1px]' : 'scale-100 opacity-100'
                }`}
              >
                {char}
              </div>
            ))}
          </div>

          {lastWin > 0 && (
            <div className="absolute inset-x-4 bottom-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black py-2.5 rounded-2xl text-center text-sm shadow-2xl shadow-amber-500/50 animate-bounce z-30 tracking-wider">
              GANHOU R$ {lastWin.toLocaleString('pt-BR')}! 🎉
            </div>
          )}
        </div>

        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span className="tracking-wider">VALOR DA APOSTA</span>
            <span className="text-amber-400 font-mono text-sm">
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
                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-amber-500/40'
                }`}
              >
                {lvl >= 1000000 ? `${lvl / 1000000}M` : `${lvl / 1000}k`}
              </button>
            ))}
          </div>

          <button
            onClick={spin}
            disabled={spinning}
            className={`w-full py-3.5 rounded-2xl font-black text-base tracking-wider transition-all shadow-2xl ${
              spinning 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-98 shadow-amber-500/30'
            }`}
          >
            {spinning ? 'GIRANDO...' : 'GIRAR AGORA'}
          </button>
        </div>
      </main>
            {showBonus && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-2xl shadow-amber-500/20">
            <h2 className="text-lg font-black text-amber-400 tracking-wider">
              BÔNUS FORTUNA DIPLOMÁTICA 💎
            </h2>
            <p className="text-xs text-slate-400">
              Gira a roleta de multiplicadores para aumentar os teus ganhos!
            </p>

            <div className="w-28 h-28 rounded-full border-4 border-amber-500 flex items-center justify-center bg-slate-950 text-3xl font-black text-amber-300 shadow-xl shadow-amber-500/20">
              {bonusMult > 0 ? `${bonusMult}x` : '?'}
            </div>

            <button
              onClick={spinBonusWheel}
              disabled={spinningBonus || bonusMult > 0}
              className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl hover:brightness-110 disabled:opacity-50 text-sm"
            >
              {spinningBonus ? 'SORTEANDO...' : bonusMult > 0 ? 'PRÊMIO CREDITADO!' : 'SORTEAR MULTIPLICADOR'}
            </button>

            {bonusMult > 0 && (
              <button 
                onClick={() => setShowBonus(false)}
                className="text-xs text-slate-400 underline mt-1"
              >
                Voltar ao Jogo
              </button>
            )}
          </div>
        </div>
      )}

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
                placeholder="Ex: SeuNome"
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
                Entrar / Criar
              </button>
            </div>
          </form>
        </div>
      )}

      {showAdminPanel && user.isAdmin && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-slate-900 border border-amber-500/40 rounded-3xl p-5 flex flex-col gap-5 my-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-black text-amber-400">
                  PAINEL MASTER (@LVelasques)
                </h2>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white text-sm font-bold">
                ✕ Fechar
              </button>
            </div>

            <div className="flex gap-2 border-b border-slate-800 pb-3">
              <button 
                onClick={() => setAdminTab('transactions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'transactions' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Fila de Transações
              </button>
              <button 
                onClick={() => setAdminTab('users')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'users' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Utilizadores & Senhas
              </button>
              <button 
                onClick={() => setAdminTab('reports')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'reports' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Relatório Financeiro
              </button>
            </div>

            {adminTab === 'transactions' && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  SOLICITAÇÕES PENDENTES
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
                    UTILIZADORES REGISTADOS ({Object.keys(usersDB).length})
                  </h3>
                  <button 
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs hover:brightness-110 flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Criar Jogador</span>
                  </button>
                </div>

                {showAddUserForm && (
                  <form onSubmit={handleAdminCreateUser} className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 flex flex-col gap-3">
                    <h4 className="text-xs font-black text-amber-400">CRIAR CONTA DE JOGADOR</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Nick / Usuário</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: João"
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
                        <label className="text-[10px] text-slate-400">Saldo Inicial (R$)</label>
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
                        Salvar e Depositar
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {Object.values(usersDB).map(u => (
                    <div key={u.username} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-amber-300">@{u.username}</strong>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Saldo: R$ {u.balance.toLocaleString('pt-BR')} | Senha: <span className="text-slate-200">{u.password}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUserToEdit(u);
                          setNewPasswordInput(u.password);
                          setNewBalanceInput(u.balance);
                        }}
                        className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl font-bold text-xs hover:bg-amber-500/30"
                      >
                        Editar
                      </button>
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
                        <label className="text-[10px] text-slate-400">Alterar Saldo (R$)</label>
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

          </div>
        </div>
      )}

      <footer className="w-full text-center py-3 text-[10px] text-slate-600 border-t border-slate-900/80 backdrop-blur-md">
        Cassino Diplomático © 2026 - Todos os direitos reservados.
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
