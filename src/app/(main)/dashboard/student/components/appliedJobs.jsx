"use client";


import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { subDays, isAfter, formatDistanceToNow, format } from "date-fns";


export default function AppliedJobs() {
 const { user } = useUser();
 const [appliedJobs, setAppliedJobs] = useState([]);
 const [filteredJobs, setFilteredJobs] = useState([]);
 const [loading, setLoading] = useState(false);
 const [filter, setFilter] = useState("all");


 async function fetchAppliedJobs() {
   if (!user?.id) return;


   setLoading(true);


   const { data, error } = await supabase
     .from("appliedjobs")
     .select(
       `
       id,
       status,
       applied_at,
       job_listings!appliedjobs_job_id_fkey (
         id,
         title,
         company,
         location,
         job_type,
         salary,
         image_url
       )
     `
     )
     .eq("user_id", user.id)
     .order("applied_at", { ascending: false });


   if (error) {
     console.error("Error fetching jobs:", JSON.stringify(error, null, 2));
   } else {
     setAppliedJobs(data);
     setFilteredJobs(filterByDate(data, filter));
   }


   setLoading(false);
 }


 function filterByDate(data, timeRange) {
   if (timeRange === "all") return data;


   let cutoff = new Date();
   if (timeRange === "24h") cutoff = subDays(new Date(), 1);
   else if (timeRange === "7Days") cutoff = subDays(new Date(), 7);
   else if (timeRange === "30Days") cutoff = subDays(new Date(), 30);


   return data.filter((job) => isAfter(new Date(job.applied_at), cutoff));
 }


 useEffect(() => {
   if (user?.id) fetchAppliedJobs();
 }, [user?.id]);


 useEffect(() => {
   setFilteredJobs(filterByDate(appliedJobs, filter));
 }, [filter, appliedJobs]);


 if (loading) return <div>Loading...</div>;


 return (
   <Card data-swapy-item="views" className="h-82 w-full border-0 overflow-auto">
     <CardContent className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-lg font-semibold">Application History</h2>
         <Select value={filter} onValueChange={setFilter}>
           <SelectTrigger className="w-[180px]">
             <SelectValue placeholder="Last:" />
           </SelectTrigger>
           <SelectContent className="border-none">
             <SelectItem value="all">All Time</SelectItem>
             <SelectItem value="24h">Last 24h</SelectItem>
             <SelectItem value="7Days">Last 7 Days</SelectItem>
             <SelectItem value="30Days">Last 30 Days</SelectItem>
           </SelectContent>
         </Select>
       </div>


       <div className="space-y-4 overflow-y-auto pr-1 flex-1">
         {filteredJobs.length === 0 ? (
           <p className="text-sm text-gray-500">No applications found for this time range.</p>
         ) : (
           filteredJobs.map((entry, i) => {
             const job = entry.job_listings;
             const appliedTime = entry.applied_at
               ? formatDistanceToNow(new Date(entry.applied_at), { addSuffix: true })
               : format(new Date(entry.applied_at), "M/d");


             return (
               <div key={i} className="flex items-start gap-3">
               {job?.image_url ? (
                 <img
                   src={job.image_url}
                   alt={job?.company || 'Company'}
                   className="w-10 h-10 rounded-full object-cover border border-gray-300"
                 />
               ) : (
                 <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                   {job?.company?.slice(0, 2).toUpperCase() || '??'}
                 </div>
               )}
            
               <div className="flex-1">
                 <div className="text-sm font-semibold">{job?.title}</div>
                 <div className="text-xs text-gray-600">
                   {job?.company} • {job?.location} • {job?.job_type} • {job?.salary}
                 </div>
                 <div className="text-[11px] text-muted-foreground mt-1">
                   Applied {appliedTime}
                 </div>
               </div>
            
               <div
                 className={`text-xs px-2 py-1 rounded-md font-medium
                   ${
                     entry.status === 'Applied'
                       ? 'bg-blue-100 text-blue-600'
                       : entry.status === 'Accepted'
                       ? 'bg-green-100 text-green-600'
                       : entry.status === 'Interview Scheduled'
                       ? "bg-blue-100 text-blue-600"
                       : 'bg-red-100 text-red-600'
                   }`}
               >
                 {entry.status}
               </div>
             </div>             
             );
           })
         )}
       </div>
     </CardContent>
   </Card>
 );
}





