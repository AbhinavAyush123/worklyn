"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from "@/components/ui/card";
import {
 TrendingUp,
 Users,
 Brain,
 Trophy,
 ArrowUpRight,
 ArrowDownRight,
} from "lucide-react";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DataTable from "./components/data-table";

const colorMap = {
 "7D": { button: "bg-blue-600 text-white", fill: "#3b82f6" },
 "30D": { button: "bg-purple-600 text-white", fill: "#8b5cf6" },
 "3M": { button: "bg-pink-600 text-white", fill: "#ec4899" },
};

export default function RecruiterDashboard() {
 const { user } = useUser();
 const userId = user?.id ?? null;

 const [range, setRange] = useState("7D");
 const [stats, setStats] = useState({
   newApplicants: 0,
   interviews: 0,
   conversionRate: "0%",
 });
 const [jobListings, setJobListings] = useState([]);
 const [candidates, setCandidates] = useState([]);
 const [chartData, setChartData] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   if (userId) {
     fetchDashboardData(userId);
   }
 }, [userId, range]);

 async function fetchDashboardData(recruiterId) {
   setLoading(true);
   try {
     const { data: jobs, error: jobsError } = await supabase
       .from("job_listings")
       .select("*")
       .eq("posted_by", recruiterId);

     if (jobsError) throw jobsError;

     setJobListings(jobs || []);

     const jobIds = jobs?.map((job) => job.id) || [];

     const { data: applications, error: appError } = await supabase
       .from("appliedjobs")
       .select("*")
       .in("job_id", jobIds);

     if (appError) throw appError;

     const { data: interviews, error: interviewError } = await supabase
       .from("interviews")
       .select("*")
       .eq("recruiter_id", recruiterId);

     if (interviewError) throw interviewError;

     const { data: users, error: usersError } = await supabase
       .from("users")
       .select("id, first_name, last_name, image_url, role")
       .ilike("role", "%student%")
       .not("resume_url", "is", null)
       .limit(3);

     if (usersError) throw usersError;

     setCandidates(
       users?.map((u) => ({
         name: `${u.first_name} ${u.last_name}`,
         role: u.role || "Student",
         img: u.image_url,
       })) || []
     );

     const interviewCount = interviews?.length || 0;
     const conversionRate =
       jobs.length > 0
         ? `${Math.floor((applications.length / jobs.length) * 100)}%`
         : "0%";

     setStats({
       newApplicants: applications.length,
       interviews: interviewCount,
       conversionRate,
     });

     let chart = [];
     if (range === "3M") {
       const now = new Date();
       const months = [];
       for (let i = 2; i >= 0; i--) {
         const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
         months.push(d);
       }

       chart = months.map((monthDate) => {
         const monthLabel = monthDate.toLocaleString("default", {
           month: "short",
         });
         const count = applications.filter((a) => {
           const appliedAt = new Date(a.applied_at);
           return (
             appliedAt.getFullYear() === monthDate.getFullYear() &&
             appliedAt.getMonth() === monthDate.getMonth()
           );
         }).length;
         return { day: monthLabel, applications: count };
       });
     } else {
       const daysCount = range === "7D" ? 7 : 30;
       const today = new Date();

       chart = Array.from({ length: daysCount }, (_, i) => {
         const day = new Date(today);
         day.setDate(today.getDate() - (daysCount - 1 - i));
         const label = day.toLocaleDateString("en-US", { weekday: "short" });
         const count = applications.filter((a) => {
           const appliedAt = new Date(a.applied_at);
           return appliedAt.toDateString() === day.toDateString();
         }).length;
         return { day: label, applications: count };
       });
     }

     setChartData(chart);
   } catch (error) {
     console.error("Error fetching dashboard data:", error);
   } finally {
     setLoading(false);
   }
 }

 function TrendIcon({ trend }) {
   if (!trend) return null;
   const positive = trend.startsWith("+");
   return positive ? (
     <ArrowUpRight className="h-5 w-5 text-green-600" />
   ) : (
     <ArrowDownRight className="h-5 w-5 text-red-600" />
   );
 }

 return (
   <div className="px-4 sm:px-6 lg:px-8 mt-5 max-w-7xl mx-auto min-h-screen flex flex-col gap-4 sm:gap-6 lg:gap-8">
     {/* Stat Cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
       <StatCard
         title="Total Jobs Posted"
         value={jobListings.length}
         icon={<TrendingUp />}
         trend="+12%"
         description="Total jobs you posted"
         gradient="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white border-none"
         lastUpdated="Just now"
         TrendIcon={TrendIcon}
       />
       <StatCard
         title="New Applicants"
         value={stats.newApplicants}
         icon={<Users />}
         trend="+8%"
         description="Total recent applications"
         lastUpdated="5 mins ago"
         TrendIcon={TrendIcon}
       />
       <StatCard
         title="Interviews Held"
         value={stats.interviews}
         icon={<Brain />}
         trend="+3%"
         description="Interviews arranged"
         lastUpdated="Today"
         TrendIcon={TrendIcon}
       />
       <StatCard
         title="Conversion Rate"
         value={stats.conversionRate}
         icon={<Trophy />}
         trend="+2.5%"
         description="Applications per listing"
         lastUpdated="Today"
         TrendIcon={TrendIcon}
       />
     </div>

     {/* Chart and Suggested Candidates */}
     <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
       <Card className="flex-1 border border-dashed border-neutral-200 dark:border-neutral-800 shadow-none bg-white dark:bg-neutral-900">
         <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
           <div>
             <CardTitle className="text-gray-900 dark:text-gray-100">
               Applications Over Time
             </CardTitle>
             <CardDescription className="text-gray-600 dark:text-gray-400">
               Trends based on selected range
             </CardDescription>
           </div>
           <div className="flex gap-2 mt-4 sm:mt-0">
             {["7D", "30D", "3M"].map((r) => (
               <button
                 key={r}
                 onClick={() => setRange(r)}
                 className={cn(
                   "px-3 py-1 text-sm rounded-md border dark:bg-neutral-800",
                   range === r
                     ? colorMap[r].button
                     : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-700"
                 )}
               >
                 {r === "7D" ? "7 Days" : r === "30D" ? "30 Days" : "3 Months"}
               </button>
             ))}
           </div>
         </CardHeader>
         <CardContent className="h-[250px]">
           {chartData ? (
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                     <stop
                       offset="5%"
                       stopColor={colorMap[range].fill}
                       stopOpacity={0.8}
                     />
                     <stop
                       offset="95%"
                       stopColor={colorMap[range].fill}
                       stopOpacity={0}
                     />
                   </linearGradient>
                 </defs>
                 <XAxis
                   dataKey="day"
                   stroke="#93C5FD"
                   tick={{ fill: "currentColor" }}
                 />
                 <YAxis stroke="#9CA3AF" tick={{ fill: "currentColor" }} />
                 <Tooltip
                   contentStyle={{
                     backgroundColor: "#1F2937",
                     borderRadius: "6px",
                     border: "none",
                     color: "#DBEAFE",
                   }}
                   itemStyle={{ color: colorMap[range].fill }}
                   cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                 />
                 <Area
                   type="monotone"
                   dataKey="applications"
                   stroke={colorMap[range].fill}
                   fillOpacity={1}
                   fill="url(#colorApps)"
                   animationDuration={1500}
                   animationEasing="ease-out"
                 />
               </AreaChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center">
               <p className="text-gray-500 dark:text-gray-400">
                 {loading ? "Loading data..." : "No data available"}
               </p>
             </div>
           )}
         </CardContent>
       </Card>

       {/* Suggested Candidates */}
       <Card className="w-full lg:w-80 border border-neutral-200 dark:border-neutral-800 shadow-none bg-white dark:bg-neutral-900">
         <CardHeader>
           <CardTitle className="text-gray-900 dark:text-gray-100">
             Suggested Candidates
           </CardTitle>
           <CardDescription className="text-gray-600 dark:text-gray-400">
             Top profiles to consider
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-3">
           {candidates.length > 0 ? (
             candidates.map((user) => (
               <div
                 key={user.name}
                 className="group flex items-center gap-4 p-3 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
               >
                 <Avatar className="w-10 h-10 shrink-0">
                   <AvatarImage src={user.img} alt={user.name} />
                   <AvatarFallback>{user.name[0]}</AvatarFallback>
                 </Avatar>
                 <div className="flex-1 min-w-0">
                   <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                     {user.name}
                   </p>
                   <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                     {user.role}
                   </p>
                 </div>
                 <Button
                   variant="secondary"
                   className="group-hover:bg-blue-600 group-hover:text-white transition-colors"
                 >
                   Profile
                 </Button>
               </div>
             ))
           ) : (
             <p className="text-gray-500 dark:text-gray-400 text-center py-4">
               {loading ? "Loading..." : "No candidates found"}
             </p>
           )}
         </CardContent>
       </Card>
     </div>

     {/* Job Listings Table */}
     <Card className="border-neutral-200 dark:border-neutral-800">
       <CardContent>
         {jobListings.length > 0 ? (
           <DataTable data={jobListings} />
         ) : (
           <p className="text-gray-500 dark:text-gray-400 text-center py-4">
             {loading ? "Loading job listings..." : "No job listings found"}
           </p>
         )}
       </CardContent>
     </Card>
   </div>
 );
}

function StatCard({
 title,
 value,
 icon,
 trend,
 description,
 gradient,
 lastUpdated,
 TrendIcon,
}) {
 return (
   <Card
     className={cn(
       "relative px-5 py-3 border shadow hover:shadow-lg transition",
       gradient
         ? gradient
         : "bg-white border-gray-200 text-gray-900 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-300"
     )}
   >
     <div className="flex justify-between items-center text-sm">
       <span
         className={gradient ? "text-white" : "text-gray-600 dark:text-gray-400"}
       >
         {title}
       </span>
       {icon && (
         <div className={gradient ? "text-white" : "text-blue-600"}>{icon}</div>
       )}
     </div>

     <p
       className={cn(
         "text-2xl font-bold",
         gradient ? "text-white" : "text-gray-900 dark:text-gray-100"
       )}
     >
       {value}
     </p>

     {description && (
       <p className={cn("text-xs", gradient ? "text-white" : "text-gray-500 dark:text-gray-400")}>
         {description}
       </p>
     )}

     {lastUpdated && (
       <p className={cn("text-[11px] mt-1", gradient ? "text-white/80" : "text-gray-400 dark:text-gray-500")}>
         Updated {lastUpdated}
       </p>
     )}
   </Card>
 );
}