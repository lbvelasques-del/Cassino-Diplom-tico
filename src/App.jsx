import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Shield, Coins, Sparkles, User, Settings, LogOut, 
  ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, XCircle, Clock
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
  { id: 0, name: 'Linha Superior', coords: [0, 1, 2], color: '#eab308' },
  { id: 1, name: 'Linha Central', coords: [3, 4, 5], color: '#3b82f6' },
  { id: 2, name: 'Linha Inferior', coords: [6, 7, 8], color: '#22c55e' },
  { id: 3, name: 'Diagonal Principal', coords: [0, 4, 8], color: '#ec4899' },
  { id: 4, name: 'Diagonal Invertida', coords: [2, 4, 6], color: '#a855f7' }
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
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cd_user');
    return saved ? JSON.parse(saved) : { username: 'Visitante', balance: 0, isAdmin: false };
  });

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
  const [houseStats, setHouseStats] = useState(() => {
    const saved = localStorage.getItem('cd_house_stats');
    return saved ? JSON.parse(saved) : { totalBets: 50000000, totalPayouts: 22000000 };
  });

  useEffect(() => { localStorage.setItem('cd_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('cd_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('cd_house_stats', JSON.stringify(houseStats)); }, [houseStats]);

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanNick = loginUsername.trim().replace('@', '');
    const isAdmin = cleanNick.toLowerCase() === 'lvelasques' && loginPassword === 'Lucas123!';

    setUser({
      username: cleanNick || 'Jogador',
      balance: isAdmin ? 10000000 : (user.username === cleanNick ? user.balance : 0),
      isAdmin
    });
    setLoginUsername('');
    setLoginPassword('');
    setShowAuthModal(false);
  };

  const getRtpTarget = (bet) => {
    if (bet <= 60000) return 0.55;
    if (bet <= 500000) return 0.40;
    return 0.25;
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
      alert('Saldo insuficiente! Faça um depósito para continuar jogando.');
      setWalletTab('deposit');
      setShowWalletModal(true);
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
      const lowTierSymbols = SYMBOLS.filter(s => s.mult <= 4);
      const winningSymbol = lowTierSymbols[Math.floor(Math.random() * lowTierSymbols.length)];
      const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];

      finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
      targetLine.coords.forEach(idx => {
        finalGrid[idx] = winningSymbol.char;
      });

      if (Math.random() < 0.05) {
        const bonusLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
        bonusLine.coords.forEach(idx => { finalGrid[idx] = '💎'; });
        hasBonus = true;
      }
    } else {
      finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
      if (Math.random() < 0.60) {
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
          setActivePaylines(winLines);
          setLastWin(totalWin);
          setUser(prev => ({ ...prev, balance: prev.balance + totalWin }));
          setHouseStats(prev => ({ ...prev, totalPayouts: prev.totalPayouts + totalWin }));
        }

        if (hasBonus) {
          setTimeout(() => {
            setShowBonus(true);
            setBonusMult(0);
          }, 500);
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
      setUser(prev => ({ ...prev, balance: prev.balance + bonusPrize }));
      setHouseStats(prev => ({ ...prev, totalPayouts: prev.totalPayouts + bonusPrize }));
    }, 1800);
  };

  const handleTransactionRequest = (e) => {
    e.preventDefault();
    const val = parseFloat(transactionAmount);
    if (!val || val <= 0) return;

    if (walletTab === 'withdraw') {
      if (user.balance < val) {
        alert('Saldo insuficiente para realizar este saque!');
        return;
      }
      setUser(prev => ({ ...prev, balance: prev.balance - val }));
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
      ? 'Pedido de depósito enviado! Aguarde aprovação do Admin.' 
      : 'Pedido de saque registrado! O valor foi retido da conta enquanto o Admin faz o envio no Diplomacia.'
    );
  };

  const handleApproveTransaction = (tx) => {
    setTransactions(transactions.map(t => t.id === tx.id ? { ...t, status: 'approved' } : t));
    if (tx.type === 'deposit') {
      if (tx.username === user.username) {
        setUser(prev => ({ ...prev, balance: prev.balance + tx.amount }));
      }
    }
  };

  const handleRejectTransaction = (tx) => {
    setTransactions(transactions.map(t => t.id === tx.id ? { ...t, status: 'rejected' } : t));
    if (tx.type === 'withdraw') {
      if (tx.username === user.username) {
        setUser(prev => ({ ...prev, balance: prev.balance + tx.amount }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#040817] text-slate-100 flex flex-col items-center justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      <header className="w-full max-w-lg bg-slate-900/90 border-b border-amber-500/30 p-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              CASSINO DIPLOMÁTICO
            </h1>
            <p className="text-[9px] text-amber-400/70 font-semibold tracking-widest uppercase">
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
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <div className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black text-amber-300">
              R$ {user.balance.toLocaleString('pt-BR')}
            </span>
          </div>

          <button 
            onClick={() => setShowWalletModal(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black hover:brightness-110 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Carteira</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-lg p-4 flex flex-col items-center gap-3 my-auto">
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Jogador: <strong className="text-amber-300">@{user.username}</strong></span>
          </div>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="text-slate-400 hover:text-amber-400 flex items-center gap-1 text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{user.username === 'Visitante' ? 'Entrar' : 'Trocar Conta'}</span>
          </button>
        </div>

        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl border-2 border-amber-500/40 p-3.5 flex flex-col justify-between shadow-2xl shadow-amber-500/10 overflow-hidden">
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
                className={`bg-slate-900/90 border border-amber-500/20 rounded-xl flex items-center justify-center text-4xl sm:text-5xl shadow-inner transition-transform ${
                  spinning ? 'scale-95 opacity-80 blur-[1px]' : 'scale-100 opacity-100'
                }`}
              >
                {char}
              </div>
            ))}
          </div>

          {lastWin > 0 && (
            <div className="absolute inset-x-4 bottom-4 bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-center text-sm shadow-xl animate-bounce z-30">
              GANHOU R$ {lastWin.toLocaleString('pt-BR')}! 🎉
            </div>
          )}
        </div>

        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>VALOR DA APOSTA</span>
            <span className="text-amber-400 font-mono">
              R$ {currentBet.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
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

          <button
            onClick={spin}
            disabled={spinning}
            className={`w-full py-3.5 rounded-xl font-black text-base tracking-wider transition-all shadow-xl ${
              spinning 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-98 shadow-amber-500/25'
            }`}
          >
            {spinning ? 'GIRANDO...' : 'GIRAR AGORA'}
          </button>
        </div>
      </main>
              {showBonus && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 text-center flex flex-col items-center gap-4">
            <h2 className="text-lg font-black text-amber-400 tracking-wider">
              BÔNUS FORTUNA DIPLOMÁTICA 💎
            </h2>
            <p className="text-xs text-slate-400">
              Gire a roleta de multiplicadores para aumentar seus ganhos!
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
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              <button 
                onClick={() => setWalletTab('deposit')}
                className={`w-1/2 py-2 text-xs font-black rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  walletTab === 'deposit' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>DEPÓSITO</span>
              </button>
              <button 
                onClick={() => setWalletTab('withdraw')}
                className={`w-1/2 py-2 text-xs font-black rounded-md flex items-center justify-center gap-1.5 transition-all ${
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm mt-1 focus:border-amber-500 outline-none"
                />
                {walletTab === 'withdraw' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Saldo disponível para saque: <strong className="text-amber-400">R$ {user.balance.toLocaleString('pt-BR')}</strong>
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">
                  Confirmar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-black text-amber-400">ACESSO DA CONTA</h3>
            <div>
              <label className="text-xs text-slate-400">Utilizador / Nick</label>
              <input 
                type="text"
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Ex: SeuNome"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm mt-1 focus:border-amber-500 outline-none"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm mt-1 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs"
              >
                Fechar
              </button>
              <button type="submit" className="w-2/3 py-2.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">
                Entrar / Criar
              </button>
            </div>
          </form>
        </div>
      )}

      {showAdminPanel && user.isAdmin && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-slate-900 border border-amber-500/40 rounded-2xl p-6 flex flex-col gap-6 my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-black text-amber-400 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                PAINEL MASTER DE GESTÃO (@LVelasques)
              </h2>
              <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white text-sm">
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400">ENTRADAS (APOSTAS)</p>
                <p className="text-sm font-black text-slate-200">R$ {houseStats.totalBets.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400">SAÍDAS (PRÊMIOS)</p>
                <p className="text-sm font-black text-amber-400">R$ {houseStats.totalPayouts.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30">
                <p className="text-[10px] text-amber-400">LUCRO LÍQUIDO CASA</p>
                <p className="text-sm font-black text-emerald-400">
                  R$ {(houseStats.totalBets - houseStats.totalPayouts).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-300 mb-3 uppercase tracking-wider">
                FILA DE SOLICITAÇÕES (DEPÓSITOS E SAQUES)
              </h3>
              <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Nenhuma transação pendente.</p>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        {tx.type === 'deposit' ? (
                          <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                            <ArrowDownRight className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-200">@{tx.username}</strong>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
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

                      <div className="flex items-center gap-2">
                        {tx.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveTransaction(tx)}
                              className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-lg font-black text-xs hover:brightness-110 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprovar</span>
                            </button>
                            <button
                              onClick={() => handleRejectTransaction(tx)}
                              className="bg-rose-500/20 border border-rose-500/40 text-rose-400 px-2.5 py-1.5 rounded-lg font-bold text-xs hover:bg-rose-500/30 flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rejeitar</span>
                            </button>
                          </>
                        ) : (
                          <span className={`font-bold text-xs px-2 py-1 rounded ${
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
          </div>
        </div>
      )}

      <footer className="w-full text-center py-3 text-[10px] text-slate-600 border-t border-slate-900">
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
