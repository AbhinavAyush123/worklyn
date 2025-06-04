import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from './supabase';

export async function getUserRole() {
  const user = await currentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Failed to fetch user role:', error.message);
    return null;
  }

  return data.role;
}
