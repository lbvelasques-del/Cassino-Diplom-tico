import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(150000);
  const [betAmount, setBetAmount] = useState(30000);
  const [turbo, setTurbo] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winEffect, setWinEffect] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  
  // Estados para o novo modal de Registo/Login simples (sem e-mail)
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const symbols = [
    { icon: '🏛️', name: 'Banco' },
    { icon: '🇧🇷', name: 'Brasil' },
    { icon: '🌍', name: 'Mundo' },
    { icon: '🦌', name: 'Pampas' },
    { icon: '🇨🇷', name: 'Costa Rica' },
    { icon: '🛢️', name: 'Petróleo' }
  ];

  const [grid, setGrid] = useState([
    symbols[0], symbols[1], symbols[2], 
    symbols[3], symbols[4], symbols[5], 
    symbols[0], symbols[1], symbols[2]
  ]);
  
  const bets = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

  const spin = () => {
    if (balance < betAmount || spinning) return;
    setBalance(prev => prev - betAmount);
    setSpinning(true);
    setWinEffect(false);
    setLastWin(0);

    setTimeout(() => {
      const newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      setGrid(newGrid);
      setSpinning(false);
      if (Math.random() > 0.5) {
        const prize = betAmount * 2;
        setBalance(prev => prev + prize);
        setLastWin(prize);
        setWinEffect(true);
      }
    }, turbo ? 300 : 800);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'register') {
      if (password !== confirmPassword) {
        setAuthError('As senhas não coincidem!');
        return;
      }
      if (password.length < 4) {
        setAuthError('A senha deve ter pelo menos 4 carateres.');
        return;
      }
    }

    // Validação do Admin ou Utilizador Simples
    if (username.trim() !== '') {
      if (username.toLowerCase() === 'admin') {
        setUser({ name: 'Admin', isAdmin: true });
        setBalance(99999999); // Saldo de Administrador
      } else {
        setUser({ name: username, isAdmin: false });
      }
      setIsAuthOpen(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans antialiased pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[#26262b] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black font-black">
            🪙
          </div>
          <div>
            <h1 className="text-amber-400 font-black text-sm tracking-wider uppercase">Cassino da Costa Rica</h1>
            <p className="text-[10px] text-zinc-400 font-medium">REDE PAMPAS PATROCINADOR MASTER</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3 bg-[#16161a] border border-[#2a2a30] px-3 py-1.5 rounded-xl">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-[10px] text-amber-400 font-bold">{user.name}</span>
                  {user.isAdmin && <span className="bg-amber-500 text-black text-[9px] font-black px-1 rounded">ADMIN</span>}
                </div>
                <p className="text-amber-400 font-bold text-sm">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button 
                onClick={() => setIsWithdrawOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
              >
                ↗️ Saque
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5"
            >
              👤 Entrar / Registar
            </button>
          )}
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/40 border-y border-amber-500/20 py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold">
          🏆 <span>REDE PAMPAS — PATROCINADOR MASTER OFICIAL</span>
        </div>
      </div>

      {/* Main Game */}
      <main className="max-w-md mx-auto p-4 space-y-4 pt-6">
        <div className="relative bg-gradient-to-b from-[#16161a] to-[#0a0a0c] border-2 border-amber-500/30 rounded-3xl p-4 shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow-md">
            ✨ Padrão VIP Costa Rica
          </div>
          <div className="grid grid-cols-3 gap-3 my-4">
            {grid.map((sym, idx) => (
              <div key={idx} className={`h-24 rounded-2xl bg-[#0d0d0f] border border-[#2a2a30] flex flex-col items-center justify-center text-3xl shadow-inner ${spinning ? 'animate-pulse opacity-60' : ''} ${winEffect ? 'border-amber-400 scale-105' : ''}`}>
                <span>{sym.icon}</span>
                <span className="text-[9px] text-zinc-400 mt-1 font-medium">{sym.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bet Selector */}
        <div className="bg-[#121215] border border-[#26262b] rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Escolha a Aposta</span>
            <span className="text-amber-400 font-bold text-sm">R$ {betAmount.toLocaleString('pt-BR')}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {bets.map((val) => (
              <button
                key={val}
                disabled={spinning}
                onClick={() => setBetAmount(val)}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${betAmount === val ? 'bg-amber-500 text-black border-amber-400 scale-105' : 'bg-[#1a1a20] text-zinc-300 border-[#2f2f38]'}`}
              >
                {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {lastWin > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 text-center animate-bounce">
            <p className="text-xs text-amber-300 font-semibold uppercase">🎉 Vitória Costa Rica!</p>
            <p className="text-amber-400 font-black text-lg">+ R$ {lastWin.toLocaleString('pt-BR')}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setTurbo(!turbo)}
            className={`py-4 px-5 rounded-2xl font-bold text-xs border transition-all ${turbo ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-[#16161a] text-zinc-400 border-[#2a2a30]'}`}
          >
            ⚡ TURBO {turbo ? 'ON' : 'OFF'}
          </button>

          <button
            disabled={spinning || balance < betAmount}
            onClick={spin}
            className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-lg py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            ▶️ {spinning ? 'A GIRAR...' : 'GIRAR'}
          </button>
        </div>
      </main>

      {/* Auth Modal (Login / Registo com repetição de senha, sem e-mail) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16161a] border border-[#2a2a30] w-full max-w-md rounded-3xl p-6 relative">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">✕</button>
            <h2 className="text-white font-bold text-xl mb-1">
              {authMode === 'login' ? 'Aceder à Conta' : 'Criar Conta Simples'}
            </h2>
            <p className="text-xs text-zinc-400 mb-6">Plataforma Oficial - Rede Pampas</p>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome de Utilizador</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm" 
                  placeholder="Ex: seu_utilizador (ou admin)" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Senha</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm" 
                  placeholder="••••••••" 
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Repetir Senha</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm" 
                    placeholder="••••••••" 
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg">
                {authMode === 'login' ? 'Entrar na Conta' : 'Registar Conta'}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
                  className="text-xs text-amber-400 hover:underline"
                >
                  {authMode === 'login' ? 'Não tem conta? Registe-se aqui' : 'Já tem conta? Faça login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16161a] border border-[#2a2a30] w-full max-w-md rounded-3xl p-6 relative">
            <button onClick={() => { setIsWithdrawOpen(false); setWithdrawSuccess(false); }} className="absolute top-4 right-4 text-zinc-400 hover:text-white">✕</button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">🏦</div>
              <div>
                <h2 className="text-white font-bold text-lg">Painel de Saques</h2>
                <p className="text-xs text-zinc-400">Levantamento rápido via PIX</p>
              </div>
            </div>

            {withdrawSuccess ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-white font-bold text-base">Saque Solicitado com Sucesso!</h3>
                <button onClick={() => { setWithdrawSuccess(false); setIsWithdrawOpen(false); }} className="mt-6 w-full bg-amber-500 text-black font-bold py-3 rounded-xl text-sm">Concluir</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setWithdrawSuccess(true); }} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Chave PIX</label>
                  <input type="text" placeholder="CPF, E-mail ou Telefone" value={pixKey} onChange={(e) => setPixKey(e.target.value)} required className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Valor do Saque (Disponível: R$ {balance.toFixed(2)})</label>
                  <input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm" />
                </div>
                <button type="submit" className="w-full bg-amber-500 text-black font-bold py-3.5 rounded-xl text-sm">Solicitar Saque PIX</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
