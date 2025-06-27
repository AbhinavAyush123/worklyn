"use client";


import React, { useEffect, useState } from "react";
import {
 Card,
 CardContent,
 CardFooter,
 CardTitle,
} from "@/components/ui/card";
import {
 MoreHorizontal,
 CalendarCheck2,
 ClockArrowDown,
 Bookmark,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import SalaryTrend from "./components/graph";
import ApplicationHistoryCard from "./components/appliedJobs";
import { supabase } from "@/lib/supabase";
import { subDays, isAfter } from "date-fns";
import StatusOverTimeChart from "./components/rejectedappliedgraph";
import InterviewCard from "./components/interviewCard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";
import ExpiringJobsCard from "./components/jobsCard";


dayjs.extend(utc);
dayjs.extend(relativeTime);


const fadeIn = {
 hidden: { opacity: 0, y: 20 },
 visible: (i = 0) => ({
   opacity: 1,
   y: 0,
   transition: {
     delay: i * 0.2,
     duration: 0.6,
     ease: "easeOut",
   },
 }),
};


const StudentDashboardClient = () => {
 const [interviews, setInterviews] = useState([]);
 const [nextInterviewText, setNextInterviewText] = useState("Loading...");
 const { user } = useUser();
 const [totalApplications, setTotalApplications] = useState(0);
 const [totalChangePercent, setTotalChangePercent] = useState(null);
 const [lastWeekApplications, setLastWeekApplications] = useState(0);
 const [pendingCount, setPendingCount] = useState(0);
 const [lastWeekPending, setLastWeekPending] = useState(0);
 const [pendingChangePercent, setPendingChangePercent] = useState(null);
 const [savedJobsCount, setSavedJobsCount] = useState(0);
 const [lastWeekSavedJobsCount, setLastWeekSavedJobsCount] = useState(0);


 const [lastUpdated, setLastUpdated] = useState({
   applications: null,
   pending: null,
   interviews: null,
   saved: null,
 });


 useEffect(() => {
   const fetchTimestamps = async () => {
     const [{ data: applied }, { data: pending }, { data: interview }, { data: saved }] = await Promise.all([
       supabase.from("appliedjobs").select("applied_at").order("applied_at", { ascending: false }).limit(1),
       supabase.from("appliedjobs").select("applied_at").eq("status", "pending").order("applied_at", { ascending: false }).limit(1),
       supabase.from("interviews").select("created_at").order("created_at", { ascending: false }).limit(1),
       supabase.from("savedjobs").select("saved_at").order("saved_at", { ascending: false }).limit(1),
     ]);


     setLastUpdated({
       applications: applied?.[0]?.applied_at || null,
       pending: pending?.[0]?.applied_at || null,
       interviews: interview?.[0]?.created_at || null,
       saved: saved?.[0]?.saved_at || null,
     });
   };


   fetchTimestamps();
 }, []);


 useEffect(() => {
   if (!user?.id) return;


   async function fetchApplications() {
     const { data, error } = await supabase
       .from("appliedjobs")
       .select("applied_at")
       .eq("user_id", user.id);


     if (error) return console.error(error);
     const now = new Date();
     const sevenDaysAgo = subDays(now, 7);
     const fourteenDaysAgo = subDays(now, 14);
     const last7 = data.filter((d) => isAfter(new Date(d.applied_at), sevenDaysAgo)).length;
     const prev7 = data.filter((d) => {
       const date = new Date(d.applied_at);
       return date > fourteenDaysAgo && date <= sevenDaysAgo;
     }).length;


     setTotalApplications(data.length);
     setLastWeekApplications(last7);
     setTotalChangePercent(prev7 === 0 ? null : (((last7 - prev7) / prev7) * 100).toFixed(1));
   }


   fetchApplications();
 }, [user?.id]);


 useEffect(() => {
   if (!user?.id) return;


   async function fetchPendingApplications() {
     const { data, error } = await supabase
       .from("appliedjobs")
       .select("applied_at, status")
       .eq("user_id", user.id)
       .eq("status", "Applied");


     if (error) return console.error(error);


     const now = new Date();
     const sevenDaysAgo = subDays(now, 7);
     const fourteenDaysAgo = subDays(now, 14);
     const last7 = data.filter((d) => isAfter(new Date(d.applied_at), sevenDaysAgo)).length;
     const prev7 = data.filter((d) => {
       const date = new Date(d.applied_at);
       return date > fourteenDaysAgo && date <= sevenDaysAgo;
     }).length;


     setPendingCount(data.length);
     setLastWeekPending(last7);
     setPendingChangePercent(prev7 === 0 ? null : (((last7 - prev7) / prev7) * 100).toFixed(1));
   }


   fetchPendingApplications();
 }, [user?.id]);


 useEffect(() => {
   if (!user) return;
   const fetchInterviews = async () => {
     const { data } = await supabase
       .from("interviews")
       .select("interview_at")
       .eq("student_id", user.id)
       .gt("interview_at", new Date().toISOString())
       .order("interview_at", { ascending: true });


     setInterviews(data || []);
     if (data && data.length > 0) {
       const next = dayjs(data[0].interview_at);
       const now = dayjs();
       const label = next.isSame(now, "day")
         ? `Today at ${next.format("h:mm A")}`
         : next.isSame(now.add(1, "day"), "day")
         ? `Tomorrow at ${next.format("h:mm A")}`
         : next.format("MMM D [at] h:mm A");


       setNextInterviewText(`Next: ${label}`);
     } else {
       setNextInterviewText("No upcoming interviews");
     }
   };


   fetchInterviews();
 }, [user]);


 useEffect(() => {
   if (!user) return;


   async function fetchSavedJobsCounts() {
     const { count: currentCount, error: currentError } = await supabase
       .from("savedjobs")
       .select("*", { count: "exact", head: true })
       .eq("user_id", user.id);


     if (currentError) {
       console.error("Error fetching current saved jobs:", currentError);
       return;
     }


     const startLastWeek = dayjs().subtract(14, "day").startOf("week").toISOString();
     const endLastWeek = dayjs().subtract(7, "day").endOf("week").toISOString();


     const { count: lastWeekCount, error: lastWeekError } = await supabase
       .from("savedjobs")
       .select("*", { count: "exact", head: true })
       .eq("user_id", user.id)
       .gte("saved_at", startLastWeek)
       .lte("saved_at", endLastWeek);


     if (lastWeekError) {
       console.error("Error fetching last week saved jobs:", lastWeekError);
       return;
     }


     setSavedJobsCount(currentCount || 0);
     setLastWeekSavedJobsCount(lastWeekCount || 0);
   }


   fetchSavedJobsCounts();
 }, [user]);


 const changePercent = lastWeekSavedJobsCount
   ? (((savedJobsCount - lastWeekSavedJobsCount) / lastWeekSavedJobsCount) * 100).toFixed(0)
   : null;


 const subtitle = `Compared to (${lastWeekSavedJobsCount} last week)`;


 const formatTimestamp = (timestamp) => {
   return timestamp ? dayjs(timestamp).fromNow() : "5 minutes ago";
 };


 const metricCard = (title, icon, count, changePercent, subtitle, index, timestamp) => {
   const isFirst = index === 0;


   return (
     <motion.div
       custom={index}
       variants={fadeIn}
       initial="hidden"
       animate="visible"
       className={`relative flex flex-col justify-between h-48 px-5 py-3 rounded-2xl border shadow hover:shadow-lg transition ${
         isFirst
           ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white border-none"
           : "bg-white border-gray-200 text-gray-900 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-300"
       }`}
     >
       <div className="flex justify-between items-center text-sm mb-1">
         <span className={isFirst ? "text-white" : "text-gray-600 dark:text-gray-400"}>{title}</span>
         <div className={isFirst ? "text-white" : "text-purple-600 dark:text-purple-400"}>{icon}</div>
       </div>


       <div className="mt-1">
         <p className={`text-2xl font-bold leading-tight ${isFirst ? "text-white" : "text-gray-900 dark:text-white"}`}>
           {count}
         </p>
         {changePercent !== null && (
           <p
             className={`text-sm font-medium mt-1 ${
               changePercent >= 0
                 ? isFirst
                   ? "text-white"
                   : "text-green-600"
                 : isFirst
                 ? "text-white"
                 : "text-red-600"
             }`}
           >
             {changePercent >= 0 ? "↑" : "↓"} {Math.abs(changePercent)}%
           </p>
         )}
       </div>


       <p className={`text-xs mt-1 ${isFirst ? "text-white/90" : "text-gray-500 dark:text-gray-400"}`}>{subtitle}</p>


       <p className={`text-[11px] mt-2 ${isFirst ? "text-white/80" : "text-gray-400 dark:text-gray-500"}`}>
        Last updated {timestamp}
       </p>
     </motion.div>
   );
 };


 return (
   <motion.div
     className="px-4 sm:px-6 md:px-8 mt-5 max-w-7xl mx-auto min-h-screen flex flex-col gap-10"
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     transition={{ duration: 0.6 }}
   >
     {/* Metric Cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
       {metricCard(
         "Total Applications",
         <Bookmark className="text-white-500" />,
         totalApplications,
         totalChangePercent,
         `Compared to (${lastWeekApplications} last week)`,
         0,
         formatTimestamp(lastUpdated.applications)
       )}
       {metricCard(
         "Applications Pending",
         <ClockArrowDown className="text-blue-500" />,
         pendingCount,
         pendingChangePercent,
         `Compared to (${lastWeekPending} last week)`,
         1,
         formatTimestamp(lastUpdated.pending)
       )}
       {metricCard(
         "Interviews Scheduled",
         <CalendarCheck2 className="text-blue-500" />,
         interviews.length,
         null,
         nextInterviewText,
         2,
         formatTimestamp(lastUpdated.interviews)
       )}
       {metricCard(
         "Jobs Saved",
         <Bookmark className="text-blue-500" />,
         savedJobsCount,
         changePercent,
         subtitle,
         3,
         formatTimestamp(lastUpdated.saved)
       )}
     </div>


     {/* Interview + Chart */}
     <motion.div className="flex flex-col lg:flex-row gap-4 sm:gap-6" variants={fadeIn} custom={4} initial="hidden" animate="visible">
       <div className="w-full lg:w-1/2">
         <InterviewCard />
       </div>
       <Card className="h-80 w-full lg:w-1/2 rounded-2xl border-0 shadow-md  dark:from-zinc-900 dark:to-zinc-800">
         <CardContent className="h-full">
           <StatusOverTimeChart />
         </CardContent>
       </Card>
     </motion.div>


     {/* Salary + Applications */}
     <motion.div className="space-y-6" variants={fadeIn} custom={5} initial="hidden" animate="visible">
       <div className="h-96 w-full">
         <SalaryTrend />
       </div>
       <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6 mt-12">
         <div className="w-full md:w-1/2">
           <ApplicationHistoryCard />
         </div>
         <div className="w-full md:w-1/2">
           <Card className="h-82 w-full border-2 border-gray-100 rounded-2xl shadow-md dark:from-zinc-900 dark:to-zinc-800 dark:border-none">
             <CardContent className="h-full p-4">
               <ExpiringJobsCard />
             </CardContent>
           </Card>
         </div>
       </div>
     </motion.div>
   </motion.div>
 );
};


export default StudentDashboardClient;




