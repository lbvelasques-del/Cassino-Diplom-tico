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
      const { data: existing, error: errExist } = await supabase.from('users').select('*').ilike('username', trimmedUser);
      if (errExist) {
        alert('Erro ao consultar Supabase: ' + errExist.message);
        return;
      }
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
      if (error) {
        alert('ERRO AO REGISTAR NO SUPABASE: ' + error.message);
        setAuthError('Erro ao criar conta no servidor: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert('Aviso: O registo foi enviado mas não retornou dados.');
        return;
      }

      const created = data[0];
      setCurrentUser(created);
      setBalance(Number(created.balance));
      setIsAuthOpen(false);
      resetAuthForm();
      await fetchUsers();
      alert('Conta criada com sucesso!');
    } else {
      const { data, error } = await supabase.from('users').select('*').ilike('username', trimmedUser).eq('password', inputPassword);
      if (error) {
        alert('Erro no Login: ' + error.message);
        return;
      }
      if (!data || data.length === 0) {
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
