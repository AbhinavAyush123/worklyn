"use client"
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);




export default function PostJob() {
  const { user } = useUser();
  const [form, setForm] = useState({ title: '', description: '', company: '', location: '', salary: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('job_listings').insert([{ ...form, posted_by: user.id }]);
    if (error) return alert('Failed to submit job');
    alert('Job submitted successfully');
    setForm({ title: '', description: '', company: '', location: '', salary: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      {['title', 'description', 'company', 'location', 'salary'].map((field) => (
        <input
          key={field}
          required
          className="w-full border p-2 rounded"
          placeholder={field}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        />
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Post Job</button>
    </form>
  );
}
