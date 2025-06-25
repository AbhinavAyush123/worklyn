"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"; // adjust import path as needed

export default function FriendManager() {
  const { user } = useUser();
  const [suggestions, setSuggestions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentIds, setSentIds] = useState([]);
  const [email, setEmail] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [open, setOpen] = useState(false); // controls Sheet open state

  // Fetch accepted friends using RPC
  useEffect(() => {
    if (!user?.id) return;

    const fetchFriends = async () => {
      const { data } = await supabase.rpc("get_friends", { user_id_input: user.id });
      setFriends(data || []);
      setFriendIds(data?.map((f) => f.id) || []);
    };

    fetchFriends();
  }, [user?.id]);

  // Fetch incoming friend requests with real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const fetchRequests = async () => {
      const { data } = await supabase
        .from("friend_requests")
        .select("id, sender_id, receiver_id, users!friend_requests_sender_id_fkey(email)")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      setRequests(data || []);
    };

    fetchRequests();

    const channel = supabase
      .channel("friend-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friend_requests" },
        () => fetchRequests()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // Fetch already sent friend requests to disable "Add" button as "Requested"
  useEffect(() => {
    if (!user?.id) return;

    const fetchSent = async () => {
      const { data } = await supabase
        .from("friend_requests")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .eq("status", "pending");

      setSentIds(data?.map((r) => r.receiver_id) || []);
    };

    fetchSent();
  }, [user?.id]);

  // Fetch user suggestions by email prefix (max 5)
  const fetchSuggestions = useCallback(
    async (query) => {
      if (!query.trim() || !user?.id) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);

      const { data, error } = await supabase
        .from("users")
        .select("id, email, image_url")
        .ilike("email", `${query}%`)
        .neq("id", user.id)
        .limit(5);

      if (!error && data) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }

      setLoadingSuggestions(false);
    },
    [user?.id]
  );

  const onEmailChange = (e) => {
    const val = e.target.value.toLowerCase();
    setEmail(val);
    fetchSuggestions(val);
  };

  // Send friend request
  const handleSendRequestTo = async (receiverId) => {
    if (!user?.id || !receiverId) return;

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to send request");
      return;
    }

    toast.success("Friend request sent!");
    setSentIds((prev) => [...prev, receiverId]);
    setSuggestions((prev) => prev.filter((u) => u.id !== receiverId));
    setEmail(""); // clear input
  };

  const handleRespond = async (id, status) => {
    const { error } = await supabase.from("friend_requests").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update request");
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>Open Friends</Button>
        </SheetTrigger>

        <SheetContent position="right" size="sm" className="p-4">
          <SheetHeader>
            <SheetTitle></SheetTitle>
           
          </SheetHeader>

          <Tabs defaultValue="friends" className="w-full max-w-md mx-auto mt-4">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="add">Add Friend</TabsTrigger>
            </TabsList>

            {/* FRIENDS */}
            <TabsContent value="friends">
              <div className="space-y-2">
                {friends.length === 0 ? (
                  <p>No friends yet.</p>
                ) : (
                  friends.map((f) => (
                    <div key={f.id} className="border p-2 rounded">
                      {f.first_name} {f.last_name || f.email}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* REQUESTS */}
            <TabsContent value="requests">
              <div className="space-y-2">
                {requests.length === 0 ? (
                  <p>No pending requests.</p>
                ) : (
                  requests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between border p-2 rounded"
                    >
                      <span>{req.users?.email}</span>
                      <div className="space-x-2">
                        <Button size="sm" onClick={() => handleRespond(req.id, "accepted")}>
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRespond(req.id, "declined")}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ADD FRIEND */}
            <TabsContent value="add">
              <div className="space-y-3">
                <Input
                  placeholder="Search by email prefix..."
                  value={email}
                  onChange={onEmailChange}
                  autoComplete="off"
                />

                {email && (
                  <div className="border rounded-md shadow-sm max-h-60 overflow-y-auto">
                    {loadingSuggestions ? (
                      <div className="p-3 text-center">Loading...</div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((user) => {
                        const isFriend = friendIds.includes(user.id);
                        const isRequested = sentIds.includes(user.id);

                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-2 hover:bg-muted"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  user.image_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`
                                }
                                alt={user.email}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span>{user.email}</span>
                            </div>
                            <Button
                              size="sm"
                              disabled={isFriend || isRequested}
                              onClick={() => handleSendRequestTo(user.id)}
                            >
                              {isFriend ? "Added" : isRequested ? "Requested" : "Add"}
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-muted-foreground">No user found</div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
