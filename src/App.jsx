import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import FutebolDiplomatico from './FutebolDiplomatico';
import CassinoCostaRica from './CassinoCostaRica'; // O nosso cassino integrado como passatempo

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeGame, setActiveGame] = useState(null); // 'futebol', 'cassino' ou null (Lobby)
  const [balance, setBalance] = useState(0);

  // Estados de Autenticação
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');

  // Estados do Perfil / Configurações / ADM
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamPrice, setTeamPrice] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('pampas_current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      fetchBalance(parsedUser.username);
    }
  }, []);

  const fetchBalance = async (user) => {
    const { data } = await supabase.from('users').select('balance').eq('username', user).single();
    if (data) {
      setBalance(data.balance);
      const savedUser = JSON.parse(localStorage.getItem('pampas_current_user'));
      if (savedUser) {
        localStorage.setItem('pampas_current_user', JSON.stringify({ ...savedUser, balance: data.balance }));
      }
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const { data } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single();
      if (data) {
        localStorage.setItem('pampas_current_user', JSON.stringify(data));
        setCurrentUser(data);
        setBalance(data.balance);
      } else {
        alert("Utilizador ou senha incorretos!");
      }
    } else {
      if (!username || !password || !teamName) {
        alert("Preencha todos os campos!");
        return;
      }
      const { data: existingUser } = await supabase.from('users').select('username').eq('username', username).single();
      if (existingUser) {
        alert("Nome de utilizador já em uso.");
        return;
      }
      const { data, error } = await supabase.from('users').insert([{ username, password, team: teamName, balance: 10000000 }]).select().single();
      if (!error && data) {
        localStorage.setItem('pampas_current_user', JSON.stringify(data));
        setCurrentUser(data);
        setBalance(data.balance);
      } else {
        alert("Erro ao criar conta.");
      }
    }
  };// Funções do Modal de Perfil e Mercado de Clubes
  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      alert("As senhas não coincidem ou estão vazias!");
      return;
    }
    const { error } = await supabase.from('users').update({ password: newPassword }).eq('username', currentUser.username);
    if (!error) {
      alert("Senha alterada com sucesso!");
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSellTeam = async () => {
    const price = Number(teamPrice);
    if (!price || price <= 0) {
      alert("Insira um valor válido para vender o time!");
      return;
    }
    const { error } = await supabase.from('users').update({ team_price: price }).eq('username', currentUser.username);
    if (!error) {
      alert(`Clube colocado à venda no Mercado por R$ ${price.toLocaleString('pt-BR')}!`);
      setTeamPrice('');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("ATENÇÃO: Deseja apagar a sua conta e perder o clube definitivamente?")) {
      const { error } = await supabase.from('users').delete().eq('username', currentUser.username);
      if (!error) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pampas_current_user');
    window.location.reload();
  };

  // --- TELA DE LOGIN / REGISTO ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-[#0a0a0e] p-6 rounded-3xl border border-emerald-900/40 w-full max-w-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 blur-3xl rounded-full"></div>
          
          <h2 className="text-2xl font-black text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 uppercase tracking-widest">
            {isLogin ? 'Painel de Acesso' : 'Fundar Clube'}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-4 relative z-10">
            <input type="text" placeholder="Utilizador" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#111] text-white p-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" required />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#111] text-white p-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" required />
            {!isLogin && (
              <input type="text" placeholder="Nome do seu Clube" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-[#111] text-white p-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" required />
            )}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black p-3 rounded-xl uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(5,150,105,0.4)]">
              {isLogin ? 'Entrar' : 'Registrar'}
            </button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-5 text-xs text-zinc-500 hover:text-emerald-400 font-bold uppercase tracking-widest transition-colors relative z-10">
            {isLogin ? 'Não possui clube? Registe-se' : 'Já possui clube? Entre aqui'}
          </button>
        </div>
      </div>
    );
  }

  // --- LOBBY PRINCIPAL DA REDE ---
  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {!activeGame ? (
        <div className="max-w-md mx-auto p-4 space-y-6 animate-fade-in">
          
          {/* Cabeçalho do Lobby */}
          <div className="flex justify-between items-center bg-gradient-to-r from-[#0a0a0e] to-[#0f1412] p-5 rounded-3xl border border-emerald-900/30 shadow-2xl">
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Painel Administrativo</p>
              <h1 className="text-xl font-black text-white">{currentUser.username} <span className="text-emerald-500 text-xs ml-1">(#{currentUser.id || 1})</span></h1>
            </div>
            <div className="text-right flex items-center gap-4">
              <div className="bg-black/50 px-3 py-1.5 rounded-xl border border-emerald-900/30">
                <p className="text-[8px] text-zinc-500 uppercase font-black">Patrimônio</p>
                <p className="text-sm font-black text-emerald-400">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setShowProfileModal(true)} className="bg-zinc-800/80 hover:bg-emerald-600 text-zinc-400 hover:text-black w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all">
                ⚙️
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Jogo Principal em Destaque */}
            <div>
              <h2 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-3 pl-2 border-l-2 border-emerald-500">Simulador Oficial</h2>
              <button onClick={() => setActiveGame('futebol')} className="w-full text-left group relative overflow-hidden bg-[#0a1210] border border-emerald-600/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(5,150,105,0.15)] hover:border-emerald-400 transition-all">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-all"></div>
                <span className="text-4xl block mb-3 drop-shadow-lg relative z-10">⚽</span>
                <h3 className="text-2xl font-black text-white tracking-tighter relative z-10 group-hover:text-emerald-300 transition-colors">Futebol Diplomático</h3>
                <p className="text-[10px] text-emerald-500/80 font-bold uppercase mt-1 tracking-widest relative z-10">Gestão de Elenco • Mercado • Táticas</p>
                <div className="mt-4 inline-block bg-emerald-600 text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-lg relative z-10">Entrar na Liga</div>
              </button>
            </div>

            {/* Passatempo VIP / Cassino */}
            <div>
              <h2 className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-3 pl-2 border-l-2 border-amber-500 mt-2">Área VIP / Passatempo</h2>
              <button onClick={() => setActiveGame('cassino')} className="w-full text-left group relative overflow-hidden bg-[#140e0a] border border-amber-900/40 rounded-3xl p-5 hover:border-amber-500 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <span className="text-3xl drop-shadow-md">🎰</span>
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">Cassino Costa Rica</h3>
                    <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">Multiplique o seu patrimônio</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (// --- TELA DE JOGO ATIVO ---
        <div className="relative animate-fade-in">
          <div className="fixed top-3 left-3 z-50">
            <button onClick={() => { setActiveGame(null); fetchBalance(currentUser.username); }} className="bg-black/90 backdrop-blur-md text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-900/50 transition-colors">
              ⬅️ Voltar ao Painel
            </button>
          </div>
          
          {activeGame === 'futebol' && <FutebolDiplomatico />}
          {activeGame === 'cassino' && <CassinoCostaRica />}
        </div>
      )}

      {/* --- O NOVO MODAL DE PERFIL (MERCADO DE CLUBES & SEGURANÇA) --- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0a0a0e] border border-emerald-900/40 p-6 rounded-3xl w-full max-w-sm relative shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-5 right-5 text-zinc-600 hover:text-white transition-colors text-xl font-black">✕</button>

            <h3 className="text-xl font-black text-white">{currentUser.username} <span className="text-emerald-500 text-sm">(#{currentUser.id || 1})</span></h3>
            <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 p-2.5 rounded-xl text-center text-xs font-black mt-3 uppercase tracking-widest">
              Manager • {currentUser.team || "Clube"}
            </div>

            <div className="space-y-5 mt-6">
              
              {/* 1. Vender o Time (Mercado) */}
              <div className="bg-black/60 p-4 rounded-2xl border border-emerald-900/30">
                <h4 className="text-emerald-500 font-black text-sm mb-1 uppercase tracking-wider">Mercado de Clubes</h4>
                <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed font-bold">Defina um valor para o seu clube. Ele ficará disponível para aquisição por outros managers.</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Preço (R$)" value={teamPrice} onChange={(e) => setTeamPrice(e.target.value)} className="flex-1 bg-[#111] text-white text-xs px-4 py-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" />
                  <button onClick={handleSellTeam} className="bg-emerald-600 hover:bg-emerald-500 text-black px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg cursor-pointer">Anunciar</button>
                </div>
              </div>

              {/* 2. Alterar Senha */}
              <div className="bg-black/60 p-4 rounded-2xl border border-zinc-900/80">
                <h4 className="text-zinc-400 font-black text-sm mb-3 uppercase tracking-wider">Segurança</h4>
                <div className="space-y-3">
                  <input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#111] text-white text-xs px-4 py-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" />
                  <input type="password" placeholder="Repetir nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#111] text-white text-xs px-4 py-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" />
                  <button onClick={handleChangePassword} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl text-xs font-black transition-colors uppercase tracking-widest cursor-pointer">Atualizar Senha</button>
                </div>
              </div>

              {/* 3. Desligar e Apagar */}
              <div className="flex flex-col gap-3 pt-3 border-t border-zinc-900/80">
                <button onClick={handleLogout} className="w-full bg-zinc-800/80 hover:bg-zinc-700 text-white font-black py-3.5 rounded-xl text-xs transition-colors uppercase tracking-widest cursor-pointer">
                  Desligar (Sair)
                </button>
                <button onClick={handleDeleteAccount} className="w-full bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-500 font-black py-3.5 rounded-xl text-xs transition-colors uppercase tracking-widest cursor-pointer">
                  Apagar Conta
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
