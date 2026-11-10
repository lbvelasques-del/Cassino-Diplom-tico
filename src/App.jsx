import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import FutebolDiplomatico from './FutebolDiplomatico';
import CassinoCostaRica from './CassinoCostaRica';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
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

  // Gestão de ADM e Co-ADM
  const [userList, setUserList] = useState([]);
  const [admTargetUser, setAdmTargetUser] = useState('');
  const [admAmount, setAdmAmount] = useState('');
  const [admTeamName, setAdmTeamName] = useState('');
  
  // Criador de Jogadores (ADM)
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerOvr, setNewPlayerOvr] = useState(78);
  const [newPlayerPos, setNewPlayerPos] = useState('ATA');
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
    const { data } = await supabase.from('users').select('id, username, team, balance, is_co_admin').order('id', { ascending: true });
    if (data) setUserList(data);
  };

  useEffect(() => {
    const isMasterOrCo = currentUser?.username?.toLowerCase() === 'lvelasques' || currentUser?.is_co_admin;
    if (isMasterOrCo && showAdminModal) {
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
      const { data, error } = await supabase.from('users').insert([{ username, password, team: teamName, balance: 10000000, is_co_admin: false }]).select().single();
      if (!error && data) {
        localStorage.setItem('pampas_current_user', JSON.stringify(data));
        setCurrentUser(data);
        setBalance(data.balance);
      } else {
        alert("Erro ao criar conta.");
      }
    }
  };const handleAdminInjectBalance = async (targetUser, amount) => {
    const val = Number(amount);
    if (!targetUser || isNaN(val)) return alert("Informe o utilizador e um valor válido.");
    const { data: targetData } = await supabase.from('users').select('balance').eq('username', targetUser).single();
    if (!targetData) return alert("Utilizador não encontrado!");

    const newBal = targetData.balance + val;
    const { error } = await supabase.from('users').update({ balance: newBal }).eq('username', targetUser);
    if (!error) {
      alert(`Saldo atualizado de ${targetUser}: R$ ${newBal.toLocaleString('pt-BR')}`);
      fetchAdminUsers();
      if (targetUser === currentUser.username) fetchBalance(currentUser.username);
    }
  };

  const handleAdminAssignTeam = async (targetUser, newTeam) => {
    const { error } = await supabase.from('users').update({ team: newTeam }).eq('username', targetUser);
    if (!error) {
      alert(`Clube de ${targetUser} alterado para "${newTeam}"!`);
      fetchAdminUsers();
    }
  };

  const handleToggleCoAdmin = async (targetUser, currentStatus) => {
    if (currentUser?.username?.toLowerCase() !== 'lvelasques') {
      return alert("Apenas o Administrador Master pode gerir Co-Admins!");
    }
    const newStatus = !currentStatus;
    const { error } = await supabase.from('users').update({ is_co_admin: newStatus }).eq('username', targetUser);
    if (!error) {
      alert(`Utilizador ${targetUser} ${newStatus ? 'promovido a Co-Admin' : 'removido de Co-Admin'}!`);
      fetchAdminUsers();
    }
  };

  const handleAdminCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName) return alert("Preencha o nome do atleta!");
    const { error } = await supabase.from('players').insert([{
      name: newPlayerName,
      overall: Number(newPlayerOvr),
      position: newPlayerPos,
      special_skill: newPlayerSkill,
      price: Number(newPlayerPrice),
      current_club: newPlayerTargetClub
    }]);

    if (!error) {
      alert(`Atleta ${newPlayerName} (${newPlayerOvr} OVR) criado com sucesso!`);
      setNewPlayerName('');
    } else {
      alert("Erro ao criar jogador.");
    }
  };

  const handleAdminDeleteUser = async (usernameToDelete) => {
    if (currentUser?.username?.toLowerCase() !== 'lvelasques') {
      return alert("Apenas o Master pode apagar contas!");
    }
    if (window.confirm(`ATENÇÃO MASTER: Apagar definitivamente a conta de "${usernameToDelete}"?`)) {
      const { error } = await supabase.from('users').delete().eq('username', usernameToDelete);
      if (!error) {
        alert("Conta removida com sucesso!");
        fetchAdminUsers();
      }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) return alert("As senhas não coincidem!");
    const { error } = await supabase.from('users').update({ password: newPassword }).eq('username', currentUser.username);
    if (!error) {
      alert("Senha alterada com sucesso!");
      setNewPassword(''); setConfirmPassword('');
    }
  };

  const handleSellTeam = async () => {
    const price = Number(teamPrice);
    if (!price || price <= 0) return alert("Insira um valor válido.");
    const { error } = await supabase.from('users').update({ team_price: price }).eq('username', currentUser.username);
    if (!error) {
      alert(`Clube colocado à venda por R$ ${price.toLocaleString('pt-BR')}!`);
      setTeamPrice('');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Deseja apagar sua conta definitivamente?")) {
      const { error } = await supabase.from('users').delete().eq('username', currentUser.username);
      if (!error) handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pampas_current_user');
    window.location.reload();
  };if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070908] flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-[#0f1412] p-8 rounded-3xl border border-emerald-900/50 w-full max-w-sm shadow-2xl">
          <h2 className="text-2xl font-black text-center mb-6 text-emerald-400 uppercase tracking-widest">
            {isLogin ? 'REDE PAMPAS' : 'NOVO REGISTRO'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="text" placeholder="Utilizador" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black text-white p-3.5 rounded-xl border border-zinc-800 outline-none font-semibold" required />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black text-white p-3.5 rounded-xl border border-zinc-800 outline-none font-semibold" required />
            {!isLogin && (
              <input type="text" placeholder="Nome do Clube" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-black text-white p-3.5 rounded-xl border border-zinc-800 outline-none font-semibold" required />
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
  }

  const isMaster = currentUser?.username?.toLowerCase() === 'lvelasques';
  const isCoAdmin = currentUser?.is_co_admin === true;
  const hasAdminAccess = isMaster || isCoAdmin;

  return (
    <div className="min-h-screen bg-[#050606] text-white font-sans">
      {!activeGame ? (
        <div className="max-w-md mx-auto p-4 space-y-6 pt-6">
          
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
              <button onClick={() => setShowProfileModal(true)} className="bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-black w-9 h-9 rounded-xl flex items-center justify-center font-black transition-colors cursor-pointer" title="Perfil">
                ⚙️
              </button>
              {hasAdminAccess && (
                <button onClick={() => setShowAdminModal(true)} className="bg-red-950/80 hover:bg-red-600 border border-red-800 text-red-300 hover:text-white w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-lg cursor-pointer" title="Painel de Administrador">
                  👑
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2 pl-2 border-l-2 border-emerald-500">Simulador Master</h2>
              <button onClick={() => setActiveGame('futebol')} className="w-full text-left group relative overflow-hidden bg-gradient-to-br from-[#0d1612] via-[#09100d] to-[#050907] border-2 border-emerald-500/60 rounded-[2.5rem] p-7 shadow-[0_0_40px_rgba(5,150,105,0.2)] hover:border-emerald-400 transition-all cursor-pointer">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="flex flex-col gap-3 relative z-10">
                  <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500/60 rounded-2xl flex items-center justify-center text-4xl shadow-inner">⚽</div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-emerald-300">Futebol Diplomático</h3>
                    <p className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-widest">Gerencie Elenco • Táticas • Campeonato Oficial</p>
                  </div>
                  <span className="mt-2 inline-block text-center bg-emerald-500 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg">Entrar no Simulador</span>
                </div>
              </button>
            </div>

            <div>
              <h2 className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-2 pl-2 border-l-2 border-amber-500">Passatempo VIP</h2>
              <button onClick={() => setActiveGame('cassino')} className="w-full text-left group bg-[#140e0a] border border-amber-900/50 rounded-[2rem] p-6 shadow-xl hover:border-amber-500 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-950 border border-amber-700/50 rounded-2xl flex items-center justify-center text-3xl">🎰</div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-amber-300">Cassino Diplomático</h3>
                    <p className="text-[9px] text-amber-600 font-bold uppercase mt-1 tracking-widest">Portal de Jogos • Multiplicadores</p>
                  </div>
                </div>
              </button>
            </div>
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
      )}{/* MODAL DE PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0c0b] border border-emerald-900/40 p-6 rounded-3xl w-full max-w-sm relative shadow-2xl space-y-4">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-black cursor-pointer">✕</button>
            <h3 className="text-lg font-black text-white">{currentUser.username} <span className="text-emerald-500 text-xs">(#{currentUser.id || 1})</span></h3>
            
            <div className="space-y-3">
              <div className="bg-[#111] p-3 rounded-2xl border border-zinc-800">
                <p className="text-[10px] text-zinc-400 font-bold mb-2">VENDER CLUBE NO MERCADO</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Preço (R$)" value={teamPrice} onChange={(e) => setTeamPrice(e.target.value)} className="flex-1 bg-black text-white text-xs px-3 py-2 rounded-xl border border-zinc-800 outline-none" />
                  <button onClick={handleSellTeam} className="bg-emerald-600 text-black font-black text-xs px-3 rounded-xl uppercase">Anunciar</button>
                </div>
              </div>

              <div className="bg-[#111] p-3 rounded-2xl border border-zinc-800 space-y-2">
                <p className="text-[10px] text-zinc-400 font-bold">ALTERAR SENHA</p>
                <input type="password" placeholder="Nova Senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black text-white text-xs px-3 py-2 rounded-xl border border-zinc-800 outline-none" />
                <input type="password" placeholder="Confirmar Senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-black text-white text-xs px-3 py-2 rounded-xl border border-zinc-800 outline-none" />
                <button onClick={handleChangePassword} className="w-full bg-zinc-800 text-white font-bold text-xs py-2 rounded-xl uppercase">Atualizar</button>
              </div>

              <button onClick={handleLogout} className="w-full bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs uppercase">Sair da Conta</button>
              <button onClick={handleDeleteAccount} className="w-full bg-red-950/30 border border-red-900/40 text-red-500 font-bold py-2.5 rounded-xl text-xs uppercase">Excluir Conta</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADMINISTRAÇÃO (MASTER & CO-ADMIN BLINDADO) */}
      {showAdminModal && hasAdminAccess && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0a0a] border border-red-900/60 p-6 rounded-3xl w-full max-w-md relative shadow-2xl overflow-y-auto max-h-[90vh] space-y-5 text-left">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-black cursor-pointer">✕</button>

            <div className="border-b border-red-900/40 pb-2">
              <h3 className="text-lg font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                👑 PAINEL DE {isMaster ? 'ADMINISTRADOR MASTER' : 'CO-ADMINISTRADOR'}
              </h3>
            </div>

            <div className="bg-black/60 p-4 rounded-2xl border border-red-900/30 space-y-3">
              <h4 className="text-xs font-black text-red-400 uppercase">1. Gestão de Saldo e Clube</h4>
              <input type="text" placeholder="Utilizador Alvo" value={admTargetUser} onChange={(e) => setAdmTargetUser(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
              <div className="flex gap-2">
                <input type="number" placeholder="Valor Saldo (+ ou -)" value={admAmount} onChange={(e) => setAdmAmount(e.target.value)} className="flex-1 bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
                <button onClick={() => handleAdminInjectBalance(admTargetUser, admAmount)} className="bg-red-700 text-black font-black text-xs px-4 rounded-xl uppercase cursor-pointer">Aplicar</button>
              </div>
              <div className="flex gap-2 pt-1">
                <input type="text" placeholder="Novo Nome do Clube" value={admTeamName} onChange={(e) => setAdmTeamName(e.target.value)} className="flex-1 bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
                <button onClick={() => handleAdminAssignTeam(admTargetUser, admTeamName)} className="bg-zinc-800 text-white font-bold text-xs px-4 rounded-xl uppercase cursor-pointer">Definir</button>
              </div>
            </div>

            <form onSubmit={handleAdminCreatePlayer} className="bg-black/60 p-4 rounded-2xl border border-red-900/30 space-y-3">
              <h4 className="text-xs font-black text-amber-400 uppercase">2. Criar Novo Jogador</h4>
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
                    <option value="LAD">LAD (Lateral Direito)</option>
                    <option value="LAE">LAE (Lateral Esquerdo)</option>
                    <option value="VOL">VOL (Volante)</option>
                    <option value="MC">MC (Meio-Campo)</option>
                    <option value="MEI">MEI (Meia Atacante)</option>
                    <option value="ATA">ATA (Atacante)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Habilidade (ex: Chute Curvo)" value={newPlayerSkill} onChange={(e) => setNewPlayerSkill(e.target.value)} className="bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
                <input type="number" placeholder="Valor Passe (R$)" value={newPlayerPrice} onChange={(e) => setNewPlayerPrice(e.target.value)} className="bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />
              </div>

              <input type="text" placeholder="Destino (ex: Mercado Livre ou Clube)" value={newPlayerTargetClub} onChange={(e) => setNewPlayerTargetClub(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-white text-xs p-2.5 rounded-xl outline-none" />

              <button type="submit" className="w-full bg-amber-600 text-black font-black text-xs py-3 rounded-xl uppercase cursor-pointer">
                Gerar e Publicar Atleta
              </button>
            </form>

            <div className="bg-black/60 p-4 rounded-2xl border border-red-900/30 space-y-3">
              <h4 className="text-xs font-black text-zinc-300 uppercase">3. Utilizadores Cadastrados ({userList.length})</h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {userList.map(u => {
                  const isUserMaster = u.username.toLowerCase() === 'lvelasques';
                  return (
                    <div key={u.id} className="bg-[#111] p-2.5 rounded-xl flex items-center justify-between border border-zinc-800 text-xs">
                      <div>
                        <p className="font-bold text-white">
                          {u.username} <span className="text-emerald-400 text-[10px]">({u.team || "Sem Clube"})</span>
                          {u.is_co_admin && <span className="ml-1 text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black">CO-ADMIN</span>}
                        </p>
                        <p className="text-[10px] text-zinc-400">R$ {(u.balance || 0).toLocaleString('pt-BR')}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isMaster && !isUserMaster && (
                          <>
                            <button 
                              onClick={() => handleToggleCoAdmin(u.username, u.is_co_admin)} 
                              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer ${u.is_co_admin ? 'bg-amber-600 text-black' : 'bg-zinc-800 text-zinc-300'}`}
                              title={u.is_co_admin ? "Remover Co-Admin" : "Tornar Co-Admin"}
                            >
                              {u.is_co_admin ? 'Rem. Co-Admin' : 'Co-Admin'}
                            </button>
                            <button onClick={() => handleAdminDeleteUser(u.username)} className="bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer" title="Excluir Utilizador">
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
