import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tieduoyppbigsaxxjhfl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

const isSupabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY.startsWith('sb_');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function RoletaDiplomatica() {
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
  const [selectedBetType, setSelectedBetType] = useState('diamante'); // 'diamante', 'petroleo', 'pampas', 'brasil', 'costarica'
  const [spinning, setSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [winMessage, setWinMessage] = useState('');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Setores oficiais dispostos na roleta (10 setores no total)
  const wheelSectors = [
    { index: 0, name: 'Diamante', type: 'diamante', mult: 10, icon: '/diamante.png', color: 'from-amber-600 to-yellow-500' },
    { index: 1, name: 'Petróleo', type: 'petroleo', mult: 3, icon: '/petroleo.png', color: 'from-blue-700 to-cyan-600' },
    { index: 2, name: 'Pampas', type: 'pampas', mult: 2, icon: '/pampas.png', color: 'from-amber-500/80 to-yellow-600' },
    { index: 3, name: 'Brasil', type: 'brasil', mult: 4, icon: '/brasil.png', color: 'from-emerald-700 to-green-600' },
    { index: 4, name: 'Costa Rica', type: 'costarica', mult: 6, icon: '/costarica.png', color: 'from-blue-600 to-indigo-700' },
    { index: 5, name: 'Petróleo', type: 'petroleo', mult: 3, icon: '/petroleo.png', color: 'from-blue-700 to-cyan-600' },
    { index: 6, name: 'Pampas', type: 'pampas', mult: 2, icon: '/pampas.png', color: 'from-amber-500/80 to-yellow-600' },
    { index: 7, name: 'Brasil', type: 'brasil', mult: 4, icon: '/brasil.png', color: 'from-emerald-700 to-green-600' },
    { index: 8, name: 'Costa Rica', type: 'costarica', mult: 6, icon: '/costarica.png', color: 'from-blue-600 to-indigo-700' },
    { index: 9, name: 'Diamante', type: 'diamante', mult: 10, icon: '/diamante.png', color: 'from-amber-600 to-yellow-500' }
  ];

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

  const spinWheel = () => {
    if (!currentUser) return setIsAuthOpen(true);
    if (balance < betAmount || spinning) return;

    updateBalanceOnDb(currentUser.id, balance - betAmount);
    setSpinning(true);
    setWinMessage('');
    setLastResult(null);

    // Sortear o índice vencedor
    const winningIndex = Math.floor(Math.random() * wheelSectors.length);
    const result = wheelSectors[winningIndex];

    // Cada setor ocupa 36 graus (360 / 10)
    const degreesPerSector = 36;
    const extraSpins = 360 * 6; // 6 voltas completas para dar emoção
    const targetAngle = extraSpins + (winningIndex * degreesPerSector) + (degreesPerSector / 2);
    
    setRotationDegrees(prev => prev + targetAngle);

    setTimeout(() => {
      setLastResult(result);
      setSpinning(false);

      const isWinner = selectedBetType === result.type;

      if (isWinner) {
        const prize = betAmount * result.mult;
        updateBalanceOnDb(currentUser.id, balance - betAmount + prize);
        setWinMessage(`🎉 VITÓRIA! Acertaste em ${result.name} (+R$ ${prize.toLocaleString('pt-BR', {maximumFractionDigits: 0})})`);
      } else {
        setWinMessage(`❌ Não foi desta vez. Caiu em ${result.name}.`);
      }
    }, 3500); // Duração da animação em sincronia com o CSS
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const foundUser = usersDb.find(u => u.username.toLowerCase() === inputUsername.trim().toLowerCase() && u.password === inputPassword);
    if (foundUser) {
      setCurrentUser(foundUser);
      setBalance(Number(foundUser.balance));
      setIsAuthOpen(false);
      setInputUsername('');
      setInputPassword('');
    } else {
      setAuthError('Dados incorretos.');
    }
  };
    return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12 selection:bg-amber-500 selection:text-black">
      {/* Patrocinador Global no Topo */}
      <div className="py-6 px-4 text-center bg-black border-b border-zinc-900 flex flex-col items-center justify-center space-y-3">
        <img 
          src="/Grupopampas.png" 
          alt="Patrocinador Grupo Pampas" 
          className="h-14 w-auto max-w-[200px] object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
        />
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 drop-shadow-[0_5px_15px_rgba(245,158,11,0.6)]">
          🎡 ROLETA DIPLOMÁTICA 🎡
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">A Fortuna do Grupo Pampas</p>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 pt-5">
        <div className="bg-gradient-to-b from-[#14141a] to-[#0a0a0e] border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] space-y-5 text-center">
          
          {/* Nova Roda Visual Giratória Estilo Casino */}
          <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
            {/* Indicador / Seta Superior */}
            <div className="absolute -top-3 z-30 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>

            {/* Círculo Externo com Efeito Dourado */}
            <div className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] bg-[#0a0a0e] relative overflow-hidden flex items-center justify-center">
              
              {/* Roda Rotativa */}
              <div 
                className="absolute inset-2 rounded-full border border-amber-500/30 transition-all ease-out"
                style={{ 
                  transform: `rotate(${rotationDegrees}deg)`,
                  transitionDuration: spinning ? '3.5s' : '0s'
                }}
              >
                {wheelSectors.map((sector, idx) => {
                  const angle = idx * 36;
                  return (
                    <div 
                      key={idx} 
                      className="absolute top-0 left-1/2 w-12 h-1/2 -ml-6 origin-bottom flex flex-col items-center pt-3"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-black/60 border border-amber-400/50 flex items-center justify-center shadow-md">
                        <img src={sector.icon} alt={sector.name} className="w-5 h-5 object-contain" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Centro da Roleta */}
              <div className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 border-2 border-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.8)]">
                <span className="text-black font-black text-xs">PAMPAS</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-black text-amber-400">
              {spinning ? '🔄 A RODA ESTÁ A GIRAR...' : lastResult ? `Resultado: ${lastResult.name} (${lastResult.mult}x)` : 'FAÇA A SUA APOSTA E GIRE'}
            </p>
          </div>

          {winMessage && (
            <div className={`p-3 text-center rounded-xl font-black text-xs uppercase tracking-wide animate-pulse ${winMessage.includes('VITÓRIA') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
              {winMessage}
            </div>
          )}

          {/* Seleção de Valor da Aposta */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block">Valor da Aposta (R$)</label>
            <select disabled={spinning} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-[#18181e] text-amber-400 border border-zinc-700 rounded-xl px-3 py-2.5 font-black outline-none text-xs">
              <option value={30000}>R$ 30k</option>
              <option value={100000}>R$ 100k</option>
              <option value={500000}>R$ 500k</option>
              <option value={1000000}>R$ 1M</option>
            </select>
          </div>

          {/* Escolha do Símbolo / Setor de Aposta */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block">Escolha o Símbolo da Aposta</label>
            <div className="grid grid-cols-3 gap-2">
              <button disabled={spinning} onClick={() => setSelectedBetType('diamante')} className={`py-2 px-2 rounded-xl font-bold text-xs border flex flex-col items-center gap-1 transition-all ${selectedBetType === 'diamante' ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>
                <img src="/diamante.png" alt="Diamante" className="w-6 h-6 object-contain" />
                <span>Diamante (10x)</span>
              </button>
              <button disabled={spinning} onClick={() => setSelectedBetType('costarica')} className={`py-2 px-2 rounded-xl font-bold text-xs border flex flex-col items-center gap-1 transition-all ${selectedBetType === 'costarica' ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>
                <img src="/costarica.png" alt="Costa Rica" className="w-6 h-6 object-contain" />
                <span>Costa Rica (6x)</span>
              </button>
              <button disabled={spinning} onClick={() => setSelectedBetType('brasil')} className={`py-2 px-2 rounded-xl font-bold text-xs border flex flex-col items-center gap-1 transition-all ${selectedBetType === 'brasil' ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>
                <img src="/brasil.png" alt="Brasil" className="w-6 h-6 object-contain" />
                <span>Brasil (4x)</span>
              </button>
              <button disabled={spinning} onClick={() => setSelectedBetType('petroleo')} className={`py-2 px-2 rounded-xl font-bold text-xs border flex flex-col items-center gap-1 transition-all ${selectedBetType === 'petroleo' ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>
                <img src="/petroleo.png" alt="Petróleo" className="w-6 h-6 object-contain" />
                <span>Petróleo (3x)</span>
              </button>
              <button disabled={spinning} onClick={() => setSelectedBetType('pampas')} className={`py-2 px-2 rounded-xl font-bold text-xs border flex flex-col items-center gap-1 transition-all col-span-2 ${selectedBetType === 'pampas' ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg scale-105' : 'bg-[#18181e] text-zinc-300 border-zinc-800'}`}>
                <img src="/pampas.png" alt="Pampas" className="w-6 h-6 object-contain" />
                <span>Pampas (2x)</span>
              </button>
            </div>
          </div>

          {/* Botão de Rodar */}
          <button disabled={spinning} onClick={spinWheel} className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all active:scale-95">
            {spinning ? '🔄 A RODAR...' : '🎡 GIRAR A ROLETA'}
          </button>

        </div>
      </main>

      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
            <h2 className="text-amber-400 font-black text-xl mb-1">Entrar na Roleta Diplomática</h2>
            {authError && <div className="text-red-400 text-xs mb-3 font-semibold">{authError}</div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-4">
              <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Utilizador" />
              <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className="w-full bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Senha" />
              <button type="submit" className="w-full bg-amber-500 text-black font-black py-3.5 rounded-xl text-sm shadow-lg">Confirmar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
