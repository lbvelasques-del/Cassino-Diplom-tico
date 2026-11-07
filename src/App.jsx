import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(150000);
  const [betAmount, setBetAmount] = useState(30000);
  const [turbo, setTurbo] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winningLines, setWinningLines] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  
  // Autenticação
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Saques (Sistema Diplomacia)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // Painel Admin
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Símbolos oficiais do Diplomacia / Rede Pampas
  const symbols = [
    { id: 'petroleo', icon: '🛢️', name: 'Petróleo', mult: 5 },
    { id: 'banco', icon: '🏛️', name: 'Banco', mult: 4 },
    { id: 'brasil', icon: '🇧🇷', name: 'Brasil', mult: 3 },
    { id: 'costarica', icon: '🇨🇷', name: 'Costa Rica', mult: 8 },
    { id: 'pampas', icon: '🦌', name: 'Pampas', mult: 6 }
  ];

  const [grid, setGrid] = useState([
    symbols[0], symbols[1], symbols[2], 
    symbols[3], symbols[4], symbols[0], 
    symbols[1], symbols[2], symbols[3]
  ]);
  
  const bets = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

  // Verificador rigoroso de linhas, colunas e diagonais fechadas
  const checkWinningLines = (currentGrid) => {
    let lines = [];
    
    // Horizontais
    if (currentGrid[0].id === currentGrid[1].id && currentGrid[1].id === currentGrid[2].id) lines.push(0, 1, 2);
    if (currentGrid[3].id === currentGrid[4].id && currentGrid[4].id === currentGrid[5].id) lines.push(3, 4, 5);
    if (currentGrid[6].id === currentGrid[7].id && currentGrid[7].id === currentGrid[8].id) lines.push(6, 7, 8);

    // Verticais
    if (currentGrid[0].id === currentGrid[3].id && currentGrid[3].id === currentGrid[6].id) lines.push(0, 3, 6);
    if (currentGrid[1].id === currentGrid[4].id && currentGrid[4].id === currentGrid[7].id) lines.push(1, 4, 7);
    if (currentGrid[2].id === currentGrid[5].id && currentGrid[5].id === currentGrid[8].id) lines.push(2, 5, 8);

    // Diagonais
    if (currentGrid[0].id === currentGrid[4].id && currentGrid[4].id === currentGrid[8].id) lines.push(0, 4, 8);
    if (currentGrid[2].id === currentGrid[4].id && currentGrid[4].id === currentGrid[6].id) lines.push(2, 4, 6);

    return [...new Set(lines)];
  };

  const spin = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (balance < betAmount || spinning) return;
    
    setBalance(prev => prev - betAmount);
    setSpinning(true);
    setWinningLines([]);
    setLastWin(0);

    setTimeout(() => {
      const newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      setGrid(newGrid);
      setSpinning(false);

      const winningIndices = checkWinningLines(newGrid);
      if (winningIndices.length > 0) {
        const winningSymbol = newGrid[winningIndices[0]];
        const prize = betAmount * winningSymbol.mult;
        setBalance(prev => prev + prize);
        setLastWin(prize);
        setWinningLines(winningIndices);
      }
    }, turbo ? 250 : 700);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'register') {
      if (password !== confirmPassword) {
        setAuthError('As senhas não coincidem!');
        return;
      }
      if (password.length < 3) {
        setAuthError('A senha é muito curta.');
        return;
      }
    }

    if (username.trim() !== '') {
      const isAdministrator = username.toLowerCase() === 'admin';
      setUser({ name: username, isAdmin: isAdministrator });
      if (isAdministrator) {
        setBalance(99999999);
      } else {
        setBalance(150000);
      }
      setIsAuthOpen(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Insira um valor válido.');
      return;
    }
    if (amountNum > balance) {
      alert('Não tem saldo suficiente na conta para este saque.');
      return;
    }

    setBalance(prev => prev - amountNum);
    const newRequest = {
      id: Date.now(),
      user: user.name,
      amount: amountNum,
      status: 'Pendente no Jogo'
    };
    setWithdrawalRequests(prev => [newRequest, ...prev]);
    setWithdrawSuccess(true);
    setWithdrawAmount('');
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
          {user ? (
            <div className="flex items-center gap-2.5 bg-[#141418] border border-amber-500/30 px-3 py-1.5 rounded-2xl shadow-inner">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-[11px] text-amber-300 font-bold">{user.name}</span>
                  {user.isAdmin && (
                    <button 
                      onClick={() => setIsAdminOpen(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow transition-all"
                    >
                      ADMIN ⚙️
                    </button>
                  )}
                </div>
                <p className="text-amber-400 font-black text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button 
                onClick={() => {
                  if(!user) { setIsAuthOpen(true); return; }
                  setIsWithdrawOpen(true);
                  setWithdrawSuccess(false);
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                ↗️ Sacar
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

      {/* Banner Master Luminoso */}
      <div className="bg-gradient-to-r from-amber-950/60 via-[#121216] to-amber-950/60 border-y border-amber-500/30 py-2.5 px-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-bold tracking-wider">
          ✨ <span>PATROCINADOR MASTER OFICIAL • REDE PAMPAS & DIPLOMACIA</span> ✨
        </div>
      </div>

      {/* Jogo Principal (Grelha Dinâmica e Moderna) */}
      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        <div className="relative bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/40 rounded-3xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-black text-[10px] uppercase px-4 py-1 rounded-full shadow-lg border border-amber-300">
            🎰 Grelha Oficial VIP
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
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

        {/* Seletor de Aposta Moderno */}
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

        {/* Mensagem de Vitória por Linha Fechada */}
        {lastWin > 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/60 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
            <p className="text-xs text-amber-300 font-extrabold uppercase tracking-widest">🎉 LINHA VENCEDORA FECHADA!</p>
            <p className="text-amber-400 font-black text-xl drop-shadow-md">+ R$ {lastWin.toLocaleString('pt-BR')}</p>
          </div>
        )}

        {/* Botões de Ação (Girar e Turbo) */}
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
            disabled={spinning || (user && balance < betAmount)}
            onClick={spin}
            className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-lg py-4 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all border border-amber-200/50"
          >
            ▶️ {spinning ? 'A GIRAR...' : 'GIRAR'}
          </button>
        </div>
      </main>

      {/* Modal de Autenticação (Obrigatório para Jogar, Sem E-mail) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl shadow-amber-500/10">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1 tracking-wide">
              {authMode === 'login' ? 'Entrar no Cassino' : 'Criar Conta Oficial'}
            </h2>
            <p className="text-xs text-zinc-400 mb-6">Registe-se para começar a jogar e apostar</p>

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
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all" 
                  placeholder="Ex: seu_utilizador (admin para painel)" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Senha</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
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

              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                {authMode === 'login' ? 'Entrar na Plataforma' : 'Criar Nova Conta'}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  {authMode === 'login' ? 'Ainda não tem conta? Crie uma aqui' : 'Já tem conta? Faça login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Saque (Sistema Diplomacia: Saldo descontado para depósito no jogo) */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => { setIsWithdrawOpen(false); setWithdrawSuccess(false); }} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">🏦</div>
              <div>
                <h2 className="text-white font-bold text-lg">Resgate para o Diplomacia</h2>
                <p className="text-xs text-zinc-400">Transfira saldo do cassino para o jogo</p>
              </div>
            </div>

            {withdrawSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="text-4xl">✅</div>
                <h3 className="text-white font-bold text-base">Pedido de Saque Enviado!</h3>
                <p className="text-xs text-zinc-400">O valor foi debitado da sua conta do cassino e aguarda confirmação e depósito por parte do Administrador no jogo Diplomacia.</p>
                <button onClick={() => { setWithdrawSuccess(false); setIsWithdrawOpen(false); }} className="mt-4 w-full bg-amber-500 text-black font-black py-3 rounded-xl text-sm">Concluir</button>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-3.5 flex justify-between items-center">
                  <span className="text-xs text-zinc-400 font-medium">Saldo Disponível:</span>
                  <span className="text-amber-400 font-bold text-sm">R$ {balance.toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-semibold">Valor que deseja retirar</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value)} 
                    required 
                    className="w-full bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all" 
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-black py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all">
                  Solicitar Saque no Jogo
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Painel de Administrador Exclusivo */}
      {isAdminOpen && user && user.isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#141418] border-2 border-amber-500 w-full max-w-lg rounded-3xl p-6 relative shadow-[0_0_50px_rgba(245,158,11,0.2)] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center text-xl shadow-lg">⚙️</div>
              <div>
                <h2 className="text-amber-400 font-black text-xl">Painel de Administrador</h2>
                <p className="text-xs text-zinc-400">Gestão global de saques do Diplomacia</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs text-amber-300 font-bold uppercase tracking-wider">Pedidos de Saque Pendentes ({withdrawalRequests.length})</h3>
              
              {withdrawalRequests.length === 0 ? (
                <div className="bg-[#0b0b0e] border border-zinc-800/80 rounded-2xl p-6 text-center text-xs text-zinc-500">
                  Nenhum pedido de saque pendente de momento.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawalRequests.map((req) => (
                    <div key={req.id} className="bg-[#0b0b0e] border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white font-bold">Jogador: <span className="text-amber-400">{req.user}</span></p>
                        <p className="text-xs text-zinc-400">Valor: <span className="text-amber-300 font-bold">R$ {req.amount.toLocaleString('pt-BR')}</span></p>
                      </div>
                      <button 
                        onClick={() => {
                          setWithdrawalRequests(prev => prev.filter(item => item.id !== req.id));
                          alert(`Saque de R$ ${req.amount} para ${req.user} marcado como depositado no Diplomacia!`);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-3 py-2 rounded-xl shadow transition-all"
                      >
                        ✅ Depositar no Jogo
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
              <button onClick={() => setIsAdminOpen(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-xs transition-all">
                Fechar Painel Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
