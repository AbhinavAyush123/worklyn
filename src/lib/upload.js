import { supabase } from '@/lib/supabase';

export async function uploadFileToSupabase(file, userId) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`; // unique file name
  const filePath = `profile-pictures/${fileName}`;

  const { error } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
