import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  // === ESTADOS DO JOGO E CONTAS ===
  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(0);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Estados Admin e Utilizador
  const [usersDb, setUsersDb] = useState([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminTargetUser, setAdminTargetUser] = useState('');
  const [adminDepositAmount, setAdminDepositAmount] = useState('');
  
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // === LIGAÇÃO AO SUPABASE ===
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('username', { ascending: true });
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

  // Função Principal de Login e Registo (Com Alertas de Erro)
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

      // Verifica se já existe
      const { data: existing, error: errExist } = await supabase.from('users').select('*').ilike('username', trimmedUser);
      if (errExist) {
        alert('Erro ao consultar Supabase: ' + errExist.message);
        return;
      }
      if (existing && existing.length > 0) {
        setAuthError('Este nome já está em uso.');
        return;
      }

      const newUser = {
        username: trimmedUser,
        password: inputPassword,
        balance: 150000,
        is_admin: trimmedUser.toLowerCase() === 'lvelasques' // A tua conta admin
      };

      const { data, error } = await supabase.from('users').insert([newUser]).select();
      if (error) {
        alert('ERRO AO REGISTAR NO SUPABASE: ' + error.message);
        setAuthError('Erro ao criar conta no servidor: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert('Aviso: O registo foi enviado mas não retornou dados.');
        return;
      }// Função do Administrador: Adicionar ou Remover Dinheiro
  const handleAdminBalanceUpdate = async (e, action) => {
    e.preventDefault();
    const amount = Number(adminDepositAmount);
    if (!adminTargetUser || amount <= 0) return;

    const targetUser = usersDb.find(u => u.username.toLowerCase() === adminTargetUser.toLowerCase());
    if (!targetUser) {
      alert('Utilizador não encontrado!');
      return;
    }

    const newBalance = action === 'add' ? Number(targetUser.balance) + amount : Number(targetUser.balance) - amount;
    
    const { error } = await supabase.from('users').update({ balance: newBalance }).eq('id', targetUser.id);
    if (error) {
      alert('Erro ao atualizar saldo: ' + error.message);
    } else {
      alert(`Saldo de ${targetUser.username} atualizado para R$ ${newBalance.toLocaleString('pt-BR')}`);
      setAdminDepositAmount('');
      setAdminTargetUser('');
      fetchUsers();
      if (currentUser.id === targetUser.id) {
        setBalance(newBalance);
        setCurrentUser({...currentUser, balance: newBalance});
      }
    }
  };

  // Função de Pedido de Saque
  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (amount > balance) {
      alert('Saldo insuficiente!');
      return;
    }
    setWithdrawalRequests([...withdrawalRequests, { id: Date.now(), user: currentUser.username, amount }]);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 3000);
    setWithdrawAmount('');
  };

  // === INTERFACE DO JOGO (RENDER) ===
  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white font-sans selection:bg-amber-500/30">
      
      {/* Cabeçalho */}
      <header className="bg-[#141418] border-b border-amber-500/20 px-6 py-4 flex justify-between items-center shadow-lg shadow-black/50">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 tracking-tight">
            REDE PAMPAS
          </h1>
          <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-[0.2em]">Cassino da Costa Rica</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!currentUser ? (
            <button 
              onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
            >
              ENTRAR / REGISTAR
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs text-zinc-400 font-bold">{currentUser.username}</p>
                <p className="text-sm text-amber-400 font-black">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button 
                onClick={() => setIsUserPanelOpen(true)}
                className="w-10 h-10 bg-[#1a1a20] border border-amber-500/30 rounded-xl flex items-center justify-center text-lg hover:bg-amber-500/10 transition-all"
              >
                👤
              </button>
              {currentUser.is_admin && (
                <button 
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black text-lg shadow-lg hover:bg-amber-400 transition-all"
                >
                  ⚙️
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Área Central (Cassino) */}
      <main className="max-w-4xl mx-auto p-6 mt-10">
        <div className="bg-[#141418] border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-4">Bem-vindo ao Cassino!</h2>
          <p className="text-zinc-400 mb-8">Faça login para jogar e testar a sua sorte na Costa Rica.</p>
          
          <div className="w-64 h-64 mx-auto bg-[#0b0b0e] border-4 border-amber-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <span className="text-6xl">🎰</span>
          </div>
          
          <div className="mt-8">
            <button className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xl px-12 py-4 rounded-2xl shadow-lg shadow-amber-500/20 opacity-50 cursor-not-allowed">
              GIRAR ROLETA
            </button>
            <p className="text-xs text-zinc-500 mt-3">(Área de jogo em construção. Já podes criar conta e gerir o dinheiro no Admin!)</p>
          </div>
        </div>
      </main>{/* === MODAIS DE REGISTO E PAINEIS === */}
      
      {/* Modal de Autenticação */}
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
                  💰 Gestão de Saldo de Utilizadores
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
                            setWithdrawalRequests(prev => prev.filter(item => item.id !== req.id));
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

              {/* Lista Online de Contas no Supabase com botão de refresh */}
              <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                    👥 Utilizadores Registados ({usersDb.length})
                  </h3>
                  <button 
                    onClick={fetchUsers}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all"
                  >
                    🔄 Atualizar Lista
                  </button>
                </div>
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

export default App;
