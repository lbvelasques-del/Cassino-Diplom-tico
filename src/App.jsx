import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Coins, LogOut, CheckCircle, XCircle, ShieldAlert, Star } from 'lucide-react';

const styles = `
  @keyframes spin-blur {
    0% { transform: translateY(0); filter: blur(0px); }
    50% { transform: translateY(-100%); filter: blur(4px); }
    100% { transform: translateY(0); filter: blur(0px); }
  }
  .animate-spin-fast { animation: spin-blur 0.2s linear infinite; }
  
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }
    50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
  }
  .glass-panel {
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 215, 0, 0.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  }
  .gold-gradient {
    background: linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #FFF8DC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .luxury-btn {
    background: linear-gradient(to bottom, #d4af37, #aa8222);
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
    transition: all 0.3s ease;
  }
  .luxury-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.7);
  }
  .luxury-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const SYMBOLS = [
  { id: 'S1', char: '🦆', weight: 40, payout: 1, name: 'Pato' },
  { id: 'S2', char: '🍞', weight: 30, payout: 3, name: 'Pão' },
  { id: 'S3', char: '🍷', weight: 15, payout: 5, name: 'Vinho' },
  { id: 'S4', char: '👮', weight: 10, payout: 10, name: 'Polícia' },
  { id: 'S5', char: '🇨🇷', weight: 4, payout: 25, name: 'Passaporte' },
  { id: 'S6', char: '⭐', weight: 1, payout: 100, name: 'Estrela' }
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
  <div className="flex justify-center mb-8 w-full mt-4">
    <div className="flex items-center space-x-3 bg-gradient-to-r from-black via-slate-900 to-black px-8 py-3 rounded-full border border-yellow-500/40 pulse-gold shadow-2xl">
      <Star className="text-yellow-400 w-6 h-6 animate-pulse" fill="currentColor" />
      <span className="text-yellow-400 font-black tracking-widest uppercase text-sm md:text-base">
        Rede Pampas Patrocinador Master
      </span>
      <Star className="text-yellow-400 w-6 h-6 animate-pulse" fill="currentColor" />
    </div>
  </div>
);

const TopNav = ({ balance, onLogout, onOpenFinance, isAdmin, onOpenAdmin }) => (
  <nav className="glass-panel sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center p-4 md:px-8 border-b border-yellow-500/20">
    <h1 className="text-2xl md:text-3xl font-black gold-gradient tracking-tighter mb-4 md:mb-0">
      CASSINO DA COSTA RICA
    </h1>
    <div className="flex items-center space-x-3 md:space-x-6">
      {isAdmin && (
        <button onClick={onOpenAdmin} className="text-yellow-500 hover:text-yellow-300 flex items-center font-bold">
          <ShieldAlert className="w-5 h-5 mr-1" /> Admin
        </button>
      )}
      <div className="flex items-center bg-black/60 px-4 py-2 rounded-xl border border-slate-700/50 shadow-inner">
        <Coins className="text-yellow-400 w-6 h-6 mr-2" />
        <span className="text-white font-bold text-lg">R$ {balance.toFixed(2)}</span>
      </div>
      <button onClick={onOpenFinance} className="luxury-btn px-6 py-2 rounded-xl text-white font-black uppercase text-sm">
        Sacar
      </button>
      <button onClick={onLogout} className="text-slate-400 hover:text-white p-2">
        <LogOut className="w-6 h-6" />
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
  
  // Interface e Formulários
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showFinance, setShowFinance] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Saques e Gestão Admin
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pendingTransactions, setPendingTransactions] = useState([]);
  
  // Jogo
  const [betAmount, setBetAmount] = useState(1);
    const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await supabase
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
        alert('Dados incorretos. Verifica o teu utilizador.');
      }
    } catch (err) {
      alert('Erro de ligação ao servidor.');
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
        alert('Conta de Luxo criada! Faz login para acederes ao Cassino.');
        setAuthMode('login');
      }
    } catch (err) {
      alert('Utilizador já existe ou erro de rede.');
    }
  };
    const handleSpin = async () => {
    if (balance < betAmount) return alert('Saldo insuficiente. Pede um depósito manual ao administrador.');
    
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
      setWinMessage(`GRANDE VITÓRIA: R$ ${winAmount.toFixed(2)}!`);
      await supabase.from('users').update({ balance: finalBalance }).eq('username', user);
    }
    setIsSpinning(false);
  };
    const handleWithdrawRequest = async () => {
    const amount = Number(withdrawAmount);
    if (amount <= 0 || amount > balance) {
      return alert('Valor inválido ou maior que o teu saldo disponível.');
    }

    try {
      // Subtrai imediatamente o valor da conta (o dinheiro "desaparece")
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
      alert('Pedido de Saque enviado! O valor foi retido para avaliação.');
      setWithdrawAmount('');
      setShowFinance(false);
    } catch (err) {
      alert('Falha ao pedir o saque. Tenta de novo.');
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
    // Como o valor já saiu do saldo no pedido, só confirmamos a transação
    await supabase.from('transactions').update({ status: 'approved' }).eq('id', tx.id);
    fetchAdminData();
    alert('Saque aprovado! O dinheiro saiu definitivamente.');
  };

  const handleRejectTransaction = async (tx) => {
    // Rejeitado: O dinheiro tem de voltar à conta do utilizador
    const { data: userData } = await supabase.from('users').select('balance').eq('username', tx.username).single();
    if (userData) {
      const refundedBalance = Number(userData.balance) + Number(tx.amount);
      await supabase.from('users').update({ balance: refundedBalance }).eq('username', tx.username);
    }
    await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);
    fetchAdminData();
    alert('Saque rejeitado. O valor foi devolvido à conta do utilizador.');
  };
    if (showAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <style>{styles}</style>
        <div className="glass-panel p-10 rounded-3xl w-full max-w-md text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500"></div>
          <h1 className="text-4xl font-black gold-gradient mb-10 leading-tight">CASSINO DA<br/>COSTA RICA</h1>
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-6">
            <input type="text" placeholder="Utilizador" className="w-full bg-slate-900/50 text-white p-4 rounded-xl border border-slate-600 focus:border-yellow-500 outline-none transition-colors" 
              value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required />
            <input type="password" placeholder="Palavra-passe" className="w-full bg-slate-900/50 text-white p-4 rounded-xl border border-slate-600 focus:border-yellow-500 outline-none transition-colors" 
              value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
            <button type="submit" className="w-full luxury-btn py-4 rounded-xl text-white font-black uppercase tracking-widest text-lg shadow-lg">
              {authMode === 'login' ? 'Entrar no Cassino' : 'Criar Conta VIP'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="mt-6 text-slate-400 hover:text-yellow-400 font-medium">
            {authMode === 'login' ? 'Novo aqui? Regista-te' : 'Já és VIP? Entra aqui'}
          </button>
        </div>
      </div>
    );
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white font-sans overflow-x-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <style>{styles}</style>
      <TopNav balance={balance} onLogout={() => setShowAuth(true)} onOpenFinance={() => setShowFinance(true)} isAdmin={isAdmin} onOpenAdmin={() => setShowAdmin(true)} />
      
      <main className="max-w-3xl mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <SponsorBadge />
        
        <div className="glass-panel p-8 rounded-[2.5rem] w-full mb-8 relative shadow-2xl">
          <div className="grid grid-cols-3 gap-3 mb-8 bg-slate-950/80 p-6 rounded-3xl border-4 border-yellow-500/20 shadow-inner">
            {grid.map((sym, i) => (
              <div key={i} className={`flex items-center justify-center bg-slate-800/80 rounded-2xl aspect-square text-6xl shadow-[inset_0_-4px_10px_rgba(0,0,0,0.5)] border border-slate-600/30 ${isSpinning ? 'animate-spin-fast' : ''}`}>
                {sym.char}
              </div>
            ))}
          </div>
          
          {winMessage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-10 py-5 rounded-full font-black text-3xl animate-bounce shadow-[0_0_40px_rgba(255,215,0,0.8)] z-20 whitespace-nowrap border-4 border-white">
              {winMessage}
            </div>
          )}

          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-6 bg-slate-900 p-3 rounded-full border border-slate-700 w-full max-w-sm justify-between">
              <button onClick={() => setBetAmount(Math.max(1, betAmount - 1))} className="w-12 h-12 bg-slate-700 rounded-full hover:bg-slate-600 font-black text-xl flex items-center justify-center">-</button>
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aposta</span>
                <span className="font-black text-2xl text-yellow-400">R$ {betAmount}</span>
              </div>
              <button onClick={() => setBetAmount(betAmount + 1)} className="w-12 h-12 bg-slate-700 rounded-full hover:bg-slate-600 font-black text-xl flex items-center justify-center">+</button>
            </div>
            <button onClick={handleSpin} disabled={isSpinning} className="luxury-btn w-full py-5 rounded-2xl text-3xl font-black tracking-[0.2em] shadow-xl uppercase">
              {isSpinning ? 'A Girar...' : 'GIRAR ROLOS'}
            </button>
          </div>
        </div>
      </main>

      {showFinance && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md border border-yellow-500/30 relative">
            <button onClick={() => setShowFinance(false)} className="absolute top-4 right-4"><XCircle className="w-8 h-8 text-slate-400 hover:text-red-500 transition-colors" /></button>
            <h2 className="text-3xl font-black gold-gradient mb-6">Saque de Ganhos</h2>
            <div className="bg-slate-900 p-4 rounded-xl mb-6 border border-slate-700 flex justify-between items-center">
              <span className="text-slate-400 font-bold">Disponível:</span>
              <span className="font-black text-2xl text-yellow-400">R$ {balance.toFixed(2)}</span>
            </div>
            <input type="number" placeholder="Valor a sacar" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-slate-950 p-4 rounded-xl border border-slate-600 mb-6 text-2xl font-bold text-white focus:border-yellow-500 outline-none" />
            <button onClick={handleWithdrawRequest} className="w-full luxury-btn py-4 rounded-xl font-black uppercase tracking-widest text-lg">Confirmar Saque</button>
          </div>
        </div>
      )}

      {showAdmin && isAdmin && (
         <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-md">
         <div className="glass-panel p-8 rounded-3xl w-full max-w-2xl border border-yellow-500/30 max-h-[85vh] overflow-y-auto relative">
           <button onClick={() => setShowAdmin(false)} className="absolute top-6 right-6"><XCircle className="w-8 h-8 text-slate-400 hover:text-red-500 transition-colors" /></button>
           <h2 className="text-3xl font-black text-yellow-500 flex items-center mb-8 border-b border-slate-700 pb-4"><ShieldAlert className="mr-3 w-8 h-8"/> Painel VIP Admin</h2>
           <h3 className="font-bold text-slate-300 mb-6 uppercase tracking-widest">Saques Pendentes:</h3>
           <div className="space-y-4">
             {pendingTransactions.length === 0 ? <p className="text-slate-500 font-medium p-4 text-center bg-slate-900 rounded-xl">Sem pedidos pendentes de momento.</p> : pendingTransactions.map(tx => (
               <div key={tx.id} className="bg-slate-900/80 p-5 rounded-2xl flex justify-between items-center border border-slate-700">
                 <div>
                    <p className="font-black text-white text-lg">{tx.username}</p>
                    <p className="text-yellow-400 font-bold">Solicitou: R$ {Number(tx.amount).toFixed(2)}</p>
                 </div>
                 <div className="flex space-x-3">
                   <button onClick={() => handleApproveTransaction(tx)} className="bg-green-600 hover:bg-green-500 px-4 py-3 rounded-xl text-white font-bold flex items-center shadow-lg"><CheckCircle className="mr-2"/> Aprovar</button>
                   <button onClick={() => handleRejectTransaction(tx)} className="bg-red-600 hover:bg-red-500 px-4 py-3 rounded-xl text-white font-bold flex items-center shadow-lg"><XCircle className="mr-2"/> Recusar</button>
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
