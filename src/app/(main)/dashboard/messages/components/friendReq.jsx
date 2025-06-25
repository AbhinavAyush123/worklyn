"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function FriendRequestDialog() {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [existingRequests, setExistingRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("friend_requests")
        .select("receiver_id")
        .eq("sender_id", user.id);

      setExistingRequests(data?.map((r) => r.receiver_id) || []);
    };

    if (user?.id) fetchRequests();
  }, [user?.id]);

  const handleSendRequest = async () => {
    if (!email) return toast("Enter a valid email");
    if (!user) return;

    const { data: receiverUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (!receiverUser) return toast("User not found");

    if (existingRequests.includes(receiverUser.id))
      return toast("Request already sent");

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: user.id,
      receiver_id: receiverUser.id,
    });

    if (error) return toast("Error sending request");

    toast("Friend request sent!");
    setEmail("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Friend</Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <Input
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSendRequest}>Send Request</Button>
      </DialogContent>
    </Dialog>
  );
}
