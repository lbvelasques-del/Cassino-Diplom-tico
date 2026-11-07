import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function App() {
  const [usersDb, setUsersDb] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(150000);
  const [betAmount, setBetAmount] = useState(30000);
  const [turbo, setTurbo] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winningLines, setWinningLines] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  
  const [freeSpins, setFreeSpins] = useState(0);
  const [bonusActive, setBonusActive] = useState(false);
  
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

  const [adminTargetUser, setAdminTargetUser] = useState('');
  const [adminDepositAmount, setAdminDepositAmount] = useState('');

  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');

  // Tabela Oficial de Símbolos
  const symbols = [
    { id: 'pampas', icon: '🫎', name: 'Pampas', mult: 0.5, isBonus: false },
    { id: 'alquimia', icon: '⚗️', name: 'Alquimia', mult: 0.8, isBonus: false },
    { id: 'petroleo', icon: '🛢️', name: 'Petróleo', mult: 1.0, isBonus: false },
    { id: 'moeda', icon: '🪙', name: 'Moeda', mult: 1.5, isBonus: false },
    { id: 'brasil', icon: '🇧🇷', name: 'Brasil', mult: 2.0, isBonus: false },
    { id: 'costarica', icon: '🇨🇷', name: 'Costa Rica', mult: 3.0, isBonus: false },
    { id: 'diamante', icon: '💎', name: 'Diamante', mult: 0, isBonus: true }
  ];

  const [grid, setGrid] = useState([
    symbols[0], symbols[1], symbols[2], 
    symbols[3], symbols[4], symbols[5], 
    symbols[6], symbols[0], symbols[1]
  ]);
  
  const bets = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

  // Carregar utilizadores do Supabase ao iniciar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) {
      setUsersDb(data);
      if (currentUser) {
        const updated = data.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
        if (updated) {
          setBalance(updated.balance);
          setCurrentUser(updated);
        }
      }
    }
  };

  const checkHorizontalAndDiagonalWins = (currentGrid) => {
    let lines = [];
    if (currentGrid[0].id === currentGrid[1].id && currentGrid[1].id === currentGrid[2].id) lines.push(0, 1, 2);
    if (currentGrid[3].id === currentGrid[4].id && currentGrid[4].id === currentGrid[5].id) lines.push(3, 4, 5);
    if (currentGrid[6].id === currentGrid[7].id && currentGrid[7].id === currentGrid[8].id) lines.push(6, 7, 8);
    if (currentGrid[0].id === currentGrid[4].id && currentGrid[4].id === currentGrid[8].id) lines.push(0, 4, 8);
    if (currentGrid[2].id === currentGrid[4].id && currentGrid[4].id === currentGrid[6].id) lines.push(2, 4, 6);
    return [...new Set(lines)];
  };

  const getWinningSymbol = () => {
    const weights = { 'pampas': 50, 'alquimia': 48, 'petroleo': 45, 'brasil': 40, 'moeda': 38, 'costarica': 33, 'diamante': 20 };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;
    for (const [id, weight] of Object.entries(weights)) {
      if (randomNum < weight) return symbols.find(s => s.id === id);
      randomNum -= weight;
    }
    return symbols[0];
  };

  const updateBalanceInSupabase = async (newBalance) => {
    if (!currentUser) return;
    setBalance(newBalance);
    await supabase.from('users').update({ balance: newBalance }).eq('username', currentUser.username);
    fetchUsers();
  };

  const spin = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const isFree = freeSpins > 0;
    if (!isFree && (balance < betAmount || spinning)) return;
    
    let newBal = balance;
    if (isFree) {
      setFreeSpins(prev => prev - 1);
    } else {
      newBal = balance - betAmount;
      await updateBalanceInSupabase(newBal);
    }

    setSpinning(true);
    setWinningLines([]);
    setLastWin(0);

    setTimeout(async () => {
      const winProbability = isFree ? 0.38 : 0.25; 
      const rand = Math.random();
      
      let newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      while (checkHorizontalAndDiagonalWins(newGrid).length > 0) {
        newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      }

      if (rand < winProbability) {
        const winningSym = getWinningSymbol();
        const winLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        const chosenLine = winLines[Math.floor(Math.random() * winLines.length)];
        chosenLine.forEach(idx => { newGrid[idx] = winningSym; });
      }

      setGrid(newGrid);
      setSpinning(false);

      const winningIndices = checkHorizontalAndDiagonalWins(newGrid);
      if (winningIndices.length > 0) {
        const winningSymbol = newGrid[winningIndices[0]];
        if (winningSymbol.isBonus) {
          setFreeSpins(prev => prev + 7);
          setBonusActive(true);
          setLastWin(0);
        } else {
          const prize = betAmount * winningSymbol.mult;
          const finalBal = newBal + prize;
          await updateBalanceInSupabase(finalBal);
          setLastWin(prize);
        }
        setWinningLines(winningIndices);
      }
    }, turbo ? 180 : 550);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const trimmedUser = inputUsername.trim();

    if (authMode === 'register') {
      if (inputPassword !== confirmPassword) {
        setAuthError('As senhas não coincidem!');
        return;
      }
      if (inputPassword.length < 3) {
        setAuthError('A senha é muito curta.');
        return;
      }

      const { data: existing } = await supabase.from('users').select('*').ilike('username', trimmedUser);
      if (existing && existing.length > 0) {
        setAuthError('Este nome já está em uso.');
        return;
      }

      const newUser = {
        username: trimmedUser,
        password: inputPassword,
        balance: 150000,
        is_admin: trimmedUser.toLowerCase() === 'lvelasques'
      };

      const { data, error } = await supabase.from('users').insert([newUser]).select();
      if (error) {
        setAuthError('Erro ao criar conta.');
        return;
      }

      const created = data[0];
      setCurrentUser(created);
      setBalance(created.balance);
      setIsAuthOpen(false);
      resetAuthForm();
      fetchUsers();
    } else {
      const { data, error } = await supabase.from('users').select('*').ilike('username', trimmedUser).eq('password', inputPassword);
      if (error || !data || data.length === 0) {
        setAuthError('Utilizador ou senha incorretos.');
        return;
      }
      const found = data[0];
      setCurrentUser(found);
      setBalance(found.balance);
      setIsAuthOpen(false);
      resetAuthForm();
      fetchUsers();
    }
  };

  const resetAuthForm = () => {
    setInputUsername('');
    setInputPassword('');
    setConfirmPassword('');
    setAuthError('');
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Insira um valor válido para saque.');
      return;
    }
    if (amountNum > balance) {
      alert('Saldo insuficiente na conta.');
      return;
    }
    const finalBal = balance - amountNum;
    await updateBalanceInSupabase(finalBal);
    
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

  const handleAdminBalanceUpdate = async (e, type) => {
    e.preventDefault();
    const targetUserTrim = adminTargetUser.trim();
    const amountVal = parseFloat(adminDepositAmount);

    if (!targetUserTrim || isNaN(amountVal) || amountVal <= 0) {
      alert('Insira um nome válido e valor acima de zero.');
      return;
    }

    const targetUser = usersDb.find(u => u.username.toLowerCase() === targetUserTrim.toLowerCase());
    if (!targetUser) {
      alert('Utilizador não encontrado na base de dados online.');
      return;
    }

    let newBal = targetUser.balance;
    if (type === 'add') {
      newBal += amountVal;
    } else if (type === 'remove') {
      if (targetUser.balance < amountVal) {
        alert('Erro: Saldo insuficiente na conta do utilizador.');
        return;
      }
      newBal -= amountVal;
    }

    const { error } = await supabase.from('users').update({ balance: newBal }).eq('username', targetUser.username);
    if (error) {
      alert('Erro ao atualizar saldo no Supabase.');
      return;
    }

    alert(`Sucesso! Saldo de ${targetUser.username} atualizado para R$ ${newBal.toLocaleString('pt-BR')}.`);
    setAdminTargetUser('');
    setAdminDepositAmount('');
    fetchUsers();
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
                  {currentUser.is_admin && (
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

      {/* Banner Master */}
      <div className="bg-gradient-to-r from-amber-950/70 via-[#121216] to-amber-950/70 border-y border-amber-500/40 py-3 px-4 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-black tracking-widest uppercase drop-shadow-md">
          ✨ <span>REDE PAMPAS — PATROCINADOR MASTER OFICIAL</span> ✨
        </div>
      </div>

      {/* Jogo Principal */}
      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        {freeSpins > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 border border-amber-400 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
            <p className="text-xs text-amber-300 font-black uppercase tracking-wider">🎁 RODADAS GRÁTIS ATIVAS!</p>
            <p className="text-amber-400 font-black text-lg">{freeSpins} Rodada(s) Restante(s)</p>
          </div>
        )}

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

        {bonusActive && lastWin === 0 && winningLines.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 border border-yellow-400 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(252,211,77,0.4)] animate-bounce">
            <p className="text-xs text-yellow-300 font-black uppercase tracking-widest">💎 BÔNUS CONQUISTADO!</p>
            <p className="text-yellow-400 font-bold text-sm">+7 Rodadas Grátis de Diamante!</p>
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
            disabled={spinning || (currentUser && !freeSpins && balance < betAmount)}
            onClick={spin}
            className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-lg py-4 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all border border-amber-200/50"
          >
            ▶️ {spinning ? 'A GIRAR...' : freeSpins > 0 ? `GIRAR GRÁTIS (${freeSpins})` : 'GIRAR'}
          </button>
        </div>
      </main>{/* Modal de Autenticação */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl shadow-amber-500/10">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1 tracking-wide">
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
                  className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all" 
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
                  className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all" 
                  placeholder="••••••••" 
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-semibold">Repetir Senha</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all" 
                    placeholder="••••••••" 
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-black py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95">
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
            <button onClick={() => setIsUserPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            
            <div className="flex items-center gap-3 mb-5 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-black">👤</div>
              <div>
                <h2 className="text-white font-bold text-lg">{currentUser.username}</h2>
                <p className="text-xs text-amber-400 font-bold">Saldo: R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-[#0b0b0e] border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs text-amber-300 font-bold uppercase tracking-wide">Fazer Saque para o Jogo Diplomacia</h3>
                {withdrawSuccess ? (
                  <div className="text-center py-2 text-emerald-400 text-xs font-bold">
                    ✅ Pedido de saque enviado com sucesso!
                  </div>
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
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-xs shadow">
                      Solicitar Saque
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => { setCurrentUser(null); setIsUserPanelOpen(false); setWithdrawSuccess(false); }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
                >
                  🚪 Sair da Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Painel de Administrador Sincronizado com Supabase */}
      {isAdminPanelOpen && currentUser && currentUser.is_admin && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#141418] border-2 border-amber-500 w-full max-w-2xl rounded-3xl p-6 relative shadow-[0_0_50px_rgba(245,158,11,0.2)] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center text-xl shadow-lg">⚙️</div>
              <div>
                <h2 className="text-amber-400 font-black text-xl">Painel Admin Online (Supabase)</h2>
                <p className="text-xs text-zinc-400">Gestão global de saldos e utilizadores em tempo real</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Ferramenta Admin: Adicionar / Remover Saldo Online */}
              <div className="bg-[#0b0b0e] border border-amber-500/40 rounded-2xl p-4">
                <h3 className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-3">
                  💰 Gestão de Saldo de Utilizadores (Supabase)
                </h3>
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
                    <button 
                      onClick={(e) => handleAdminBalanceUpdate(e, 'add')} 
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 rounded-xl text-xs shadow transition-all"
                    >
                      ➕ Adicionar Dinheiro
                    </button>
                    <button 
                      onClick={(e) => handleAdminBalanceUpdate(e, 'remove')} 
                      className="flex-1 bg-red-500 hover:bg-red-400 text-black font-black py-2.5 rounded-xl text-xs shadow transition-all"
                    >
                      ➖ Remover Dinheiro
                    </button>
                  </div>
                </form>
              </div>

              {/* Pedidos de Saque Pendentes */}
              <div className="bg-[#0b0b0e] border border-amber-500/30 rounded-2xl p-4">
                <h3 className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-3">
                  💸 Pedidos de Saque Pendentes ({withdrawalRequests.length})
                </h3>
                {withdrawalRequests.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-3">Nenhum pedido de saque pendente.</p>
                ) : (
                  <div className="space-y-2.5">
                    {withdrawalRequests.map((req) => (
                      <div key={req.id} className="bg-[#141418] border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white font-bold">Jogador: <span className="text-amber-400">{req.user}</span></p>
                          <p className="text-xs text-zinc-400">Valor: <span className="text-amber-300 font-bold">R$ {req.amount.toLocaleString('pt-BR')}</span></p>
                        </div>
                        <button 
                          onClick={() => {
                            setwithdrawalRequests(prev => prev.filter(item => item.id !== req.id));
                            alert(`Saque de R$ ${req.amount} para ${req.user} depositado no jogo Diplomacia!`);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-3 py-2 rounded-xl shadow transition-all"
                        >
                          ✅ Concluir Saque
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista Online de Contas no Supabase */}
              <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4">
                <h3 className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-3">
                  👥 Utilizadores Registados na Base de Dados ({usersDb.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {usersDb.map((u, idx) => (
                    <div key={idx} className="bg-[#141418] border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{u.username}</span>
                        {u.is_admin && <span className="ml-2 bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded">ADMIN</span>}
                      </div>
                      <div className="text-right text-zinc-400">
                        Saldo: <span className="text-amber-400 font-bold">R$ {Number(u.balance).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
              <button onClick={() => setIsAdminPanelOpen(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-xs transition-all">
                Fechar Painel Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                      }
