import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side use
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Missing Supabase credentials in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

// Function to fetch professional profile data 
export async function fetchProfessionalProfile(userId: number) {
  if (!supabase) {
    console.warn('Supabase client not initialized, skipping profile fetch');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.warn('Error fetching professional profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Exception while fetching professional profile:', error);
    return null;
  }
}

// Export supabase instance
export { supabase };