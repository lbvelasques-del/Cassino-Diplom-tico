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

  // Grelha 5x3 = 15 posições
  const [grid, setGrid] = useState(Array(15).fill({ type: 'normal', icon: '👑' }));
  const [betAmount, setBetAmount] = useState(30000);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('Gire para encontrar 6 moedas!');
  
  // Estados do Bônus Hold & Win
  const [bonusMode, setBonusMode] = useState(false);
  const [respins, setRespins] = useState(3);

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
    const mults = [1, 1, 2, 2, 3, 5, 10, 20, 50]; // Multiplicadores possíveis da moeda
    const m = mults[Math.floor(Math.random() * mults.length)];
    return { type: 'coin', icon: '🪙', val: bet * m, mult: m };
  };

  const collectBonus = (finalGrid) => {
    const coins = finalGrid.filter(s => s.type === 'coin');
    const totalCoinValue = coins.reduce((acc, curr) => acc + curr.val, 0);
    const isGrand = coins.length === 15;
    const grandPrize = isGrand ? betAmount * 500 : 0; // GRAND JACKPOT = 500x a aposta
    const totalPrize = totalCoinValue + grandPrize;

    updateBalanceOnDb(currentUser.id, balance + totalPrize);
    setMessage(`🏆 BÔNUS CONCLUÍDO! Ganhaste R$ ${totalPrize.toLocaleString('pt-BR')} ${isGrand ? '🔥 GRAND JACKPOT! 🔥' : ''}`);
    setBonusMode(false);
    setSpinning(false);
  };

  const handleSpin = () => {
    if (!currentUser) return alert("Faça login para jogar!");
    if (!bonusMode && balance < betAmount) return alert("Saldo insuficiente!");
    if (spinning) return;

    setSpinning(true);
    
    if (!bonusMode) {
      updateBalanceOnDb(currentUser.id, balance - betAmount);
      setMessage('🎰 A girar rolos...');
    } else {
      setMessage('🔄 Respin ativo...');
    }

    setTimeout(() => {
      if (bonusMode) {
        // --- MODO BÔNUS (Respins) ---
        let newGrid = [...grid];
        let newCoinsLanded = false;
        
        for(let i=0; i<15; i++) {
          if (newGrid[i].type !== 'coin') { // Posições vazias rodam
            if (Math.random() < 0.15) { // 15% de chance de cair nova moeda
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
        setRespins(nextRespins);

        if (nextRespins === 0 || currentCoinsCount === 15) {
          setTimeout(() => collectBonus(newGrid), 1000); // Fim do Bônus
        } else {
          setMessage(newCoinsLanded ? '🪙 Nova Moeda! Respins resetados para 3!' : `Respins restantes: ${nextRespins}`);
          setSpinning(false);
        }

      } else {
        // --- MODO JOGO BASE ---
        let newGrid = [];
        for(let i=0; i<15; i++) {
          if (Math.random() < 0.12) { // 12% de chance de Moeda no jogo base
            newGrid.push(generateCoin(betAmount));
          } else {
            const syms = ['🍒', '🍇', '🔔', '💎', '👑'];
            newGrid.push({ type: 'normal', icon: syms[Math.floor(Math.random() * syms.length)] });
          }
        }
        setGrid(newGrid);

        // Verifica Linhas Horizontais (mínimo 3 iguais da esquerda)
        let lineWin = 0;
        const checkRow = (r) => {
          const start = r * 5;
          if (newGrid[start].type === 'normal' &&
              newGrid[start].icon === newGrid[start+1].icon &&
              newGrid[start+1].icon === newGrid[start+2].icon) {
            const mults = { '🍒': 1, '🍇': 2, '🔔': 4, '💎': 10, '👑': 20 };
            lineWin += betAmount * mults[newGrid[start].icon];
          }
        };
        checkRow(0); checkRow(1); checkRow(2); // Linha de cima, meio e baixo

        const coins = newGrid.filter(s => s.type === 'coin');
        
        if (coins.length >= 6) {
          // ATIVA O BÔNUS
          if (lineWin > 0) updateBalanceOnDb(currentUser.id, balance - betAmount + lineWin);
          setMessage(`🔥 HOLD & WIN ATIVADO! (${coins.length} Moedas) 🔥`);
          
          setTimeout(() => {
            setBonusMode(true);
            setRespins(3);
            // Limpa os símbolos normais, deixa só moedas
            setGrid(newGrid.map(s => s.type === 'coin' ? s : { type: 'blank', icon: '' }));
            setSpinning(false);
          }, 2000);
        } else {
          // NÃO DEU BÔNUS, SÓ AVALIA LINHAS
          if (lineWin > 0) {
            updateBalanceOnDb(currentUser.id, balance - betAmount + lineWin);
            setMessage(`✅ Ganhaste R$ ${lineWin.toLocaleString('pt-BR')} nas linhas!`);
          } else {
            setMessage('Tente novamente!');
          }
          setSpinning(false);
        }
      }
    }, 800);
  };
        return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <div className={`py-6 px-4 text-center border-b ${bonusMode ? 'bg-red-950 border-red-500' : 'bg-black border-zinc-900'} flex flex-col items-center justify-center space-y-3 transition-colors duration-500`}>
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500">
          O COFRE DO BARÃO
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
          {bonusMode ? (
            <span className="text-red-400 animate-pulse font-black">🔥 MODO BÔNUS ATIVO: {respins} RESPINS 🔥</span>
          ) : (
            'Pampas Hold & Win Slots'
          )}
        </p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-4">
        <div className={`border-2 rounded-3xl p-5 shadow-2xl space-y-4 text-center transition-colors duration-500 ${bonusMode ? 'bg-red-950/40 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-black border-amber-500/60'}`}>
          
          <div className="p-3 bg-black border border-amber-500/40 text-amber-400 text-center rounded-xl font-black text-xs uppercase tracking-wide h-10 flex items-center justify-center">
            {message}
          </div>

          {/* Grelha 5x3 do Caça-Níquel */}
          <div className="grid grid-cols-5 gap-1.5 p-2 bg-[#0a0a0e] border-2 border-zinc-800 rounded-xl shadow-inner">
            {grid.map((sym, i) => (
              <div key={i} className={`h-16 rounded-lg flex flex-col items-center justify-center text-3xl transition-all duration-300 ${sym.type === 'coin' ? 'bg-gradient-to-br from-yellow-300 to-amber-600 border-2 border-yellow-200 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : sym.type === 'blank' ? 'bg-black/50 border border-zinc-900' : 'bg-[#14141a] border border-zinc-800'}`}>
                {sym.icon}
                {sym.type === 'coin' && (
                  <span className="text-[8px] font-black text-black leading-none mt-1">
                    {sym.mult}x
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center bg-black border border-amber-500/30 rounded-2xl p-3">
            <div className="text-left">
              <span className="text-[9px] text-zinc-400 uppercase font-bold block">Aposta</span>
              <select disabled={spinning || bonusMode} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="bg-transparent text-amber-400 font-black outline-none text-xs appearance-none">
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

          <button 
            disabled={spinning} 
            onClick={handleSpin} 
            className={`w-full font-black text-sm py-4 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 ${bonusMode ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/50' : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black'}`}
          >
            {spinning ? 'A GIRAR...' : bonusMode ? '🔥 RESPIN 🔥' : '🎰 GIRAR'}
          </button>

        </div>
      </main>
    </div>
  );
}

