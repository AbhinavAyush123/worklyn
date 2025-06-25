"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function FriendRequestList() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      const { data } = await supabase
        .from("friend_requests")
        .select("id, sender_id, users!friend_requests_sender_id_fkey(email)")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      setRequests(data || []);
    };

    fetchRequests();

    const channel = supabase
      .channel("realtime-friends")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friend_requests" },
        () => fetchRequests()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const handleUpdate = async (id, status) => {
    await supabase.from("friend_requests").update({ status }).eq("id", id);
  };

  return (
    <div className="space-y-2">
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex items-center justify-between border p-2 rounded"
        >
          <span>{req.users?.email}</span>
          <div className="space-x-2">
            <Button onClick={() => handleUpdate(req.id, "accepted")}>
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdate(req.id, "declined")}
            >
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
