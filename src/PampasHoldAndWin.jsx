import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function PampasHoldAndWin() {
  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem('pampas_users_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [{ id: 1, username: 'LVelasques', password: 'Lucas123!', balance: 99999999, isAdmin: true }];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('pampas_current_user');
    return saved ? JSON.parse(saved).balance : 150000;
  });

  const [grid, setGrid] = useState(Array(15).fill({ type: 'normal', icon: '⚽' }));
  const [betAmount, setBetAmount] = useState(30000);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('Gire para encontrar 6 moedas!');
  
  const [bonusMode, setBonusMode] = useState(false);
  const [respins, setRespins] = useState(3);
  
  // Novo estado para guardar as posições que ganharam e destacá-las
  const [winningIndices, setWinningIndices] = useState([]);

  const fetchUsersDb = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          setUsersDb(data);
          localStorage.setItem('pampas_users_db', JSON.stringify(data));
          if (currentUser) {
            const updatedMe = data.find(u => u.id === currentUser.id);
            if (updatedMe) setBalance(Number(updatedMe.balance));
          }
        }
      } catch (e) { }
    }
  };

  useEffect(() => {
    fetchUsersDb();
    const interval = setInterval(fetchUsersDb, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('pampas_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('pampas_current_user');
  }, [currentUser]);

  const updateBalanceOnDb = async (userId, newBal) => {
    setBalance(newBal);
    setCurrentUser(prev => prev ? { ...prev, balance: newBal } : null);
    if (isSupabaseConfigured) {
      try { await supabase.from('users').update({ balance: newBal }).eq('id', userId); } catch (e) { }
    }
    setUsersDb(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, balance: newBal } : u);
      localStorage.setItem('pampas_users_db', JSON.stringify(updated));
      return updated;
    });
  };

  const generateCoin = (bet) => {
    const mults = [1, 1, 2, 2, 3, 5, 10, 20, 50]; 
    const m = mults[Math.floor(Math.random() * mults.length)];
    return { type: 'coin', icon: '🪙', val: bet * m, mult: m };
  };

  const collectBonus = (finalGrid) => {
    const coins = finalGrid.filter(s => s.type === 'coin');
    const totalCoinValue = coins.reduce((acc, curr) => acc + curr.val, 0);
    const isGrand = coins.length === 15;
    const grandPrize = isGrand ? betAmount * 500 : 0; 
    const totalPrize = totalCoinValue + grandPrize;

    updateBalanceOnDb(currentUser.id, balance + totalPrize);
    setMessage(`🏆 BÔNUS CONCLUÍDO! Ganhaste R$ ${totalPrize.toLocaleString('pt-BR')} ${isGrand ? '🔥 GRAND JACKPOT! 🔥' : ''}`);
    setBonusMode(false);
    setSpinning(false);
    setWinningIndices([]);
  };

  const handleSpin = () => {
    if (!currentUser) return alert("Faça login para jogar!");
    if (!bonusMode && balance < betAmount) return alert("Saldo insuficiente!");
    if (spinning) return;

    setSpinning(true);
    setWinningIndices([]); // Limpa o brilho da vitória anterior
    
    if (!bonusMode) {
      updateBalanceOnDb(currentUser.id, balance - betAmount);
      setMessage('🎰 A girar rolos...');
    } else {
      setMessage('🔄 Respin ativo...');
    }

    setTimeout(() => {
      if (bonusMode) {
        let newGrid = [...grid];
        let newCoinsLanded = false;
        
        for(let i=0; i<15; i++) {
          if (newGrid[i].type !== 'coin') { 
            if (Math.random() < 0.15) { 
              newGrid[i] = generateCoin(betAmount);
              newCoinsLanded = true;
            } else {
              newGrid[i] = { type: 'blank', icon: '' };
            }
          }
        }
        setGrid(newGrid);

        const currentCoinsCount = newGrid.filter(s => s.type === 'coin').length;
        const nextRespins = newCoinsLanded ? 3 : respins - 1;
        setRes
          return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      
      {/* Cabeçalho Todo Preto com Destaque Dourado */}
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-3">
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
          O COFRE DO BARÃO
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider">
          {bonusMode ? (
            <span className="text-amber-400 animate-pulse font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🔥 BÔNUS ATIVO: {respins} RESPINS 🔥</span>
          ) : (
            <span className="text-zinc-400">Pampas Hold & Win Slots</span>
          )}
        </p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-4">
        
        {/* Painel do Jogo - Black & Gold */}
        <div className="bg-black border-2 border-amber-500/60 rounded-3xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4 text-center relative overflow-hidden">
          
          {/* Caixa de Mensagem (Brilha quando ganha) */}
          <div className={`p-3 border text-center rounded-xl font-black text-xs uppercase tracking-wide h-10 flex items-center justify-center transition-all duration-300 ${winningIndices.length > 0 ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105' : 'bg-[#0a0a0e] border-amber-500/40 text-amber-400'}`}>
            {message}
          </div>

          {/* Grelha 5x3 do Caça-Níquel */}
          <div className="grid grid-cols-5 gap-1.5 p-2 bg-[#0a0a0e] border-2 border-zinc-800 rounded-xl shadow-inner relative z-10">
            {grid.map((sym, i) => {
              const isWinning = winningIndices.includes(i);
              
              // Lógica de CSS Dinâmico (Turbinar a Animação)
              let cellStyle = "h-16 rounded-lg flex flex-col items-center justify-center text-3xl transition-all duration-300 ";
              
              if (spinning) {
                // Efeito do rolo a girar (tremor e blur)
                cellStyle += "opacity-50 scale-95 blur-[1px] ";
              } else if (isWinning) {
                // Efeito de VITÓRIA (Pulsa, fica maior e com borda brilhante)
                cellStyle += "bg-amber-500/30 border-2 border-amber-300 shadow-[0_0_25px_rgba(253,230,138,0.9)] scale-110 z-20 ";
              } else if (sym.type === 'coin') {
                // Estilo da Moeda (Dourada)
                cellStyle += "bg-gradient-to-br from-yellow-300 to-amber-600 border-2 border-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.6)] ";
              } else if (sym.type === 'blank') {
                // Fundo apagado durante os respins
                cellStyle += "bg-black/50 border border-zinc-900 opacity-20 ";
              } else {
                // Símbolo Normal parado
                cellStyle += "bg-[#14141a] border border-zinc-800 ";
              }

              return (
                <div key={i} className={cellStyle}>
                  {sym.icon}
                  {sym.type === 'coin' && (
                    <span className="text-[8px] font-black text-black leading-none mt-1">
                      {sym.mult}x
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controlos e Jackpot */}
          <div className="flex justify-between items-center bg-[#0a0a0e] border border-amber-500/30 rounded-2xl p-3 relative z-10">
            <div className="text-left">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Aposta</span>
              <select disabled={spinning || bonusMode} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="bg-transparent text-amber-400 font-black outline-none text-xs appearance-none cursor-pointer">
                <option value={10000}>R$ 10k</option>
                <option value={30000}>R$ 30k</option>
                <option value={100000}>R$ 100k</option>
                <option value={500000}>R$ 500k</option>
              </select>
            </div>
            
            <div className="text-right">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Grand Jackpot</span>
              <span className="text-amber-400 font-black text-sm">R$ {(betAmount * 500).toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {/* Botão Principal */}
          <button 
            disabled={spinning} 
            onClick={handleSpin} 
            className={`w-full font-black text-sm py-4 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 relative z-10 ${bonusMode ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 text-white shadow-red-500/50 border border-red-400' : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black border border-yellow-300'}`}
          >
            {spinning ? 'A GIRAR...' : bonusMode ? '🔥 RESPIN 🔥' : '🎰 GIRAR'}
          </button>
          
        </div>
      </main>
    </div>
  );
      }
      
