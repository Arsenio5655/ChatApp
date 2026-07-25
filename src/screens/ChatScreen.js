import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../service/supabase';
import { useAuth } from '../context/AuthContext';

export default function ChatScreen({ route, navigation }) {
  const { otherUser } = route.params;
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: `@${otherUser.nickname}` });
    loadMessages();

    // Escuta novas mensagens em tempo real
    const channel = supabase
      .channel(`chat-${profile.id}-${otherUser.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          const belongsToThisChat =
            (msg.sender_id === profile.id && msg.receiver_id === otherUser.id) ||
            (msg.sender_id === otherUser.id && msg.receiver_id === profile.id);
          if (belongsToThisChat) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUser.id]);

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${profile.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${profile.id})`
      )
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }

  async function sendMessage() {
    const content = text.trim();
    if (!content) return;
    setText('');
    const { error } = await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: otherUser.id,
      content,
    });
    if (error) console.log('Erro ao enviar:', error.message);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMine = item.sender_id === profile.id;
          return (
            <View
              style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}
            >
              <Text style={isMine ? styles.textMine : styles.textTheirs}>{item.content}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, gap: 8 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleMine: { backgroundColor: '#4F46E5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#F1F1F1', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  textMine: { color: '#fff', fontSize: 15 },
  textTheirs: { color: '#111', fontSize: 15 },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sendText: { color: '#fff', fontWeight: '600' },
});