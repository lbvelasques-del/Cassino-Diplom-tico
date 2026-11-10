import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import FutebolDiplomatico from './FutebolDiplomatico';
import CassinoCostaRica from './CassinoCostaRica';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeGame, setActiveGame] = useState(null); // 'futebol', 'cassino' ou null
  const [balance, setBalance] = useState(0);

  // Autenticação
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');

  // Modais
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamPrice, setTeamPrice] = useState('');

  // Estados Administrativos (ADM)
  const [admTargetUser, setAdmTargetUser] = useState('');
  const [admAmount, setAdmAmount] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('pampas_current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      fetchBalance(parsedUser.username);
    }
  }, []);

  const fetchBalance = async (user) => {
    if (!user) return;
    const { data } = await supabase.from('users').select('balance').eq('username', user).single();
    if (data) {
      setBalance(data.balance);
      const savedUser = JSON.parse(localStorage.getItem('pampas_current_user') || '{}');
      if (savedUser.username) {
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
  };// Funções do Modal de Perfil e Conta
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
      alert(`Clube colocado à venda por R$ ${price.toLocaleString('pt-BR')}!`);
      setTeamPrice('');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("ATENÇÃO: Deseja apagar a sua conta definitivamente?")) {
      const { error } = await supabase.from('users').delete().eq('username', currentUser.username);
      if (!error) handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pampas_current_user');
    window.location.reload();
  };

  // Funções Exclusivas do Administrador (LVelasques)
  const handleAdminInjectBalance = async () => {
    if (!admTargetUser || !admAmount) {
      alert("Preencha o utilizador e o valor.");
      return;
    }
    const amount = Number(admAmount);
    
    // Obter saldo atual do alvo
    const { data: targetData, error: targetError } = await supabase.from('users').select('balance').eq('username', admTargetUser).single();
    if (targetError || !targetData) {
      alert("Utilizador não encontrado!");
      return;
    }

    const newBalance = targetData.balance + amount;
    const { error } = await supabase.from('users').update({ balance: newBalance }).eq('username', admTargetUser);
    
    if (!error) {
      alert(`Injeção concluída! Novo saldo de ${admTargetUser}: R$ ${newBalance.toLocaleString('pt-BR')}`);
      setAdmTargetUser('');
      setAdmAmount('');
      if (admTargetUser === currentUser.username) fetchBalance(currentUser.username);
    } else {
      alert("Erro na operação administrativa.");
    }
  };

  // --- TELA DE LOGIN / REGISTO ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090b0a] flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-[#121614] p-8 rounded-3xl border border-emerald-900/50 w-full max-w-sm shadow-[0_0_40px_rgba(5,150,105,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 blur-3xl rounded-full"></div>
          
          <h2 className="text-2xl font-black text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 uppercase tracking-widest">
            {isLogin ? 'Painel de Acesso' : 'Fundar Clube'}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-4 relative z-10">
            <input type="text" placeholder="Utilizador" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#0a0c0b] text-white p-3.5 rounded-xl border border-emerald-900/30 outline-none focus:border-emerald-500 transition-colors" required />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0a0c0b] text-white p-3.5 rounded-xl border border-emerald-900/30 outline-none focus:border-emerald-500 transition-colors" required />
            {!isLogin && (
              <input type="text" placeholder="Nome do seu Clube" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-[#0a0c0b] text-white p-3.5 rounded-xl border border-emerald-900/30 outline-none focus:border-emerald-500 transition-colors" required />
            )}
            <button type="submit" className="w-full bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 text-black font-black p-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg mt-2">
              {isLogin ? 'Entrar na Rede' : 'Registrar'}
            </button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-xs text-zinc-500 hover:text-emerald-400 font-bold uppercase tracking-widest transition-colors relative z-10">
            {isLogin ? 'Não possui clube? Registe-se' : 'Já possui clube? Entre aqui'}
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.username?.toLowerCase() === 'lvelasques';

  // --- LOBBY PRINCIPAL DA REDE (INTERFACE PREMIUM CORRIGIDA) ---
  return (
    <div className="min-h-screen bg-[#050606] text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {!activeGame ? (
        <div className="max-w-md mx-auto p-4 space-y-6 animate-fade-in pt-6">
          
          {/* Cabeçalho do Lobby */}
          <div className="flex justify-between items-center bg-[#0d110f] p-5 rounded-3xl border border-emerald-900/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Painel Manager</p>
              <h1 className="text-xl font-black text-white">{currentUser.username} <span className="text-emerald-500 text-xs ml-1">#{currentUser.id || 1}</span></h1>
            </div>
            <div className="text-right flex items-center gap-4 relative z-10">
              <div>
                <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Patrimônio Base</p>
                <p className="text-sm font-black text-emerald-400">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setShowProfileModal(true)} className="bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-black w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors shadow-lg cursor-pointer">
                ⚙️
              </button>
            </div>
          </div>

          {/* Painel Administrativo Fixo no Lobby (Visível Apenas para o ADM) */}
          {isAdmin && (
            <div className="bg-[#120a0a] border border-red-900/50 p-4 rounded-3xl text-left shadow-xl">
              <div className="flex justify-between items-center border-b border-red-900/30 pb-2 mb-3">
                <h3 className="text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <span>⚡ Ferramentas de Administrador</span>
                </h3>
                <span className="text-[8px] bg-red-950 text-red-400 font-black px-2 py-0.5 rounded uppercase border border-red-800">Nível Deus</span>
              </div>
              <div className="space-y-3">
                <div className="bg-black/40 p-3 rounded-xl border border-red-900/20">
                  <p className="text-[10px] text-zinc-400 mb-2 font-bold uppercase tracking-wider">Injeção / Remoção de Saldo</p>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Utilizador Alvo" value={admTargetUser} onChange={(e) => setAdmTargetUser(e.target.value)} className="w-1/3 bg-[#0a0a0a] border border-zinc-800 text-white text-[10px] p-2.5 rounded-lg outline-none focus:border-red-500" />
                    <input type="number" placeholder="Valor (ex: 500000 ou -1000)" value={admAmount} onChange={(e) => setAdmAmount(e.target.value)} className="w-1/3 bg-[#0a0a0a] border border-zinc-800 text-white text-[10px] p-2.5 rounded-lg outline-none focus:border-red-500" />
                    <button onClick={handleAdminInjectBalance} className="w-1/3 bg-red-600 hover:bg-red-500 text-black font-black text-[10px] rounded-lg uppercase tracking-wider transition-colors cursor-pointer">Executar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {/* Jogo Principal: Futebol Diplomático */}
            <div>
              <h2 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-3 pl-3 border-l-2 border-emerald-500">Gestão Desportiva de Elite</h2>
              <button onClick={() => setActiveGame('futebol')} className="w-full text-left group relative overflow-hidden bg-[#0d1612] border border-emerald-800/40 rounded-[2rem] p-7 shadow-2xl hover:border-emerald-400 transition-all cursor-pointer">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 group-hover:bg-emerald-500/20 transition-all"></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-700/50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform">⚽</div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-emerald-300 transition-colors">Futebol Diplomático</h3>
                    <p className="text-[9px] text-emerald-500 font-black uppercase mt-1 tracking-widest leading-relaxed">Elenco • Táticas • Campeonato</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Área VIP: Cassino Costa Rica */}
            <div>
              <h2 className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-3 pl-3 border-l-2 border-amber-500 mt-4">Entretenimento & Apostas</h2>
              <button onClick={() => setActiveGame('cassino')} className="w-full text-left group relative overflow-hidden bg-[#16100a] border border-amber-900/40 rounded-[2rem] p-6 hover:border-amber-500 transition-all shadow-xl cursor-pointer">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 group-hover:bg-amber-500/20 transition-all"></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 bg-amber-950 border border-amber-700/50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">🎰</div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">Cassino Costa Rica</h3>
                    <p className="text-[8px] text-amber-600 font-black uppercase tracking-widest mt-1">Multiplique o seu patrimônio na área VIP</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (// --- TELA DE JOGO ATIVO ---
        <div className="relative animate-fade-in bg-[#050507] min-h-screen">
          <div className="fixed top-3 left-3 z-50">
            <button onClick={() => { setActiveGame(null); fetchBalance(currentUser.username); }} className="bg-black/90 backdrop-blur-md text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-900/50 transition-colors cursor-pointer">
              ⬅️ Voltar ao Painel
            </button>
          </div>
          
          {/* Renderização condicional do jogo selecionado */}
          {activeGame === 'futebol' && <FutebolDiplomatico />}
          {activeGame === 'cassino' && <CassinoCostaRica />}
        </div>
      )}

      {/* --- MODAL DE PERFIL E CONFIGURAÇÕES --- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0a0c0b] border border-emerald-900/40 p-6 rounded-3xl w-full max-w-sm relative shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-5 right-5 text-zinc-600 hover:text-white transition-colors text-xl font-black cursor-pointer">✕</button>

            <h3 className="text-xl font-black text-white">{currentUser.username} <span className="text-emerald-500 text-sm">(#{currentUser.id || 1})</span></h3>
            <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 p-2.5 rounded-xl text-center text-xs font-black mt-3 uppercase tracking-widest">
              Manager • {currentUser.team || "Clube Livre"}
            </div>

            <div className="space-y-5 mt-6">
              
              {/* Mercado de Clubes */}
              <div className="bg-[#111] p-4 rounded-2xl border border-emerald-900/30 shadow-inner">
                <h4 className="text-emerald-500 font-black text-xs mb-1 uppercase tracking-wider">Mercado de Clubes</h4>
                <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed font-bold">Defina um valor financeiro para o seu clube. Ele ficará disponível para aquisição na liga.</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Preço (R$)" value={teamPrice} onChange={(e) => setTeamPrice(e.target.value)} className="flex-1 bg-black text-white text-xs px-4 py-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" />
                  <button onClick={handleSellTeam} className="bg-emerald-600 hover:bg-emerald-500 text-black px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg cursor-pointer">Anunciar</button>
                </div>
              </div>

              {/* Alterar Senha */}
              <div className="bg-[#111] p-4 rounded-2xl border border-zinc-900/80 shadow-inner">
                <h4 className="text-zinc-400 font-black text-xs mb-3 uppercase tracking-wider">Segurança da Conta</h4>
                <div className="space-y-3">
                  <input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black text-white text-xs px-4 py-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" />
                  <input type="password" placeholder="Repetir nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-black text-white text-xs px-4 py-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 transition-colors" />
                  <button onClick={handleChangePassword} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl text-xs font-black transition-colors uppercase tracking-widest cursor-pointer mt-1">Atualizar Senha</button>
                </div>
              </div>

              {/* Ações Perigosas */}
              <div className="flex flex-col gap-3 pt-3 border-t border-zinc-900/80">
                <button onClick={handleLogout} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-black py-3.5 rounded-xl text-xs transition-colors uppercase tracking-widest cursor-pointer">
                  Desligar (Sair do Sistema)
                </button>
                <button onClick={handleDeleteAccount} className="w-full bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-500 font-black py-3.5 rounded-xl text-xs transition-colors uppercase tracking-widest cursor-pointer">
                  Apagar Conta Definitivamente
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
