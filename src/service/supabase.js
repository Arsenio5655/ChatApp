import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ttxhdkdthknfpfxjmlmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eGhka2R0aGtuZnBmeGptbG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDgyNzAsImV4cCI6MjA5ODY4NDI3MH0.8xLXh42pfsCqo57b7uKQk-geXC2U0Td9jGmR9h7vLX8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});