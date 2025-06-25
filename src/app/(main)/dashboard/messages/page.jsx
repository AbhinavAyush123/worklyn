'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import NewMessageToast from './components/notifications';
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AddFriendDialog from './components/addFriends';


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
  const [lastMessagesMap, setLastMessagesMap] = useState({});
  const [requestSent, setRequestSent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

const filteredFriends = friends.filter((friend) => {
  const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
  return fullName.includes(searchTerm.toLowerCase());
});
  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };
useEffect(() => {
  if (!user?.id) return;

  const fetchLastMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error.message);
      return;
    }

    const map = {};

    data.forEach((msg) => {
      const friendId =
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!map[friendId]) {
        map[friendId] = msg;
      }
    });

    setLastMessagesMap(map);
  };

  fetchLastMessages();
}, [user?.id, messages]);



const [suggestedUsers, setSuggestedUsers] = useState([]);

const sendFriendRequest = async (receiverId) => {
  if (!user?.id || !receiverId) return;

  const { error } = await supabase.from('friend_requests').insert([
    {
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending',
    },
  ]);

  if (error) {
    console.error('Error sending friend request:', error.message);
  } else {
    setRequestSent((prev) => [...prev, receiverId]);
  }
};


useEffect(() => {
  const fetchSuggestions = async () => {
    if (!user?.id) return;
  
    // 1. Get current user's school
    const { data: currentUserData } = await supabase
      .from('users')
      .select('school')
      .eq('id', user.id)
      .single();
  
    const userSchool = currentUserData?.school;
    if (!userSchool) return;
  
    // 2. Get all users from the same school (excluding current user)
    const { data: sameSchoolUsers, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, image_url, school')
      .eq('school', userSchool)
      .neq('id', user.id);
  
    if (userError) {
      console.error('Error fetching users from same school:', userError.message);
      return;
    }
  
    // 3. Get accepted friend IDs
    const { data: accepted } = await supabase
      .from('friend_requests')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');
  
    const friendIds = accepted?.map((req) =>
      req.sender_id === user.id ? req.receiver_id : req.sender_id
    ) || [];
  
    // 4. Filter out existing friends
    const filteredSuggestions = sameSchoolUsers.filter(
      (u) => !friendIds.includes(u.id)
    );
  
    setSuggestedUsers(filteredSuggestions.slice(0, 5)); // limit to 5
  };
  

  fetchSuggestions();
}, [user?.id]);


  


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
  
    const { data: insertedMessage, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedFriend.id,
        content: newMsg,
      })
      .select()
      .single();
  
    if (error || !insertedMessage) {
      console.error("Error inserting message:", error);
      return;
    }
  
    console.log("Inserted message ID:", insertedMessage.id);
  
    setNewMsg('');
    sendTypingStatus(false);
    setFriends((prevFriends) => moveFriendToTop(prevFriends, selectedFriend));
  
    const { data: existingNotification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', selectedFriend.id)
      .eq('sender_id', user.id)
      .eq('type', 'message')
      .eq('is_read', false)
      .limit(1)
      .single();
  
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || "Someone";
  
    if (!fetchError && existingNotification) {
      const newCount = (existingNotification.count || 1) + 1;
      const updatedContent = `${displayName} sent you ${newCount} messages`;
  
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          count: newCount,
          content: updatedContent,
          created_at: new Date().toISOString(),
        })
        .eq('id', existingNotification.id);
  
      if (updateError) {
        console.error('Error updating grouped notification:', updateError);
      }
    } else {
      // Insert new notification — ensure insertedMessage.id is valid!
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: selectedFriend.id,
        sender_id: user.id,
        type: "message",
        related_id: insertedMessage.id,  // must be valid UUID
        content: `${displayName} sent you a message`,
        count: 1,
        is_read: false,
      });
  
      if (notifError) {
        console.error('Error creating message notification:', notifError);
      }
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


  function moveFriendToTop(friendsList, friendToMove) {
    if (!friendToMove) return friendsList;
  
    return [
      friendToMove,
      ...friendsList.filter((f) => f.id !== friendToMove.id),
    ];
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 p-4 overflow-y-auto">
  <h2 className="text-xl font-semibold mb-2">Chats</h2>
{/* Search bar */}
<Input
  placeholder="Search friends..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="mb-4"
/>

{/* Filtered friend list */}
{filteredFriends.length === 0 && searchTerm.trim() !== '' ? (
  <p className="text-sm text-gray-500">User not found</p>
) : (
  filteredFriends.map((friend) => (
    <motion.div
      key={friend.id}
      layout
      onClick={() => {
        setSelectedFriend(friend);
        setMessages([]);
        setIsFriendTyping(false);
      }}
      className={`p-3 rounded-2xl cursor-pointer hover:bg-blue-300 mb-3 ${
        selectedFriend?.id === friend.id ? 'bg-blue-200' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <img
          src={friend.image_url || '/default-avatar.png'}
          className="w-8 h-8 rounded-full"
          alt=""
        />
        <div className="flex flex-col">
          <span className="font-medium">
            {friend.first_name} {friend.last_name}
          </span>
          <span className="text-sm text-gray-500 truncate max-w-[180px]">
            {lastMessagesMap[friend.id]?.content || 'No messages yet'}
          </span>
        </div>
      </div>
    </motion.div>
  ))
)}

<AddFriendDialog/>


<div className="mt-6 border-t pt-4">
  <h3 className="text-sm font-semibold text-gray-700 mb-2">People You Might Know</h3>
  {suggestedUsers.length === 0 && (
    <p className="text-sm text-gray-500">No suggestions</p>
  )}
  {suggestedUsers.map((suggestedUser) => (
  <div key={suggestedUser.id} className="flex items-center justify-between p-2 mb-2">
    <div className="flex items-center gap-2">
      <img
        src={suggestedUser.image_url}
        alt={`${suggestedUser.first_name} ${suggestedUser.last_name}`}
        className="w-10 h-10 rounded-full"
      />
      <div className='flex flex-col'>
      <span>{suggestedUser.first_name} {suggestedUser.last_name}</span>
      <span className = 'text-xs text-neutral-500'> From : {suggestedUser.school}</span>
      </div>
      

      <DropdownMenu>
  <DropdownMenuTrigger>:</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Team</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
    <DropdownMenuSeparator />
    
    <DropdownMenuItem
      onClick={() => {
        if (!requestSent.includes(suggestedUser.id)) {
          sendFriendRequest(suggestedUser.id);
        }
      }}
      disabled={requestSent.includes(suggestedUser.id)}
      className={requestSent.includes(suggestedUser.id) ? 'opacity-50 cursor-not-allowed' : ''}
    >
      {requestSent.includes(suggestedUser.id) ? 'Request Sent' : 'Send Friend Request'}
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

    </div>

   
  </div>
))}

</div>


</div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col p-4">
        {selectedFriend ? (
          <>


      
            <h2 className="text-xl font-semibold mb-4 pb-2">
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
      className={`p-2 rounded-md max-w-sm text-sm ${
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
    
          <NewMessageToast 
  friends={friends} 
  selectedFriend={selectedFriend} 
  onSelectFriend={setSelectedFriend} 
/>
    </div>
  );
}