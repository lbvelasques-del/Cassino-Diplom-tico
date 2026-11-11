import React, { useState, useEffect } from 'react';

export default function FutebolDiplomatico({ currentUser, balance, setBalance }) {
  const isAdmin = currentUser?.isAdmin || currentUser?.username?.toLowerCase() === 'lvelasques';
  const [activeTab, setActiveTab] = useState('taticas');

  const [tatica, setTatica] = useState(() => localStorage.getItem('pampas_tatica_futebol') || '4-3-3');
  const [estiloJogo, setEstiloJogo] = useState(() => localStorage.getItem('pampas_estilo_futebol') || 'Equilibrado');
  const [mentalidade, setMentalidade] = useState(() => localStorage.getItem('pampas_mentalidade_futebol') || 'Normal');
  const [isSaved, setIsSaved] = useState(false);

  const [clubes, setClubes] = useState(() => {
    const saved = localStorage.getItem('pampas_futebol_clubes');
    return saved ? JSON.parse(saved) : [
      { id: 1, nome: 'Grupo Pampas FC', sigla: 'GPFC', forca: 85 },
      { id: 2, nome: 'Costa Rica United', sigla: 'CRU', forca: 82 },
      { id: 3, nome: 'Diplomatas City', sigla: 'DIP', forca: 80 }
    ];
  });

  const [jogadores, setJogadores] = useState(() => {
    const saved = localStorage.getItem('pampas_futebol_jogadores');
    return saved ? JSON.parse(saved) : [];
  });

  const [partidas, setPartidas] = useState(() => {
    const saved = localStorage.getItem('pampas_futebol_partidas');
    return saved ? JSON.parse(saved) : [];
  });

  const [classificacao, setClassificacao] = useState(() => {
    const saved = localStorage.getItem('pampas_futebol_classificacao');
    return saved ? JSON.parse(saved) : clubes.map(c => ({
      clubeId: c.id, nome: c.nome, pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, saldo: 0
    }));
  });

  useEffect(() => { localStorage.setItem('pampas_futebol_clubes', JSON.stringify(clubes)); }, [clubes]);
  useEffect(() => { localStorage.setItem('pampas_futebol_jogadores', JSON.stringify(jogadores)); }, [jogadores]);
  useEffect(() => { localStorage.setItem('pampas_futebol_partidas', JSON.stringify(partidas)); }, [partidas]);
  useEffect(() => { localStorage.setItem('pampas_futebol_classificacao', JSON.stringify(classificacao)); }, [classificacao]);

  const [novoJogadorNome, setNovoJogadorNome] = useState('');
  const [novoJogadorPosicao, setNovoJogadorPosicao] = useState('ATA');
  const [novoJogadorOverall, setNovoJogadorOverall] = useState(75);
  const [novoJogadorClubeId, setNovoJogadorClubeId] = useState(clubes[0]?.id || '');
  
  const [transfJogadorId, setTransfJogadorId] = useState('');
  const [transfNovoClubeId, setTransfNovoClubeId] = useState('');

  const [partidaClubeCasa, setPartidaClubeCasa] = useState(clubes[0]?.id || '');
  const [partidaClubeFora, setPartidaClubeFora] = useState(clubes[1]?.id || '');

  const salvarTatidaInstantanea = () => {
    localStorage.setItem('pampas_tatica_futebol', tatica);
    localStorage.setItem('pampas_estilo_futebol', estiloJogo);
    localStorage.setItem('pampas_mentalidade_futebol', mentalidade);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCriarJogador = (e) => {
    e.preventDefault();
    if (!novoJogadorNome.trim() || !novoJogadorClubeId) return alert('Preencha os dados do jogador e escolha um clube.');
    const novoJogador = {
      id: Date.now(),
      nome: novoJogadorNome,
      posicao: novoJogadorPosicao,
      overall: Number(novoJogadorOverall),
      clubeId: Number(novoJogadorClubeId)
    };
    setJogadores([...jogadores, novoJogador]);
    setNovoJogadorNome('');
    alert(`Jogador ${novoJogadorNome} criado e adicionado ao clube!`);
  };

  const handleTransferencia = (e) => {
    e.preventDefault();
    if (!transfJogadorId || !transfNovoClubeId) return alert('Selecione o jogador e o novo clube.');
    const atualizados = jogadores.map(j => 
      j.id === Number(transfJogadorId) ? { ...j, clubeId: Number(transfNovoClubeId) } : j
    );
    setJogadores(atualizados);
    setTransfJogadorId('');
    alert('Transferência realizada com sucesso!');
  };

  const simularPartida = (e) => {
    e.preventDefault();
    if (partidaClubeCasa === partidaClubeFora) return alert('O clube não pode jogar contra si mesmo.');
    const clubeCasa = clubes.find(c => c.id === Number(partidaClubeCasa));
    const clubeFora = clubes.find(c => c.id === Number(partidaClubeFora));
    if (!clubeCasa || !clubeFora) return alert('Clubes inválidos.');

    let bonusCasa = 0;
    if (estiloJogo === 'PressaoAlta') bonusCasa += 1;
    if (mentalidade === 'Ofensiva' || mentalidade === 'TudoOuNada') bonusCasa += 1.5;

    const baseCasa = Math.random() * (clubeCasa.forca / 15) + bonusCasa;
    const baseFora = Math.random() * (clubeFora.forca / 15);
    const golsCasa = Math.floor(Math.max(0, baseCasa));
    const golsFora = Math.floor(Math.max(0, baseFora));

    const novaPartida = {
      id: Date.now(),
      data: new Date().toLocaleDateString('pt-BR'),
      clubeCasa: clubeCasa.nome,
      golsCasa: golsCasa,
      clubeFora: clubeFora.nome,
      golsFora: golsFora
    };

    setPartidas([novaPartida, ...partidas]);

    setClassificacao(prevClassificacao => {
      const novaClassificacao = prevClassificacao.map(c => ({ ...c }));
      const indexCasa = novaClassificacao.findIndex(c => c.clubeId === clubeCasa.id);
      const indexFora = novaClassificacao.findIndex(c => c.clubeId === clubeFora.id);
      
      novaClassificacao[indexCasa].jogos += 1;
      novaClassificacao[indexCasa].golsPro += golsCasa;
      novaClassificacao[indexCasa].golsContra += golsFora;
      novaClassificacao[indexCasa].saldo = novaClassificacao[indexCasa].golsPro - novaClassificacao[indexCasa].golsContra;

      novaClassificacao[indexFora].jogos += 1;
      novaClassificacao[indexFora].golsPro += golsFora;
      novaClassificacao[indexFora].golsContra += golsCasa;
      novaClassificacao[indexFora].saldo = novaClassificacao[indexFora].golsPro - novaClassificacao[indexFora].golsContra;

      if (golsCasa > golsFora) {
        novaClassificacao[indexCasa].vitorias += 1;
        novaClassificacao[indexCasa].pontos += 3;
        novaClassificacao[indexFora].derrotas += 1;
      } else if (golsCasa < golsFora) {
        novaClassificacao[indexFora].vitorias += 1;
        novaClassificacao[indexFora].pontos += 3;
        novaClassificacao[indexCasa].derrotas += 1;
      } else {
        novaClassificacao[indexCasa].empates += 1;
        novaClassificacao[indexCasa].pontos += 1;
        novaClassificacao[indexFora].empates += 1;
        novaClassificacao[indexFora].pontos += 1;
      }
      return novaClassificacao.sort((a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias || b.saldo - a.saldo);
    });

    alert(`Fim de Jogo! ${clubeCasa.sigla} ${golsCasa} x ${golsFora} ${clubeFora.sigla}`);
  };return (
    <div className="min-h-screen bg-black text-white p-4 max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 via-[#0b1f14] to-black border border-emerald-500/40 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-400 tracking-wider">⚽ FUTEBOL DIPLOMÁTICO</h1>
          <p className="text-xs text-zinc-400 font-semibold">Simulador Profissional de Clubes & Série A Oficial</p>
        </div>
        <div className="flex gap-2 bg-black/60 p-1.5 rounded-2xl border border-emerald-500/20">
          <button onClick={() => setActiveTab('taticas')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'taticas' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'}`}>Táticas & Plantel</button>
          <button onClick={() => setActiveTab('tabela')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'tabela' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'}`}>Série A & Partidas</button>
          {isAdmin && (
            <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'admin' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-amber-400 hover:text-white'}`}>Área Admin</button>
          )}
        </div>
      </div>

      {activeTab === 'taticas' && (
        <div className="space-y-6">
          <div className="bg-[#0f0f12] border-2 border-emerald-500/50 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-emerald-400 font-black text-base uppercase tracking-wide">🛠️ Painel Tático & Estilo de Jogo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5">Formação Tática</label>
                <select value={tatica} onChange={(e) => setTatica(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500">
                  <option value="4-3-3">4-3-3 Ofensivo</option>
                  <option value="4-4-2">4-4-2 Clássico</option>
                  <option value="3-5-2">3-5-2 Posse de Bola</option>
                  <option value="5-3-2">5-3-2 Retranca</option>
                  <option value="4-2-3-1">4-2-3-1 Equilibrado</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5">Estilo de Jogo</label>
                <select value={estiloJogo} onChange={(e) => setEstiloJogo(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500">
                  <option value="Equilibrado">Equilibrado</option>
                  <option value="Contra-Ataque">Contra-Ataque Rápido</option>
                  <option value="Tiki-Taka">Tiki-Taka (Posse)</option>
                  <option value="PressaoAlta">Pressão Alta (Gegenpressing)</option>
                  <option value="BolasLongas">Bolas Longas</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5">Mentalidade</label>
                <select value={mentalidade} onChange={(e) => setMentalidade(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500">
                  <option value="UltraDefensiva">Ultra Defensiva</option>
                  <option value="Defensiva">Defensiva</option>
                  <option value="Normal">Normal</option>
                  <option value="Ofensiva">Ofensiva</option>
                  <option value="TudoOuNada">Tudo ou Nada</option>
                </select>
              </div>
            </div>

            <button 
              onClick={salvarTatidaInstantanea}
              className={`w-full font-black py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer ${isSaved ? 'bg-emerald-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-black'}`}
            >
              {isSaved ? '✅ TÁTICA SALVA E APLICADA COM SUCESSO!' : '💾 SALVAR FORMAÇÃO INSTANTANEAMENTE'}
            </button>
          </div>

          <div className="bg-[#0f0f12] border border-zinc-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-white font-black text-base uppercase">📋 Plantel de Jogadores</h3>
            {jogadores.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Nenhum jogador registado. {isAdmin ? 'Crie jogadores na aba de Área Admin.' : ''}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {jogadores.map(j => {
                  const clubeNome = clubes.find(c => c.id === j.clubeId)?.nome || 'Sem Clube';
                  return (
                    <div key={j.id} className="bg-[#141418] border border-zinc-800 p-3 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <span className="text-emerald-400 font-bold block">{j.nome} ({j.posicao})</span>
                        <span className="text-[10px] text-zinc-400">Clube: {clubeNome}</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 font-black px-2.5 py-1 rounded-xl border border-emerald-500/30">OVR {j.overall}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tabela' && (
        <div className="space-y-6">
          <div className="bg-[#0f0f12] border border-emerald-500/30 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-emerald-400 font-black text-base uppercase">🏆 Tabela da Série A Oficial</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-2">Clube</th>
                    <th className="pb-2 text-center">PTS</th>
                    <th className="pb-2 text-center">J</th>
                    <th className="pb-2 text-center">V</th>
                    <th className="pb-2 text-center">E</th>
                    <th className="pb-2 text-center">D</th>
                    <th className="pb-2 text-center">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {classificacao.map((c, index) => (
                    <tr key={c.clubeId} className="hover:bg-[#141418]">
                      <td className="py-2.5 font-bold text-white flex items-center gap-2">
                        <span className="text-[10px] text-emerald-400 w-4">{index + 1}º</span> {c.nome}
                      </td>
                      <td className="py-2.5 text-center font-black text-amber-400">{c.pontos}</td>
                      <td className="py-2.5 text-center text-zinc-400">{c.jogos}</td>
                      <td className="py-2.5 text-center text-zinc-400">{c.vitorias}</td>
                      <td className="py-2.5 text-center text-zinc-400">{c.empates}</td>
                      <td className="py-2.5 text-center text-zinc-400">{c.derrotas}</td>
                      <td className="py-2.5 text-center text-zinc-400">{c.saldo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin' && isAdmin && (
        <div className="space-y-6">
          <div className="bg-[#0f0f12] border-2 border-amber-500/50 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-amber-400 font-black text-base uppercase">⚡ Criar Novo Jogador</h3>
            <form onSubmit={handleCriarJogador} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Nome do Jogador</label>
                <input type="text" value={novoJogadorNome} onChange={(e) => setNovoJogadorNome(e.target.value)} placeholder="Ex: Cristiano Silva" required className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Posição</label>
                <select value={novoJogadorPosicao} onChange={(e) => setNovoJogadorPosicao(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500">
                  <option value="ATA">Atacante (ATA)</option>
                  <option value="MEI">Médio (MEI)</option>
                  <option value="DEF">Defesa (DEF)</option>
                  <option value="GR">Guarda-Redes (GR)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Overall (OVR: {novoJogadorOverall})</label>
                <input type="number" min="50" max="99" value={novoJogadorOverall} onChange={(e) => setNovoJogadorOverall(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Atribuir ao Clube</label>
                <select value={novoJogadorClubeId} onChange={(e) => setNovoJogadorClubeId(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500">
                  {clubes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer">Adicionar Jogador ao Plantel</button>
              </div>
            </form>
          </div>

          <div className="bg-[#0f0f12] border border-zinc-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-amber-400 font-black text-base uppercase">🔄 Gerir Transferências de Jogadores</h3>
            <form onSubmit={handleTransferencia} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Selecionar Jogador</label>
                <select value={transfJogadorId} onChange={(e) => setTransfJogadorId(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500">
                  <option value="">-- Escolher Jogador --</option>
                  {jogadores.map(j => <option key={j.id} value={j.id}>{j.nome} (OVR {j.overall})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Novo Clube Destino</label>
                <select value={transfNovoClubeId} onChange={(e) => setTransfNovoClubeId(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500">
                  <option value="">-- Escolher Clube --</option>
                  {clubes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer">Concluir Transferência</button>
              </div>
            </form>
          </div>

          <div className="bg-[#0f0f12] border border-emerald-500/50 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-emerald-400 font-black text-base uppercase">⚡ Simular Partida Oficial da Série A</h3>
            <form onSubmit={simularPartida} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Clube da Casa</label>
                <select value={partidaClubeCasa} onChange={(e) => setPartidaClubeCasa(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500">
                  {clubes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Clube de Fora</label>
                <select value={partidaClubeFora} onChange={(e) => setPartidaClubeFora(e.target.value)} className="w-full bg-[#141418] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500">
                  {clubes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-xl text-xs transition-all shadow-lg cursor-pointer">Simular Partida e Atualizar Tabela</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
