import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Coins, LogOut, CheckCircle, XCircle, ShieldAlert, Star, Crown } from 'lucide-react';

const styles = `
  @keyframes spin-blur {
    0% { transform: translateY(0); filter: blur(0px); }
    50% { transform: translateY(-100%); filter: blur(4px); }
    100% { transform: translateY(0); filter: blur(0px); }
  }
  .animate-spin-fast { animation: spin-blur 0.15s linear infinite; }
  
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }
    50% { box-shadow: 0 0 35px rgba(255, 215, 0, 0.7); }
  }
  .glass-panel {
    background: rgba(10, 15, 30, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 215, 0, 0.25);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  }
  .gold-gradient {
    background: linear-gradient(135deg, #FFD700 0%, #FDF5E6 50%, #D4AF37 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .luxury-btn {
    background: linear-gradient(to bottom, #d4af37, #8a6311);
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.5);
    transition: all 0.3s ease;
    border: 1px solid #FFD700;
  }
  .luxury-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(212, 175, 55, 0.8);
    background: linear-gradient(to bottom, #FFD700, #aa8222);
  }
  .luxury-btn:disabled { opacity: 0.5; cursor: not-allowed; border-color: #555; }
`;
const SYMBOLS = [
  { id: 'S1', char: '🦆', weight: 40, payout: 1, name: 'Pato' },
  { id: 'S2', char: '🍞', weight: 30, payout: 3, name: 'Pão' },
  { id: 'S3', char: '🍷', weight: 15, payout: 5, name: 'Vinho' },
  { id: 'S4', char: '👮', weight: 10, payout: 10, name: 'Polícia' },
  { id: 'S5', char: '🇨🇷', weight: 4, payout: 25, name: 'Costa Rica' },
  { id: 'S6', char: '💎', weight: 1, payout: 100, name: 'Diamante' }
];

const generateReel = () => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const sym of SYMBOLS) {
    cumulative += sym.weight;
    if (rand <= cumulative) return sym;
  }
  return SYMBOLS[0];
};

const checkWinLines = (grid) => {
  const lines = [
    [grid[0], grid[1], grid[2]],
    [grid[3], grid[4], grid[5]],
    [grid[6], grid[7], grid[8]],
    [grid[0], grid[4], grid[8]],
    [grid[2], grid[4], grid[6]]
  ];
  let totalPayout = 0;
  lines.forEach((line) => {
    if (line[0].id === line[1].id && line[1].id === line[2].id) {
      totalPayout += line[0].payout;
    }
  });
  return { totalPayout };
};
const SponsorBadge = () => (
  <div className="flex justify-center mb-6 w-full pt-4">
    <div className="flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-black via-slate-900 to-black px-6 py-2 md:py-3 rounded-full border border-yellow-500/50 pulse-gold shadow-2xl">
      <Crown className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
      <span className="text-yellow-400 font-black tracking-[0.15em] uppercase text-xs md:text-sm text-center">
        Rede Pampas Patrocinador Master
      </span>
      <Crown className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
    </div>
  </div>
);

const TopNav = ({ balance, onLogout, onOpenFinance, isAdmin, onOpenAdmin }) => (
  <nav className="glass-panel sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center p-3 md:px-8 border-b-2 border-yellow-500/30">
    <h1 className="text-xl md:text-3xl font-black gold-gradient tracking-tighter mb-3 md:mb-0">
      CASSINO DA COSTA RICA
    </h1>
    <div className="flex items-center space-x-2 md:space-x-6 w-full md:w-auto justify-between md:justify-end">
      {isAdmin && (
        <button onClick={onOpenAdmin} className="text-yellow-500 hover:text-yellow-300 flex items-center font-bold bg-slate-900/80 px-3 py-2 rounded-lg border border-yellow-500/20">
          <ShieldAlert className="w-5 h-5 mr-1" /> Admin
        </button>
      )}
      <div className="flex items-center bg-black/80 px-3 py-2 rounded-xl border border-slate-700 shadow-inner">
        <Coins className="text-yellow-400 w-5 h-5 mr-2" />
        <span className="text-white font-black text-base md:text-lg">R$ {balance.toFixed(2)}</span>
      </div>
      <button onClick={onOpenFinance} className="luxury-btn px-4 md:px-6 py-2 rounded-xl text-white font-black uppercase text-xs md:text-sm">
        Sacar
      </button>
      <button onClick={onLogout} className="text-slate-400 hover:text-white p-2">
        <LogOut className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  </nav>
);
export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [balance, setBalance] = useState(0);
  const [grid, setGrid] = useState(Array(9).fill(SYMBOLS[0]));
  const [isSpinning, setIsSpinning] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  
  const [showFinance, setShowFinance] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pendingTransactions, setPendingTransactions] = useState([]);
  
  const [betAmount, setBetAmount] = useState(1);
    const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', authForm.username)
        .eq('password', authForm.password)
        .single();
        
      if (data) {
        setUser(data.username);
        setBalance(Number(data.balance));
        setIsAdmin(data.is_admin);
        setShowAuth(false);
      } else {
        alert('Dados incorretos. Verifica o utilizador e a senha.');
      }
    } catch (err) {
      alert('Erro de comunicação. Confirma a tua ligação.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('users').insert([{ 
          username: authForm.username, 
          password: authForm.password,
          balance: 0 
      }]);
      if (!error) {
        alert('Conta VIP criada com sucesso! Podes fazer login agora.');
        setAuthMode('login');
      } else {
        alert('Este nome de utilizador já existe.');
      }
    } catch (err) {
      alert('Erro ao criar conta.');
    }
  };
    const handleSpin = async () => {
    if (balance < betAmount) {
      return alert('Saldo insuficiente para esta aposta. Pede uma recarga manual ao Administrador.');
    }
    
    setIsSpinning(true);
    setWinMessage('');
    
    const newBalance = balance - betAmount;
    setBalance(newBalance);
    await supabase.from('users').update({ balance: newBalance }).eq('username', user);

    let spins = 0;
    const spinInterval = setInterval(() => {
      setGrid(Array(9).fill(0).map(() => generateReel()));
      spins++;
      if (spins > 12) {
        clearInterval(spinInterval);
        finishSpin(newBalance);
      }
    }, 80);
  };

  const finishSpin = async (currentBalance) => {
    const finalGrid = Array(9).fill(0).map(() => generateReel());
    setGrid(finalGrid);
    
    const { totalPayout } = checkWinLines(finalGrid);
    
    if (totalPayout > 0) {
      const winAmount = totalPayout * betAmount;
      const finalBalance = currentBalance + winAmount;
      setBalance(finalBalance);
      setWinMessage(`GANHASTE R$ ${winAmount.toFixed(2)}!`);
      await supabase.from('users').update({ balance: finalBalance }).eq('username', user);
    }
    setIsSpinning(false);
  };
    const handleWithdrawRequest = async () => {
    const amount = Number(withdrawAmount);
    if (amount <= 0 || amount > balance) {
      return alert('Valor inválido. Só podes sacar até ao limite do teu saldo atual.');
    }

    try {
      // O valor desaparece imediatamente da conta do utilizador
      const newBalance = balance - amount;
      
      await supabase.from('users').update({ balance: newBalance }).eq('username', user);
      await supabase.from('transactions').insert([{
        username: user,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        date: new Date().toISOString()
      }]);
      
      setBalance(newBalance);
      alert('Pedido de Saque enviado com sucesso! O valor foi retirado da tua conta e aguarda aprovação.');
      setWithdrawAmount('');
      setShowFinance(false);
    } catch (err) {
      alert('Falha ao pedir o saque. Tenta novamente mais tarde.');
    }
  };
    const fetchAdminData = async () => {
    const { data } = await supabase.from('transactions').select('*').eq('status', 'pending');
    if (data) setPendingTransactions(data);
  };

  useEffect(() => {
    if (isAdmin && showAdmin) fetchAdminData();
  }, [isAdmin, showAdmin]);

  const handleApproveTransaction = async (tx) => {
    await supabase.from('transactions').update({ status: 'approved' }).eq('id', tx.id);
    fetchAdminData();
    alert(`Saque de ${tx.username} aprovado definitivamente.`);
  };

  const handleRejectTransaction = async (tx) => {
    // Se o saque for rejeitado, o dinheiro volta para a conta do utilizador
    const { data: userData } = await supabase.from('users').select('balance').eq('username', tx.username).single();
    if (userData) {
      const refundedBalance = Number(userData.balance) + Number(tx.amount);
      await supabase.from('users').update({ balance: refundedBalance }).eq('username', tx.username);
    }
    await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);
    fetchAdminData();
    alert('Saque rejeitado. O valor foi devolvido ao jogador.');
  };
    if (showAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <style>{styles}</style>
        <div className="glass-panel p-8 md:p-12 rounded-[2rem] w-full max-w-md text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600"></div>
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
          <h1 className="text-3xl md:text-4xl font-black gold-gradient mb-8 leading-tight">
            CASSINO DA<br/>COSTA RICA
          </h1>
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            <input type="text" placeholder="Nome de Utilizador" className="w-full bg-slate-900/80 text-white p-4 rounded-xl border border-slate-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all" 
              value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required />
            <input type="password" placeholder="Palavra-passe" className="w-full bg-slate-900/80 text-white p-4 rounded-xl border border-slate-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all" 
              value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
            <button type="submit" className="w-full luxury-btn py-4 rounded-xl text-white font-black uppercase tracking-widest text-lg mt-4">
              {authMode === 'login' ? 'Entrar no Cassino' : 'Criar Conta VIP'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="mt-8 text-slate-400 hover:text-yellow-400 font-medium transition-colors">
            {authMode === 'login' ? 'Criar uma nova conta VIP' : 'Já tens conta? Entra aqui'}
          </button>
        </div>
      </div>
    );
    }
    return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white font-sans overflow-x-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <style>{styles}</style>
      <TopNav balance={balance} onLogout={() => setShowAuth(true)} onOpenFinance={() => setShowFinance(true)} isAdmin={isAdmin} onOpenAdmin={() => setShowAdmin(true)} />
      
      <main className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <SponsorBadge />
        
        <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] w-full max-w-2xl mb-8 relative shadow-2xl">
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 bg-black/60 p-4 md:p-8 rounded-[2rem] border-4 border-yellow-500/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
            {grid.map((sym, i) => (
              <div key={i} className={`flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl aspect-square text-5xl md:text-7xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),0_5px_15px_rgba(0,0,0,0.5)] border border-slate-700/50 ${isSpinning ? 'animate-spin-fast' : ''}`}>
                {sym.char}
              </div>
            ))}
          </div>
          
          {winMessage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-full font-black text-2xl md:text-4xl animate-bounce shadow-[0_0_50px_rgba(255,215,0,0.8)] z-20 whitespace-nowrap border-4 border-white text-center">
              {winMessage}
            </div>
          )}

          <div className="flex flex-col items-center space-y-6 md:space-y-8">
            <div className="flex items-center space-x-6 bg-slate-950 p-2 md:p-3 rounded-full border border-slate-700/50 w-full justify-between shadow-inner">
              <button onClick={() => setBetAmount(Math.max(1, betAmount - 1))} className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-full hover:bg-slate-700 font-black text-2xl text-slate-300 transition-colors">-</button>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] md:text-xs text-yellow-500/80 font-bold uppercase tracking-[0.2em] mb-1">Aposta</span>
                <span className="font-black text-2xl md:text-3xl text-white">R$ {betAmount}</span>
              </div>
              <button onClick={() => setBetAmount(betAmount + 1)} className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-full hover:bg-slate-700 font-black text-2xl text-slate-300 transition-colors">+</button>
            </div>
            <button onClick={handleSpin} disabled={isSpinning} className="luxury-btn w-full py-5 md:py-6 rounded-2xl text-2xl md:text-3xl font-black tracking-[0.2em] shadow-2xl uppercase">
              {isSpinning ? 'A Girar...' : 'GIRAR ROLOS'}
            </button>
          </div>
        </div>
      </main>

      {showFinance && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-lg">
          <div className="glass-panel p-8 rounded-[2rem] w-full max-w-md border border-yellow-500/40 relative">
            <button onClick={() => setShowFinance(false)} className="absolute top-5 right-5"><XCircle className="w-8 h-8 text-slate-500 hover:text-red-500 transition-colors" /></button>
            <h2 className="text-2xl md:text-3xl font-black gold-gradient mb-8 text-center uppercase tracking-widest">Painel de Saque</h2>
            <div className="bg-slate-900/80 p-5 rounded-2xl mb-6 border border-slate-700 flex flex-col items-center justify-center shadow-inner">
              <span className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-widest">Saldo Disponível</span>
              <span className="font-black text-4xl text-yellow-400">R$ {balance.toFixed(2)}</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 text-center">O valor será descontado imediatamente da tua conta para análise.</p>
            <input type="number" placeholder="Valor a sacar" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-black/50 p-5 rounded-xl border border-slate-600 mb-6 text-2xl font-bold text-white focus:border-yellow-500 outline-none text-center" />
            <button onClick={handleWithdrawRequest} className="w-full luxury-btn py-4 rounded-xl font-black uppercase tracking-widest text-lg">Solicitar Saque</button>
          </div>
        </div>
      )}

      {showAdmin && isAdmin && (
         <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-lg">
         <div className="glass-panel p-6 md:p-8 rounded-[2rem] w-full max-w-2xl border border-yellow-500/40 max-h-[85vh] overflow-y-auto relative">
           <button onClick={() => setShowAdmin(false)} className="absolute top-5 right-5 md:top-6 md:right-6"><XCircle className="w-8 h-8 text-slate-500 hover:text-red-500 transition-colors" /></button>
           <h2 className="text-2xl md:text-3xl font-black text-yellow-500 flex items-center mb-8 border-b border-slate-700/50 pb-5"><ShieldAlert className="mr-3 w-8 h-8"/> Admin VIP</h2>
           <h3 className="font-bold text-slate-400 mb-4 uppercase tracking-[0.1em] text-sm">Saques Pendentes</h3>
           <div className="space-y-4">
             {pendingTransactions.length === 0 ? <p className="text-slate-500 font-medium p-6 text-center bg-slate-900/50 rounded-2xl border border-slate-800">Sem pedidos de saque pendentes de momento.</p> : pendingTransactions.map(tx => (
               <div key={tx.id} className="bg-slate-900 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center border border-slate-700 shadow-lg">
                 <div className="text-center md:text-left mb-4 md:mb-0">
                    <p className="font-black text-white text-xl">{tx.username}</p>
                    <p className="text-yellow-400 font-bold mt-1 text-lg">Saque: R$ {Number(tx.amount).toFixed(2)}</p>
                 </div>
                 <div className="flex space-x-3 w-full md:w-auto">
                   <button onClick={() => handleApproveTransaction(tx)} className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 px-4 py-3 rounded-xl text-white font-bold flex items-center justify-center shadow-lg transition-all"><CheckCircle className="mr-2 w-5 h-5"/> Aprovar</button>
                   <button onClick={() => handleRejectTransaction(tx)} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 px-4 py-3 rounded-xl text-white font-bold flex items-center justify-center shadow-lg transition-all"><XCircle className="mr-2 w-5 h-5"/> Recusar</button>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
      )}
    </div>
  );
}
