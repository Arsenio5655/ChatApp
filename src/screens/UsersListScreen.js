import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { supabase } from '../service/supabase';
import { useAuth } from '../context/AuthContext';

export default function UsersListScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', profile.id)
      .not('nickname', 'is', null);
    if (search.trim()) {
      query = query.ilike('nickname', `%${search.trim().toLowerCase()}%`);
    }
    const { data } = await query.order('nickname');
    setUsers(data || []);
  }, [search, profile]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function onRefresh() {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>@{profile?.nickname}</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logout}>Sair</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Buscar por nickname..."
        autoCapitalize="none"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum usuário encontrado</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => navigation.navigate('Chat', { otherUser: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.nickname[0]?.toUpperCase()}</Text>
            </View>
            <Text style={styles.userNick}>@{item.nickname}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  logout: { color: '#EF4444', fontWeight: '600' },
  search: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  userNick: { fontSize: 16, fontWeight: '500' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});