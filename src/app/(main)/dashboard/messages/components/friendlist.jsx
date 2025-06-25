"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function FriendList() {
  const { user } = useUser();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchFriends = async () => {
      const { data } = await supabase.rpc("get_friends", { user_id_input: user.id });
      setFriends(data || []);
    };

    fetchFriends();
  }, [user]);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Your Friends</h2>
      {friends.map((f) => (
        <div key={f.id} className="border p-2 rounded">
          {f.first_name} {f.last_name || f.email}
        </div>
      ))}
    </div>
  );
}
