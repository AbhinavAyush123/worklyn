'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import NewMessageToast from './components/notifications';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
 Search,
 Send,
 MoreHorizontal,
 UserPlus,
 User,
 MessageSquare,
 CheckCircle2,
 ChevronRight,
 PlusCircle,
 Users
} from 'lucide-react';
import AddFriendsSheet from '@/app/components/AddFriends';


export default function MessagesPage() {
 const { user } = useUser();
 const [friends, setFriends] = useState([]);
 const [recruiters, setRecruiters] = useState([]);
 const [selectedFriend, setSelectedFriend] = useState(null);
 const [messages, setMessages] = useState([]);
 const [newMsg, setNewMsg] = useState('');
 const [isFriendTyping, setIsFriendTyping] = useState(false);
 const bottomRef = useRef(null);
 const [isNearBottom, setIsNearBottom] = useState(true);
 const [lastMessagesMap, setLastMessagesMap] = useState({});
 const [requestSent, setRequestSent] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [activeTab, setActiveTab] = useState('students');
 const [suggestedUsers, setSuggestedUsers] = useState([]);


 const filteredFriends = activeTab === 'students'
 ? friends.filter(friend =>
     `${friend.first_name} ${friend.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
   ) // <-- closing this
 : recruiters.filter(recruiter =>
     `${recruiter.first_name} ${recruiter.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));




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
       const friendId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
       if (!map[friendId]) {
         map[friendId] = msg;
       }
     });


     setLastMessagesMap(map);
   };


   fetchLastMessages();
 }, [user?.id, messages]);


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
  
     const { data: currentUserData } = await supabase
       .from('users')
       .select('school')
       .eq('id', user.id)
       .single();
  
     const userSchool = currentUserData?.school;
     if (!userSchool) return;
  
     const { data: sameSchoolUsers, error: userError } = await supabase
       .from('users')
       .select('id, first_name, last_name, image_url, school, role')
       .eq('school', userSchool)
       .neq('id', user.id);
  
     if (userError) {
       console.error('Error fetching users from same school:', userError.message);
       return;
     }
  
     const { data: accepted } = await supabase
       .from('friend_requests')
       .select('sender_id, receiver_id')
       .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
       .eq('status', 'Accepted');
  
     const friendIds = accepted?.map((req) =>
       req.sender_id === user.id ? req.receiver_id : req.sender_id
     ) || [];
  
     const filteredSuggestions = sameSchoolUsers.filter(
       (u) => !friendIds.includes(u.id)
     );
  
     setSuggestedUsers(filteredSuggestions.slice(0, 5));
   };
  
   fetchSuggestions();
 }, [user?.id]);


 useEffect(() => {
   if (isFriendTyping && isNearBottom) {
     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
   }
 }, [isFriendTyping, isNearBottom]);


 // Fetch accepted friends and recruiters
 useEffect(() => {
   if (!user?.id) return;


   const fetchConnections = async () => {
     const { data, error } = await supabase
       .from('friend_requests')
       .select('sender_id, receiver_id')
       .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
       .eq('status', 'Accepted');


     if (error) {
       console.error('Error fetching friends:', error.message);
       return;
     }


     const connectionIds = data.map((req) =>
       req.sender_id === user.id ? req.receiver_id : req.sender_id
     );


     const { data: usersData } = await supabase
       .from('users')
       .select('id, first_name, last_name, image_url, role')
       .in('id', connectionIds);


     if (usersData) {
       setFriends(usersData.filter(user => user.role === 'student'));
       setRecruiters(usersData.filter(user => user.role === 'recruiter'));
     }
   };


   fetchConnections();
 }, [user?.id]);


 // Fetch messages and subscribe to real-time updates
 useEffect(() => {
   if (!user?.id || !selectedFriend) return;


   let channel;


   const fetchMessages = async () => {
     const { data, error } = await supabase
       .from('messages')
       .select('*')
       .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
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
     const { error: notifError } = await supabase.from('notifications').insert({
       user_id: selectedFriend.id,
       sender_id: user.id,
       type: "message",
       related_id: insertedMessage.id,
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
   <div className="flex h-screen overflow-hidden bg-background">
     {/* Sidebar */}
     <div className="w-1/4 border-r border-muted p-4 space-y-4 overflow-y-auto">
       <div className="flex items-center justify-between">
         <h2 className="text-lg font-semibold">Chats</h2>
         <Users className="w-5 h-5 text-muted-foreground" />
         <AddFriendsSheet/>
       </div>
        <Input
         placeholder="Search..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         className="mt-2"
       />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
         <TabsList className="grid grid-cols-2 bg-muted">
           <TabsTrigger value="students">Students</TabsTrigger>
           <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
         </TabsList>
       </Tabs>
        <ScrollArea className="h-[calc(100vh-220px)] mt-2 pr-2">
         {filteredFriends.length > 0 ? (
           filteredFriends.map((user) => {
             const lastMsg = lastMessagesMap[user.id];
             return (
               <div
                 key={user.id}
                 onClick={() => handleSelectFriend(user)}
                 className={cn(
                   "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-accent",
                   selectedFriend?.id === user.id && "bg-accent"
                 )}
               >
                 <Avatar className="w-10 h-10">
                   <AvatarImage src={user.image_url} alt={user.first_name} />
                   <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col text-sm flex-1">
                   <div className="font-medium">
                     {user.first_name} {user.last_name}
                   </div>
                   {lastMsg && (
                     <span className="text-muted-foreground truncate max-w-[180px] text-xs">
                       {lastMsg.sender_id === user.id ? lastMsg.content : `You: ${lastMsg.content}`}
                     </span>
                   )}
                 </div>
                 {lastMsg?.sender_id === user.id && !lastMsg?.seen && (
                   <Badge variant="secondary" className="text-xs">New</Badge>
                 )}
               </div>
             );
           })
         ) : (
           <p className="text-sm text-center mt-10 text-muted-foreground animate-pulse">
             No connections found.
           </p>
         )}
       </ScrollArea>
     </div>
      {/* Chat Window */}
     <div className="flex flex-col flex-1 h-full">
       {selectedFriend ? (
         <>
           {/* Chat Header */}
           <div className="flex items-center justify-between border-b border-muted p-4">
             <div className="flex items-center gap-3">
               <Avatar className="w-10 h-10">
                 <AvatarImage src={selectedFriend.image_url} />
                 <AvatarFallback>{selectedFriend.first_name[0]}</AvatarFallback>
               </Avatar>
               <div>
                 <div className="font-semibold">{selectedFriend.first_name} {selectedFriend.last_name}</div>
                 {isFriendTyping && (
                   <span className="text-xs text-blue-500 animate-pulse">typing...</span>
                 )}
               </div>
             </div>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon">
                   <MoreHorizontal className="w-5 h-5" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                 <DropdownMenuLabel>Options</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem>View Profile</DropdownMenuItem>
                 <DropdownMenuItem>Unfriend</DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
            {/* Chat Messages */}
           <ScrollArea className="flex-1 p-4 space-y-2 overflow-y-auto">
 {messages.map((msg) => {
   const isMe = msg.sender_id === user.id;
   return (
     <div
       key={msg.id}
       className={cn(
         "w-full flex",
         isMe ? "justify-end" : "justify-start"
       )}
     >
       <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className={cn(
           "px-4 py-2 rounded-xl text-sm break-words",
           "max-w-[80%] inline-block",
           isMe
             ? "bg-blue-600 text-white mt-3"
             : "bg-muted text-foreground"
         )}
       >
         {msg.content}
         <div className="text-[10px] mt-1 opacity-70 text-right whitespace-nowrap">
           {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           {isMe && msg.seen && <CheckCircle2 className="inline w-3 h-3 ml-1 text-green-500" />}
         </div>
       </motion.div>
     </div>
   );
 })}
 <div ref={bottomRef} />
</ScrollArea>


            {/* Message Input */}
           <div className="border-t border-muted p-3">
             <div className="flex items-center gap-2">
               <Input
                 value={newMsg}
                 onChange={(e) => {
                   setNewMsg(e.target.value);
                   sendTypingStatus(true);
                 }}
                 onKeyDown={(e) => {
                   if (e.key === "Enter") {
                     handleSend();
                   }
                 }}
                 placeholder="Type your message..."
                 className="flex-1"
               />
               <Button onClick={handleSend} size="icon" className="bg-blue-600 text-white hover:bg-blue-700">
                 <Send className="w-4 h-4" />
               </Button>
             </div>
           </div>
         </>
       ) : (
         <div className="flex items-center justify-center h-full text-muted-foreground">
           <MessageSquare className="w-6 h-6 mr-2" />
           Select a chat to start messaging.
         </div>
       )}
     </div>
      {/* <NewMessageToast /> */}
   </div>
 );
} 



