"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BellIcon, MessageCircle, Briefcase, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "sonner";

dayjs.extend(relativeTime);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function NotificationsDialog() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [tab, setTab] = useState("unread");
  const [viewedTimestamp, setViewedTimestamp] = useState(null);
  const [handledNotifications, setHandledNotifications] = useState([]); // IDs of friend requests handled (accept/reject)
  const isDialogOpen = useRef(false);

  // Fetch notifications for current user
  const fetchNotifications = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        sender:users!notifications_sender_id_fkey (first_name, last_name, image_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
      setHasUnread(data.some((n) => !n.is_read));
    }
  };

  // Mark notifications read up to a timestamp
  const markReadUpTo = async (timestamp) => {
    if (!user?.id) return;
    const idsToRead = notifications
      .filter((n) => !n.is_read && new Date(n.created_at) <= timestamp)
      .map((n) => n.id);
    if (idsToRead.length === 0) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", idsToRead);
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          idsToRead.includes(n.id) ? { ...n, is_read: true } : n
        )
      );
      setHasUnread(
        notifications.filter((n) => !n.is_read && new Date(n.created_at) > timestamp).length > 0
      );
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
          event: "INSERT",
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setHasUnread(true);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // Handle dialog open/close and mark notifications read when closed
  const handleDialogChange = (isOpen) => {
    setOpen(isOpen);
    isDialogOpen.current = isOpen;
    if (isOpen) {
      setViewedTimestamp(new Date());
    } else if (viewedTimestamp) {
      markReadUpTo(viewedTimestamp);
      setViewedTimestamp(null);
    }
  };

  // Icon by notification type
  const getIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "friend_request":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "job_application":
        return <Briefcase className="w-5 h-5 text-purple-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // Handle accept/reject friend request
  const handleFriendRequest = async (notificationId, senderId, action) => {
    if (!user?.id || !senderId) return;

    // Update friend_requests table status
    const { error: friendReqError } = await supabase
      .from("friend_requests")
      .update({ status: action === "accept" ? "accepted" : "rejected" })
      .eq("sender_id", senderId)
      .eq("receiver_id", user.id);

    // Mark notification as read
    const { error: notifError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (!friendReqError && !notifError) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      // Mark handled so buttons disappear
      setHandledNotifications((prev) => [...prev, notificationId]);

      toast.success(
        `Friend request ${action === "accept" ? "accepted" : "rejected"}`
      );
    } else {
      console.error("Error updating friend request or notification", friendReqError, notifError);
      toast.error("There was a problem processing your request.");
    }
  };

  // Notifications arrays
  const unread = notifications.filter((n) => !n.is_read);
  const read = notifications.filter((n) => n.is_read);

  // Show accept/reject buttons if type is friend_request and notification not handled yet
  const renderFriendRequestButtons = (notification) => {
    if (
      notification.type === "friend_request" &&
      !handledNotifications.includes(notification.id)
    ) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleFriendRequest(notification.id, notification.sender_id, "reject")
            }
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() =>
              handleFriendRequest(notification.id, notification.sender_id, "accept")
            }
          >
            Accept
          </Button>
        </div>
      );
    }
    return null;
  };




  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
      <Button
  variant="default"
  size="icon"
  className="bg-gradient-to-r from-violet-500 via-fuchsia-600 to-pink-500 group dark:hover:text-violet-200"
>
<BellIcon className="group-hover:rotate-20 transition duration-200" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Notifications</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="px-6">
          <TabsList className="flex border-b">
            <TabsTrigger value="unread" className="flex-1">
              Unread
            </TabsTrigger>
            <TabsTrigger value="read" className="flex-1">
              Read
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread">
            {unread.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">
                No unread notifications.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {unread.map((n) => {
                    const senderName = [n.sender?.first_name, n.sender?.last_name]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <motion.li
                        key={n.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="flex items-center gap-3 px-6 py-4 border-b hover:bg-blue-50"
                      >
                        <img
                          src={n.sender?.image_url || "https://i.pravatar.cc/40"}
                          className="w-9 h-9 rounded-full"
                          alt="avatar"
                        />
                        <div className="flex-1">
                          <p>{n.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {dayjs(n.created_at).fromNow()}
                          </p>
                          {renderFriendRequestButtons(n)}
                        </div>
                        {getIcon(n.type)}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </TabsContent>

          <TabsContent value="read">
            {read.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">
                No read notifications.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {read.map((n) => {
                  const senderName = [n.sender?.first_name, n.sender?.last_name]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <li
                      key={n.id}
                      className="flex items-center gap-3 px-6 py-4 border-b"
                    >
                      <img
                        src={n.sender?.image_url || "https://i.pravatar.cc/40"}
                        className="w-9 h-9 rounded-full"
                        alt="avatar"
                      />
                      <div className="flex-1">
                        <p>{n.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {dayjs(n.created_at).fromNow()}
                        </p>
                        {renderFriendRequestButtons(n)}
                      </div>
                      {getIcon(n.type)}
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
