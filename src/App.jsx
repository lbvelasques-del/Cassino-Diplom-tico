import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Shield, Coins, Sparkles, User, Settings, LogOut, 
  ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, XCircle, Clock,
  Users, Key, Search, Activity, DollarSign, Lock, RefreshCw, Zap
} from 'lucide-react';

const SYMBOLS = [
  { id: 'couro', char: '🫎', name: 'Couro', mult: 1, weight: 100 },
  { id: 'trm', char: '⚗️', name: 'TRM', mult: 2, weight: 80 },
  { id: 'petroleo', char: '🛢️', name: 'Petróleo', mult: 3, weight: 50 },
  { id: 'ouro', char: '🪙', name: 'Ouro', mult: 4, weight: 30 },
  { id: 'brasil', char: '🇧🇷', name: 'Brasil', mult: 5, weight: 20 },
  { id: 'costarica', char: '🇨🇷', name: 'Costa Rica', mult: 6, weight: 15 },
  { id: 'mundo', char: '🌎', name: 'Mundo', mult: 8, weight: 10 },
  { id: 'diamante', char: '💎', name: 'Diamante', mult: 10, weight: 5, isWild: true }
];

const BET_LEVELS = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

const PAYLINES = [
  { id: 0, name: 'Linha Superior', coords: [0, 1, 2], color: '#f59e0b' },
  { id: 1, name: 'Linha Central', coords: [3, 4, 5], color: '#06b6d4' },
  { id: 2, name: 'Linha Inferior', coords: [6, 7, 8], color: '#10b981' },
  { id: 3, name: 'Diagonal Principal', coords: [0, 4, 8], color: '#ec4899' },
  { id: 4, name: 'Diagonal Invertida', coords: [2, 4, 6], color: '#8b5cf6' }
];

const MULTIPLIER_WHEEL = [
  { mult: 2, weight: 90 },
  { mult: 3, weight: 70 },
  { mult: 4, weight: 40 },
  { mult: 5, weight: 25 },
  { mult: 6, weight: 15 },
  { mult: 8, weight: 8 },
  { mult: 10, weight: 2 }
];

function App() {
  // Base de Dados Global de Utilizadores em LocalStorage
  const [usersDB, setUsersDB] = useState(() => {
    const saved = localStorage.getItem('cd_users_db');
    return saved ? JSON.parse(saved) : {
      'LVelasques': { username: 'LVelasques', password: 'Lucas123!', balance: 10000000, isAdmin: true }
    };
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cd_current_user');
    return saved ? JSON.parse(saved) : { username: 'Visitante', balance: 0, isAdmin: false };
  });

  // Contador de Jogadores Online (Simulador de Tráfego em Tempo Real)
  const [onlineCount, setOnlineCount] = useState(134);
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTab, setWalletTab] = useState('deposit');
  const [transactionAmount, setTransactionAmount] = useState('');

  const [betIndex, setBetIndex] = useState(0);
  const currentBet = BET_LEVELS[betIndex];
  const [grid, setGrid] = useState(['🪙','🇧🇷','
                                          {/* Modal de Bônus */}
      {showBonus && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-2xl shadow-amber-500/20">
            <h2 className="text-lg font-black text-amber-400 tracking-wider">
              BÔNUS FORTUNA DIPLOMÁTICA 💎
            </h2>
            <p className="text-xs text-slate-400">
              Gira a roleta de multiplicadores para aumentar os teus ganhos!
            </p>

            <div className="w-28 h-28 rounded-full border-4 border-amber-500 flex items-center justify-center bg-slate-950 text-3xl font-black text-amber-300 shadow-xl shadow-amber-500/20">
              {bonusMult > 0 ? `${bonusMult}x` : '?'}
            </div>

            <button
              onClick={spinBonusWheel}
              disabled={spinningBonus || bonusMult > 0}
              className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl hover:brightness-110 disabled:opacity-50 text-sm"
            >
              {spinningBonus ? 'SORTEANDO...' : bonusMult > 0 ? 'PRÊMIO CREDITADO!' : 'SORTEAR MULTIPLICADOR'}
            </button>

            {bonusMult > 0 && (
              <button 
                onClick={() => setShowBonus(false)}
                className="text-xs text-slate-400 underline mt-1"
              >
                Voltar ao Jogo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Carteira (Depósito e Saque) */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
            
            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button 
                onClick={() => setWalletTab('deposit')}
                className={`w-1/2 py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  walletTab === 'deposit' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>DEPÓSITO</span>
              </button>
              <button 
                onClick={() => setWalletTab('withdraw')}
                className={`w-1/2 py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  walletTab === 'withdraw' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>SAQUE</span>
              </button>
            </div>

            <form onSubmit={handleTransactionRequest} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-400">
                  {walletTab === 'deposit' ? 'Valor para Depositar (R$)' : 'Valor para Sacar (R$)'}
                </label>
                <input 
                  type="number"
                  required
                  min="1000"
                  value={transactionAmount}
                  onChange={e => setTransactionAmount(e.target.value)}
                  placeholder="Ex: 500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm mt-1 focus:border-amber-500 outline-none font-mono"
                />
                {walletTab === 'withdraw' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Saldo disponível: <strong className="text-amber-400">R$ {user.balance.toLocaleString('pt-BR')}</strong>
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
                  Enviar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Login (Privado) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-base font-black text-amber-400">ACESSO À CONTA</h3>
            <div>
              <label className="text-xs text-slate-400">Utilizador / Nick</label>
              <input 
                type="text"
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Ex: SeuNome"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm mt-1 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Senha</label>
              <input 
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm mt-1 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Fechar
              </button>
              <button type="submit" className="w-2/3 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
                Entrar / Criar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PAINEL MASTER DE GESTÃO DO ADMIN (@LVelasques) */}
      {showAdminPanel && user.isAdmin && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-slate-900 border border-amber-500/40 rounded-3xl p-5 flex flex-col gap-5 my-4 shadow-2xl">
            
            {/* Header Admin */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-black text-amber-400">
                  PAINEL MASTER (@LVelasques)
                </h2>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white text-sm font-bold">
                ✕ Fechar
              </button>
            </div>

            {/* Menu de Navegação do Admin */}
            <div className="flex gap-2 border-b border-slate-800 pb-3">
              <button 
                onClick={() => setAdminTab('transactions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'transactions' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Fila de Transações
              </button>
              <button 
                onClick={() => setAdminTab('users')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'users' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Utilizadores & Senhas
              </button>
              <button 
                onClick={() => setAdminTab('reports')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  adminTab === 'reports' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Relatório Financeiro
              </button>
            </div>

            {/* ABA 1: FILA DE TRANSAÇÕES (Aprovar/Rejeitar) */}
            {adminTab === 'transactions' && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  SOLICITAÇÕES PENDENTES
                </h3>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                  {transactions.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Nenhuma transação registada.</p>
                  ) : (
                    transactions.map(tx => (
                      <div key={tx.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {tx.type === 'deposit' ? (
                            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                              <ArrowDownRight className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                              <ArrowUpRight className="w-4 h-4" />
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-200">@{tx.username}</strong>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {tx.type === 'deposit' ? 'Depósito' : 'Saque'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              R$ {tx.amount.toLocaleString('pt-BR')} • {tx.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {tx.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveTransaction(tx)}
                                className="bg-emerald-500 text-slate-950 px-2.5 py-1.5 rounded-xl font-black text-xs hover:brightness-110 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovar</span>
                              </button>
                              <button
                                onClick={() => handleRejectTransaction(tx)}
                                className="bg-rose-500/20 border border-rose-500/40 text-rose-400 px-2 py-1.5 rounded-xl font-bold text-xs hover:bg-rose-500/30 flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejeitar</span>
                              </button>
                            </>
                          ) : (
                            <span className={`font-bold text-xs px-2 py-1 rounded-lg ${
                              tx.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                            }`}>
                              {tx.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ABA 2: GESTÃO DE UTILIZADORES (Redefinir Senha e Saldo) */}
            {adminTab === 'users' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    UTILIZADORES REGISTADOS ({Object.keys(usersDB).length})
                  </h3>
                </div>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {Object.values(usersDB).map(u => (
                    <div key={u.username} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-amber-300">@{u.username}</strong>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Saldo: R$ {u.balance.toLocaleString('pt-BR')} | Senha: <span className="text-slate-200">{u.password}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUserToEdit(u);
                          setNewPasswordInput(u.password);
                          setNewBalanceInput(u.balance);
                        }}
                        className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl font-bold text-xs hover:bg-amber-500/30"
                      >
                        Editar
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form de Edição de Utilizador */}
                {selectedUserToEdit && (
                  <div className="mt-2 bg-slate-950 p-4 rounded-2xl border border-amber-500/40 flex flex-col gap-3">
                    <h4 className="text-xs font-black text-amber-400">
                      EDITAR CONTA: @{selectedUserToEdit.username}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Nova Senha</label>
                        <input 
                          type="text"
                          value={newPasswordInput}
                          onChange={e => setNewPasswordInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs mt-1 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Alterar Saldo (R$)</label>
                        <input 
                          type="number"
                          value={newBalanceInput}
                          onChange={e => setNewBalanceInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs mt-1 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={() => setSelectedUserToEdit(null)}
                        className="w-1/2 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveUserEdit}
                        className="w-1/2 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl"
                      >
                        Guardar Alterações
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA 3: RELATÓRIO FINANCEIRO COMPLETO */}
            {adminTab === 'reports' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase">TOTAL DEPÓSITOS APROVADOS</p>
                    <p className="text-base font-black text-emerald-400 font-mono mt-1">
                      R$ {totalApprovedDeposits.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-rose-500/30">
                    <p className="text-[10px] text-rose-400 font-bold uppercase">TOTAL SAQUES PAGOS</p>
                    <p className="text-base font-black text-rose-400 font-mono mt-1">
                      R$ {totalApprovedWithdrawals.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <p className="text-[9px] text-slate-400">VOLUME APOSTADO</p>
                    <p className="text-xs font-black text-slate-200 font-mono mt-1">
                      R$ {houseStats.totalBets.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <p className="text-[9px] text-slate-400">PRÊMIOS PAGOS</p>
                    <p className="text-xs font-black text-amber-400 font-mono mt-1">
                      R$ {houseStats.totalPayouts.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30">
                    <p className="text-[9px] text-amber-400">LUCRO DA CASA</p>
                    <p className="text-xs font-black text-emerald-400 font-mono mt-1">
                      R$ {(houseStats.totalBets - houseStats.totalPayouts).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Rodapé Futurista */}
      <footer className="w-full text-center py-3 text-[10px] text-slate-600 border-t border-slate-900/80 backdrop-blur-md">
        Cassino Diplomático © 2026 - Todos os direitos reservados.
      </footer>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
              }
                          
