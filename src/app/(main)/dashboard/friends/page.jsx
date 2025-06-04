'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export default function FriendsPage() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users except the current user
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, image_url, role')
        .neq('id', user.id); // exclude current user

      if (error) {
        console.error('Error fetching users:', error.message);
      } else {
        setUsers(data);
      }

      setLoading(false);
    };

    fetchUsers();
  }, [user?.id]);

  const sendFriendRequest = async (receiverId) => {
    const res = await fetch('/api/friends/send-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId }),
    });

    if (res.ok) {
      alert('Friend request sent!');
    } else {
      const err = await res.text();
      alert('Error: ' + err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Other Users</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between border p-4 rounded"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={u.image_url || '/default-avatar.png'}
                  alt={u.first_name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{u.first_name} {u.last_name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
              <button
  className="px-3 py-1 bg-blue-500 text-white rounded"
  onClick={async () => {
    const res = await fetch('/api/send-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: u.id }), // ✅ Send the other user's ID
    });

    if (res.ok) {
      alert('Friend request sent!');
    } else {
      const err = await res.text();
      alert('Error: ' + err);
    }
  }}
>
  Add
</button>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
