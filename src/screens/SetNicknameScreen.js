import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SetNicknameScreen() {
  const { setNickname, signOut } = useAuth();
  const [nickname, setNicknameValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Garante que o valor exibido sempre começa com "@"
  function handleChange(text) {
    if (!text.startsWith('@')) {
      setNicknameValue('@' + text.replace('@', ''));
    } else {
      setNicknameValue(text);
    }
  }

  async function handleConfirm() {
    const clean = nickname.replace('@', '').trim();

    if (clean.length < 3) {
      Alert.alert('Nickname inválido', 'Escolha um nickname com pelo menos 3 caracteres.');
      return;
    }

    setLoading(true);
    const { error } = await setNickname(clean);
    setLoading(false);

    if (error) {
      Alert.alert('Erro', error.message);
    }
    // Em caso de sucesso, AuthContext atualiza `profile` e o App.js
    // redireciona automaticamente para a tela principal.
  }

  async function handleCancel() {
    await signOut();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.topDecoration} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Título e descrição */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logo}>🏷️</Text>
          </View>
          <Text style={styles.title}>Escolha seu nickname</Text>
          <Text style={styles.subtitle}>
            É assim que as pessoas vão te encontrar no app, ex: @henrique
          </Text>
        </View>

        {/* Campo e botões */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="@seunickname"
              placeholderTextColor="#B0B4C3"
              autoCapitalize="none"
              autoCorrect={false}
              value={nickname}
              onChangeText={handleChange}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Salvando…' : 'Confirmar'}
            </Text>
          </Pressable>

          <Pressable onPress={handleCancel} style={styles.linkWrapper}>
            <Text style={styles.cancelText}>Cancelar e sair</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = '#6C5CE7';
const PRIMARY_DARK = '#5849C4';
const BG = '#F5F6FB';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  topDecoration: {
    position: 'absolute',
    top: -140,
    left: '50%',
    marginLeft: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: PRIMARY,
    opacity: 0.12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EDEAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 34,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8DA1',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: '#3F3B6C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6E85',
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E1B2E',
    backgroundColor: '#FAFAFD',
  },
  button: {
    height: 54,
    backgroundColor: PRIMARY,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonPressed: {
    backgroundColor: PRIMARY_DARK,
    opacity: 0.95,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  linkWrapper: {
    marginTop: 4,
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#B0B4C3',
    fontWeight: '500',
  },
});