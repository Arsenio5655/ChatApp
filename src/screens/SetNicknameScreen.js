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

export default function SetNicknameScreen() {
  const { setNickname, signOut } = useAuth();
  const [nickname, setNicknameInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    const cleanNick = nickname.trim().toLowerCase().replace('@', '');

    if (!/^[a-z0-9_]{3,20}$/.test(cleanNick)) {
      Alert.alert(
        'Nickname inválido',
        'Use de 3 a 20 caracteres: letras minúsculas, números ou _'
      );
      return;
    }

    setLoading(true);
    const { error } = await setNickname(cleanNick);
    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        Alert.alert('Ops', 'Esse nickname já está em uso, escolha outro.');
      } else {
        Alert.alert('Erro', error.message);
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Escolha seu nickname</Text>
      <Text style={styles.subtitle}>
        É assim que as pessoas vão te encontrar no app, ex: @henrique
      </Text>

      <TextInput
        style={styles.input}
        placeholder="nickname"
        autoCapitalize="none"
        autoFocus
        value={nickname}
        onChangeText={setNicknameInput}
      />

      <TouchableOpacity style={styles.button} onPress={handleConfirm} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Confirmar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={signOut}>
        <Text style={styles.link}>Cancelar e sair</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
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
  link: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 14 },
});