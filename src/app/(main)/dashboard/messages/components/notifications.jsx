'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function NewMessageToast({ friends, selectedFriend, onSelectFriend }) {
  const { user } = useUser();
  const [lastNotifiedId, setLastNotifiedId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('toast-new-message')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const msg = payload.new;

          // Ignore if message already seen or from current chat
          if (
            msg.seen || 
            (selectedFriend && msg.sender_id === selectedFriend.id)
          ) return;

          // Only notify once per message id
          if (msg.id === lastNotifiedId) return;

          const friend = friends.find((f) => f.id === msg.sender_id);
          if (!friend) return;

          toast(
            (t) => (
              <div
                className="cursor-pointer"
                onClick={() => {
                  onSelectFriend(friend);
                  toast.dismiss(t.id);
                }}
              >
                <strong>{friend.first_name} {friend.last_name}</strong>
                <div className="text-sm">Sent a Message</div>
              </div>
            ),
            {
              duration: 5000,
            }
          );

          setLastNotifiedId(msg.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    user?.id,
    selectedFriend?.id,
    lastNotifiedId,
    onSelectFriend,
    friends.map((f) => f.id).join(','),
  ]);

  return null;
}
