import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email || !password) {
      Alert.alert('Ops', 'Preencha e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { data, error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao criar conta', error.message);
      return;
    }

    // Se a confirmação de e-mail estiver ativada, ainda não há sessão
    // aqui — o app volta pra tela de Login. Se estiver desativada, o
    // AuthContext já detecta a sessão e o App.js leva direto pra tela
    // de escolher o nickname.
    if (!data.session) {
      Alert.alert(
        'Quase lá!',
        'Verifique seu e-mail para confirmar a conta e depois faça login.'
      );
      navigation.navigate('Login');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Criar conta</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha (mín. 6 caracteres)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Criando...' : 'Criar conta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#4F46E5', marginTop: 20, fontSize: 14 },
});