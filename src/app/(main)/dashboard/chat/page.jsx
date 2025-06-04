'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState(''); // could be selected from UI

  const fetchMessages = async () => {
    if (!user?.id || !receiverId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .order('created_at');

    if (error) return console.error(error);
    setMessages(data);
  };

  const sendMessage = async () => {
    const { error } = await supabase
      .from('messages')
      .insert({ sender_id: user.id, receiver_id: receiverId, content });

    if (!error) setContent('');
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, [user?.id, receiverId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Chat</h1>
      <input
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        placeholder="Receiver ID"
        className="border p-2 mb-4 w-full"
      />
      <div className="h-64 overflow-y-auto border mb-4 p-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.sender_id === user.id ? 'You' : 'Them'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-2 mb-2"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}
