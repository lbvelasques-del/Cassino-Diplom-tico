import React, { useState } from 'react';

export default function App() {
  const [usersDb, setUsersDb] = useState([
    { id: 1, username: 'LVelasques', password: 'Lucas123!', balance: 99999999, isAdmin: true }
  ]);

  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(150000);
  const [betAmount, setBetAmount] = useState(30000);
  const [turbo, setTurbo] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winningLines, setWinningLines] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  
  // Estados da Nova Roleta de Bônus (1x a 10x)
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
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // Gestão Admin
  const [adminTargetUser, setAdminTargetUser] = useState('');
  const [adminDepositAmount, setAdminDepositAmount] = useState('');

  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');

  // Símbolos com as novas probabilidades e multiplicadores pedidos
  const symbols = [
    { id: 'pampas', icon: '🫎', name: 'Pampas', mult: 0.5, prob: 0.50, isBonus: false },
    { id: 'alquimia', icon: '⚗️', name: 'Alquimia', mult: 0.8, prob: 0.48, isBonus: false },
    { id: 'petroleo', icon: '🛢️', name: 'Petróleo', mult: 1.0, prob: 0.45, isBonus: false },
    { id: 'moeda', icon: '🪙', name: 'Moeda', mult: 1.5, prob: 0.38, isBonus: false },
    { id: 'brasil', icon: '🇧🇷', name: 'Brasil', mult: 2.0, prob: 0.40, isBonus: false },
    { id: 'costarica', icon: '🇨🇷', name: 'Costa Rica', mult: 3.0, prob: 0.33, isBonus: false },
    { id: 'diamante', icon: '💎', name: 'Diamante', mult: 0, prob: 0.20, isBonus: true }
  ];

  const [grid, setGrid] = useState([
    symbols[0], symbols[1], symbols[2], 
    symbols[3], symbols[4], symbols[5], 
    symbols[6], symbols[0], symbols[1]
  ]);
  
  const bets = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

  const checkHorizontalAndDiagonalWins = (currentGrid) => {
    let lines = [];
    if (currentGrid[0].id === currentGrid[1].id && currentGrid[1].id === currentGrid[2].id) lines.push(0, 1, 2);
    if (currentGrid[3].id === currentGrid[4].id && currentGrid[4].id === currentGrid[5].id) lines.push(3, 4, 5);
    if (currentGrid[6].id === currentGrid[7].id && currentGrid[7].id === currentGrid[8].id) lines.push(6, 7, 8);
    if (currentGrid[0].id === currentGrid[4].id && currentGrid[4].id === currentGrid[8].id) lines.push(0, 4, 8);
    if (currentGrid[2].id === currentGrid[4].id && currentGrid[4].id === currentGrid[6].id) lines.push(2, 4, 6);
    return [...new Set(lines)];
  };

  const spin = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    if (balance < betAmount || spinning) return;
    
    setBalance(prev => prev - betAmount);
    setSpinning(true);
    setWinningLines([]);
    setLastWin(0);

    setTimeout(() => {
      // Seleção ponderada baseada na probabilidade específica de cada símbolo
      const randVal = Math.random();
      let accumulated = 0;
      let chosenSym = symbols[0];

      for (let sym of symbols) {
        accumulated += sym.prob;
        if (randVal <= accumulated) {
          chosenSym = sym;
          break;
        }
      }

      let newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      
      // Decisão de vitória vs derrota mantendo a vantagem da casa controlada
      const winCheck = Math.random();
      if (winCheck < chosenSym.prob) {
        const winLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        const chosenLine = winLines[Math.floor(Math.random() * winLines.length)];
        chosenLine.forEach(idx => { newGrid[idx] = chosenSym; });
      } else {
        while (checkHorizontalAndDiagonalWins(newGrid).length > 0) {
          newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
        }
      }

      setGrid(newGrid);
      setSpinning(false);

      const winningIndices = checkHorizontalAndDiagonalWins(newGrid);
      if (winningIndices.length > 0) {
        const winningSymbol = newGrid[winningIndices[0]];
        if (winningSymbol.isBonus) {
          setBonusWheelActive(true);
          setLastWin(0);
        } else {
          const prize = betAmount * winningSymbol.mult;
          setBalance(prev => prev + prize);
          setLastWin(prize);
        }
        setWinningLines(winningIndices);
      }
    }, turbo ? 180 : 550);
  };

  const triggerBonusWheel = () => {
    setSpinningWheel(true);
    setTimeout(() => {
      const randomMult = Math.floor(Math.random() * 10) + 1; // 1x a 10x
      const prize = betAmount * randomMult;
      setWheelMultiplier(randomMult);
      setBalance(prev => prev + prize);
      setLastWin(prize);
      setSpinningWheel(false);
      setBonusWheelActive(false);
    }, 1500);
  };const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const trimmedUser = inputUsername.trim();

    if (authMode === 'register') {
      if (inputPassword !== confirmPassword) {
        setAuthError('As senhas não coincidem!');
        return;
      }
      if (inputPassword.length < 3) {
        setAuthError('A senha é demasiado curta.');
        return;
      }
      const existing = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase());
      if (existing) {
        setAuthError('Este nome de utilizador já está em uso.');
        return;
      }
      const isAdmin = trimmedUser.toLowerCase() === 'lvelasques';
      const newUser = {
        id: Date.now(),
        username: trimmedUser,
        password: inputPassword,
        balance: 150000,
        isAdmin: isAdmin
      };
      setUsersDb(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setBalance(newUser.balance);
      setIsAuthOpen(false);
      resetAuthForm();
    } else {
      const found = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === inputPassword);
      if (!found) {
        setAuthError('Utilizador ou senha incorretos.');
        return;
      }
      setCurrentUser(found);
      setBalance(found.balance);
      setIsAuthOpen(false);
      resetAuthForm();
    }
  };

  const resetAuthForm = () => {
    setInputUsername('');
    setInputPassword('');
    setConfirmPassword('');
    setAuthError('');
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Insira um valor válido para saque.');
      return;
    }
    if (amountNum > balance) {
      alert('Não tem saldo suficiente na conta para este valor.');
      return;
    }
    setBalance(prev => prev - amountNum);
    const newReq = {
      id: Date.now(),
      user: currentUser.username,
      amount: amountNum,
      status: 'Pendente no Jogo'
    };
    setWithdrawalRequests(prev => [newReq, ...prev]);
    setWithdrawSuccess(true);
    setWithdrawAmount('');
  };

  const handleAdminBalanceUpdate = (e, type) => {
    e.preventDefault();
    const targetUserTrim = adminTargetUser.trim();
    const amountVal = parseFloat(adminDepositAmount);

    if (!targetUserTrim || isNaN(amountVal) || amountVal <= 0) {
      alert('Insira um nome de utilizador válido e um valor superior a zero.');
      return;
    }

    const userIndex = usersDb.findIndex(u => u.username.toLowerCase() === targetUserTrim.toLowerCase());
    if (userIndex === -1) {
      alert('Utilizador não encontrado na base de dados.');
      return;
    }

    const updatedUsers = [...usersDb];
    if (type === 'add') {
      updatedUsers[userIndex].balance += amountVal;
      alert(`Sucesso: Adicionado R$ ${amountVal.toLocaleString('pt-BR')} à conta de ${updatedUsers[userIndex].username}.`);
    } else if (type === 'remove') {
      if (updatedUsers[userIndex].balance < amountVal) {
        alert(`Erro: Saldo insuficiente para remover este valor.`);
        return;
      }
      updatedUsers[userIndex].balance -= amountVal;
      alert(`Sucesso: Removido R$ ${amountVal.toLocaleString('pt-BR')} da conta de ${updatedUsers[userIndex].username}.`);
    }

    setUsersDb(updatedUsers);
    if (currentUser && currentUser.username.toLowerCase() === updatedUsers[userIndex].username.toLowerCase()) {
      setBalance(updatedUsers[userIndex].balance);
    }
    setAdminTargetUser('');
    setAdminDepositAmount('');
  };return (
    <div className="min-h-screen bg-[#070709] text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      {/* Header Luminoso */}
      <header className="sticky top-0 z-50 bg-[#0c0c0f]/95 backdrop-blur-xl border-b border-amber-500/20 px-4 py-3 flex items-center justify-between shadow-2xl shadow-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30 text-black font-black text-lg border border-amber-200/40 animate-pulse">
            👑
          </div>
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
                  {currentUser.isAdmin && (
                    <button 
                      onClick={() => setIsAdminPanelOpen(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow transition-all"
                    >
                      ADMIN ⚙️
                    </button>
                  )}
                </div>
                <p className="text-amber-400 font-black text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>

              <button 
                onClick={() => setIsUserPanelOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-black text-xs px-3 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                ⚙️ Perfil
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
            >
              👤 Criar Conta / Entrar
            </button>
          )}
        </div>
      </header>

      {/* Banner Master Oficial */}
      <div className="bg-gradient-to-r from-amber-950/70 via-[#121216] to-amber-950/70 border-y border-amber-500/40 py-3 px-4 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-black tracking-widest uppercase drop-shadow-md">
          ✨ <span>REDE PAMPAS — PATROCINADOR MASTER OFICIAL</span> ✨
        </div>
      </div>

      {/* Jogo Principal */}
      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        {/* Modal da Roleta de Bônus 1x a 10x */}
        {bonusWheelActive && (
          <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 border-2 border-amber-400 rounded-3xl p-5 text-center shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-pulse space-y-3">
            <p className="text-xs text-amber-300 font-black uppercase tracking-wider">💎 LINHA DE DIAMANTE ATIVA! 💎</p>
            <p className="text-white font-bold text-sm">Gire a Roleta de Bônus (1x a 10x aposta)</p>
            {wheelMultiplier && (
              <p className="text-2xl text-amber-400 font-black">🎉 Multiplicador: {wheelMultiplier}x (+R$ {(betAmount * wheelMultiplier).toLocaleString('pt-BR')})</p>
            )}
            <button
              disabled={spinningWheel}
              onClick={triggerBonusWheel}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3 rounded-2xl shadow-lg text-sm hover:scale-105 transition-all"
            >
              {spinningWheel ? '🔄 A RODAR A ROLETA...' : '🎰 RODAR ROLETA DE BÔNUS'}
            </button>
          </div>
        )}

        {/* Grelha 3x3 */}
        <div className="relative bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/40 rounded-3xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] mt-2">
          <div className="grid grid-cols-3 gap-3 my-2">
            {grid.map((sym, idx) => {
              const isWinningCell = winningLines.includes(idx);
              return (
                <div 
                  key={idx} 
                  className={`h-24 rounded-2xl bg-[#0b0b0e] border flex flex-col items-center justify-center text-3xl shadow-inner transition-all duration-300 ${
                    spinning ? 'animate-pulse opacity-50 scale-95 border-zinc-800' : ''
                  } ${
                    isWinningCell 
                      ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce' 
                      : 'border-zinc-800/80 hover:border-amber-500/40'
                  }`}
                >
                  <span className="drop-shadow-md">{sym.icon}</span>
                  <span className="text-[10px] text-zinc-400 mt-1 font-bold tracking-wider">{sym.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seletor de Aposta */}
        <div className="bg-[#121216] border border-amber-500/20 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Valor da Aposta</span>
            <span className="text-amber-400 font-black text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">R$ {betAmount.toLocaleString('pt-BR')}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {bets.map((val) => (
              <button
                key={val}
                disabled={spinning}
                onClick={() => setBetAmount(val)}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  betAmount === val 
                    ? 'bg-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/30 scale-105 font-black' 
                    : 'bg-[#18181e] text-zinc-300 border-zinc-800 hover:border-amber-500/30'
                }`}
              >
                {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {lastWin > 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/60 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
            <p className="text-xs text-amber-300 font-extrabold uppercase tracking-widest">🎉 VITÓRIA NA LINHA!</p>
            <p className="text-amber-400 font-black text-xl drop-shadow-md">+ R$ {lastWin.toLocaleString('pt-BR')}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setTurbo(!turbo)}
            className={`py-4 px-5 rounded-2xl font-bold text-xs border transition-all shadow-md ${
              turbo 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-[#141418] text-zinc-400 border-zinc-800'
            }`}
          >
            ⚡ TURBO {turbo ? 'ON' : 'OFF'}
          </button>

          <button
            disabled={spinning || (currentUser && balance < betAmount) || bonusWheelActive}
            onClick={spin}
            className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-lg py-4 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all border border-amber-200/50"
          >
            ▶️ {spinning ? 'A GIRAR...' : 'GIRAR'}
          </button>
        </div>
      </main>

      {/* Modal de Autenticação (Com Confirmação de Senha) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">
              {authMode === 'login' ? 'Entrar no Cassino' : 'Criar Conta Oficial'}
            </h2>
            <p className="text-xs text-zinc-400 mb-6">Registo obrigatório para jogar</p>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-4 font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Nome de Utilizador</label>
                <input 
                  type="text" 
                  value={inputUsername} 
                  onChange={(e) => setInputUsername(e.target.value)} 
                  required 
                  className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none" 
                  placeholder="Ex: LVelasques" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Senha</label>
                <input 
                  type="password" 
                  value={inputPassword} 
                  onChange={(e) => setInputPassword(e.target.value)} 
                  required 
                  className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none" 
                  placeholder="••••••••" 
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-semibold">Confirmar Senha</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none" 
                    placeholder="••••••••" 
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3.5 rounded-xl text-sm shadow-lg">
                {authMode === 'login' ? 'Entrar na Plataforma' : 'Criar Nova Conta'}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  {authMode === 'login' ? 'Não tem conta? Registe-se aqui' : 'Já tem conta? Faça login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Painel do Utilizador */}
      {isUserPanelOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setIsUserPanelOpen(false); }} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <div className="flex items-center gap-3 mb-5 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-black">👤</div>
              <div>
                <h2 className="text-white font-bold text-lg">{currentUser.username}</h2>
                <p className="text-xs text-amber-400 font-bold">Saldo: R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="bg-[#0b0b0e] border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs text-amber-300 font-bold uppercase">Fazer Saque para o Jogo Diplomacia</h3>
                {withdrawSuccess ? (
                  <div className="text-center py-2 text-emerald-400 text-xs font-bold">✅ Pedido enviado com sucesso!</div>
                ) : (
                  <form onSubmit={handleWithdrawSubmit} className="space-y-3">
                    <input 
                      type="number" 
                      placeholder="Valor do saque (R$)" 
                      value={withdrawAmount} 
                      onChange={(e) => setWithdrawAmount(e.target.value)} 
                      required 
                      className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-xs outline-none" 
                    />
                    <button type="submit" className="w-full bg-amber-500 text-black font-black py-2.5 rounded-xl text-xs">Solicitar Saque</button>
                  </form>
                )}
              </div>
              <button onClick={() => { setCurrentUser(null); setIsUserPanelOpen(false); setWithdrawSuccess(false); }} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-xs">🚪 Sair da Conta</button>
            </div>
          </div>
        </div>
      )}

      {/* Painel Administrador */}
      {isAdminPanelOpen && currentUser && currentUser.isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#141418] border-2 border-amber-500 w-full max-w-2xl rounded-3xl p-6 relative shadow-[0_0_50px_rgba(245,158,11,0.2)] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center text-xl shadow-lg">⚙️</div>
              <div>
                <h2 className="text-amber-400 font-black text-xl">Painel Admin (LVelasques)</h2>
                <p className="text-xs text-zinc-400">Gestão de saldos e utilizadores</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-[#0b0b0e] border border-amber-500/40 rounded-2xl p-4">
                <h3 className="text-xs text-amber-300 font-bold uppercase mb-3">💰 Gestão de Saldo de Utilizadores</h3>
                <form className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Nome do Utilizador" 
                      value={adminTargetUser} 
                      onChange={(e) => setAdminTargetUser(e.target.value)} 
                      className="bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-xs outline-none" 
                    />
                    <input 
                      type="number" 
                      placeholder="Valor (R$)" 
                      value={adminDepositAmount} 
                      onChange={(e) => setAdminDepositAmount(e.target.value)} 
                      className="bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-xs outline-none" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleAdminBalanceUpdate(e, 'add')} className="flex-1 bg-emerald-500 text-black font-black py-2.5 rounded-xl text-xs">➕ Adicionar Dinheiro</button>
                    <button onClick={(e) => handleAdminBalanceUpdate(e, 'remove')} className="flex-1 bg-red-500 text-black font-black py-2.5 rounded-xl text-xs">➖ Remover Dinheiro</button>
                  </div>
                </form>
              </div>

              <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4">
                <h3 className="text-xs text-amber-300 font-bold uppercase mb-3">👥 Utilizadores Registados ({usersDb.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {usersDb.map((u, idx) => (
                    <div key={idx} className="bg-[#141418] border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{u.username}</span>
                        {u.isAdmin && <span className="ml-2 bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded">ADMIN</span>}
                      </div>
                      <div className="text-right text-zinc-400">
                        Saldo: <span className="text-amber-400 font-bold">R$ {u.balance.toLocaleString('pt-BR')}</span>
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
