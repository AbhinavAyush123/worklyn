'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FriendRequestsPage() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          status,
          sender:sender_id (
            first_name,
            last_name
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) console.error('Error fetching requests:', error);
      else setRequests(data);
    };

    fetchRequests();
  }, [user?.id]);

  const handleResponse = async (id, accept) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', id);

    if (error) return console.error(error);
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Friend Requests</h1>
      {requests.map((req) => (
        <div key={req.id} className="border p-4 rounded mb-2">
          <p>{req.sender.first_name} {req.sender.last_name} wants to connect.</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleResponse(req.id, true)}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={() => handleResponse(req.id, false)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
