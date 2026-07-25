import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SetNicknameScreen from './src/screens/SetNicknameScreen';
import UsersListScreen from './src/screens/UsersListScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();

function Routes() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Sem sessão -> login/cadastro
  if (!session) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  // Sessão existe mas o nickname ainda não foi definido -> obriga a
  // passar por essa tela antes de liberar o resto do app.
  if (!profile?.nickname) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="SetNickname"
          component={SetNicknameScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // Sessão + nickname definido -> app liberado
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UsersList"
        component={UsersListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AuthProvider>
  );
}