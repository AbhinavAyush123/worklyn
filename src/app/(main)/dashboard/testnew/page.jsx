"use client";


import React, { useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"


const data7Days = [
 { day: "Mon", applications: 12 },
 { day: "Tue", applications: 18 },
 { day: "Wed", applications: 10 },
 { day: "Thu", applications: 15 },
 { day: "Fri", applications: 20 },
 { day: "Sat", applications: 22 },
 { day: "Sun", applications: 16 },
];


const data30Days = Array.from({ length: 30 }, (_, i) => ({
 day: `Day ${i + 1}`,
 applications: Math.floor(Math.random() * 40) + 10,
}));


const data3Months = [
 { month: "Apr", applications: 60 },
 { month: "May", applications: 48 },
 { month: "Jun", applications: 80 },
];


const jobListings = [
 {
   id: "1",
   title: "Frontend Developer",
   company: "Netflix",
   location: "Remote",
   status: "Open",
 },
 {
   id: "2",
   title: "Backend Engineer",
   company: "Google",
   location: "California",
   status: "Closed",
 },
 {
   id: "3",
   title: "UX Designer",
   company: "Meta",
   location: "New York",
   status: "Open",
 },
 {
   id: "4",
   title: "Product Manager",
   company: "Airbnb",
   location: "Seattle",
   status: "Open",
 },
 {
   id: "5",
   title: "Data Analyst",
   company: "Spotify",
   location: "Remote",
   status: "Closed",
 },
];


const suggestedCandidates = [
 {
   name: "Alice Smith",
   role: "UI/UX Designer",
   img: "https://randomuser.me/api/portraits/women/45.jpg",
 },
 {
   name: "Bob Johnson",
   role: "Full-Stack Developer",
   img: "https://randomuser.me/api/portraits/men/32.jpg",
 },
 {
   name: "Clara Lee",
   role: "Data Scientist",
   img: "https://randomuser.me/api/portraits/women/68.jpg",
 },
];


export default function RecruiterDashboard() {
 const [range, setRange] = useState("7D");


 const chartData =
   range === "7D" ? data7Days : range === "30D" ? data30Days : data3Months;


 const colorMap = {
   "7D": {
     button: "bg-purple-600 text-white",
     fill: "#8b5cf6", // purple-500
   },
   "30D": {
     button: "bg-pink-600 text-white",
     fill: "#ec4899", // pink-500
   },
   "3M": {
     button: "bg-fuchsia-600 text-white",
     fill: "#c026d3", // fuchsia-600
   },
 };


 const isPositive = (trend) => trend?.startsWith("+");


 return (
   <div className="px-8 mt-5 max-w-7xl mx-auto min-h-screen flex flex-col gap-8">
     {/* Stat Cards - horizontal row */}
     <div className="grid grid-cols-4 gap-6">
       <StatCard
         title="Total Revenue"
         value="$7,320"
         gradient="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white border-none"
         icon={<TrendingUp />}
         trend="+18%"
         description="Compared to last month"
         lastUpdated="5 mins ago"
       />
       <StatCard
         title="New Applicants"
         value="1,230"
         icon={<Users />}
         trend="-5%"
         description="Since last week"
         lastUpdated="10 mins ago"
       />
       <StatCard
         title="Interviews Held"
         value="432"
         icon={<Brain />}
         trend="+12%"
         description="This quarter"
         lastUpdated="1 hour ago"
       />
       <StatCard
         title="Conversion Rate"
         value="11.2%"
         icon={<Trophy />}
         trend="+2.5%"
         description="Increase in applications"
         lastUpdated="2 hours ago"
       />
     </div>


     {/* Graph and Suggested Users side by side */}
     <div className="flex gap-6">
       {/* Graph */}
       <Card className="flex-1 border border-dashed border-neutral-200 dark:border-neutral-800 shadow-none bg-white dark:bg-neutral-900">
 <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
   <div>
     <CardTitle className="text-gray-900 dark:text-gray-100">Applications Over Time</CardTitle>
     <CardDescription className="text-gray-600 dark:text-gray-400">
       Trends based on selected range
     </CardDescription>
   </div>
   <div className="flex gap-2 mt-4 lg:mt-0">
     {["7D", "30D", "3M"].map((r) => (
       <button
         key={r}
         onClick={() => setRange(r)}
         className={`
           px-3 py-1 text-sm rounded-md border
           dark:bg-neutral-800
           ${
             range === r
               ? colorMap[r].button
               : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-700"
           }
           transition-colors
         `}
       >
         {r === "7D" ? "7 Days" : r === "30D" ? "30 Days" : "3 Months"}
       </button>
     ))}
   </div>
 </CardHeader>
 <CardContent className="h-[250px]">
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
         dataKey={range === "3M" ? "month" : "day"}
         stroke={range === "3M" ? "#D8B4FE" : range === "30D" ? "#F9A8D4" : "#C4B5FD"} // fuchsia, pink, purple lighter shades
         tick={{ fill: "currentColor" }}
       />
       <YAxis stroke="#9CA3AF" tick={{ fill: "currentColor" }} />
       <Tooltip
         contentStyle={{
           backgroundColor: '#1F2937', // dark background
           borderRadius: '6px',
           border: 'none',
           color: '#E0E7FF',
         }}
         itemStyle={{ color: colorMap[range].fill }}
         cursor={{ fill: 'rgba(147, 51, 234, 0.1)' }}
       />
       <Area
         type="monotone"
         dataKey="applications"
         stroke={colorMap[range].fill}
         fillOpacity={1}
         fill="url(#colorApps)"
       />
     </AreaChart>
   </ResponsiveContainer>
 </CardContent>
</Card>




       {/* Suggested Users */}
       <Card className="w-80 border border-neutral-200 dark:border-neutral-800 shadow-none bg-white dark:bg-neutral-900">
     <CardHeader>
       <CardTitle className="text-gray-900 dark:text-gray-100">Suggested Candidates</CardTitle>
       <CardDescription className="text-gray-600 dark:text-gray-400">
         Top profiles to consider
       </CardDescription>
     </CardHeader>
     <CardContent className="space-y-3">
       {suggestedCandidates.map((user) => (
         <div
           key={user.name}
           className="group flex items-center gap-4 p-3 rounded-md cursor-pointer
                      hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors"
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
             className="group-hover:bg-purple-600 group-hover:text-white
                        dark:group-hover:bg-purple-500 dark:group-hover:
                        transition-colors hover:bg-purple-700"
           >
             Profile
           </Button>
         </div>
       ))}
     </CardContent>
   </Card>
     </div>


     {/* Job Table full width */}
     <Card className="border-none shadow-none">
       <CardContent>
         
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
}) {
 const isPositive = trend?.startsWith("+");


 return (
   <Card
     className={cn(
       "relative px-5 py-3 border shadow hover:shadow-lg transition",
       gradient
         ? gradient
         : "bg-white border-gray-200 text-gray-900 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-300"
     )}
   >
     {trend && (
       <div
         className={cn(
           "absolute top-3 right-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
           isPositive
             ? "bg-green-200 text-green-800 border border-green-400 dark:bg-green-800 dark:text-green-100"
             : "bg-red-200 text-red-800 border border-red-400 dark:bg-red-800 dark:text-red-100"
         )}
         title={`Trend: ${trend}`}
       >
         {isPositive ? (
           <ArrowUpRight className="h-4 w-4" />
         ) : (
           <ArrowDownRight className="h-4 w-4" />
         )}
         <span>{trend}</span>
       </div>
     )}


     <div className="flex justify-between items-center text-sm">
       <span className={gradient ? "text-white" : "text-gray-600 dark:text-gray-400"}>
         {title}
       </span>
     </div>


     <p className={cn(
       "text-2xl font-bold",
       gradient ? "text-white" : "text-gray-900 dark:text-gray-100"
     )}>
       {value}
     </p>


     {description && (
       <p className={cn(
         "text-xs",
         gradient ? "text-white" : "text-gray-500 dark:text-gray-400"
       )}>
         {description}
       </p>
     )}


     {lastUpdated && (
       <p className={cn(
         "text-[11px] mt-1",
         gradient ? "text-white/80" : "text-gray-400 dark:text-gray-500"
       )}>
         Updated {lastUpdated}
       </p>
     )}
   </Card>
 );
}





