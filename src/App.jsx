import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function App() {
  const [usersDb, setUsersDb] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(150000);
  const [betAmount, setBetAmount] = useState(30000);
  const [turbo, setTurbo] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winningLines, setWinningLines] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  
  const [freeSpins, setFreeSpins] = useState(0);
  const [bonusActive, setBonusActive] = useState(false);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  const [adminTargetUser, setAdminTargetUser] = useState('');
  const [adminDepositAmount, setAdminDepositAmount] = useState('');

  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');

  // Tabela Oficial de Símbolos
  const symbols = [
    { id: 'pampas', icon: '🫎', name: 'Pampas', mult: 0.5, isBonus: false },
    { id: 'alquimia', icon: '⚗️', name: 'Alquimia', mult: 0.8, isBonus: false },
    { id: 'petroleo', icon: '🛢️', name: 'Petróleo', mult: 1.0, isBonus: false },
    { id: 'moeda', icon: '🪙', name: 'Moeda', mult: 1.5, isBonus: false },
    { id: 'brasil', icon: '🇧🇷', name: 'Brasil', mult: 2.0, isBonus: false },
    { id: 'costarica', icon: '🇨🇷', name: 'Costa Rica', mult: 3.0, isBonus: false },
    { id: 'diamante', icon: '💎', name: 'Diamante', mult: 0, isBonus: true }
  ];

  const [grid, setGrid] = useState([
    symbols[0], symbols[1], symbols[2], 
    symbols[3], symbols[4], symbols[5], 
    symbols[6], symbols[0], symbols[1]
  ]);
  
  const bets = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

  // Sincronização automática em tempo real com o Supabase a cada 3 segundos
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      fetchUsers();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) {
      setUsersDb(data);
      if (currentUser) {
        const updated = data.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
        if (updated) {
          setBalance(Number(updated.balance));
          setCurrentUser(updated);
        }
      }
    }
  };

  const checkHorizontalAndDiagonalWins = (currentGrid) => {
    let lines = [];
    if (currentGrid[0].id === currentGrid[1].id && currentGrid[1].id === currentGrid[2].id) lines.push(0, 1, 2);
    if (currentGrid[3].id === currentGrid[4].id && currentGrid[4].id === currentGrid[5].id) lines.push(3, 4, 5);
    if (currentGrid[6].id === currentGrid[7].id && currentGrid[7].id === currentGrid[8].id) lines.push(6, 7, 8);
    if (currentGrid[0].id === currentGrid[4].id && currentGrid[4].id === currentGrid[8].id) lines.push(0, 4, 8);
    if (currentGrid[2].id === currentGrid[4].id && currentGrid[4].id === currentGrid[6].id) lines.push(2, 4, 6);
    return [...new Set(lines)];
  };

  const getWinningSymbol = () => {
    const weights = { 'pampas': 50, 'alquimia': 48, 'petroleo': 45, 'brasil': 40, 'moeda': 38, 'costarica': 33, 'diamante': 20 };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;
    for (const [id, weight] of Object.entries(weights)) {
      if (randomNum < weight) return symbols.find(s => s.id === id);
      randomNum -= weight;
    }
    return symbols[0];
  };

  const updateBalanceInSupabase = async (newBalance) => {
    if (!currentUser) return;
    setBalance(newBalance);
    await supabase.from('users').update({ balance: newBalance }).eq('username', currentUser.username);
    await fetchUsers();
  };

  const spin = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const isFree = freeSpins > 0;
    if (!isFree && (balance < betAmount || spinning)) return;
    
    let newBal = balance;
    if (isFree) {
      setFreeSpins(prev => prev - 1);
    } else {
      newBal = balance - betAmount;
      await updateBalanceInSupabase(newBal);
    }

    setSpinning(true);
    setWinningLines([]);
    setLastWin(0);

    setTimeout(async () => {
      const winProbability = isFree ? 0.38 : 0.25; 
      const rand = Math.random();
      
      let newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      while (checkHorizontalAndDiagonalWins(newGrid).length > 0) {
        newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      }

      if (rand < winProbability) {
        const winningSym = getWinningSymbol();
        const winLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        const chosenLine = winLines[Math.floor(Math.random() * winLines.length)];
        chosenLine.forEach(idx => { newGrid[idx] = winningSym; });
      }

      setGrid(newGrid);
      setSpinning(false);

      const winningIndices = checkHorizontalAndDiagonalWins(newGrid);
      if (winningIndices.length > 0) {
        const winningSymbol = newGrid[winningIndices[0]];
        if (winningSymbol.isBonus) {
          setFreeSpins(prev => prev + 7);
          setBonusActive(true);
          setLastWin(0);
        } else {
          const prize = betAmount * winningSymbol.mult;
          const finalBal = newBal + prize;
          await updateBalanceInSupabase(finalBal);
          setLastWin(prize);
        }
        setWinningLines(winningIndices);
      }
    }, turbo ? 180 : 550);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const trimmedUser = inputUsername.trim();

    if (authMode === 'register') {
      if (inputPassword !== confirmPassword) {
        setAuthError('As senhas não coincidem!');
        return;
      }
      if (inputPassword.length < 3) {
        setAuthError('A senha é muito curta.');
        return;
      }

      // Verifica se já existe
      const { data: existing } = await supabase.from('users').select('*').ilike('username', trimmedUser);
      if (existing && existing.length > 0) {
        setAuthError('Este nome já está em uso.');
        return;
      }

      const newUser = {
        username: trimmedUser,
        password: inputPassword,
        balance: 150000,
        is_admin: trimmedUser.toLowerCase() === 'lvelasques'
      };

      const { data, error } = await supabase.from('users').insert([newUser]).select();
      if (error || !data) {
        setAuthError('Erro ao criar conta no servidor.');
        return;
      }

      const created = data[0];
      setCurrentUser(created);
      setBalance(Number(created.balance));
      setIsAuthOpen(false);
      resetAuthForm();
      await fetchUsers();
    } else {
      const { data, error } = await supabase.from('users').select('*').ilike('username', trimmedUser).eq('password', inputPassword);
      if (error || !data || data.length === 0) {
        setAuthError('Utilizador ou senha incorretos.');
        return;
      }
      const found = data[0];
      setCurrentUser(found);
      setBalance(Number(found.balance));
      setIsAuthOpen(false);
      resetAuthForm();
      await fetchUsers();
    }
  };

  const resetAuthForm = () => {
    setInputUsername('');
    setInputPassword('');
    setConfirmPassword('');
    setAuthError('');
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Insira um valor válido para saque.');
      return;
    }
    if (amountNum > balance) {
      alert('Saldo insuficiente na conta.');
      return;
    }
    const finalBal = balance - amountNum;
    await updateBalanceInSupabase(finalBal);
    
    const newReq = {
      id: Date.now(),
      user: currentUser.username,
      amount: amountNum,
      status: 'Pendente no Jogo'
    };
    setWithdrawalRequests(prev => [newReq, ...prev]);
    setWithdrawSuccess(true);
    setWithdrawAmount('');
  };

  const handleAdminBalanceUpdate = async (e, type) => {
    e.preventDefault();
    const targetUserTrim = adminTargetUser.trim();
    const amountVal = parseFloat(adminDepositAmount);

    if (!targetUserTrim || isNaN(amountVal) || amountVal <= 0) {
      alert('Insira um nome válido e valor acima de zero.');
      return;
    }

    const targetUser = usersDb.find(u => u.username.toLowerCase() === targetUserTrim.toLowerCase());
    if (!targetUser) {
      alert('Utilizador não encontrado na base de dados online.');
      return;
    }

    let newBal = Number(targetUser.balance);
    if (type === 'add') {
      newBal += amountVal;
    } else if (type === 'remove') {
      if (newBal < amountVal) {
        alert('Erro: Saldo insuficiente na conta do utilizador.');
        return;
      }
      newBal -= amountVal;
    }

    const { error } = await supabase.from('users').update({ balance: newBal }).eq('username', targetUser.username);
    if (error) {
      alert('Erro ao atualizar saldo no Supabase.');
      return;
    }

    alert(`Sucesso! Saldo de ${targetUser.username} atualizado para R$ ${newBal.toLocaleString('pt-BR')}.`);
    setAdminTargetUser('');
    setAdminDepositAmount('');
    await fetchUsers();
  };
