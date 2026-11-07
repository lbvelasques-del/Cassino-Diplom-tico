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

  // Painel Admin por ID e Exclusão
  const [usersDb, setUsersDb] = useState([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminTargetId, setAdminTargetId] = useState('');
  const [adminDepositAmount, setAdminDepositAmount] = useState('');
  
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // Símbolos temáticos originais do vosso layout
  const themeSymbols = [
    { name: 'Petróleo', icon: '🛢️', mult: 1.0 },
    { name: 'Banco', icon: '🏛️', mult: 1.2 },
    { name: 'Costa Rica', icon: '🇨🇷', mult: 3.0 },
    { name: 'Brasil', icon: '🇧🇷', mult: 2.0 },
    { name: 'Pampas', icon: '🦌', mult: 1.5 }
  ];

  // Grelha 3x3 original
  const [grid, setGrid] = useState([
    [themeSymbols[0], themeSymbols[0], themeSymbols[3]],
    [themeSymbols[1], themeSymbols[2], themeSymbols[3]],
    [themeSymbols[1], themeSymbols[4], themeSymbols[4]]
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [turboOn, setTurboOn] = useState(false);
  const [selectedBet, setSelectedBet] = useState(30000); // Aposta inicial padrão (30k)
  const [winMessage, setWinMessage] = useState('🎉 PRONTO PARA GIRAR!');

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
        balance: 180000, // Saldo inicial ajustado ao vosso layout
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

  // Mecânica de Giro Original
  const handleSpin = async () => {
    if (!currentUser) return alert("Faça login para jogar!");
    if (balance < selectedBet) return setWinMessage("Saldo insuficiente para esta aposta!");

    setIsSpinning(true);
    setWinMessage("A GIRAR OS CILINDROS...");

    const newBalance = balance - selectedBet;
    setBalance(newBalance);
    setCurrentUser({...currentUser, balance: newBalance});
    await supabase.from('users').update({ balance: newBalance }).eq('id', currentUser.id);

    const speed = turboOn ? 40 : 100;
    const limit = turboOn ? 6 : 12;

    let counter = 0;
    const spinInterval = setInterval(() => {
      setGrid([
        [themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)]],
        [themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)]],
        [themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)]]
      ]);
      counter++;
      if (counter > limit) {
        clearInterval(spinInterval);
        finalizeSpinResult(newBalance);
      }
    }, speed);
  };

  const finalizeSpinResult = async (currentBalance) => {
    const finalGrid = [
      [themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)]],
      [themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)]],
      [themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)], themeSymbols[Math.floor(Math.random() * themeSymbols.length)]]
    ];
    setGrid(finalGrid);
    setIsSpinning(false);

    // Simulação de vitória baseada na linha central
    let payout = 0;
    const middleRow = finalGrid[1];
    if (middleRow[0].name === middleRow[1].name && middleRow[1].name === middleRow[2].name) {
      payout = selectedBet * middleRow[0].mult * 2;
    } else if (middleRow[0].name === middleRow[1].name || middleRow[1].name === middleRow[2].name) {
      payout = selectedBet * 0.8;
    }

    if (payout > 0) {
      const victoryName = middleRow[1].name === 'Costa Rica' ? 'COSTA RICA' : 'REDE PAMPAS';
      setWinMessage(`🥳 VITÓRIA ${victoryName}! + R$ ${payout.toLocaleString('pt-BR')}`);
      const finalBalance = currentBalance + payout;
      setBalance(finalBalance);
      setCurrentUser({...currentUser, balance: finalBalance});
      await supabase.from('users').update({ balance: finalBalance }).eq('id', currentUser.id);
      fetchUsers();
    } else {
      setWinMessage("NÃO FOI DESTA VEZ, TENTE DE NOVO!");
    }
  };return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans selection:bg-amber-500/30 flex flex-col items-center pb-12">
      
      {/* CABEÇALHO SUPERIOR FIEL AO ORIGINAL */}
      <div className="w-full max-w-md bg-[#141418] border-b border-amber-500/20 px-5 py-4 flex justify-between items-center rounded-b-3xl shadow-lg mb-6">
        <div>
          <h1 className="text-sm font-black text-amber-400 tracking-wider">CASSINO DA COSTA RICA</h1>
          <p className="text-[9px] text-amber-500/70 font-bold uppercase tracking-widest">REDE PAMPAS PATROCINADOR MASTER</p>
        </div>
        
        <div className="flex items-center gap-2">
          {!currentUser ? (
            <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="bg-amber-500 text-black font-black text-xs px-4 py-2 rounded-xl shadow">ENTRAR</button>
          ) : (
            <div className="bg-[#0b0b0e] border border-amber-500/40 px-3 py-1.5 rounded-2xl flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 font-bold truncate max-w-[90px]">{currentUser.username}</p>
                <p className="text-xs text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setIsUserPanelOpen(true)} className="bg-amber-500 text-black font-black text-xs px-3 py-1.5 rounded-xl shadow hover:bg-amber-400">Saque</button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md px-4 space-y-4">
        
        {/* GRELHA 3x3 ESTILO ORIGINAL */}
        <div className="bg-[#141418] border border-amber-500/30 rounded-3xl p-4 shadow-2xl">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {grid.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div key={`${rIdx}-${cIdx}`} className="h-28 bg-[#0b0b0e] border border-amber-500/20 rounded-2xl flex flex-col items-center justify-center shadow-inner relative">
                  <span className={`text-4xl mb-2 ${isSpinning ? 'animate-pulse scale-110' : ''}`}>{cell.icon}</span>
                  <span className="text-[10px] text-zinc-400 font-bold">{cell.name}</span>
                </div>
              ))
            )}
          </div>
          
          {/* MENSAGEM DE VITÓRIA / ESTADO */}
          <div className="bg-[#0b0b0e] border border-amber-500/40 rounded-2xl py-3 px-4 text-center shadow-inner">
            <p className="text-amber-400 font-black text-xs tracking-wide">{winMessage}</p>
          </div>
        </div>

        {/* ESCOLHA A APOSTA (BOTÕES FIÉIS AO ORIGINAL) */}
        <div className="bg-[#141418] border border-amber-500/30 rounded-3xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ESCOLHA A APOSTA</span>
            <span className="text-xs font-black text-amber-400">R$ {selectedBet.toLocaleString('pt-BR')}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000].map((val) => {
              const label = val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`;
              return (
                <button
                  key={val}
                  onClick={() => setSelectedBet(val)}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all border ${selectedBet === val ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-[#0b0b0e] text-zinc-300 border-zinc-800 hover:border-zinc-700'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTÃO TURBO E BOTÃO GIRAR PRINCIPAL */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTurboOn(!turboOn)}
            className={`flex-1 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border transition-all ${turboOn ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-[#141418] text-zinc-400 border-zinc-800'}`}
          >
            ⚡ TURBO {turboOn ? 'ON' : 'OFF'}
          </button>
          
          <button 
            onClick={handleSpin}
            disabled={isSpinning || !currentUser}
            className={`flex-[2] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-black font-black text-lg py-4 rounded-2xl shadow-lg transition-all ${isSpinning || !currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]'}`}
          >
            {isSpinning ? 'A GIRAR...' : '▶ GIRAR'}
          </button>
        </div>

      </div>

      {/* MODAL DE LOGIN / REGISTO */}
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

      {/* PAINEL DO UTILIZADOR / SAQUE */}
      {isUserPanelOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative">
            <button onClick={() => setIsUserPanelOpen(false)} className="absolute top-4 right-4 text-zinc-400">✕</button>
            <h2 className="text-white font-bold text-lg mb-1">{currentUser.username}</h2>
            <p className="text-xs text-zinc-400 mb-4">A tua ID Oficial: <span className="text-amber-400 font-mono font-bold">#{currentUser.id}</span></p>
            <div className="bg-[#0b0b0e] border border-zinc-800 p-4 rounded-2xl mb-4">
              <h3 className="text-xs text-amber-300 font-bold mb-3">Saque para Diplomacia</h3>
              {withdrawSuccess ? ( <p className="text-emerald-400 text-xs">✅ Pedido enviado com sucesso!</p> ) : (
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

      {/* PAINEL ADMIN (COM ID E EXCLUSÃO DE CONTAS) */}
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
