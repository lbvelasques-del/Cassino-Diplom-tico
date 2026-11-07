import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(0);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Painel Admin (Com suporte a ID e Exclusão)
  const [usersDb, setUsersDb] = useState([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminTargetId, setAdminTargetId] = useState('');
  const [adminDepositAmount, setAdminDepositAmount] = useState('');
  
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // Símbolos oficiais com os pagamentos que definiste (Estilo Fortune Tiger)
  const symbols = [
    { id: 'elks', name: 'Alce', icon: '🫎', multiplier: 0.5 },
    { id: 'pot', name: 'Alquimia', icon: '⚗️', multiplier: 0.8 },
    { id: 'oil', name: 'Barril', icon: '🛢️', multiplier: 1.0 },
    { id: 'coin', name: 'Moeda', icon: '🪙', multiplier: 1.5 },
    { id: 'br', name: 'Brasil', icon: '🇧🇷', multiplier: 2.0 },
    { id: 'world', name: 'Mundo', icon: '🌎', multiplier: 2.5 },
    { id: 'cr', name: 'Costa Rica', icon: '🇨🇷', multiplier: 3.0 },
    { id: 'diamond', name: 'Diamante', icon: '💎', bonusOnly: true } // Diamante ativa Bônus
  ];

  // Grelha 3x3 estilo Fortune Tiger
  const [grid, setGrid] = useState([
    [symbols[0], symbols[1], symbols[2]],
    [symbols[3], symbols[4], symbols[5]],
    [symbols[6], symbols[0], symbols[1]]
  ]);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameMessage, setGameMessage] = useState('Faça a sua aposta e gire!');
  const [betAmount, setBetAmount] = useState(100); // Aposta padrão
  
  // Estado do Bônus (Roleta de 1x a 10x)
  const [bonusActive, setBonusActive] = useState(false);
  const [bonusMultiplier, setBonusMultiplier] = useState(null);
  const [isBonusSpinning, setIsBonusSpinning] = useState(false);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
    if (!error && data) setUsersDb(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetAuthForm = () => {
    setInputUsername(''); setInputPassword(''); setConfirmPassword(''); setAuthError('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const trimmedUser = inputUsername.trim();

    if (authMode === 'register') {
      if (inputPassword !== confirmPassword) return setAuthError('As senhas não coincidem!');
      if (inputPassword.length < 3) return setAuthError('A senha é muito curta.');

      const { data: existing, error: errExist } = await supabase.from('users').select('*').ilike('username', trimmedUser);
      if (errExist) return alert('Erro Supabase: ' + errExist.message);
      if (existing && existing.length > 0) return setAuthError('Este nome já está em uso.');

      const newUser = {
        username: trimmedUser,
        password: inputPassword,
        balance: 150000,
        is_admin: trimmedUser.toLowerCase() === 'lvelasques'
      };

      const { data, error } = await supabase.from('users').insert([newUser]).select();
      if (error) return setAuthError('Erro: ' + error.message);
      
      setCurrentUser(data[0]); setBalance(Number(data[0].balance));
      setIsAuthOpen(false); resetAuthForm(); await fetchUsers(); alert('Conta criada com sucesso!');
    } else {
      const { data, error } = await supabase.from('users').select('*').ilike('username', trimmedUser).eq('password', inputPassword);
      if (error) return alert('Erro Login: ' + error.message);
      if (!data || data.length === 0) return setAuthError('Utilizador ou senha incorretos.');
      
      setCurrentUser(data[0]); setBalance(Number(data[0].balance));
      setIsAuthOpen(false); resetAuthForm(); await fetchUsers();
    }
  };const handleAdminBalanceUpdate = async (e, action) => {
    e.preventDefault();
    const amount = Number(adminDepositAmount);
    if (!adminTargetId || amount <= 0) return;

    const targetUser = usersDb.find(u => String(u.id) === String(adminTargetId).trim());
    if (!targetUser) return alert('Nenhuma conta encontrada com este ID!');

    const newBalance = action === 'add' ? Number(targetUser.balance) + amount : Number(targetUser.balance) - amount;
    const { error } = await supabase.from('users').update({ balance: newBalance }).eq('id', targetUser.id);
    
    if (error) {
      alert('Erro: ' + error.message);
    } else {
      alert(`Saldo da conta ID #${targetUser.id} (${targetUser.username}) alterado para R$ ${newBalance.toLocaleString('pt-BR')}`);
      setAdminDepositAmount(''); setAdminTargetId(''); fetchUsers();
      if (currentUser && currentUser.id === targetUser.id) {
        setBalance(newBalance); setCurrentUser({...currentUser, balance: newBalance});
      }
    }
  };

  const handleDeleteUser = async (id, username) => {
    const confirmar = window.confirm(`ATENÇÃO! Queres EXCLUIR a conta de ${username} (ID: ${id}) para sempre?`);
    if (!confirmar) return;

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir conta: ' + error.message);
    } else {
      alert(`Conta de ${username} excluída com sucesso!`);
      fetchUsers();
    }
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (amount > balance) return alert('Saldo insuficiente!');
    setWithdrawalRequests([...withdrawalRequests, { id: Date.now(), user: currentUser.username, amount }]);
    setWithdrawSuccess(true); setTimeout(() => setWithdrawSuccess(false), 3000); setWithdrawAmount('');
  };

  // Motor do Jogo Estilo Fortune Tiger
  const handleSpin = async () => {
    if (!currentUser) return alert("Faz login para jogar!");
    if (balance < betAmount) return setGameMessage("Saldo insuficiente para esta aposta!");

    setIsSpinning(true);
    setGameMessage("A girar os cilindros...");

    const newBalance = balance - betAmount;
    setBalance(newBalance);
    setCurrentUser({...currentUser, balance: newBalance});
    await supabase.from('users').update({ balance: newBalance }).eq('id', currentUser.id);

    let counter = 0;
    const spinInterval = setInterval(() => {
      setGrid([
        [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
        [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
        [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]]
      ]);
      counter++;
      if (counter > 12) {
        clearInterval(spinInterval);
        evaluateSpin(newBalance);
      }
    }, 90);
  };

  const evaluateSpin = async (currentBalance) => {
    // Gera resultado final 3x3
    const finalGrid = [
      [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
      [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
      [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]]
    ];
    setGrid(finalGrid);
    setIsSpinning(false);

    // Verifica se saiu Diamante 💎 (Ativa Bônus)
    let diamondCount = 0;
    finalGrid.forEach(row => row.forEach(cell => {
      if (cell.id === 'diamond') diamondCount++;
    }));

    if (diamondCount >= 2) {
      setGameMessage("💎 DIAMANTE DETETADO! A ENTRAR NO MODO BÔNUS!");
      setBonusActive(true);
      return;
    }

    // Verifica Linhas Horizontais Pagantes (Estilo Tiger)
    let totalWin = 0;
    finalGrid.forEach(row => {
      if (row[0].id === row[1].id && row[1].id === row[2].id && !row[0].bonusOnly) {
        totalWin += betAmount * row[0].multiplier;
      }
    });

    if (totalWin > 0) {
      setGameMessage(`🎉 Vitória! Ganhaste R$ ${totalWin.toLocaleString('pt-BR')}!`);
      const finalBalance = currentBalance + totalWin;
      setBalance(finalBalance);
      setCurrentUser({...currentUser, balance: finalBalance});
      await supabase.from('users').update({ balance: finalBalance }).eq('id', currentUser.id);
      fetchUsers();
    } else {
      setGameMessage("Não foi desta vez. Tente novamente!");
    }
  };

  // Roleta de Bônus (1x a 10x)
  const spinBonusWheel = async () => {
    setIsBonusSpinning(true);
    let count = 0;
    const wheelInterval = setInterval(() => {
      const randomMult = Math.floor(Math.random() * 10) + 1;
      setBonusMultiplier(randomMult);
      count++;
      if (count > 15) {
        clearInterval(wheelInterval);
        const finalMult = Math.floor(Math.random() * 10) + 1; // 1x a 10x
        setBonusMultiplier(finalMult);
        setIsBonusSpinning(false);
        applyBonusReward(finalMult);
      }
    }, 100);
  };

  const applyBonusReward = async (mult) => {
    const bonusPrize = betAmount * mult * 10; // Prémio escalado pelo bônus
    setGameMessage(`🌟 BÔNUS CONCLUÍDO! Multiplicador ${mult}x! Prémio: R$ ${bonusPrize.toLocaleString('pt-BR')}`);
    
    const newBalance = balance + bonusPrize;
    setBalance(newBalance);
    setCurrentUser({...currentUser, balance: newBalance});
    await supabase.from('users').update({ balance: newBalance }).eq('id', currentUser.id);
    fetchUsers();

    setTimeout(() => {
      setBonusActive(false);
      setBonusMultiplier(null);
    }, 4000);
  };return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans selection:bg-amber-500/30">
      <header className="bg-[#141418] border-b border-amber-500/20 px-6 py-4 flex justify-between items-center shadow-lg shadow-black/50">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 tracking-tight">REDE PAMPAS</h1>
          <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-[0.2em]">Cassino da Costa Rica</p>
        </div>
        <div className="flex items-center gap-3">
          {!currentUser ? (
            <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all">ENTRAR / REGISTAR</button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs text-zinc-400 font-bold">{currentUser.username}</p>
                <p className="text-sm text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setIsUserPanelOpen(true)} className="w-10 h-10 bg-[#1a1a20] border border-amber-500/30 rounded-xl text-lg flex items-center justify-center">👤</button>
              {currentUser.is_admin && <button onClick={() => setIsAdminPanelOpen(true)} className="w-10 h-10 bg-amber-500 rounded-xl text-black text-lg flex items-center justify-center">⚙️</button>}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-white mb-2">Cassino Estilo Tiger - Costa Rica</h2>
          {!currentUser && <p className="text-zinc-400 text-sm">Faça login para jogar e testar a sua sorte.</p>}
        </div>

        {/* MODO BÔNUS ATIVO (ROLETA 1x a 10x) */}
        {bonusActive && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#141418] border-4 border-amber-500 w-full max-w-md rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.4)]">
              <h2 className="text-2xl font-black text-amber-400 mb-2">🎰 MODO BÔNUS ATIVADO!</h2>
              <p className="text-xs text-zinc-400 mb-6">Gire a roleta de bônus para multiplicar o seu prêmio (1x a 10x)</p>
              
              <div className="w-36 h-36 mx-auto bg-[#0b0b0e] border-4 border-amber-400 rounded-full flex items-center justify-center text-4xl font-black text-amber-300 mb-8 shadow-inner">
                {bonusMultiplier ? `${bonusMultiplier}x` : '💎'}
              </div>

              <button 
                onClick={spinBonusWheel} 
                disabled={isBonusSpinning}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-4 rounded-2xl shadow-lg text-lg hover:scale-105 transition-all"
              >
                {isBonusSpinning ? 'A RODAR BÔNUS...' : 'GIRAR RODA DE BÔNUS'}
              </button>
            </div>
          </div>
        )}

        {/* GRELHA DO JOGO (ESTILO TIGER 3x3) */}
        <div className="bg-[#141418] border-2 border-amber-500 rounded-3xl p-6 max-w-lg mx-auto text-center shadow-[0_0_40px_rgba(245,158,11,0.15)] mb-8">
          <div className="grid grid-cols-3 gap-3 mb-6 bg-[#0b0b0e] p-4 rounded-2xl border border-zinc-800">
            {grid.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div key={`${rIdx}-${cIdx}`} className="h-24 bg-[#141418] border border-zinc-700 rounded-xl flex flex-col items-center justify-center text-4xl shadow-inner">
                  <span className={isSpinning ? 'animate-bounce' : ''}>{cell.icon}</span>
                  <span className="text-[9px] text-zinc-400 mt-1 font-bold">{cell.name}</span>
                </div>
              ))
            )}
          </div>
          
          <p className="text-amber-400 font-bold text-sm h-8 mb-4">{gameMessage}</p>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xs text-zinc-400 font-bold">Aposta:</span>
            {[50, 100, 500, 1000].map((val) => (
              <button 
                key={val} 
                onClick={() => setBetAmount(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${betAmount === val ? 'bg-amber-500 text-black border-amber-400 shadow-md' : 'bg-[#0b0b0e] text-zinc-400 border-zinc-800'}`}
              >
                R$ {val}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleSpin} disabled={isSpinning || !currentUser}
            className={`w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xl py-4 rounded-2xl shadow-lg transition-all ${isSpinning || !currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            {isSpinning ? 'A GIRAR...' : `GIRAR (R$ ${betAmount})`}
          </button>
        </div>

        {/* TABELA DE PAGAMENTOS E MULTIPLICADORES */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-amber-500 font-black text-xs uppercase tracking-widest mb-3 text-center">📋 Tabela de Pagamentos e Símbolos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
            {symbols.map((s, i) => (
              <div key={i} className="bg-[#141418] border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-xl">{s.icon}</span>
                <div className="text-right">
                  <p className="text-white font-bold">{s.name}</p>
                  <p className="text-amber-400 text-[10px]">{s.bonusOnly ? 'Ativa Bônus 💎' : `${s.multiplier}x Aposta`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL DE LOGIN */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-6">{authMode === 'login' ? 'Entrar' : 'Criar Conta'}</h2>
            {authError && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-4">{authError}</div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm" placeholder="Utilizador" />
              <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm" placeholder="Senha" />
              {authMode === 'register' && <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm" placeholder="Repetir Senha" />}
              <button type="submit" className="w-full bg-amber-500 text-black font-black py-3.5 rounded-xl">{authMode === 'login' ? 'Entrar' : 'Criar Conta'}</button>
              <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="w-full text-xs text-amber-400">{authMode === 'login' ? 'Criar nova conta' : 'Já tem conta? Login'}</button>
            </form>
          </div>
        </div>
      )}

      {/* PAINEL DO UTILIZADOR */}
      {isUserPanelOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative">
            <button onClick={() => setIsUserPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400">✕</button>
            <h2 className="text-white font-bold text-lg mb-1">{currentUser.username}</h2>
            <p className="text-xs text-zinc-400 mb-4">A tua ID Oficial: <span className="text-amber-400 font-mono font-bold">#{currentUser.id}</span></p>
            <div className="bg-[#0b0b0e] border border-zinc-800 p-4 rounded-2xl mb-4">
              <h3 className="text-xs text-amber-300 font-bold mb-3">Saque para Diplomacia</h3>
              {withdrawSuccess ? ( <p className="text-emerald-400 text-xs">✅ Pedido enviado!</p> ) : (
                <form onSubmit={handleWithdrawSubmit} className="flex gap-2">
                  <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required className="flex-1 bg-[#141418] border border-zinc-700 rounded-xl px-3 text-white text-xs" placeholder="Valor (R$)" />
                  <button type="submit" className="bg-amber-500 text-black font-bold px-4 py-2.5 rounded-xl text-xs">Sacar</button>
                </form>
              )}
            </div>
            <button onClick={() => { setCurrentUser(null); setIsUserPanelOpen(false); }} className="w-full bg-red-500 text-black font-bold py-2.5 rounded-xl text-xs">Sair da Conta</button>
          </div>
        </div>
      )}

      {/* PAINEL ADMIN (COM ID E EXCLUSÃO) */}
      {isAdminPanelOpen && currentUser?.is_admin && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#141418] border-2 border-amber-500 w-full max-w-2xl rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-4">Painel Admin Online</h2>
            
            <div className="bg-[#0b0b0e] border border-amber-500/40 rounded-2xl p-4 mb-4">
              <h3 className="text-xs text-amber-300 font-bold mb-2">💰 Inserir/Remover por ID da Conta</h3>
              <form className="flex flex-col gap-2">
                <input type="text" placeholder="Escreva a ID da Conta (ex: 2)" value={adminTargetId} onChange={(e) => setAdminTargetId(e.target.value)} className="bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-mono" />
                <input type="number" placeholder="Valor (R$)" value={adminDepositAmount} onChange={(e) => setAdminDepositAmount(e.target.value)} className="bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs" />
                <div className="flex gap-2 mt-1">
                  <button onClick={(e) => handleAdminBalanceUpdate(e, 'add')} className="flex-1 bg-emerald-500 text-black font-bold py-2.5 rounded-xl text-xs">➕ Depositar</button>
                  <button onClick={(e) => handleAdminBalanceUpdate(e, 'remove')} className="flex-1 bg-red-500 text-black font-bold py-2.5 rounded-xl text-xs">➖ Retirar</button>
                </div>
              </form>
            </div>

            <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4 mb-4">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs text-amber-300 font-bold">👥 Utilizadores Registados</h3>
                 <button onClick={fetchUsers} className="text-[10px] text-amber-400 border border-amber-500/30 px-2 py-1 rounded hover:bg-amber-500/20">🔄 Atualizar</button>
               </div>
               
               <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                 {usersDb.map((u, i) => (
                   <div key={i} className="flex justify-between items-center bg-[#141418] p-3 rounded-xl border border-zinc-800">
                     <div className="flex flex-col">
                       <div className="flex items-center">
                         <span className="text-amber-500/60 font-mono text-[10px] mr-1">#{u.id}</span>
                         <span className="text-white text-xs font-bold">{u.username}</span>
                         {u.is_admin && <span className="ml-1 bg-amber-500 text-black font-black text-[8px] px-1 py-0.5 rounded">ADMIN</span>}
                       </div>
                       <span className="text-amber-400 text-xs mt-1">R$ {Number(u.balance).toLocaleString('pt-BR')}</span>
                     </div>
                     <button onClick={() => handleDeleteUser(u.id, u.username)} className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all" title="Excluir Conta Permanentemente">🗑️</button>
                   </div>
                 ))}
               </div>
            </div>
            <button onClick={() => setIsAdminPanelOpen(false)} className="w-full bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs">Fechar Painel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
