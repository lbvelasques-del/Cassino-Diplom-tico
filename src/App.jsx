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

  // Estados de Gestão do ADM
  const [userList, setUserList] = useState([]);
  const [admTargetUser, setAdmTargetUser] = useState('');
  const [admAmount, setAdmAmount] = useState('');
  const [admTeamName, setAdmTeamName] = useState('');
  
  // Criador de Jogadores (ADM)
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerOvr, setNewPlayerOvr] = useState(78);
  const [newPlayerPos, setNewPlayerPos] = useState('CA');
  const [newPlayerSkill, setNewPlayerSkill] = useState('Chute Curvo');
  const [newPlayerPrice, setNewPlayerPrice] = useState(5000000);
  const [newPlayerTargetClub, setNewPlayerTargetClub] = useState('Mercado Livre');

  useEffect(() => {
    const savedUser = localStorage.getItem('pampas_current_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        fetchBalance(parsedUser.username);
      } catch (e) {
        localStorage.removeItem('pampas_current_user');
      }
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

  const fetchAdminUsers = async () => {
    const { data } = await supabase.from('users').select('id, username, team, balance').order('id', { ascending: true });
    if (data) setUserList(data);
  };

  useEffect(() => {
    if (currentUser?.username?.toLowerCase() === 'lvelasques' && showAdminModal) {
      fetchAdminUsers();
    }
  }, [currentUser, showAdminModal]);

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
  };

  const handleAdminInjectBalance = async (targetUser, amount) => {
    const val = Number(amount);
    if (!targetUser || isNaN(val)) {
      alert("Informe o utilizador e um valor válido.");
      return;
    }
    const { data: targetData } = await supabase.from('users').select('balance').eq('username', targetUser).single();
    if (!targetData) {
      alert("Utilizador não encontrado!");
      return;
    }

    const newBal = targetData.balance + val;
    const { error } = await supabase.from('users').update({ balance: newBal }).eq('username', targetUser);
    if (!error) {
      alert(`Saldo atualizado de ${targetUser}: R$ ${newBal.toLocaleString('pt-BR')}`);
      fetchAdminUsers();
      if (targetUser === currentUser.username) fetchBalance(currentUser.username);
    }
  };const handleAdminAssignTeam = async (targetUser, newTeam) => {
    const { error } = await supabase.from('users').update({ team: newTeam }).eq('username', targetUser);
    if (!error) {
      alert(`Clube de ${targetUser} alterado para "${newTeam}"!`);
      fetchAdminUsers();
    }
  };

  const handleAdminCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName) {
      alert("Preencha o nome do atleta!");
      return;
    }
    const { error } = await supabase.from('players').insert([{
      name: newPlayerName,
      overall: Number(newPlayerOvr),
      position: newPlayerPos,
      special_skill: newPlayerSkill,
      price: Number(newPlayerPrice),
      current_club: newPlayerTargetClub
    }]);

    if (!error) {
      alert(`Atleta ${newPlayerName} (${newPlayerOvr} OVR) criado com sucesso para: ${newPlayerTargetClub}!`);
      setNewPlayerName('');
    } else {
      alert("Erro ao registar jogador no banco de dados.");
    }
  };

  const handleAdminDeleteUser = async (usernameToDelete) => {
    if (window.confirm(`ATENÇÃO ADM: Apagar definitivamente a conta de "${usernameToDelete}"?`)) {
      const { error } = await supabase.from('users').delete().eq('username', usernameToDelete);
      if (!error) {
        alert("Conta removida com sucesso!");
        fetchAdminUsers();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pampas_current_user');
    window.location.reload();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070908] flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-[#0f1412] p-8 rounded-3xl border border-emerald-900/50 w-full max-w-sm shadow-[0_0_50px_rgba(5,150,105,0.2)]">
          <h2 className="text-2xl font-black text-center mb-6 text-emerald-400 uppercase tracking-widest">
            {isLogin ? 'REDE PAMPAS' : 'NOVO REGISTRO'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="text" placeholder="Utilizador" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black text-white p-3.5 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 font-semibold" required />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black text-white p-3.5 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 font-semibold" required />
            {!isLogin && (
              <input type="text" placeholder="Nome do Clube" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-black text-white p-3.5 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 font-semibold" required />
            )}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black p-3.5 rounded-xl uppercase tracking-wider transition-colors shadow-lg cursor-pointer">
              {isLogin ? 'Entrar' : 'Registrar'}
            </button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-5 text-xs text-zinc-500 hover:text-emerald-400 font-bold uppercase tracking-widest cursor-pointer">
            {isLogin ? 'Criar nova conta' : 'Já possui conta? Entrar'}
          </button>
        </div>
      </div>
    );
  }const isAdmin = currentUser?.username?.toLowerCase() === 'lvelasques';

  return (
    <div className="min-h-screen bg-[#050606] text-white font-sans">
      {!activeGame ? (
        <div className="max-w-md mx-auto p-4 space-y-6 pt-6">
          
          {/* Header */}
          <div className="flex justify-between items-center bg-[#0d1210] p-5 rounded-3xl border border-emerald-900/40 shadow-2xl">
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Painel Principal</p>
              <h1 className="text-xl font-black text-white">{currentUser.username} <span className="text-emerald-500 text-xs">#{currentUser.id || 1}</span></h1>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <p className="text-[8px] text-zinc-500 uppercase font-black">Patrimônio</p>
                <p className="text-sm font-black text-emerald-400">R$ {balance.toLocaleString('pt-BR')}</p>
              </div>
              {isAdmin && (
                <button onClick={() => setShowAdminModal(true)} className="bg-red-950/80 hover:bg-red-600 border border-red-800 text-red-300 hover:text-white w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors cursor-pointer shadow-lg" title="Painel de Administrador">
                  👑
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Opção 1: Futebol Diplomático */}
            <button onClick={() => setActiveGame('futebol')} className="w-full text-left group bg-[#0d1612] border border-emerald-800/40 rounded-[2rem] p-6 shadow-2xl hover:border-emerald-400 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-950 border border-emerald-700/50 rounded-2xl flex items-center justify-center text-3xl">⚽</div>
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-emerald-300">Futebol Diplomático</h3>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1 tracking-widest">Campeonato • Táticas • Elenco</p>
                </div>
              </div>
            </button>

            {/* Opção 2: Cassino Costa Rica */}
            <button onClick={() => setActiveGame('cassino')} className="w-full text-left group bg-[#16100a] border border-amber-900/40 rounded-[2rem] p-6 shadow-2xl hover:border-amber-500 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-950 border border-amber-700/50 rounded-2xl flex items-center justify-center text-3xl">🎰</div>
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-300">Cassino Costa Rica</h3>
                  <p className="text-[9px] text-amber-600 font-bold uppercase mt-1 tracking-widest">Lobby VIP • Multiplicadores</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen bg-[#050507]">
          <div className="fixed top-3 left-3 z-50">
            <button onClick={() => { setActiveGame(null); fetchBalance(currentUser.username); }} className="bg-black/90 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-950 cursor-pointer">
              ⬅️ Menu Principal
            </button>
          </div>
          {activeGame === 'futebol' && <FutebolDiplomatico />}
          {activeGame === 'cassino' && <CassinoCostaRica balance={balance} setBalance={setBalance} currentUser={currentUser} />}
        </div>
      )}{/* MODAL MASTER DE ADMINISTRADOR (LVelasques) */}
      {showAdminModal && isAdmin && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0a0a] border border-red-900/60 p-6 rounded-3xl w-full max-w-md relative shadow-2xl overflow-y-auto max-h-[90vh] space-y-6 text-left">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-black cursor-pointer">✕</button>

            <div className="border-b border-red-900/40 pb-3">
              <h3 className="text-lg font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                👑 PAINEL MASTER DE ADMINISTRAÇÃO
              </h3>
              <p className="text-[10px] text-zinc-400 font-semibold">Controle total da Rede Pampas</p>
            </div>

            {/* 1. Gestão Finanças e Times por Usuário */}
            <div className="bg-black/60 p-4 rounded-2xl border border-red-900/30 space-y-3">
              <h4 className="text-xs font-black text-red-400 uppercase tracking-wider">1. Gestão de Saldo e Clube</h4>
              <div className="space-y-2">
                <input type="text" placeholder="Utilizador Alvo" value={admTargetUser} onChange={(e) => setAdmTargetUser(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none focus:border-red-500" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Valor Saldo (+ ou -)" value={admAmount} onChange={(e) => setAdmAmount(e.target.value)} className="flex-1 bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
                  <button onClick={() => handleAdminInjectBalance(admTargetUser, admAmount)} className="bg-red-700 hover:bg-red-600 text-black font-black text-xs px-4 rounded-xl uppercase cursor-pointer">Aplicar</button>
                </div>
                <div className="flex gap-2 pt-1">
                  <input type="text" placeholder="Novo Nome do Clube" value={admTeamName} onChange={(e) => setAdmTeamName(e.target.value)} className="flex-1 bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
                  <button onClick={() => handleAdminAssignTeam(admTargetUser, admTeamName)} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-4 rounded-xl uppercase cursor-pointer">Definir Time</button>
                </div>
              </div>
            </div>

            {/* 2. Gerador de Atletas (Leilão / Mercado) */}
            <form onSubmit={handleAdminCreatePlayer} className="bg-black/60 p-4 rounded-2xl border border-red-900/30 space-y-3">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">2. Criar Novo Jogador</h4>
              <input type="text" placeholder="Nome do Jogador" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" required />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-zinc-400 uppercase font-bold block">Overall (OVR)</label>
                  <input type="number" value={newPlayerOvr} onChange={(e) => setNewPlayerOvr(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-white text-xs p-2 rounded-lg outline-none" min="50" max="99" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 uppercase font-bold block">Posição</label>
                  <select value={newPlayerPos} onChange={(e) => setNewPlayerPos(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-white text-xs p-2 rounded-lg outline-none">
                    <option value="GOL">GOL (Goleiro)</option>
                    <option value="ZAG">ZAG (Zagueiro)</option>
                    <option value="LAT">LAT (Lateral)</option>
                    <option value="VOL">VOL (Volante)</option>
                    <option value="MC">MC (Meio-Campo)</option>
                    <option value="MEI">MEI (Meia Atacante)</option>
                    <option value="EXT">EXT (Ponta)</option>
                    <option value="CA">CA (Centroavante)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Habilidade (ex: Chute Curvo)" value={newPlayerSkill} onChange={(e) => setNewPlayerSkill(e.target.value)} className="bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
                <input type="number" placeholder="Valor Passe (R$)" value={newPlayerPrice} onChange={(e) => setNewPlayerPrice(e.target.value)} className="bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
              </div>

              <input type="text" placeholder="Destino (ex: Mercado Livre ou Nome do Clube)" value={newPlayerTargetClub} onChange={(e) => setNewPlayerTargetClub(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />

              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black text-xs py-3 rounded-xl uppercase tracking-wider cursor-pointer">
                Gerar e Publicar Atleta
              </button>
            </form>

            {/* 3. Lista Completa de Usuários e Lixeira */}
            <div className="bg-black/60 p-4 rounded-2xl border border-red-900/30 space-y-3">
              <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider">3. Usuários Cadastrados ({userList.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {userList.map(u => (
                  <div key={u.id} className="bg-[#111] p-2.5 rounded-xl flex items-center justify-between border border-zinc-800 text-xs">
                    <div>
                      <p className="font-bold text-white">{u.username} <span className="text-emerald-400 text-[10px]">({u.team || "Sem Clube"})</span></p>
                      <p className="text-[10px] text-zinc-400">R$ {(u.balance || 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <button onClick={() => handleAdminDeleteUser(u.username)} className="bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer" title="Excluir Usuário">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
