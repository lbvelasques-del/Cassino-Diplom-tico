import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  // === ESTADOS DO JOGO E CONTAS ===
  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(0);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Estados Admin (Agora a usar o ID)
  const [usersDb, setUsersDb] = useState([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminTargetId, setAdminTargetId] = useState(''); // Mudámos de Nome para ID
  const [adminDepositAmount, setAdminDepositAmount] = useState('');
  
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // Estados da Roleta (Slot Machine)
  const symbols = ['🍒', '🍋', '💎', '🔔', '7️⃣'];
  const [slots, setSlots] = useState(['🎰', '🎰', '🎰']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinMessage, setSpinMessage] = useState('');

  // === LIGAÇÃO AO SUPABASE ===
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
    if (!error && data) {
      setUsersDb(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetAuthForm = () => {
    setInputUsername('');
    setInputPassword('');
    setConfirmPassword('');
    setAuthError('');
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
      
      const created = data[0];
      setCurrentUser(created);
      setBalance(Number(created.balance));
      setIsAuthOpen(false);
      resetAuthForm();
      await fetchUsers();
      alert('Conta criada com sucesso!');
    } else {
      const { data, error } = await supabase.from('users').select('*').ilike('username', trimmedUser).eq('password', inputPassword);
      if (error) return alert('Erro Login: ' + error.message);
      if (!data || data.length === 0) return setAuthError('Utilizador ou senha incorretos.');
      
      const found = data[0];
      setCurrentUser(found);
      setBalance(Number(found.balance));
      setIsAuthOpen(false);
      resetAuthForm();
      await fetchUsers();
    }
  };// Função de Admin: Atualizar saldo usando o ID da Conta
  const handleAdminBalanceUpdate = async (e, action) => {
    e.preventDefault();
    const amount = Number(adminDepositAmount);
    if (!adminTargetId || amount <= 0) return;

    // Procura o utilizador pelo ID em vez do nome
    const targetUser = usersDb.find(u => String(u.id) === String(adminTargetId).trim());
    if (!targetUser) return alert('Nenhuma conta encontrada com este ID!');

    const newBalance = action === 'add' ? Number(targetUser.balance) + amount : Number(targetUser.balance) - amount;
    const { error } = await supabase.from('users').update({ balance: newBalance }).eq('id', targetUser.id);
    
    if (error) {
      alert('Erro: ' + error.message);
    } else {
      alert(`Saldo da conta ID #${targetUser.id} (${targetUser.username}) alterado para R$ ${newBalance.toLocaleString('pt-BR')}`);
      setAdminDepositAmount('');
      setAdminTargetId('');
      fetchUsers();
      if (currentUser && currentUser.id === targetUser.id) {
        setBalance(newBalance);
        setCurrentUser({...currentUser, balance: newBalance});
      }
    }
  };

  // NOVA FUNÇÃO: Excluir Conta do Supabase
  const handleDeleteUser = async (id, username) => {
    const confirmar = window.confirm(`ATENÇÃO! Tens a certeza que queres EXCLUIR a conta de ${username} (ID: ${id}) para sempre?`);
    if (!confirmar) return;

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir conta: ' + error.message);
    } else {
      alert(`Conta de ${username} excluída com sucesso!`);
      fetchUsers(); // Atualiza a lista automaticamente
    }
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (amount > balance) return alert('Saldo insuficiente!');
    setWithdrawalRequests([...withdrawalRequests, { id: Date.now(), user: currentUser.username, amount }]);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 3000);
    setWithdrawAmount('');
  };

  // === LÓGICA DO JOGO (ROLETA) ===
  const handleSpin = async () => {
    if (!currentUser) return alert("Faz login para jogar!");
    const betAmount = 500;
    if (balance < betAmount) return setSpinMessage("Saldo insuficiente! Custa R$ 500.");

    setIsSpinning(true);
    setSpinMessage("A girar...");

    const newBalance = balance - betAmount;
    setBalance(newBalance);
    setCurrentUser({...currentUser, balance: newBalance});
    await supabase.from('users').update({ balance: newBalance }).eq('id', currentUser.id);

    let counter = 0;
    const spinInterval = setInterval(() => {
       setSlots([
         symbols[Math.floor(Math.random() * symbols.length)],
         symbols[Math.floor(Math.random() * symbols.length)],
         symbols[Math.floor(Math.random() * symbols.length)]
       ]);
       counter++;
       if(counter > 10) {
          clearInterval(spinInterval);
          finishSpin(newBalance);
       }
    }, 100);
  };

  const finishSpin = async (currentBalance) => {
    const result = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    setSlots(result);
    setIsSpinning(false);

    let winnings = 0;
    if (result[0] === result[1] && result[1] === result[2]) {
       if (result[0] === '7️⃣') winnings = 50000;
       else if (result[0] === '💎') winnings = 20000;
       else winnings = 5000;
       setSpinMessage(`JACKPOT! Ganhaste R$ ${winnings.toLocaleString('pt-BR')}!`);
    } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
       winnings = 1000;
       setSpinMessage(`Boa! Ganhaste R$ ${winnings.toLocaleString('pt-BR')}!`);
    } else {
       setSpinMessage("Não foi desta vez...");
    }

    if (winnings > 0) {
       const finalBalance = currentBalance + winnings;
       setBalance(finalBalance);
       setCurrentUser({...currentUser, balance: finalBalance});
       await supabase.from('users').update({ balance: finalBalance }).eq('id', currentUser.id);
       fetchUsers();
    }
  };return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans selection:bg-amber-500/30">
      <header className="bg-[#141418] border-b border-amber-500/20 px-6 py-4 flex justify-between items-center shadow-lg shadow-black/50">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 tracking-tight">
            REDE PAMPAS
          </h1>
          <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-[0.2em]">Cassino da Costa Rica</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!currentUser ? (
            <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all">
              ENTRAR / REGISTAR
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs text-zinc-400 font-bold">{currentUser.username}</p>
                <p className="text-sm text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setIsUserPanelOpen(true)} className="w-10 h-10 bg-[#1a1a20] border border-amber-500/30 rounded-xl flex items-center justify-center text-lg hover:bg-amber-500/10">👤</button>
              {currentUser.is_admin && (
                <button onClick={() => setIsAdminPanelOpen(true)} className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black text-lg hover:bg-amber-400">⚙️</button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-10">
        <div className="bg-[#141418] border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-4">Bem-vindo ao Cassino!</h2>
          {!currentUser && <p className="text-zinc-400 mb-8">Faça login para jogar e testar a sua sorte na Costa Rica.</p>}
          
          <div className="w-72 h-32 mx-auto bg-[#0b0b0e] border-4 border-amber-500 rounded-2xl flex items-center justify-center gap-6 text-5xl shadow-[0_0_50px_rgba(245,158,11,0.2)] mb-2">
            <span className={isSpinning ? "animate-bounce" : ""}>{slots[0]}</span>
            <span className={isSpinning ? "animate-bounce delay-75" : ""}>{slots[1]}</span>
            <span className={isSpinning ? "animate-bounce delay-150" : ""}>{slots[2]}</span>
          </div>
          
          <p className="text-amber-400 font-bold text-lg h-8 mb-4">{spinMessage}</p>
          
          <div>
            <button 
              onClick={handleSpin}
              disabled={isSpinning || !currentUser}
              className={`bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xl px-12 py-4 rounded-2xl shadow-lg transition-all ${isSpinning || !currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
              {isSpinning ? 'A GIRAR...' : 'GIRAR ROLETA (R$ 500)'}
            </button>
            <div className="mt-6 flex justify-center gap-4 text-xs text-zinc-500 font-bold flex-wrap">
               <span className="bg-zinc-900 px-3 py-1 rounded-lg">2 Iguais: R$ 1.000</span>
               <span className="bg-zinc-900 px-3 py-1 rounded-lg">3 Iguais: R$ 5.000</span>
               <span className="bg-zinc-900 px-3 py-1 rounded-lg text-amber-500/70 border border-amber-500/20">JACKPOT: R$ 50.000</span>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE LOGIN/REGISTO */}
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

      {/* PAINEL ADMIN COM NOVAS FUNÇÕES */}
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
                     
                     <button 
                       onClick={() => handleDeleteUser(u.id, u.username)}
                       className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                       title="Excluir Conta Permanentemente"
                     >
                       🗑️
                     </button>
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
