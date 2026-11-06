 import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Shield, Coins, Sparkles, TrendingUp, 
  UserCheck, RefreshCw, AlertCircle, ArrowUpRight, 
  Lock, CheckCircle2, DollarSign, Settings, LogOut, User
} from 'lucide-react';

const SYMBOLS = [
  { id: 'couro', char: '🫎', name: 'Couro', mult: 1, weight: 80 },
  { id: 'trm', char: '⚗️', name: 'TRM', mult: 2, weight: 70 },
  { id: 'petroleo', char: '🛢️', name: 'Petróleo', mult: 3, weight: 60 },
  { id: 'ouro', char: '🪙', name: 'Ouro', mult: 4, weight: 40 },
  { id: 'brasil', char: '🇧🇷', name: 'Brasil', mult: 5, weight: 30 },
  { id: 'costarica', char: '🇨🇷', name: 'Costa Rica', mult: 6, weight: 25 },
  { id: 'mundo', char: '🌎', name: 'Mundo', mult: 8, weight: 20 },
  { id: 'diamante', char: '💎', name: 'Diamante', mult: 10, weight: 20, isWild: true, isBonus: true }
];

const BET_LEVELS = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

const PAYLINES = [
  { id: 0, name: 'Linha Superior', coords: [0, 1, 2], color: '#eab308' },
  { id: 1, name: 'Linha Central', coords: [3, 4, 5], color: '#3b82f6' },
  { id: 2, name: 'Linha Inferior', coords: [6, 7, 8], color: '#22c55e' },
  { id: 3, name: 'Diagonal Principal', coords: [0, 4, 8], color: '#ec4899' },
  { id: 4, name: 'Diagonal Invertida', coords: [2, 4, 6], color: '#a855f7' }
];

const MULTIPLIER_WHEEL = [
  { mult: 2, weight: 85 },
  { mult: 3, weight: 85 },
  { mult: 4, weight: 60 },
  { mult: 5, weight: 60 },
  { mult: 6, weight: 60 },
  { mult: 7, weight: 40 },
  { mult: 8, weight: 40 },
  { mult: 9, weight: 20 },
  { mult: 10, weight: 20 }
];

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cd_user');
    return saved ? JSON.parse(saved) : { username: 'LVelasques', balance: 2500000, isAdmin: true };
  });

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [betIndex, setBetIndex] = useState(0);
  const currentBet = BET_LEVELS[betIndex];

  const [grid, setGrid] = useState(['🪙','🇧🇷','🌎','🫎','💎','⚗️','🇨🇷','🛢️','🪙']);
  const [spinning, setSpinning] = useState(false);
  const [activePaylines, setActivePaylines] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [bonusMult, setBonusMult] = useState(0);
  const [spinningBonus, setSpinningBonus] = useState(false);

  const [deposits, setDeposits] = useState(() => {
    const saved = localStorage.getItem('cd_deposits');
    return saved ? JSON.parse(saved) : [];
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [houseStats, setHouseStats] = useState(() => {
    const saved = localStorage.getItem('cd_house_stats');
    return saved ? JSON.parse(saved) : { totalBets: 15000000, totalPayouts: 8200000 };
  });

  useEffect(() => {
    localStorage.setItem('cd_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cd_deposits', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('cd_house_stats', JSON.stringify(houseStats));
  }, [houseStats]);

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanNick = loginUsername.trim().replace('@', '');
    const isAdmin = cleanNick.toLowerCase() === 'lvelasques';
    
    const newUser = {
      username: cleanNick || 'Jogador',
      balance: isAdmin ? 5000000 : 100000,
      isAdmin
    };
    
    setUser(newUser);
    setShowAuthModal(false);
  };

  const getRtpTarget = (bet) => {
    if (bet <= 60000) return 0.85;
    if (bet <= 500000) return 0.65;
    return 0.35;
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
      alert('Saldo insuficiente para esta aposta!');
      setShowDepositModal(true);
      return;
    }

    setUser(prev => ({ ...prev, balance: prev.balance - currentBet }));
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
      const winningSymbol = SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))];
      const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];

      finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
      targetLine.coords.forEach(idx => {
        finalGrid[idx] = winningSymbol.char;
      });

      if (Math.random() < 0.20) {
        const bonusLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
        bonusLine.coords.forEach(idx => {
          finalGrid[idx] = '💎';
        });
        hasBonus = true;
      }
    } else {
      finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
    }

    PAYLINES.forEach(line => {
      const [a, b, c] = line.coords;
      const symA = SYMBOLS.find(s => s.char === finalGrid[a]);
      const symB = SYMBOLS.find(s => s.char === finalGrid[b]);
      const symC = SYMBOLS.find(s => s.char === finalGrid[c]);

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
      if (currentInterval >= 15) {
        clearInterval(spinTimer);
        setGrid(finalGrid);
        setSpinning(false);

        if (winLines.length > 0) {
          const totalWin = currentBet * totalMultiplier;
          setActivePaylines(winLines);
          setLastWin(totalWin);
          setUser(prev => ({ ...prev, balance: prev.balance + totalWin }));
          setHouseStats(prev => ({ ...prev, totalPayouts: prev.totalPayouts + totalWin }));
        }

        if (hasBonus) {
          setTimeout(() => triggerBonus(), 600);
        }
      }
    }, 80);
  };

  const triggerBonus = () => {
    setShowBonus(true);
    setBonusMult(0);
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
      setUser(prev => ({ ...prev, balance: prev.balance + bonusPrize }));
      setHouseStats(prev => ({ ...prev, totalPayouts: prev.totalPayouts + bonusPrize }));
    }, 2000);
  };

  const handleRequestDeposit = (e) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (!val || val <= 0) return;

    const newDep = {
      id: Date.now(),
      username: user.username,
      amount: val,
      status: 'pending',
      date: new Date().toLocaleTimeString()
    };

    setDeposits([newDep, ...deposits]);
    setDepositAmount('');
    alert('Pedido de depósito enviado! Aguarde aprovação do Admin.');
    setShowDepositModal(false);
  };

  const handleApproveDeposit = (dep) => {
    setDeposits(deposits.map(d => d.id === dep.id ? { ...d, status: 'approved' } : d));
    if (dep.username === user.username) {
      setUser(prev => ({ ...prev, balance: prev.balance + dep.amount }));
    }
  };

  return (
    <div className="min-h-screen bg-[#040817] text-slate-100 flex flex-col items-center justify-between font-sans">
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-lg bg-slate-900/90 border-b border-amber-500/30 p-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              CASSINO DIPLOMÁTICO
            </h1>
            <p className="text-[10px] text-amber-400/70 font-semibold tracking-widest uppercase">
              REDE DIPLOMÁTICA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.isAdmin && (
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="p-2 bg-amber-500/10 border border-amber-500/40 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1 text-xs font-bold"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300">
              R$ {user.balance.toLocaleString('pt-BR')}
            </span>
          </div>

          <button 
            onClick={() => setShowDepositModal(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black hover:brightness-110 transition-all shadow-md shadow-amber-500/20"
          >
            + Depósito
          </button>
        </div>
      </header>

      {/* Main Game Interface */}
      <main className="w-full max-w-lg p-4 flex flex-col items-center gap-4 my-auto">
        
        {/* User Greeting & Status Bar */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Jogador: <strong className="text-amber-300">@{user.username}</strong></span>
          </div>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="text-slate-400 hover:text-amber-400 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Trocar</span>
          </button>
        </div>

        {/* Slot Machine Display */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl border-2 border-amber-500/40 p-4 flex flex-col justify-between shadow-2xl shadow-amber-500/10 overflow-hidden">
          
          {/* Overlay Line Glows */}
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

          {/* 3x3 Matrix Grid */}
          <div className="grid grid-cols-3 gap-3 w-full h-full z-10">
            {grid.map((char, i) => (
              <div 
                key={i}
                className={`bg-slate-900/80 border border-amber-500/20 rounded-xl flex items-center justify-center text-4xl sm:text-5xl shadow-inner transition-transform ${
                  spinning ? 'scale-95 opacity-80 blur-[1px]' : 'scale-100 opacity-100'
                }`}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Win Announcement Banner */}
          {lastWin > 0 && (
            <div className="absolute inset-x-4 bottom-4 bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-center text-sm shadow-xl animate-bounce z-30">
              GANHOU R$ {lastWin.toLocaleString('pt-BR')}! 🎉
            </div>
          )}
        </div>

        {/* Bet Scaling Control Bar */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>VALOR DA APOSTA</span>
            <span className="text-amber-400 font-mono">
              R$ {currentBet.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BET_LEVELS.map((lvl, idx) => (
              <button
                key={lvl}
                onClick={() => setBetIndex(idx)}
                className={`py-2 rounded-lg text-xs font-black transition-all border ${
                  betIndex === idx
                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                {lvl >= 1000000 ? `${lvl / 1000000}M` : `${lvl / 1000}k`}
              </button>
            ))}
          </div>

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={spinning}
            className={`w-full py-4 rounded-xl font-black text-lg tracking-wider transition-all shadow-xl ${
              spinning 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-98 shadow-amber-500/25'
            }`}
          >
            {spinning ? 'GIRANDO...' : 'GIRAR AGORA'}
          </button>
        </div>

      </main>

      {/* Bonus Modal */}
      {showBonus && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 text-center flex flex-col items-center gap-4">
            <h2 className="text-xl font-black text-amber-400 tracking-wider">
              BÔNUS FORTUNA DIPLOMÁTICA 💎
            </h2>
            <p className="text-xs text-slate-400">
              Gira a roleta de multiplicadores para aumentar os teus ganhos da rodada!
            </p>

            <div className="w-32 h-32 rounded-full border-4 border-amber-500 flex items-center justify-center bg-slate-950 text-3xl font-black text-amber-300 shadow-xl shadow-amber-500/20">
              {bonusMult > 0 ? `${bonusMult}x` : '?'}
            </div>

            <button
              onClick={spinBonusWheel}
              disabled={spinningBonus || bonusMult > 0}
              className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl hover:brightness-110 disabled:opacity-50"
            >
              {spinningBonus ? 'SORTEANDO...' : bonusMult > 0 ? 'PRÊMIO CREDITADO!' : 'SORTEAR MULTIPLICADOR'}
            </button>

            {bonusMult > 0 && (
              <button 
                onClick={() => setShowBonus(false)}
                className="text-xs text-slate-400 underline mt-2"
              >
                Voltar ao Jogo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-black text-amber-400">ENTRAR / REGISTAR</h3>
            <div>
              <label className="text-xs text-slate-400">Utilizador / Nick</label>
              <input 
                type="text"
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Ex: LVelasques"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm mt-1 focus:border-amber-500 outline-none"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm mt-1 focus:border-amber-500 outline-none"
              />
            </div>
            
            <button 
              type="button"
              onClick={() => {
                setLoginUsername('LVelasques');
                setLoginPassword('Lucas123!');
              }}
              className="text-xs text-amber-400 underline text-left"
            >
              Auto-preencher Admin (@LVelasques)
            </button>

            <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-black rounded-lg hover:brightness-110">
              Aceder à Conta
            </button>
          </form>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRequestDeposit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-black text-amber-400">SOLICITAR DEPÓSITO</h3>
            <div>
              <label className="text-xs text-slate-400">Valor em R$</label>
              <input 
                type="number"
                required
                min="1000"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="Ex: 500000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm mt-1 focus:border-amber-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setShowDepositModal(false)}
  
