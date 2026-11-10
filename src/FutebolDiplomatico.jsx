// Adiciona estes estados no início do componente FutebolDiplomatico
  const [matchState, setMatchState] = useState('menu'); // 'menu', 'simulating', 'result'
  const [matchResult, setMatchResult] = useState(null);
  const [liveLog, setLiveLog] = useState([]);

  // Função para simular a partida ao clicar em "Entrar em Campo"
  const startMatchSimulation = () => {
    setMatchState('simulating');
    setLiveLog(['Apito inicial! A bola está a rolar...', 'A equipa estuda o adversário no meio-campo...']);

    setTimeout(() => {
      setLiveLog(prev => [...prev, 'Boa jogada coletiva pelo flanco esquerdo!']);
    }, 1500);

    setTimeout(() => {
      // Cálculo simples baseado na força do plantel carregado do Supabase
      const teamOverall = myTeam?.overall || 75;
      const rivalOverall = 74; // Adversário equilibrado
      
      const myGoals = Math.floor(Math.random() * 3) + (teamOverall > rivalOverall ? 1 : 0);
      const rivalGoals = Math.floor(Math.random() * 2);

      setMatchResult({
        homeTeam: myTeam?.name || "Minha Equipa",
        awayTeam: "Rival FC",
        homeGoals: myGoals,
        awayGoals: rivalGoals,
        points: myGoals > rivalGoals ? 3 : myGoals === rivalGoals ? 1 : 0
      });
      setMatchState('result');
    }, 3500);
  };
