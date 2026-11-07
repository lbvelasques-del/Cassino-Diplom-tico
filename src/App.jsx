import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './supabaseClient';
import { 
  Shield, Coins, Sparkles, User, LogOut, 
  Wallet, CheckCircle2, XCircle, 
  RefreshCw, Zap, UserPlus, Trash2, Flame, UserCheck, PlusCircle, MinusCircle, History
} from 'lucide-react';

const CUSTOM_CSS = `
  @keyframes symbol-spin {
    0% { transform: translateY(-80%); opacity: 0; filter: blur(4px); }
    50% { transform: translateY(0); opacity: 1; filter: blur(0px); }
    100% { transform: translateY(80%); opacity: 0; filter: blur(4px); }
  }
  .animate-symbol {
    animation: symbol-spin 0.15s linear infinite;
  }
  .wheel-spin {
    transition: transform 3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
`;

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
  { id: 0, name: 'Linha Superior', coords: [0, 1, 2], style: 'top-12' },
  { id: 1, name: 'Linha Central', coords: [3, 4, 5], style: 'top-1/2 -translate-y-1/2' },
  { id: 2, name: 'Linha Inferior', coords: [6, 7, 8], style: 'bottom-12' },
  { id: 3, name: 'Diagonal Principal', coords: [0, 4, 8], style: 'rotate-45 scale-125' },
  { id: 4, name: 'Diagonal Invertida', coords: [2, 4, 6], style: '-rotate-45 scale-125' }
];

const MULTIPLIER_WHEEL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
  const [bonusCooldown, setBonusCooldown] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState('transactions');
  const [adminActionAmount, setAdminActionAmount] = useState('');
  const [showStatementModal, setShowStatementModal] = useState(false);

  const [createNickInput, setCreateNickInput] = useState('');
  const [createPassInput, setCreatePassInput] = useState('');
  const [createBalanceInput, setCreateBalanceInput] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
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
        if (user.username !== 'Visitante' && dbMap[user.username]) setUser(dbMap[user.username]);
      }

      const { data: txData, error: txError } = await supabase.from('transactions').select('*').order('id', { ascending: false });
      if (!txError && txData) {
        setTransactions(txData.map(t => ({
          id: t.id, username: t.username, type: t.type, amount: t.amount, status: t.status, date: t.date
        })));
      }
    } catch (err) {
      console.error('Erro de sincronização:', err);
    }
  };

  useEffect(() => {
    fetchCloudData();
    const interval = setInterval(fetchCloudData, 2000);
    return () => clearInterval(interval);
  }, [user.username]);

  const hasPendingTransactions = transactions.some(t => t.status === 'pending');
    const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const cleanNick = loginUsername.trim().replace('@', '');
    if (!cleanNick || !loginPassword) return;
    const isAdmin = cleanNick.toLowerCase() === 'lvelasques' && loginPassword === 'Lucas123!';

    if (authMode === 'register') {
      if (usersDB[cleanNick]) { alert('Este nome já existe!'); return; }
      const newUserObj = { username: cleanNick, password: loginPassword, balance: 0, is_admin: false, total_deposited: 0, total_won: 0 };
      const { error } = await supabase.from('users').insert([newUserObj]);
      if (error) { alert(`Erro no registo: ${error.message}`); return; }
      setUser({ ...newUserObj, isAdmin: false, totalDeposited: 0, totalWon: 0 });
      alert(`Conta criada com sucesso!`);
    } else {
      let currentUserData = usersDB[cleanNick];
      if (!currentUserData) {
        if (isAdmin) {
          currentUserData = { username: cleanNick, password: loginPassword, balance: 10000000, isAdmin: true, totalDeposited: 10000000, totalWon: 0 };
          await supabase.from('users').upsert([{ username: cleanNick, password: loginPassword, balance: 10000000, is_admin: true, total_deposited: 10000000, total_won: 0 }]);
        } else { alert('Utilizador não encontrado!'); return; }
      } else if (currentUserData.password !== loginPassword && !isAdmin) { alert('Senha incorreta!'); return; }
      setUser(currentUserData);
    }
    setLoginUsername(''); setLoginPassword(''); setShowAuthModal(false); fetchCloudData();
  };

  const handleAdminDirectDeposit = async (targetUsername) => {
    const val = parseFloat(adminActionAmount);
    if (!val || val <= 0) return alert('Insira um valor válido.');
    const currentUsr = usersDB[targetUsername];
    if (!currentUsr) return;
    await supabase.from('users').update({ balance: currentUsr.balance + val, total_deposited: currentUsr.totalDeposited + val }).eq('username', targetUsername);
    alert(`Depósito de ${formatCurrency(val)} efetuado para @${targetUsername}!`);
    setAdminActionAmount(''); fetchCloudData();
  };

  const handleAdminDirectWithdraw = async (targetUsername) => {
    const val = parseFloat(adminActionAmount);
    if (!val || val <= 0) return alert('Insira um valor válido.');
    const currentUsr = usersDB[targetUsername];
    if (!currentUsr || currentUsr.balance < val) return alert('Saldo insuficiente no utilizador.');
    await supabase.from('users').update({ balance: currentUsr.balance - val }).eq('username', targetUsername);
    alert(`Retirada de ${formatCurrency(val)} efetuada de @${targetUsername}!`);
    setAdminActionAmount(''); fetchCloudData();
  };
    const getDynamicRtp = (currentUser) => {
    if (bonusCooldown > 0) return 0.00; // Bloqueia vitórias durante 12 rodadas após bónus
    if ((currentUser.totalWon || 0) > 10000000) return 0.30; // 30% User / 70% Casa se já ganhou acima de 10m
    if ((currentUser.totalDeposited || 0) >= 10000000) return 0.50; // 50% User / 50% Casa se gastou acima de 10m
    return 0.30; // RTP Padrão: 30% User / 70% Casa
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

  const executeSpin = async () => {
    if (user.balance < currentBet) {
      alert('Saldo insuficiente! Faça um depósito para continuar a jogar.');
      setWalletTab('deposit'); setShowWalletModal(true); return;
    }

    const updatedBalance = user.balance - currentBet;
    const updatedUserObj = { ...user, balance: updatedBalance };
    setUser(updatedUserObj);
    await supabase.from('users').update({ balance: updatedBalance }).eq('username', user.username);

    setSpinning(true); setActivePaylines([]); setLastWin(0);

    if (bonusCooldown > 0) setBonusCooldown(prev => prev - 1);

    const rtpTarget = getDynamicRtp(user);
    const forceWin = Math.random() < rtpTarget;

    let finalGrid = [];
    let winLines = [];
    let totalMultiplier = 0;
    let hasBonus = false;

    if (forceWin) {
      const allowedSymbols = SYMBOLS.filter(s => !s.isBonus && s.mult <= 2.5);
      const winningSymbol = allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)];
      const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];

      finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
      targetLine.coords.forEach(idx => { finalGrid[idx] = winningSymbol.char; });

      if (Math.random() < 0.03) {
        const bonusLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
        bonusLine.coords.forEach(idx => { finalGrid[idx] = '💎'; });
        hasBonus = true;
      }
    } else {
      finalGrid = Array(9).fill(null).map(() => getRandomSymbol());
    }

    PAYLINES.forEach(line => {
      const [a, b, c] = line.coords;
      const isBonusMatch = finalGrid[a] === '💎' && finalGrid[b] === '💎' && finalGrid[c] === '💎';
      if (isBonusMatch) { hasBonus = true; winLines.push(line); return; }

      const matchChar = [finalGrid[a], finalGrid[b], finalGrid[c]].find(char => char !== '💎');
      if (!matchChar) return;

      const baseSym = SYMBOLS.find(s => s.char === matchChar);
      const isLineWin = [finalGrid[a], finalGrid[b], finalGrid[c]].every(char => char === matchChar);

      if (isLineWin && baseSym) { winLines.push(line); totalMultiplier += baseSym.mult; }
    });
        const spinDuration = isTurbo ? 45 : 100;
    const maxSteps = isTurbo ? 6 : 14;
    let currentInterval = 0;

    const spinTimer = setInterval(async () => {
      setGrid(Array(9).fill(null).map(() => getRandomSymbol()));
      currentInterval++;
      if (currentInterval >= maxSteps) {
        clearInterval(spinTimer);
        setGrid(finalGrid);
        setSpinning(false);

        if (winLines.length > 0 && totalMultiplier > 0) {
          const totalWin = currentBet * totalMultiplier;
          const winBalance = updatedBalance + totalWin;
          const wonAdded = (user.totalWon || 0) + totalWin;
          setUser({ ...updatedUserObj, balance: winBalance, totalWon: wonAdded });
          setActivePaylines(winLines);
          setLastWin(totalWin);
          await supabase.from('users').update({ balance: winBalance, total_won: wonAdded }).eq('username', user.username);
        }

        if (hasBonus) {
          setBonusCooldown(12); // Aplica 12 rodadas sem ganhar após bónus
          setTimeout(() => { setShowBonus(true); setBonusMult(0); setWheelRotation(0); }, 400);
        }
      }
    }, spinDuration);
  };

  const spinBonusWheel = () => {
    if (spinningBonus) return;
    setSpinningBonus(true);
    
    const winningIndex = Math.floor(Math.random() * MULTIPLIER_WHEEL.length);
    const resultMult = MULTIPLIER_WHEEL[winningIndex];
    
    // Calcula rotação: dá 5 voltas completas (1800deg) + ângulo do resultado
    const segmentAngle = 360 / MULTIPLIER_WHEEL.length;
    const finalRotation = 1800 + (winningIndex * segmentAngle);
    setWheelRotation(finalRotation);

    setTimeout(async () => {
      setBonusMult(resultMult);
      setSpinningBonus(false);
      const bonusPrize = currentBet * resultMult;
      const newBal = user.balance + bonusPrize;
      const wonAdded = (user.totalWon || 0) + bonusPrize;
      setUser({ ...user, balance: newBal, totalWon: wonAdded });
      await supabase.from('users').update({ balance: newBal, total_won: wonAdded }).eq('username', user.username);
    }, 3000);
  };

  const handleTransactionRequest = async (e) => {
    e.preventDefault();
    const val = parseFloat(transactionAmount);
    if (!val || val <= 0) return;

    if (walletTab === 'withdraw' && user.balance < val) return alert('Saldo insuficiente para saque!');

    const { error } = await supabase.from('transactions').insert([{
      username: user.username, type: walletTab, amount: val, status: 'pending', date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);

    if (error) {
      alert(`⚠️ ERRO DO SERVIDOR: ${error.message}\n\nSOLUÇÃO: No Supabase, vá a 'Table Editor' > 'transactions' e confirme se as colunas estão exatas e se o RLS está Desativado.`);
      return;
    }

    if (walletTab === 'withdraw') {
      setUser({ ...user, balance: user.balance - val });
      await supabase.from('users').update({ balance: user.balance - val }).eq('username', user.username);
    }

    setTransactionAmount(''); setShowWalletModal(false);
    alert('Solicitação enviada com sucesso ao administrador!'); fetchCloudData();
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
    return (
    <div className="min-h-screen bg-black text-amber-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      <style dangerouslySetInnerHTML={{ __html: CUSTOM_CSS }} />
      
      {/* HEADER ELEGANTE PRETO E DOURADO */}
      <header className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-amber-600/40 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-[0_4px_25px_rgba(217,119,6,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-100/50">
            <Coins className="w-7 h-7 text-black font-black" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-2xl tracking-widest bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-black drop-shadow-lg">
              REDE PAMPAS CASSINO
            </h1>
            <p className="text-[10px] sm:text-[11px] text-amber-400/80 font-mono tracking-widest uppercase">
              Ultra Quality Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {user.username !== 'Visitante' ? (
            <div className="flex items-center gap-3 bg-neutral-950 border border-amber-500/40 rounded-2xl px-4 py-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">@{user.username}</p>
                <p className="text-sm font-black tracking-tight text-white">{formatCurrency(user.balance)}</p>
              </div>
              <button onClick={() => { setShowWalletModal(true); setWalletTab('deposit'); }} className="bg-gradient-to-r from-amber-600 to-amber-500 hover:to-amber-400 text-black p-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95"><Wallet className="w-4 h-4" /></button>
              <button onClick={() => setShowStatementModal(true)} className="bg-neutral-800 text-amber-400 hover:text-white p-2.5 rounded-xl transition active:scale-95"><History className="w-4 h-4" /></button>
              <button onClick={() => setUser({ username: 'Visitante', balance: 0, isAdmin: false, totalDeposited: 0, totalWon: 0 })} className="bg-red-950 text-red-500 hover:text-white p-2.5 rounded-xl transition active:scale-95"><LogOut className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-extrabold px-5 py-3 rounded-2xl text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 flex items-center gap-2"><User className="w-4 h-4" /> Entrar / Registar</button>
          )}

          {user.isAdmin && (
            <button onClick={() => setShowAdminPanel(true)} className="relative bg-gradient-to-r from-neutral-900 to-neutral-800 border border-amber-500/50 text-amber-400 font-extrabold px-4 py-3 rounded-2xl shadow-lg active:scale-95 flex items-center gap-2">
              <Shield className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
              {hasPendingTransactions && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] animate-pulse" />}
            </button>
          )}
        </div>
      </header>
            <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col justify-center items-center">
        {/* EXIBIÇÃO DO PRÉMIO ACIMA DO CAÇA-NÍQUEL */}
        {lastWin > 0 && !spinning && (
          <div className="w-full mb-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 text-black font-serif font-black py-4 px-6 rounded-2xl text-center shadow-[0_0_40px_rgba(245,158,11,0.8)] border-2 border-amber-100 uppercase tracking-widest animate-pulse">
            <span className="text-3xl sm:text-4xl drop-shadow-md">🏆 {formatCurrency(lastWin)} 🏆</span>
          </div>
        )}

        <div className="w-full bg-neutral-950/95 border-2 border-amber-600/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(217,119,6,0.15)] relative backdrop-blur-3xl">
          <div className="flex justify-between items-center mb-5 bg-gradient-to-r from-neutral-900 via-amber-900/30 to-neutral-900 px-4 py-3 rounded-2xl border border-amber-600/30 shadow-inner">
            <span className="flex items-center gap-2 font-bold text-amber-300 font-serif tracking-widest uppercase text-xs sm:text-sm"><Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Rede Pampas Desenvolvimento</span>
          </div>

          {/* ESTRUTURA FIXA DA MÁQUINA */}
          <div className="relative bg-neutral-900 border-[6px] border-amber-700/60 rounded-[2rem] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,1)] mb-6">
            <div className="grid grid-cols-3 gap-3">
              {grid.map((symbolChar, idx) => {
                const isWinningSlot = activePaylines.some(line => line.coords.includes(idx));
                return (
                  <div key={idx} className={`h-24 sm:h-28 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-2 rounded-2xl flex items-center justify-center text-6xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] overflow-hidden ${isWinningSlot && !spinning ? 'border-amber-400 shadow-[0_0_30px_#f59e0b] bg-amber-500/10' : 'border-amber-900/20'}`}>
                    {/* APENAS O SÍMBOLO SE MOVE */}
                    <span className={`block transition-all duration-100 ${spinning ? 'animate-symbol text-amber-500/80' : 'drop-shadow-[0_4px_15px_rgba(255,215,0,0.4)]'}`}>
                      {symbolChar}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* LINHAS MARCADORAS VISUAIS MANTIDAS PARA O UTILIZADOR VER ONDE FECHOU */}
            {activePaylines.map(line => (
              <div key={line.id} className={`absolute inset-x-0 border-b-4 border-amber-400 shadow-[0_0_20px_#f59e0b] z-10 pointer-events-none transition-all ${line.style}`} />
            ))}
          </div>

          <div className="space-y-5">
            <div className="bg-neutral-900/90 border border-amber-600/30 rounded-2xl p-4 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-amber-400/80 font-black uppercase tracking-widest">Aposta Rápida</p>
                <span className="text-sm font-mono font-black text-amber-300 drop-shadow-md">{formatCurrency(currentBet)}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BET_LEVELS.map((betVal, idx) => (
                  <button key={idx} disabled={spinning} onClick={() => setBetIndex(idx)} className={`py-3 rounded-xl text-xs font-mono font-black transition active:scale-95 ${betIndex === idx ? 'bg-gradient-to-t from-amber-600 to-yellow-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] border-none' : 'bg-neutral-950 text-amber-500/60 border border-amber-900/40 hover:border-amber-500/80'}`}>
                    {betVal >= 1000000 ? `${betVal / 1000000}M` : `${betVal / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsTurbo(!isTurbo)} className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-2 transition active:scale-95 ${isTurbo ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-neutral-900 border-amber-900/40 text-amber-500/50'}`}>
                <Zap className="w-5 h-5" /> TURBO
              </button>
              <button disabled={spinning} onClick={executeSpin} className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-serif font-black py-4 rounded-2xl text-xl shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-widest border border-amber-200">
                {spinning ? <RefreshCw className="w-6 h-6 animate-spin text-black" /> : <Flame className="w-6 h-6 text-red-700" />} {spinning ? '...' : 'GIRAR'}
              </button>
            </div>
          </div>
        </div>
      </main>
            {/* RODA DE BÓNUS EM FORMATO RELÓGIO */}
      {showBonus && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm flex flex-col items-center relative">
            <h2 className="text-3xl font-serif font-black text-amber-400 mb-8 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] uppercase tracking-widest">Roleta Bónus</h2>
            
            <div className="relative w-72 h-72 rounded-full border-[12px] border-neutral-900 bg-neutral-950 shadow-[0_0_60px_rgba(245,158,11,0.4)] flex items-center justify-center mb-8">
              {/* Seta Indicadora Fixa no Topo */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-600 z-30 drop-shadow-lg" />
              
              {/* Interior da Roda Rotativa */}
              <div className="w-full h-full rounded-full relative wheel-spin" style={{ transform: `rotate(-${wheelRotation}deg)` }}>
                {MULTIPLIER_WHEEL.map((mult, i) => {
                  const angle = i * (360 / MULTIPLIER_WHEEL.length);
                  return (
                    <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${angle}deg)` }}>
                      <div className="mx-auto w-[2px] h-1/2 bg-amber-600/30 origin-bottom" />
                      <span className="absolute top-3 left-1/2 -translate-x-1/2 font-mono font-black text-amber-400 text-lg drop-shadow-md bg-neutral-950 px-2 rounded-lg border border-amber-600/50">
                        {mult}x
                      </span>
                    </div>
                  );
                })}
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 pointer-events-none" />
              </div>
              
              {/* Eixo Central */}
              <div className="absolute w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full z-20 border-4 border-neutral-900 shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full" />
              </div>
            </div>

            <div className="w-full bg-neutral-900/80 border border-amber-600/40 p-4 rounded-2xl mb-6 text-center shadow-inner">
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">Multiplicador Atual</p>
              <p className="text-4xl font-mono font-black text-white">{bonusMult > 0 ? `${bonusMult}x` : '---'}</p>
            </div>

            <button disabled={spinningBonus || bonusMult > 0} onClick={spinBonusWheel} className="w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 text-black font-serif font-black py-4 rounded-2xl text-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 uppercase tracking-widest border border-amber-100">
              {spinningBonus ? 'A Rodar...' : bonusMult > 0 ? 'Concluído!' : 'Rodar Agora'}
            </button>
            {bonusMult > 0 && (
              <button onClick={() => setShowBonus(false)} className="mt-4 w-full bg-neutral-800 text-amber-400 font-bold py-4 rounded-2xl text-sm uppercase tracking-wider">Voltar ao Jogo</button>
            )}
          </div>
        </div>
      )}

      {/* MODAL CARTEIRA COM MENSAGENS CLARAS DE ERRO */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-600/40 w-full max-w-md rounded-3xl p-7 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative">
            <h2 className="text-2xl font-serif font-black text-amber-400 mb-6 flex items-center gap-2"><Wallet className="w-7 h-7" /> Gestão de Saldo</h2>
            <div className="flex gap-2 mb-6 bg-neutral-950 p-1.5 rounded-2xl border border-amber-900/50">
              <button onClick={() => setWalletTab('deposit')} className={`flex-1 py-3 rounded-xl text-sm font-black transition ${walletTab === 'deposit' ? 'bg-amber-500 text-black' : 'text-amber-500/60'}`}>Depositar</button>
              <button onClick={() => setWalletTab('withdraw')} className={`flex-1 py-3 rounded-xl text-sm font-black transition ${walletTab === 'withdraw' ? 'bg-amber-500 text-black' : 'text-amber-500/60'}`}>Levantar</button>
            </div>
            <form onSubmit={handleTransactionRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-500/80 mb-2 uppercase tracking-widest">Valor R$</label>
                <input type="number" placeholder="Ex: 50000" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} className="w-full bg-neutral-950 border border-amber-900/50 rounded-2xl px-5 py-4 text-white text-base focus:border-amber-500 focus:outline-none shadow-inner" required />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-black py-4 rounded-2xl shadow-lg text-sm uppercase tracking-widest">Confirmar Pedido</button>
            </form>
            <button onClick={() => setShowWalletModal(false)} className="absolute top-6 right-6 text-amber-500 hover:text-white bg-neutral-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>
      )}
            {/* EXTRATO DE TRANSAÇÕES */}
      {showStatementModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-600/40 w-full max-w-md max-h-[85vh] rounded-3xl p-6 shadow-2xl flex flex-col relative">
            <h2 className="text-xl font-serif font-black text-amber-400 mb-4 flex items-center gap-2"><History className="w-6 h-6" /> Meu Extrato</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {transactions.filter(t => t.username === user.username).length === 0 ? (
                <p className="text-center text-amber-500/50 py-8 text-sm font-bold">Sem histórico.</p>
              ) : (
                transactions.filter(t => t.username === user.username).map(tx => (
                  <div key={tx.id} className="bg-neutral-950 border border-amber-900/40 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-white uppercase">{tx.type === 'deposit' ? 'Depósito' : 'Saque'}</p>
                      <p className="text-xs font-mono text-amber-500/60">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-mono font-black text-amber-400">{formatCurrency(tx.amount)}</p>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${tx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : tx.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-500'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowStatementModal(false)} className="mt-5 w-full bg-neutral-800 text-amber-400 font-bold py-4 rounded-2xl text-sm uppercase">Fechar Extrato</button>
          </div>
        </div>
      )}

      {/* MODAL DE AUTENTICAÇÃO */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-600/40 w-full max-w-md rounded-3xl p-7 shadow-2xl relative">
            <h2 className="text-2xl font-serif font-black text-amber-400 mb-2 flex items-center gap-2">
              <UserCheck className="w-6 h-6" /> {authMode === 'login' ? 'Entrar' : 'Registar'}
            </h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-5">
              <div>
                <input type="text" placeholder="Nome de Utilizador" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full bg-neutral-950 border border-amber-900/50 rounded-2xl px-5 py-4 text-white text-sm focus:border-amber-500 focus:outline-none" required />
              </div>
              <div>
                <input type="password" placeholder="Senha Secreta" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-neutral-950 border border-amber-900/50 rounded-2xl px-5 py-4 text-white text-sm focus:border-amber-500 focus:outline-none" required />
              </div>
              <button type="submit" className="w-full bg-amber-500 text-black font-serif font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] text-sm uppercase tracking-widest">{authMode === 'login' ? 'Aceder' : 'Criar Conta'}</button>
            </form>
            <div className="mt-5 text-center">
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs font-bold text-amber-500 hover:text-amber-400">
                {authMode === 'login' ? 'Criar nova conta de jogador' : 'Já sou jogador, fazer login'}
              </button>
            </div>
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-amber-500 hover:text-white bg-neutral-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>
      )}

      {/* PAINEL ADMIN VIP COM FERRAMENTAS COMPLETAS */}
      {showAdminPanel && user.isAdmin && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between pb-5 border-b border-amber-600/30">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-serif font-black text-amber-400 flex items-center gap-2"><Shield className="w-6 h-6" /> Admin Center</h2>
                <button onClick={fetchCloudData} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-amber-600/30 transition">
                  <RefreshCw className="w-4 h-4" /> Sync DB
                </button>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className="text-amber-400 bg-neutral-800 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-900 hover:text-red-400 transition">✕</button>
            </div>

            <div className="flex gap-2 my-5 bg-neutral-950 p-2 rounded-2xl border border-amber-900/50">
              <button onClick={() => setAdminTab('transactions')} className={`relative flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition ${adminTab === 'transactions' ? 'bg-amber-500 text-black' : 'text-amber-500/60'}`}>
                Pedidos ({transactions.filter(t => t.status === 'pending').length})
                {hasPendingTransactions && <span className="absolute right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />}
              </button>
              <button onClick={() => setAdminTab('users')} className={`flex-1 py-3 rounded-xl text-sm font-black transition ${adminTab === 'users' ? 'bg-amber-500 text-black' : 'text-amber-500/60'}`}>Jogadores ({Object.keys(usersDB).length})</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {adminTab === 'transactions' && (
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx.id} className="bg-neutral-950 border border-amber-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                      <div>
                        <p className="text-base font-black text-white">@{tx.username}</p>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1"><span className={tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-500'}>{tx.type === 'deposit' ? 'Pediu Depósito' : 'Pediu Saque'}</span></p>
                        <p className="text-sm font-mono font-bold text-amber-400 bg-neutral-900 inline-block px-2 py-1 rounded-lg border border-amber-900/40">{formatCurrency(tx.amount)} • {tx.date}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        {tx.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApproveTransaction(tx)} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider">Aprovar</button>
                            <button onClick={() => handleRejectTransaction(tx)} className="flex-1 sm:flex-none bg-red-700 hover:bg-red-600 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider">Rejeitar</button>
                          </>
                        ) : <span className={`w-full sm:w-auto text-center text-xs font-black px-4 py-2 rounded-xl border ${tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>{tx.status.toUpperCase()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'users' && (
                <div className="space-y-4">
                  <form onSubmit={handleAdminCreateUser} className="bg-neutral-950 border border-amber-600/30 p-5 rounded-2xl space-y-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2"><UserPlus className="w-4 h-4"/> Nova Conta VIP</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" placeholder="Nick" value={createNickInput} onChange={(e) => setCreateNickInput(e.target.value)} className="bg-neutral-900 border border-amber-900/40 rounded-xl p-3 text-sm text-white focus:border-amber-500" required />
                      <input type="password" placeholder="Senha" value={createPassInput} onChange={(e) => setCreatePassInput(e.target.value)} className="bg-neutral-900 border border-amber-900/40 rounded-xl p-3 text-sm text-white focus:border-amber-500" required />
                      <input type="number" placeholder="Saldo Início R$" value={createBalanceInput} onChange={(e) => setCreateBalanceInput(e.target.value)} className="bg-neutral-900 border border-amber-900/40 rounded-xl p-3 text-sm text-white focus:border-amber-500" />
                    </div>
                    <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-black w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest">Criar Jogador</button>
                  </form>

                  {Object.values(usersDB).map(u => (
                    <div key={u.username} className="bg-neutral-950 border border-amber-900/30 rounded-2xl p-5 space-y-4 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-black text-white">@{u.username} {u.isAdmin && <span className="bg-purple-900 text-purple-300 text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-purple-500/50 align-middle ml-2">Admin</span>}</p>
                          <p className="text-sm font-mono font-black text-amber-400 mt-1">Saldo Atual: {formatCurrency(u.balance)}</p>
                        </div>
                        <button onClick={() => handleDeleteUser(u.username)} className="bg-red-950/50 border border-red-900/50 text-red-500 hover:bg-red-600 hover:text-white p-3 rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-amber-900/40">
                        <input type="number" placeholder="Valor (R$)" value={adminActionAmount} onChange={(e) => setAdminActionAmount(e.target.value)} className="bg-neutral-900 border border-amber-700/50 rounded-xl px-4 py-3 text-sm font-mono text-white sm:w-40 focus:border-amber-400" />
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => handleAdminDirectDeposit(u.username)} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow">
                            <PlusCircle className="w-4 h-4" /> Adicionar
                          </button>
                          <button onClick={() => handleAdminDirectWithdraw(u.username)} className="flex-1 sm:flex-none bg-amber-700 hover:bg-amber-600 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow">
                            <MinusCircle className="w-4 h-4" /> Retirar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
