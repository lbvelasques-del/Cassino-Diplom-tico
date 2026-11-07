import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Wallet, Trophy, User, ArrowUpRight, 
  RefreshCw, Zap, Award, Globe, Building2, 
  Coins, Lock, CheckCircle2, AlertCircle, HelpCircle, 
  ChevronRight, LogOut, Play, Settings, Menu, X, Landmark, DollarSign
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO SUPABASE ---
const supabaseUrl = 'https://exemplo.supabase.co';
const supabaseKey = 'exemplo-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);
// --- COMPONENTES DE EFEITOS VISUAIS E HEADER ---
const Header = ({ user, balance, onOpenAuth, onOpenWithdraw, onOpenManualDeposit }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[#26262b] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Coins className="w-6 h-6 text-black" />
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
              <p className="text-[10px] text-zinc-400 uppercase">Saldo</p>
              <p className="text-amber-400 font-bold text-sm">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <button 
              onClick={onOpenWithdraw}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-md shadow-amber-500/10 flex items-center gap-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Saque
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <User className="w-4 h-4" /> Entrar / Registar
          </button>
        )}
      </div>
    </header>
  );
};
// --- BANNER DE PATROCÍNIO E STATUS ---
const SponsorshipBanner = () => {
  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/40 border-y border-amber-500/20 py-2 px-4 text-center">
      <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold">
        <Award className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>REDE PAMPAS — PATROCINADOR MASTER OFICIAL</span>
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
      </div>
    </div>
  );
};
// --- GRELHA DO SLOT MACHINE DA COSTA RICA ---
const SlotGrid = ({ symbols, spinning, winEffect }) => {
  return (
    <div className="relative bg-gradient-to-b from-[#16161a] to-[#0a0a0c] border-2 border-amber-500/30 rounded-3xl p-4 shadow-2xl shadow-black/80">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider">
        ✨ Padrão VIP Costa Rica
      </div>

      <div className="grid grid-cols-3 gap-3 my-4">
        {symbols.map((sym, idx) => (
          <div 
            key={idx}
            className={`h-24 rounded-2xl bg-[#0d0d0f] border border-[#2a2a30] flex flex-col items-center justify-center text-3xl shadow-inner transition-all duration-300 ${
              spinning ? 'animate-bounce opacity-70 filter blur-[1px]' : ''
            } ${winEffect ? 'border-amber-400 shadow-amber-500/40 scale-105' : ''}`}
          >
            <span>{sym.icon}</span>
            <span className="text-[9px] text-zinc-400 mt-1 font-medium">{sym.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
// --- PAINEL DE ESCOLHA DE APOSTAS ---
const BetSelector = ({ betAmount, setBetAmount, balance, spinning }) => {
  const bets = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

  return (
    <div className="bg-[#121215] border border-[#26262b] rounded-2xl p-4 shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Escolha a Aposta</span>
        <span className="text-amber-400 font-bold text-sm">R$ {betAmount.toLocaleString('pt-BR')}</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {bets.map((val) => (
          <button
            key={val}
            disabled={spinning}
            onClick={() => setBetAmount(val)}
            className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
              betAmount === val 
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 scale-105' 
                : 'bg-[#1a1a20] text-zinc-300 border-[#2f2f38] hover:border-zinc-500'
            }`}
          >
            {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
          </button>
        ))}
      </div>
    </div>
  );
};
// --- MODAL DE SAQUE (SAQUE-ONLY INTeligente) ---
const WithdrawModal = ({ isOpen, onClose, balance, user }) => {
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (!pixKey || !amount || Number(amount) <= 0) return;
    if (Number(amount) > balance) {
      alert('Saldo insuficiente para este saque.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16161a] border border-[#2a2a30] w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Painel de Saques</h2>
            <p className="text-xs text-zinc-400">Levantamento rápido via PIX</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">Saque Solicitado com Sucesso!</h3>
            <p className="text-xs text-zinc-400 mt-1">O valor será transferido para a sua chave PIX em instantes.</p>
            <button 
              onClick={() => { setSuccess(false); onClose(); }}
              className="mt-6 w-full bg-amber-500 text-black font-bold py-3 rounded-xl text-sm"
            >
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Chave PIX</label>
              <input 
                type="text" 
                placeholder="CPF, E-mail ou Telefone"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                required
                className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Valor do Saque (Disponível: R$ {balance.toFixed(2)})</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 mt-2"
            >
              {loading ? 'A processar saque...' : 'Solicitar Saque PIX'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
// --- MODAL DE AUTENTICAÇÃO (ENTRAR / REGISTAR) ---
const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({ email });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16161a] border border-[#2a2a30] w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-white font-bold text-xl mb-1">{isLogin ? 'Entrar na Conta' : 'Criar Conta VIP'}</h2>
        <p className="text-xs text-zinc-400 mb-6">Plataforma Oficial Sincronizada - Rede Pampas</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Palavra-passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 mt-2"
          >
            {isLogin ? 'Entrar Agora' : 'Registar Conta'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-xs text-amber-400 hover:underline"
          >
            {isLogin ? 'Não tem conta? Registe-se aqui' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- COMPONENTE PRINCIPAL DO JOGO ---
const GameMain = () => {
  const [balance, setBalance] = useState(150000);
  const [betAmount, setBetAmount] = useState(30000);
  const [turbo, setTurbo] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winEffect, setWinEffect] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  const availableSymbols = [
    { icon: '🏛️', name: 'Banco' },
    { icon: '🇧🇷', name: 'Brasil' },
    { icon: '🌍', name: 'Mundo' },
    { icon: '🦌', name: 'Pampas' },
    { icon: '🧪', name: 'Laboratório' },
    { icon: '🇨🇷', name: 'Costa Rica' },
    { icon: '🛢️', name: 'Petróleo' }
  ];

  const [symbols, setSymbols] = useState([
    availableSymbols[0], availableSymbols[1], availableSymbols[2],
    availableSymbols[3], availableSymbols[0], availableSymbols[4],
    availableSymbols[5], availableSymbols[6], availableSymbols[0]
  ]);

  const spin = () => {
    if (balance < betAmount || spinning) return;

    setBalance(prev => prev - betAmount);
    setSpinning(true);
    setWinEffect(false);
    setLastWin(0);

    const spinDuration = turbo ? 400 : 900;

    setTimeout(() => {
      const newSyms = Array.from({ length: 9 }, () => 
        availableSymbols[Math.floor(Math.random() * availableSymbols.length)]
      );
      setSymbols(newSyms);
      setSpinning(false);

      // Lógica simples de vitória
      if (Math.random() > 0.55) {
        const prize = betAmount * (Math.random() > 0.8 ? 5 : 2);
        setBalance(prev => prev + prize);
        setLastWin(prize);
        setWinEffect(true);
      }
    }, spinDuration);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <SlotGrid symbols={symbols} spinning={spinning} winEffect={winEffect} />

      <BetSelector 
        betAmount={betAmount} 
        setBetAmount={setBetAmount} 
        balance={balance} 
        spinning={spinning} 
      />

      {lastWin > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 text-center animate-bounce">
          <p className="text-xs text-amber-300 font-semibold uppercase">🎉 Vitória Costa Rica!</p>
          <p className="text-amber-400 font-black text-lg">+ R$ {lastWin.toLocaleString('pt-BR')}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setTurbo(!turbo)}
          className={`py-4 px-5 rounded-2xl font-bold text-xs border transition-all ${
            turbo 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
              : 'bg-[#16161a] text-zinc-400 border-[#2a2a30]'
          }`}
        >
          <Zap className="w-5 h-5 mx-auto mb-1" />
          TURBO {turbo ? 'ON' : 'OFF'}
        </button>

        <button
          disabled={spinning || balance < betAmount}
          onClick={spin}
          className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-lg py-4 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-6 h-6 fill-current" />
          {spinning ? 'A GIRAR...' : 'GIRAR'}
        </button>
      </div>
    </div>
  );
};
// --- APLICAÇÃO CENTRALIZADA (APP) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(150000);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <Header 
        user={user} 
        balance={balance} 
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
      />
      <SponsorshipBanner />

      <main className="py-4">
        <GameMain />
      </main>

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />

      <WithdrawModal 
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        balance={balance}
        user={user}
      />
    </div>
  );
}
