// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { supabase } from '@/lib/supabase';
// import { useUser } from '@clerk/nextjs';

// export default function ChatWindow({ friendId, friendName }) {
//   const { user, isLoaded } = useUser();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const messagesEndRef = useRef(null);

//   const myId = user?.id;

//   // Scroll to bottom
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   // Load message history
//   useEffect(() => {
//     if (!myId || !friendId) return;

//     const fetchMessages = async () => {
//       const { data, error } = await supabase
//         .from('messages')
//         .select('*')
//         .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
//         .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
//         .order('created_at', { ascending: true });

//       if (!error) setMessages(data);
//     };

//     fetchMessages();
//   }, [myId, friendId]);

//   // Subscribe to realtime messages
//   useEffect(() => {
//     if (!myId || !friendId) return;

//     const channel = supabase
//       .channel('realtime-messages')
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'messages',
//         },
//         (payload) => {
//           const msg = payload.new;
//           const isBetweenUsers =
//             (msg.sender_id === myId && msg.receiver_id === friendId) ||
//             (msg.sender_id === friendId && msg.receiver_id === myId);

//           if (isBetweenUsers) {
//             setMessages((prev) => [...prev, msg]);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [myId, friendId]);

//   // Scroll to bottom on new message
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!newMessage.trim()) return;

//     const { error } = await supabase.from('messages').insert([
//       {
//         sender_id: myId,
//         receiver_id: friendId,
//         content: newMessage.trim(),
//       },
//     ]);

//     if (!error) {
//       setNewMessage('');
//     }
//   };

//   return (
//     <div className="flex flex-col h-full p-4 border rounded shadow-sm bg-white">
//       <div className="text-lg font-semibold mb-2">Chat with {friendName}</div>

//       <div className="flex-1 overflow-y-auto space-y-2 mb-2 px-2">
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`max-w-xs p-2 rounded-lg ${
//               msg.sender_id === myId
//                 ? 'ml-auto bg-blue-500 text-white'
//                 : 'mr-auto bg-gray-200 text-black'
//             }`}
//           >
//             {msg.content}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="flex gap-2">
//         <input
//           type="text"
//           className="flex-1 px-3 py-2 border rounded"
//           placeholder="Type a message..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="px-4 py-2 bg-blue-600 text-white rounded"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
