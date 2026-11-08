import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function PampasHiLo() {
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

  const [betAmount, setBetAmount] = useState(30000);
  const [gameActive, setGameActive] = useState(false);
  const [currentCard, setCurrentCard] = useState(null); // { value: 2-14, name: '7', suit: '♠' }
  const [nextCard, setNextCard] = useState(null);
  const [multiplier, setMultiplier] = useState(1.00);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState('');

  const suits = ['♠', '♥', '♦', '♣'];
  const cardNames = { 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'Ás' };

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
          return;
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

  const getRandomCard = () => {
    const val = Math.floor(Math.random() * 13) + 2; // 2 a 14
    const suit = suits[Math.floor(Math.random() * suits.length)];
    return { value: val, name: cardNames[val], suit };
  };

  const startGame = () => {
    if (!currentUser) return alert("Faça login para jogar!");
    if (balance < betAmount) return alert("Saldo insuficiente para iniciar o jogo!");

    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setGameActive(true);
    setMultiplier(1.20);
    setStreak(0);
    setCurrentCard(getRandomCard());
    setNextCard(null);
    setMessage('🃏 Carta na mesa! Adivinhe se a próxima será Mais Alta ou Mais Baixa.');
  };

  const guessCard = (guessType) => {
    if (!gameActive) return;

    const newCard = getRandomCard();
    setNextCard(newCard);

    let win = false;
    if (guessType === 'higher' && newCard.value >= currentCard.value) win = true;
    if (guessType === 'lower' && newCard.value <= currentCard.value) win = true;
    if (newCard.value === currentCard.value) win = true; // Empate favorece o jogador

    if (win) {
      const newStreak = streak + 1;
      const nextMult = parseFloat((multiplier * 1.35).toFixed(2));
      setStreak(newStreak);
      setMultiplier(nextMult);
      setCurrentCard(newCard);
      setMessage(`✅ ACerto! Sequência: ${newStreak}x | Multiplicador: ${nextMult}x`);
    } else {
      setGameActive(false);
      setMessage(`❌ ERROU! A carta era ${newCard.name} ${newCard.suit}. Aposta perdida.`);
    }
  };

  const cashOutHiLo = () => {
    if (!gameActive || streak === 0) return;
    const prize = Math.floor(betAmount * multiplier);
    updateBalanceOnDb(currentUser.id, balance + prize);
    setGameActive(false);
    setMessage(`🏆 LUCRO RESGATADO! +R$ ${prize.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`);
  };
    return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-3">
        <img 
          src="/Grupopampas.png" 
          alt="Patrocinador Grupo Pampas" 
          className="h-14 w-auto max-w-[200px] object-contain" 
        />
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500">
          🃏 PAMPAS HI-LO 🃏
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">A Adivinhação de Elite</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-4">
        <div className="bg-black border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
          
          {message && (
            <div className={`p-3 text-center rounded-xl font-black text-xs uppercase tracking-wide ${message.includes('ACerto') || message.includes('RESGATADO') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : message.includes('ERROU') ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-black text-amber-400 border border-amber-500/40'}`}>
              {message}
            </div>
          )}

          {/* Visualização da Carta na Mesa */}
          <div className="relative h-44 bg-black border-2 border-amber-500/50 rounded-2xl flex flex-col items-center justify-center p-4 shadow-inner">
            <span className="text-[10px] text-zinc-400 uppercase font-bold mb-2">Carta Atual (Sequência: {streak})</span>
            {currentCard ? (
              <div className="w-20 h-28 bg-[#141418] border-2 border-amber-400 rounded-xl flex flex-col items-center justify-between p-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span className="text-amber-400 font-black text-sm">{currentCard.name}</span>
                <span className="text-2xl text-amber-300">{currentCard.suit}</span>
                <span className="text-amber-400 font-black text-sm">{currentCard.name}</span>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 font-bold">Aguardando início...</div>
            )}
            <div className="mt-2 text-amber-400 font-black text-sm">
              Multiplicador: {multiplier.toFixed(2)}x
            </div>
          </div>

          {/* Seleção de Aposta */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] text-zinc-400 font-bold uppercase block">Valor da Aposta (R$)</label>
            <select disabled={gameActive} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-black text-amber-400 border border-zinc-800 rounded-xl px-3 py-2.5 font-black outline-none text-xs">
              <option value={30000}>R$ 30k</option>
              <option value={100000}>R$ 100k</option>
              <option value={500000}>R$ 500k</option>
              <option value={1000000}>R$ 1M</option>
            </select>
          </div>

          {/* Controles de Jogo */}
          {!gameActive ? (
            <button onClick={startGame} className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95">
              🃏 INICIAR HI-LO
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => guessCard('higher')} className="py-3.5 bg-black border border-emerald-500/60 hover:bg-emerald-500 hover:text-black rounded-xl font-black text-xs text-emerald-400 transition-all shadow-md">
                  📈 MAIS ALTA (HIGHER)
                </button>
                <button onClick={() => guessCard('lower')} className="py-3.5 bg-black border border-red-500/60 hover:bg-red-500 hover:text-black rounded-xl font-black text-xs text-red-400 transition-all shadow-md">
                  📉 MAIS BAIXA (LOWER)
                </button>
              </div>

              {streak > 0 && (
                <button onClick={cashOutHiLo} className="w-full bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(16,185,129,0.4)] animate-bounce transition-all">
                  💰 RESGATAR (R$ {(betAmount * multiplier).toLocaleString('pt-BR', {maximumFractionDigits: 0})})
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
