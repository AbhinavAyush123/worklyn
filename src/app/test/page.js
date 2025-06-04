'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');

      if (error) {
        setError(error.message);
        console.error('Supabase error:', error.message);
      } else {
        setUsers(data);
        console.log('Fetched users:', data);
      }
    };

    fetchUsers();
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Users from Supabase</h1>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.clerk_id} className="border p-2 rounded">
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Image:</strong> <a href={user.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">View</a></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
