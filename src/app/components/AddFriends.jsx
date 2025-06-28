"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { Search } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AddFriendsSheet() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    if (user?.id && open) {
      fetchPendingRequests();
    }
  }, [user?.id, open]);

  useEffect(() => {
    if (searchTerm.trim().length >= 1 && activeTab === "search") {
      debouncedSearch(searchTerm);
    } else {
      setResults([]);
    }
  }, [searchTerm, activeTab]);

  const fetchPendingRequests = async () => {
    const { data, error } = await supabase
      .from("friend_requests")
      .select(
        `
        id,
        receiver_id,
        status,
        created_at,
        users!friend_requests_receiver_id_fkey (
          id,
          first_name,
          last_name,
          email,
          image_url
        )
      `
      )
      .eq("sender_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data) setPendingRequests(data);
    if (error) console.error("Error fetching sent requests:", error);
  };

  const performSearch = async (term) => {
    setLoading(true);

    const [emailResult, nameResult] = await Promise.all([
      supabase
        .from("users")
        .select("id, email, first_name, last_name, image_url")
        .ilike("email", `%${term}%`)
        .neq("id", user.id)
        .limit(7),

      supabase
        .from("users")
        .select("id, email, first_name, last_name, image_url")
        .ilike("first_name", `%${term}%`)
        .neq("id", user.id)
        .limit(7),
    ]);

    const combined = [...(emailResult?.data || []), ...(nameResult?.data || [])];
    const unique = Array.from(new Map(combined.map((u) => [u.id, u])).values()).slice(0, 7);

    setResults(unique);
    setLoading(false);
  };

  const debouncedSearch = debounce(performSearch, 300);

  const sendFriendRequest = async (receiverId) => {
    if (!user?.id) return;
  
    // 1) Get sender info from Supabase
    const { data: senderProfile, error: profileError } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();
  
    if (profileError || !senderProfile) {
      console.error("Failed to fetch sender info:", profileError);
      return;
    }
  
    // 2) Insert the friend request
    const { data: friendRequest, error: frError } = await supabase
      .from("friend_requests")
      .insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
          status: "pending",
        },
      ])
      .select()
      .single();
  
    if (frError) {
      console.error("Error sending friend request:", frError);
      return;
    }
  
    const displayName = [senderProfile.first_name, senderProfile.last_name]
    .filter(Boolean)
    .join(" ");
  
    const { error: notifError } = await supabase.from("notifications").insert([
        {
          user_id: receiverId,
          sender_id: user.id, 
          type: "friend_request",
          related_id: friendRequest.id,
          content: `${displayName} sent you a friend request`,
          is_read: false,
        },
      ]);
      
  
    if (notifError) {
      console.error("Error creating notification:", notifError);
    }
  
    // 4) Refresh pending requests
    await fetchPendingRequests();
  };
  

  const sheetVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { ease: "easeInOut", duration: 0.25 },
    },
  };

  const isRequestSent = (id) =>
    pendingRequests.some((r) => r.receiver_id === id);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className=  "bg-gradient-to-r text-white from-blue-600 via-blue-500 to-blue-400 hover:text-white">Add Friends</Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full max-w-md p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={sheetVariants}
          className="h-full flex flex-col"
        >
         <SheetHeader className="items-start px-0 mb-4">
  <SheetTitle className="flex items-center gap-2 text-lg">
    <Search className="w-5 h-5 text-muted-foreground" />
    Add Friends
  </SheetTitle>
</SheetHeader>


          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-4 flex flex-col flex-1"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="requests">Sent Requests</TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent
  value="search"
  className="flex flex-col flex-1 overflow-y-auto"
>
  <Input
    placeholder="Search by name or email..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="mb-4"
  />

  {loading ? (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  ) : results.length > 0 ? (
    <div className="space-y-3">
      {results.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 bg-white dark:bg-zinc-900 hover:shadow-purple-300-md transition-all"
        >
          <div className="flex items-center gap-4">
            <img
              src={u.image_url || "https://i.pravatar.cc/40"}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {u.first_name} {u.last_name}
              </span>
              <span className="text-muted-foreground text-xs">{u.email}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant={isRequestSent(u.id) ? "ghost" : "ghost"}
            className={isRequestSent(u.id) ? "cursor-not-allowed bg-green-500 text-white" : "bg-purple-400 text-white hover:bg-purple-500 hover:text-white"}
            disabled={isRequestSent(u.id)}
            onClick={() => sendFriendRequest(u.id)}

          >
            {isRequestSent(u.id) ? "Sent" : "Add"}
          </Button>
        </div>
      ))}
    </div>
  ) : searchTerm.length > 0 ? (
    <p className="text-sm text-muted-foreground">No users found.</p>
  ) : null}
</TabsContent>

            {/* Requests Tab */}
            <TabsContent
  value="requests"
  className="flex flex-col flex-1 overflow-y-auto space-y-3"
>
  {pendingRequests.length === 0 ? (
    <p className="text-center text-muted-foreground mt-8">
      No pending friend requests.
    </p>
  ) : (
    pendingRequests.map((req) => {
      const u = req.users;
      return (
        <div
          key={req.id}
          className="flex items-center justify-between p-3 rounded-xl border-gray-100 border-2 bg-white dark:bg-zinc-900 hover:shadow-md hover:shadow-indigo-900/20 transition-all"
        >
          <div className="flex items-center gap-4">
            <img
              src={u?.image_url || "https://i.pravatar.cc/40"}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {u?.first_name} {u?.last_name}
              </span>
              <span className="text-muted-foreground text-xs">{u?.email}</span>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 font-medium">
              Pending
          </span>
        </div>
      );
    })
  )}
</TabsContent>

          </Tabs>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
