import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../service/supabase';

const AuthContext = createContext(null);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) loadProfile(newSession.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Busca o perfil. Se não achar de primeira, tenta mais 2 vezes com um
  // pequeno intervalo — evita marcar "perfil não encontrado" por causa de
  // uma janela de tempo em que a sessão ainda não propagou totalmente
  // pro client do Supabase (o que faria a consulta rodar sem autenticação
  // e o RLS devolver vazio mesmo o perfil existindo no banco).
  async function loadProfile(userId, attempt = 1) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.log('Erro ao carregar perfil:', error.message);
    }

    if (!data && attempt < 3) {
      await sleep(500);
      return loadProfile(userId, attempt + 1);
    }

    if (!data) {
      // Depois de 3 tentativas, realmente não existe linha em profiles
      // pra esse usuário (ex: conta criada antes do trigger existir).
      Alert.alert(
        'Perfil não encontrado',
        'Sua conta não tem um perfil associado. Faça login novamente ou crie uma nova conta.'
      );
      await supabase.auth.signOut();
      setProfile(null);
      setLoading(false);
      return;
    }

    // data existe, mas data.nickname pode ser null — conta recém-criada
    // que ainda não escolheu o nickname. Isso é esperado; o App.js trata.
    setProfile(data);
    setLoading(false);
  }

  // Cria conta só com email/senha. O trigger no banco já cria a linha em
  // profiles (com nickname NULL). O nickname é definido depois, com
  // setNickname(), numa tela própria após o login.
  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // Define o nickname do usuário logado (chamado pela SetNicknameScreen,
  // seja para escolher pela primeira vez ou trocar depois).
  async function setNickname(nickname) {
    if (!session) return { error: { message: 'Sem sessão ativa.' } };

    const cleanNickname = nickname.trim().toLowerCase().replace('@', '');

    const { data, error } = await supabase
      .from('profiles')
      .update({ nickname: cleanNickname })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) return { error };

    setProfile(data);
    return { data };
  }

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signUp, signIn, signOut, setNickname }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}