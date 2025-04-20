import { createClient } from '@supabase/supabase-js';
import { User } from '@shared/schema';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
}

// User profile helpers
export async function getUserProfile() {
  const { user, error: authError } = await getCurrentUser();
  
  if (authError || !user) {
    return { profile: null, error: authError };
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return { profile: data as User, error };
}

export async function updateUserProfile(updates: Partial<User>) {
  const { user, error: authError } = await getCurrentUser();
  
  if (authError || !user) {
    return { error: authError };
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id);
  
  return { data, error };
}
