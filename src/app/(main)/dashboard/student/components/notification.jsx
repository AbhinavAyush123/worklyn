'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;

    const fetchNotifications = async () => {
      const { data: friendRequests } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'pending');

      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('*, sender_id')
        .eq('receiver_id', userId)
        .eq('seen', false);

      const groupedMessages = {};
      for (let msg of unreadMessages || []) {
        if (!groupedMessages[msg.sender_id]) {
          groupedMessages[msg.sender_id] = 1;
        } else {
          groupedMessages[msg.sender_id]++;
        }
      }

      const messageNotifs = await Promise.all(
        Object.entries(groupedMessages).map(async ([senderId, count]) => {
          const { data: sender } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', senderId)
            .single();

          const senderName = sender?.first_name
            ? `${sender.first_name} ${sender.last_name || ''}`.trim()
            : 'Someone';

          return {
            id: `msg-${senderId}`, // unique id for react key and removal
            type: 'message',
            senderId,
            text: `${senderName} sent ${count} message${count > 1 ? 's' : ''}.`,
          };
        })
      );

      const friendRequestNotifs = (friendRequests || []).map((req) => ({
        id: `fr-${req.id}`,
        type: 'friend_request',
        text: 'You have a new friend request.',
      }));

      const all = [...friendRequestNotifs, ...messageNotifs];

      setNotifications(all);
      setHasNew(all.length > 0);
    };

    fetchNotifications();

    const messageChannel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const senderId = payload.new.sender_id;

          const { data: sender } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', senderId)
            .single();

          const senderName = sender?.first_name
            ? `${sender.first_name} ${sender.last_name || ''}`.trim()
            : 'Someone';

          setNotifications((prev) => {
            const updated = [...prev];
            const existingIndex = updated.findIndex(
              (n) => n.type === 'message' && n.senderId === senderId
            );

            if (existingIndex !== -1) {
              const existing = updated[existingIndex];
              const match = existing.text.match(/(\d+)/);
              const currentCount = match ? parseInt(match[1], 10) : 1;
              updated[existingIndex] = {
                ...existing,
                text: `${senderName} sent ${currentCount + 1} message${currentCount + 1 > 1 ? 's' : ''}.`,
              };
            } else {
              updated.push({
                id: `msg-${senderId}`,
                type: 'message',
                senderId,
                text: `${senderName} sent 1 message.`,
              });
            }

            return updated;
          });

          setHasNew(true);
        }
      )
      .subscribe();

    const friendRequestChannel = supabase
      .channel('realtime:friend_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [
            ...prev,
            {
              id: `fr-${payload.new.id}`,
              type: 'friend_request',
              text: 'You have a new friend request.',
            },
          ]);
          setHasNew(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(friendRequestChannel);
    };
  }, [user]);

  // Remove notification with animation
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Update badge if empty after removal
    setTimeout(() => {
      setHasNew(notifications.length > 1); // because removal is async
    }, 300);
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
  };

  return (
    <div className="border-0 flex justify-self-end">
      <Dialog>
        <DialogTrigger className="flex justify-self-end">
          <Button variant="none" className="hover:bg-gray-100 cursor-pointer relative">
            <Bell className="w-10 h-10" />
            {hasNew && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full" />
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <AnimatePresence>
              {notifications.length === 0 && (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-500"
                >
                  No new notifications
                </motion.p>
              )}

              {notifications.map(({ id, text }) => (
                <motion.div
                  key={id}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={itemVariants}
                  layout
                  className="relative p-2 rounded bg-gray-100 text-sm flex justify-between items-center"
                >
                  <span>{text}</span>
                  <button
                    onClick={() => removeNotification(id)}
                    aria-label="Dismiss notification"
                    className="ml-4 p-1 hover:bg-gray-300 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
