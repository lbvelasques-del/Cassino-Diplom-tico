import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Importação dos teus jogos (Podes adicionar outros se tiveres mais)
import FutebolDiplomatico from './FutebolDiplomatico';
// import CassinoCostaRica from './CassinoCostaRica'; 

export default function App() {
  // Estados Globais
  const [currentUser, setCurrentUser] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [balance, setBalance] = useState(0);

  // Estados de Autenticação (Login/Registo)
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');

  // Estados do NOVO Modal de Perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamPrice, setTeamPrice] = useState('');

  // Carregar utilizador ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('pampas_current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      fetchBalance(parsedUser.username);
    }
  }, []);

  // Atualizar saldo sempre que voltar ao lobby
  useEffect(() => {
    if (currentUser && !activeGame) {
      fetchBalance(currentUser.username);
    }
  }, [activeGame, currentUser]);

  const fetchBalance = async (user) => {
    const { data, error } = await supabase.from('users').select('balance').eq('username', user).single();
    if (data) {
      setBalance(data.balance);
      const savedUser = JSON.parse(localStorage.getItem('pampas_current_user'));
      if (savedUser) {
        localStorage.setItem('pampas_current_user', JSON.stringify({ ...savedUser, balance: data.balance }));
      }
    }
  };// Lógicas de Autenticação (Login/Registo)
  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single();
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
      const { data, error } = await supabase.from('users').insert([{ username, password, team: teamName, balance: 1000 }]).select().single();
      if (!error && data) {
        localStorage.setItem('pampas_current_user', JSON.stringify(data));
        setCurrentUser(data);
        setBalance(data.balance);
      } else {
        alert("Erro ao criar conta.");
      }
    }
  };

  // Funções do Novo Modal de Perfil
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
    } else {
      alert("Erro ao alterar senha.");
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
      alert(`Time colocado à venda por R$ ${price.toLocaleString('pt-BR')}!`);
      setTeamPrice('');
    } else {
      alert("Erro ao anunciar time.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("ATENÇÃO: Tem a certeza que deseja APAGAR a sua conta e perder o seu time? Esta ação não tem volta!");
    if (confirmDelete) {
      const { error } = await supabase.from('users').delete().eq('username', currentUser.username);
      if (!error) {
        localStorage.removeItem('pampas_current_user');
        window.location.reload();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pampas_current_user');
    window.location.reload();
  };// Se não estiver logado, mostra tela de login ou registo
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-[#0a0a0e] p-6 rounded-3xl border border-amber-500/30 w-full max-w-sm shadow-2xl">
          <h2 className="text-2xl font-black text-center mb-6 text-amber-500 uppercase tracking-wider">
            {isLogin ? 'Entrar na Rede' : 'Criar Conta'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="text" placeholder="Nome de utilizador" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black text-white p-3 rounded-xl border border-zinc-700 outline-none focus:border-amber-500" required />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black text-white p-3 rounded-xl border border-zinc-700 outline-none focus:border-amber-500" required />
            {!isLogin && (
              <input type="text" placeholder="Nome do seu Clube" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-black text-white p-3 rounded-xl border border-zinc-700 outline-none focus:border-amber-500" required />
            )}
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black p-3 rounded-xl uppercase transition-colors cursor-pointer">
              {isLogin ? 'Entrar' : 'Registar'}
            </button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-xs text-zinc-400 hover:text-white cursor-pointer">
            {isLogin ? 'Não tem conta? Registe-se' : 'Já tem conta? Entre aqui'}
          </button>
        </div>
      </div>
    );
  }

  // LOBBY E JOGOS (Logado)
  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans">
      
      {!activeGame ? (
        // --- LOBBY PRINCIPAL ---
        <div className="max-w-md mx-auto p-4 space-y-6">
          <div className="flex justify-between items-center bg-[#0a0a0e] p-4 rounded-2xl border border-amber-900/30 shadow-lg">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-black">Bem-vindo(a)</p>
              <h1 className="text-xl font-black text-amber-500">{currentUser.username}</h1>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black">Saldo Total</p>
                <p className="text-lg font-black text-emerald-400">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setShowProfileModal(true)} className="bg-amber-600 w-10 h-10 rounded-full flex items-center justify-center text-black font-black text-xl hover:scale-105 transition-transform shadow-lg cursor-pointer">
                ⚙️
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-emerald-500 font-black text-lg uppercase tracking-wider pl-2 border-l-4 border-emerald-500">
              Gestão Desportiva
            </h2>
            <button onClick={() => setActiveGame('futebol')} className="w-full bg-gradient-to-r from-emerald-900 to-emerald-700 border border-emerald-500/50 p-4 rounded-2xl text-left hover:scale-[1.02] transition-transform shadow-xl relative overflow-hidden cursor-pointer">
              <span className="text-3xl block mb-2">⚽</span>
              <h3 className="text-xl font-black text-white">Futebol Diplomático</h3>
              <p className="text-xs text-emerald-200 font-bold uppercase mt-1">Gerir equipa, mercado e táticas</p>
            </button>
            {/* NOTA: Os teus botões do Cassino Costa Rica e Roleta continuariam aqui debaixo se os tiveres! */}
          </div>
        </div>
      ) : (
        // --- TELA DE JOGO ATIVO ---
        <div className="relative">
          <div className="fixed top-2 left-2 z-50">
            <button onClick={() => { setActiveGame(null); fetchBalance(currentUser.username); }} className="bg-black/80 backdrop-blur-sm text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg cursor-pointer">
              ⬅️ Voltar ao Lobby
            </button>
          </div>
          
          {activeGame === 'futebol' && <FutebolDiplomatico />}
        </div>
      )}

      {/* --- O NOVO MODAL DE PERFIL (SEM SAQUE) --- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1115] border border-amber-900/30 p-6 rounded-3xl w-full max-w-sm relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer text-xl">✕</button>

            <h3 className="text-xl font-black text-white">{currentUser.username} <span className="text-amber-500 text-sm">(#{currentUser.id || 1})</span></h3>
            <div className="bg-emerald-900/30 border border-emerald-900/50 text-emerald-400 p-2 rounded-lg text-center text-xs font-bold mt-2 uppercase tracking-wider">
              Treinador do {currentUser.team || "Clube"}
            </div>

            <div className="space-y-4 mt-5">
              
              {/* 1. Vender o Time (Mercado) */}
              <div className="bg-black/50 p-4 rounded-xl border border-amber-900/30">
                <h4 className="text-amber-500 font-black text-sm mb-1 uppercase tracking-wider">Mercado de Clubes</h4>
                <p className="text-[10px] text-zinc-400 mb-3 leading-tight">Anuncie o seu clube. Ele ficará disponível na aba do mercado para outros utilizadores.</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Preço (R$)" value={teamPrice} onChange={(e) => setTeamPrice(e.target.value)} className="flex-1 bg-[#1a1a1a] text-white text-xs px-3 py-2 rounded-lg border border-zinc-700 outline-none focus:border-amber-500" />
                  <button onClick={handleSellTeam} className="bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded-lg text-xs font-black uppercase transition-colors cursor-pointer">Vender</button>
                </div>
              </div>

              {/* 2. Alterar Senha */}
              <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                <h4 className="text-zinc-300 font-black text-sm mb-3 uppercase tracking-wider">Segurança</h4>
                <div className="space-y-2">
                  <input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#1a1a1a] text-white text-xs px-3 py-2.5 rounded-lg border border-zinc-700 outline-none focus:border-zinc-500" />
                  <input type="password" placeholder="Repetir nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#1a1a1a] text-white text-xs px-3 py-2.5 rounded-lg border border-zinc-700 outline-none focus:border-zinc-500" />
                  <button onClick={handleChangePassword} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors mt-1 cursor-pointer">Atualizar Senha</button>
                </div>
              </div>

              {/* 3. Desligar e Apagar */}
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                <button onClick={handleLogout} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-sm transition-colors uppercase cursor-pointer">
                  Desligar (Sair da Conta)
                </button>
                <button onClick={handleDeleteAccount} className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-500 font-bold py-3 rounded-xl text-sm transition-colors uppercase cursor-pointer">
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
