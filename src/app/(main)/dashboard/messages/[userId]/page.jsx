'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export default function MessagesPage() {
  const { user } = useUser();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);


  useEffect(() => {
    if (isFriendTyping && isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isFriendTyping, isNearBottom]);


useEffect(() => {
  const el = messagesContainerRef.current;
  if (!el) return;

  const handleScroll = () => {
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setIsNearBottom(isAtBottom);
  };

  el.addEventListener('scroll', handleScroll);
  return () => el.removeEventListener('scroll', handleScroll);
}, []);

  // Fetch accepted friends
  useEffect(() => {
    if (!user?.id) return;

    const fetchFriends = async () => {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching friends:', error.message);
        return;
      }

      const friendIds = data.map((req) =>
        req.sender_id === user.id ? req.receiver_id : req.sender_id
      );

      const { data: usersData } = await supabase
        .from('users')
        .select('id, first_name, last_name, image_url')
        .in('id', friendIds);

      setFriends(usersData || []);
    };

    fetchFriends();
  }, [user?.id]);




  // Fetch messages and subscribe to real-time updates
  useEffect(() => {
    if (!user?.id || !selectedFriend) return;

    let channel;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
        )
        .in('sender_id', [user.id, selectedFriend.id])
        .in('receiver_id', [user.id, selectedFriend.id])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error.message);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();
    

    // Realtime listener for new messages
    channel = supabase
      .channel(`chat_${user.id}_${selectedFriend.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new;

          const isRelevant =
            (newMsg.sender_id === user.id && newMsg.receiver_id === selectedFriend.id) ||
            (newMsg.sender_id === selectedFriend.id && newMsg.receiver_id === user.id);

          if (isRelevant) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

supabase
.channel(`chat_${user.id}_${selectedFriend.id}`)
.on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
  },
  (payload) => {
    const newMsg = payload.new;
    const isRelevant =
      (newMsg.sender_id === user.id && newMsg.receiver_id === selectedFriend.id) ||
      (newMsg.sender_id === selectedFriend.id && newMsg.receiver_id === user.id);

    if (isRelevant) {
      setMessages((prev) => [...prev, newMsg]);
    }
  }
)
.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'messages',
  },
  (payload) => {
    const updated = payload.new;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === updated.id ? { ...m, seen: updated.seen, seen_at: updated.seen_at } : m
      )
    );
  }
)
.subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedFriend?.id, user?.id]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);



  useEffect(() => {
    if (!user?.id || !selectedFriend?.id) return;
  
    const markMessagesAsSeen = async () => {
      await supabase
        .from('messages')
        .update({ seen: true, seen_at: new Date().toISOString() })
        .eq('receiver_id', user.id)
        .eq('sender_id', selectedFriend.id)
        .eq('seen', false);
    };
  
    markMessagesAsSeen();
  }, [selectedFriend?.id, user?.id]);
  



  useEffect(() => {
    if (!user?.id || !selectedFriend?.id) return;
  
    const channel = supabase
      .channel('typing-status-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'typing_status',
        },
        (payload) => {
          const data = payload.new;
          const isForMe = data.user_id === selectedFriend.id && data.receiver_id === user.id;
          if (isForMe) {
            setIsFriendTyping(data.is_typing);
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedFriend?.id, user?.id]);
  



  const handleSend = async () => {
    if (!newMsg.trim()) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedFriend.id,
      content: newMsg,
    });

    if (!error) {
      setNewMsg('');
      sendTypingStatus(false);
    }
  };

  useEffect(() => {
    return () => {
      if (user?.id && selectedFriend?.id) {
        sendTypingStatus(false);
      }
    };
  }, [selectedFriend?.id, user?.id]);


  

  const sendTypingStatus = async (isTyping) => {
    if (!user?.id || !selectedFriend?.id) return;

    await supabase.from('typing_status').upsert({
      user_id: user.id,
      receiver_id: selectedFriend.id,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });
  };


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => {
              setSelectedFriend(friend);
              setMessages([]);
              setIsFriendTyping(false);
            }}
            className={`p-3 rounded cursor-pointer hover:bg-gray-100 ${
              selectedFriend?.id === friend.id ? 'bg-gray-200' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <img
                src={friend.image_url || '/default-avatar.png'}
                className="w-8 h-8 rounded-full"
                alt=""
              />
              <span>
                {friend.first_name} {friend.last_name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col p-4">
        {selectedFriend ? (
          <>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              Chat with {selectedFriend.first_name}
            </h2>

            <div
  ref={messagesContainerRef}
  className="flex-1 overflow-y-auto space-y-2 mb-4"
>
{messages.map((msg, i) => {
  const isFromMe = msg.sender_id === user.id;
  const lastSentByMe = [...messages]
    .filter((m) => m.sender_id === user.id)
    .pop();

  return (
    <div
      key={i}
      className={`p-2 rounded max-w-sm text-sm ${
        isFromMe ? 'bg-blue-100 self-end ml-auto text-right' : 'bg-gray-200 self-start'
      }`}
    >
      <p>{msg.content}</p>
      <div className="text-xs text-gray-500 mt-1">
        {new Date(msg.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}

        {isFromMe && lastSentByMe?.id === msg.id && msg.seen && (
          <span className="ml-2 text-green-500">✓✓ Seen</span>
        )}
      </div>
    </div>
  );
})}

              {isFriendTyping && (
  <div className="flex items-center space-x-1 text-gray-500 text-sm ml-2 mb-2">
    <span>typing</span>
    <span className="animate-bounce">•</span>
    <span className="animate-bounce delay-150">•</span>
    <span className="animate-bounce delay-300">•</span>
  </div>
)}
              <div ref={bottomRef} />
            </div>

            <div className="flex space-x-2">
              <input
                className="flex-1 border p-2 rounded"
                value={newMsg}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewMsg(val);
                  sendTypingStatus(!!val.trim());
                }}
                placeholder="Type your message..."
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a friend to start chatting</p>
        )}
      </div>
    </div>
  );
}