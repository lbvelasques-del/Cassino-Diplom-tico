import React, { useState } from 'react';

export default function App() {
  const [usersDb, setUsersDb] = useState([
    { username: 'LVelasques', password: 'Lucas123!', balance: 99999999, isAdmin: true }
  ]);

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
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // Estados da ferramenta de gestão financeira do Admin
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
    { id: 'diamante', icon: '💎', name: 'Diamante', mult: 0, isBonus: true } // 7 Rodadas Grátis
  ];

  const [grid, setGrid] = useState([
    symbols[0], symbols[1], symbols[2], 
    symbols[3], symbols[4], symbols[5], 
    symbols[6], symbols[0], symbols[1]
  ]);
  
  const bets = [30000, 60000, 100000, 300000, 500000, 1000000, 3000000, 5000000];

  const checkHorizontalAndDiagonalWins = (currentGrid) => {
    let lines = [];
    if (currentGrid[0].id === currentGrid[1].id && currentGrid[1].id === currentGrid[2].id) lines.push(0, 1, 2);
    if (currentGrid[3].id === currentGrid[4].id && currentGrid[4].id === currentGrid[5].id) lines.push(3, 4, 5);
    if (currentGrid[6].id === currentGrid[7].id && currentGrid[7].id === currentGrid[8].id) lines.push(6, 7, 8);
    if (currentGrid[0].id === currentGrid[4].id && currentGrid[4].id === currentGrid[8].id) lines.push(0, 4, 8);
    if (currentGrid[2].id === currentGrid[4].id && currentGrid[4].id === currentGrid[6].id) lines.push(2, 4, 6);
    return [...new Set(lines)];
  };

  // Motor de Sorteio com Pesos (Garante retenção e lucro da casa)
  const getWinningSymbol = () => {
    const weights = {
      'pampas': 50,
      'alquimia': 48,
      'petroleo': 45,
      'brasil': 40,
      'moeda': 38,
      'costarica': 33,
      'diamante': 20
    };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;
    for (const [id, weight] of Object.entries(weights)) {
      if (randomNum < weight) return symbols.find(s => s.id === id);
      randomNum -= weight;
    }
    return symbols[0];
  };

  const spin = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const isFree = freeSpins > 0;
    if (!isFree && (balance < betAmount || spinning)) return;
    
    if (isFree) {
      setFreeSpins(prev => prev - 1);
    } else {
      setBalance(prev => prev - betAmount);
    }

    setSpinning(true);
    setWinningLines([]);
    setLastWin(0);

    setTimeout(() => {
      // Taxa de acerto: 38% nas rodadas grátis, 25% no jogo normal
      const winProbability = isFree ? 0.38 : 0.25; 
      const rand = Math.random();
      
      let newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);

      // Limpa qualquer vitória acidental antes de injetar a linha correta (ou forçar derrota)
      while (checkHorizontalAndDiagonalWins(newGrid).length > 0) {
        newGrid = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      }

      if (rand < winProbability) {
        // VITÓRIA CONTROLADA: Escolhe a imagem pela tabela de pesos
        const winningSym = getWinningSymbol();
        const winLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        const chosenLine = winLines[Math.floor(Math.random() * winLines.length)];
        
        // Aplica o símbolo vencedor numa única linha
        chosenLine.forEach(idx => { newGrid[idx] = winningSym; });
      }

      setGrid(newGrid);
      setSpinning(false);

      const winningIndices = checkHorizontalAndDiagonalWins(newGrid);
      if (winningIndices.length > 0) {
        const winningSymbol = newGrid[winningIndices[0]];
        if (winningSymbol.isBonus) {
          setFreeSpins(prev => prev + 7); // Agora concede 7 rodadas grátis
          setBonusActive(true);
          setLastWin(0);
        } else {
          const prize = betAmount * winningSymbol.mult;
          setBalance(prev => prev + prize);
          setLastWin(prize);
        }
        setWinningLines(winningIndices);
      }
    }, turbo ? 180 : 550);
  };

  const handleAuthSubmit = (e) => {
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
      const existing = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase());
      if (existing) {
        setAuthError('Este nome já está em uso.');
        return;
      }
      const newUser = {
        username: trimmedUser,
        password: inputPassword,
        balance: 150000,
        isAdmin: trimmedUser.toLowerCase() === 'lvelasques'
      };
      setUsersDb(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setBalance(newUser.balance);
      setIsAuthOpen(false);
      resetAuthForm();
    } else {
      const found = usersDb.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === inputPassword);
      if (!found) {
        setAuthError('Utilizador ou senha incorretos.');
        return;
      }
      setCurrentUser(found);
      setBalance(found.balance);
      setIsAuthOpen(false);
      resetAuthForm();
    }
  };

  const resetAuthForm = () => {
    setInputUsername('');
    setInputPassword('');
    setConfirmPassword('');
    setAuthError('');
  };

  const handleWithdrawSubmit = (e) => {
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
    setBalance(prev => prev - amountNum);
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

  const handleAdminBalanceUpdate = (e, type) => {
    e.preventDefault();
    const targetUserTrim = adminTargetUser.trim();
    const amountVal = parseFloat(adminDepositAmount);

    if (!targetUserTrim || isNaN(amountVal) || amountVal <= 0) {
      alert('Insira um nome válido e valor acima de zero.');
      return;
    }

    const userIndex = usersDb.findIndex(u => u.username.toLowerCase() === targetUserTrim.toLowerCase());
    if (userIndex === -1) {
      alert('Utilizador não encontrado na base de dados.');
      return;
    }

    const updatedUsers = [...usersDb];
    if (type === 'add') {
      updatedUsers[userIndex].balance += amountVal;
      alert(`Sucesso: R$ ${amountVal.toLocaleString('pt-BR')} adicionado a ${updatedUsers[userIndex].username}.`);
    } else if (type === 'remove') {
      if (updatedUsers[userIndex].balance < amountVal) {
        alert(`Erro: Saldo insuficiente na conta de ${updatedUsers[userIndex].username}.`);
        return;
      }
      updatedUsers[userIndex].balance -= amountVal;
      alert(`Sucesso: R$ ${amountVal.toLocaleString('pt-BR')} removido de ${updatedUsers[userIndex].username}.`);
    }

    setUsersDb(updatedUsers);
    
    if (currentUser && currentUser.username.toLowerCase() === updatedUsers[userIndex].username.toLowerCase()) {
      setBalance(updatedUsers[userIndex].balance);
    }
    
    setAdminTargetUser('');
    setAdminDepositAmount('');
  };
