"use client";


import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, TrendingUp, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion"
import {
 Table,
 TableBody,
 TableCaption,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import {
 Dialog,
 DialogTrigger,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog";


import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid,
 ResponsiveContainer,
 BarChart,
 Bar
} from "recharts";
import dayjs from "dayjs";
import {
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent
} from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@supabase/supabase-js";
import {
 DropdownMenu,
 DropdownMenuTrigger,
 DropdownMenuContent,
 DropdownMenuItem,
} from "@/components/ui/dropdown-menu";


import { ExternalLink, Eye, CheckCircle, XCircle } from "lucide-react";


const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);




const rangeOptions = {
 "7D": { label: "7 Days", fill: "#C4B5FD" },
 "30D": { label: "30 Days", fill: "#F9A8D4" },
 "3M": { label: "3 Months", fill: "#D8B4FE" },
 ALL: { label: "All Time", fill: "#60A5FA" }, // blue-400
};


const chartTypes = {
 area: "Area",
 bar: "Bar",
};




const PAGE_SIZE = 5;


const statusOptions = [
 { label: "All", value: "all" },
 { label: "Approved", value: "Approved" },
 { label: "In Review", value: "In Review" },
 { label: "Rejected", value: "Rejected" },
];
export default function Dashboard() {
 const [selectedTab, setSelectedTab] = useState("overview")


 return (
   <div className="min-h-screen bg-gray-50 p-6">
     {/* Tabs */}
    


     {/* AnimatePresence handles enter/exit animations */}
     <AnimatePresence mode="wait">
       {selectedTab === "overview" ? (
         <motion.div
           key="overview"
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 20 }}
           transition={{ duration: 0.3 }}
         >
           {/* Mobile */}
           <div className="flex flex-col gap-6 md:hidden">
             <MainContent />
             <Sidebar />
           </div>


           {/* Desktop */}
           <div className="hidden md:flex gap-6">
             <div className="flex-1 flex flex-col space-y-6">
               <MainContent />
             </div>
             <div className="w-1/3 flex flex-col space-y-6">
               <Sidebar />
             </div>
           </div>
         </motion.div>
       ) : (
         <motion.div
           key={selectedTab}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
           className="p-6 bg-white border rounded-lg shadow"
         >
           <h2 className="text-xl font-semibold capitalize">{selectedTab}</h2>
           <p className="text-gray-600 mt-2">
             Content for <strong>{selectedTab}</strong> will go here.
           </p>
         </motion.div>
       )}
     </AnimatePresence>
   </div>
 )
}


function formatDate(date) {
 // Format date as "MMM dd" e.g. "Jun 24"
 return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}


function MainContent() {


 const [range, setRange] = useState("7D");
 const [chartType, setChartType] = useState("area");
 const [chartData, setChartData] = useState([]);


 useEffect(() => {
   async function fetchData() {
     const { data, error } = await supabase
       .from("job_listings")
       .select("id, created_at");


     if (error) {
       console.error("Error fetching job listings:", error.message);
       return;
     }


     const filtered = filterByRange(data, range);
     const grouped = groupByDate(filtered, range);
     setChartData(grouped);
   }


   fetchData();
 }, [range]);


 function filterByRange(data, range) {
   if (range === "ALL") return data;
   const start = getStartDate(range);
   return data.filter((item) =>
     dayjs(item.created_at).isAfter(start)
   );
 }


 function getStartDate(range) {
   const now = dayjs();
   if (range === "7D") return now.subtract(6, "day").startOf("day");
   if (range === "30D") return now.subtract(29, "day").startOf("day");
   if (range === "3M") return now.subtract(2, "month").startOf("month");
 }


 function groupByDate(data, range) {
   const counts = {};
   const isMonthly = range === "3M" || range === "ALL";


   data.forEach((item) => {
     const date = dayjs(item.created_at);
     const key = isMonthly ? date.format("MMM YYYY") : date.format("MMM D");


     counts[key] = (counts[key] || 0) + 1;
   });


   return Object.entries(counts)
     .map(([label, applications]) => ({
       [isMonthly ? "month" : "day"]: label,
       applications,
     }))
     .sort((a, b) =>
       dayjs(a[isMonthly ? "month" : "day"]).unix() -
       dayjs(b[isMonthly ? "month" : "day"]).unix()
     );
 }


 const ChartComponent = chartType === "bar" ? BarChart : AreaChart;
 const isMonthly = range === "3M" || range === "ALL";








 const [userCount, setUserCount] = useState(null);


 useEffect(() => {
   const fetchUserData = async () => {
     const { count, error } = await supabase
       .from("users")
       .select("*", { count: "exact", head: true });


     if (error) {
       console.error("Failed to fetch user data", error);
     } else {
       setUserCount(count);
     }
   };


   fetchUserData();
 }, []);








 const [recruiterCount, setRecruiterCount] = useState(null);


 useEffect(() => {
   const fetchRecruiterCount = async () => {
     const { count, error } = await supabase
       .from("users")
       .select("*", { count: "exact", head: true })
       .eq("role", "recruiter");


     if (error) {
       console.error("Failed to fetch recruiter data", error);
     } else {
       setRecruiterCount(count);
     }
   };


   fetchRecruiterCount();
 }, []);










 const [thisMonthCount, setThisMonthCount] = useState(null);
 const [lastMonthCount, setLastMonthCount] = useState(null);
 const [percentChange, setPercentChange] = useState(null);


 useEffect(() => {
   async function fetchData() {
     const now = new Date();


     // This month range
     const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
     const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);


     // Last month range
     const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
     const startOfThisMonthForLast = new Date(now.getFullYear(), now.getMonth(), 1);


     // Fetch interviews this month count
     const { count: thisCount, error: thisError } = await supabase
       .from("interviews")
       .select("*", { count: "exact", head: true })
       .gte("interview_at", startOfThisMonth.toISOString())
       .lt("interview_at", startOfNextMonth.toISOString());


     if (thisError) {
       console.error("Error fetching this month count:", thisError);
       return;
     }
     setThisMonthCount(thisCount);


     // Fetch interviews last month count
     const { count: lastCount, error: lastError } = await supabase
       .from("interviews")
       .select("*", { count: "exact", head: true })
       .gte("interview_at", startOfLastMonth.toISOString())
       .lt("interview_at", startOfThisMonthForLast.toISOString());


     if (lastError) {
       console.error("Error fetching last month count:", lastError);
       return;
     }
     setLastMonthCount(lastCount);


     // Calculate percent change safely
     if (lastCount === 0 && thisCount > 0) {
       setPercentChange(100);
     } else if (lastCount === 0 && thisCount === 0) {
       setPercentChange(0);
     } else {
       const change = ((thisCount - lastCount) / lastCount) * 100;
       setPercentChange(change.toFixed(2));
     }
   }


   fetchData();
 }, []);


 const isPositive = percentChange >= 0;






 const [selectedRange, setSelectedRange] = useState("7d"); // default last 7 days
 const [data, setData] = useState([]);
 const [loading, setLoading] = useState(false);


 // Calculate date range from selection
 const getDateRange = () => {
   const now = new Date();
   switch (selectedRange) {
     case "7d":
       return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6), end: now };
     case "30d":
       return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29), end: now };
     case "3m":
       return { start: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()), end: now };
     case "all":
       return null; // no filter on start date
     default:
       return null;
   }
 };


 useEffect(() => {
   async function fetchJobCounts() {
     setLoading(true);
     const range = getDateRange();


     // Build query
     let query = supabase
       .from("job_listings")
       .select(
         `created_at`,
         { count: "exact" }
       );


     if (range) {
       query = query.gte("created_at", range.start.toISOString());
     }


     // Fetch all job listings within range
     const { data: jobs, error } = await query.order("created_at", { ascending: true });


     if (error) {
       console.error("Error fetching jobs:", error);
       setData([]);
       setLoading(false);
       return;
     }


     // Aggregate counts grouped by day
     // Create a map from date string -> count
     const countsByDate = {};


     if (jobs) {
       jobs.forEach((job) => {
         const dateStr = new Date(job.created_at).toISOString().slice(0, 10); // YYYY-MM-DD
         countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
       });
     }


     // Prepare chart data points for each date in range (to fill gaps with 0)
     let startDate, endDate;
     if (range) {
       startDate = new Date(range.start);
       endDate = new Date(range.end);
     } else if (jobs && jobs.length > 0) {
       // If all time, pick min and max dates from jobs
       startDate = new Date(jobs[0].created_at);
       endDate = new Date(jobs[jobs.length - 1].created_at);
     } else {
       // No data
       setData([]);
       setLoading(false);
       return;
     }


     const chartData = [];
     let current = new Date(startDate);
     while (current <= endDate) {
       const isoDate = current.toISOString().slice(0, 10);
       chartData.push({
         date: formatDate(current),
         count: countsByDate[isoDate] || 0,
       });
       current.setDate(current.getDate() + 1);
     }


     setData(chartData);
     setLoading(false);
   }


   fetchJobCounts();
 }, [selectedRange]);








 const [jobs, setJobs] = useState([]);


 // Filters + Sorting + Pagination state
 const [searchQuery, setSearchQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState("all");
 const [sortBy, setSortBy] = useState("created_at");
 const [sortDirection, setSortDirection] = useState("desc");
 const [page, setPage] = useState(1);


 // Fetch all jobs initially
 useEffect(() => {
   async function fetchJobs() {
     setLoading(true);
     const { data, error } = await supabase
       .from("job_listings")
       .select("id, title, company, status, created_at");


     if (error) {
       console.error("Error fetching jobs:", error.message);
     } else {
       setJobs(data);
     }
     setLoading(false);
   }
   fetchJobs();
 }, []);


 // Filtered, searched, and sorted jobs
 const filteredJobs = useMemo(() => {
   let filtered = jobs;


   // Filter by status if set and not "all"
   if (statusFilter && statusFilter !== "all") {
     filtered = filtered.filter(
       (job) => job.status && job.status === statusFilter
     );
   }


   // Search by title or company (case insensitive)
   if (searchQuery.trim() !== "") {
     const q = searchQuery.toLowerCase();
     filtered = filtered.filter(
       (job) =>
         (job.title && job.title.toLowerCase().includes(q)) ||
         (job.company && job.company.toLowerCase().includes(q))
     );
   }


   // Sort
   filtered = filtered.sort((a, b) => {
     let aVal = a[sortBy];
     let bVal = b[sortBy];


     // For date, parse and compare timestamps
     if (sortBy === "created_at") {
       aVal = new Date(aVal).getTime();
       bVal = new Date(bVal).getTime();
     } else {
       aVal = aVal ? aVal.toString().toLowerCase() : "";
       bVal = bVal ? bVal.toString().toLowerCase() : "";
     }


     if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
     if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
     return 0;
   });


   return filtered;
 }, [jobs, statusFilter, searchQuery, sortBy, sortDirection]);


 // Pagination calculations
 const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);
 const paginatedJobs = filteredJobs.slice(
   (page - 1) * PAGE_SIZE,
   page * PAGE_SIZE
 );


 function getBadgeVariant(status) {
   if (status === "Approved") return "default";
   if (status === "In Review") return "secondary";
   if (status === "Rejected") return "destructive";
   return "outline";
 }


 // Change sorting column or direction on header click
 function handleSort(column) {
   if (sortBy === column) {
     // toggle direction
     setSortDirection(sortDirection === "asc" ? "desc" : "asc");
   } else {
     setSortBy(column);
     setSortDirection("asc");
   }
   setPage(1); // reset to first page
 }


 // Icon for sort direction
 function SortIcon({ column }) {
   if (sortBy !== column) return null;
   return sortDirection === "asc" ? (
     <ChevronUp className="inline-block w-4 h-4 ml-1" />
   ) : (
     <ChevronDown className="inline-block w-4 h-4 ml-1" />
   );
 }
 function getBadgeClass(status) {
   switch (status.toLowerCase()) {
     case "approved":
       return "bg-green-100 text-green-800 hover:bg-green-100";
     case "in review":
       return "bg-blue-100 text-blue-800 hover:bg-blue-100";
     case "rejected":
       return "bg-red-100 text-red-800 hover:bg-red-100";
     default:
       return "bg-gray-100 text-gray-800 hover:bg-gray-100";
   }
 }


 const handleJobStatusChange = async (jobId, newStatus) => {
   // Optimistically update frontend
   setJobs((prev) =>
     prev.map((job) =>
       job.id === jobId ? { ...job, status: newStatus } : job
     )
   );
    const { error } = await supabase
     .from("job_listings")
     .update({ status: newStatus })
     .eq("id", jobId);
    if (error) {
     toast.error(`Failed to set status to ${newStatus}`);
     // Optionally revert status if needed
   } else {
     toast.success(`Job is ${newStatus}`);
   }
 };
 


 return (
   <>
     {/* Top Metrics Cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
     <Card className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white border-none h-35 flex flex-col justify-between px-4 py-2">
     <CardHeader className="p-0">
       <div className="flex items-center space-x-2">
         <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
         <span className="text-sm text-white">Total Users</span>
       </div>
     </CardHeader>
     <CardContent className="p-0 flex flex-col justify-between flex-grow">
       <div>
         <div className="text-2xl font-bold text-white leading-tight">
           {userCount !== null ? userCount.toLocaleString() : "___"}
         </div>
         <div className="text-[11px] text-white mt-0.5">Active Accounts</div>
       </div>
       <div className="flex items-center justify-between text-[11px] mt-1">
       
         <div className="flex items-center space-x-1">
           <span className="text-white font-semibold">+0.00%</span>
           <TrendingUp className="w-3 h-3 text-white" />
         </div>
       </div>
     </CardContent>
   </Card>


       {/* Card 2: Active Sessions */}
       <Card className="bg-white border border-gray-200 h-35 flex flex-col justify-between px-4 py-2">
     <CardHeader className="p-0">
       <div className="flex items-center space-x-2">
         <div className="w-2 h-2 bg-green-400 rounded-full"></div>
         <span className="text-sm text-gray-600">Total Recruiters</span>
       </div>
     </CardHeader>
     <CardContent className="p-0 flex flex-col justify-between flex-grow">
       <div>
         <div className="text-2xl font-bold text-gray-900 leading-tight">
           {recruiterCount !== null ? recruiterCount.toLocaleString() : "Loading..."}
         </div>
         <div className="text-[11px] text-gray-500 mt-0.5">Currently online</div>
       </div>
       <div className="flex items-center justify-between text-[11px] mt-1">
         <span className="text-gray-600">Details</span>
         <div className="flex items-center space-x-1">
           <span className="text-green-600 font-semibold">+5.23%</span>
           <TrendingUp className="w-3 h-3 text-green-600" />
         </div>
       </div>
     </CardContent>
   </Card>


       {/* Card 3: Bounce Rate */}
       <Card className="bg-white border border-gray-200 h-35 flex flex-col justify-between px-4 py-2">
     <CardHeader className="p-0">
       <div className="flex items-center space-x-2">
         <div className="w-2 h-2 bg-red-400 rounded-full"></div>
         <span className="text-sm text-gray-600">Interviews Scheduled</span>
       </div>
     </CardHeader>


     <CardContent className="p-0 flex flex-col justify-between flex-grow">
       <div>
         <div className="text-2xl font-bold text-gray-900 leading-tight">
           {thisMonthCount !== null ? thisMonthCount.toLocaleString() : "Loading..."}
         </div>
         <div className="text-[11px] text-gray-500 mt-0.5">This Month</div>
       </div>


       <div className="flex items-center justify-between text-[11px] mt-1">
         <span className="text-gray-600">Details</span>
         <div className="flex items-center space-x-1">
           {percentChange !== null && lastMonthCount !== null && (
             <>
               <span
                 className={`font-semibold ${
                   isPositive ? "text-green-600" : "text-red-600"
                 }`}
               >
                 {percentChange >= 0 ? "+" : ""}
                 {percentChange}%
               </span>
               <span className="text-gray-500">({lastMonthCount.toLocaleString()} last month)</span>
               <TrendingUp
                 className={`w-3 h-3 ${
                   isPositive ? "text-green-600" : "text-red-600 rotate-180"
                 }`}
               />
             </>
           )}
         </div>
       </div>
     </CardContent>
   </Card>
     </div>


     {/* Sale Activity Chart */}
     <Card className="flex-1 border shadow-sm h-full border-neutral-200 dark:border-neutral-800  bg-white dark:bg-neutral-900">
     <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
       <div>
         <CardTitle className="text-gray-900 dark:text-gray-100 text-lg">
           Listings Over Time
         </CardTitle>
        
       </div>


       <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mt-4 lg:mt-0">
         {/* Range Dropdown */}
         <Select value={range} onValueChange={(val) => setRange(val)}>
           <SelectTrigger className="w-[140px]">
             <SelectValue placeholder="Select Range" />
           </SelectTrigger>
           <SelectContent className = "border-2 border-gray-200">
             {Object.entries(rangeOptions).map(([key, val]) => (
               <SelectItem key={key} value={key}>
                 {val.label}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>


         {/* Chart Type Dropdown */}
         <Select value={chartType} onValueChange={(val) => setChartType(val)}>
           <SelectTrigger className="w-[120px]">
             <SelectValue placeholder="Chart Type" />
           </SelectTrigger>
           <SelectContent className = "border-2 border-gray-200">
             {Object.entries(chartTypes).map(([key, label]) => (
               <SelectItem key={key} value={key}>
                 {label}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
     </CardHeader>


     <CardContent className="flex-1 h-full p-0">
       <ResponsiveContainer width="100%" className="min-h-full">
         <ChartComponent data={chartData}>
           {/* Only show gradient for area */}
           {chartType === "area" && (
             <defs>
               <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                 <stop
                   offset="5%"
                   stopColor={rangeOptions[range].fill}
                   stopOpacity={0.8}
                 />
                 <stop
                   offset="95%"
                   stopColor={rangeOptions[range].fill}
                   stopOpacity={0}
                 />
               </linearGradient>
               <linearGradient id="purpleWhiteGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
               <stop offset="100%" stopColor="#ffffff" stopOpacity={0.5} />
</linearGradient>
             </defs>




           )}


           <XAxis
             dataKey={isMonthly ? "month" : "day"}
             stroke={rangeOptions[range].fill}
             tick={{ fill: "currentColor" }}
           />
           <YAxis stroke="#9CA3AF" tick={{ fill: "currentColor" }} />
           <Tooltip
             contentStyle={{
               backgroundColor: "#1F2937",
               borderRadius: "6px",
               border: "none",
               color: "#E0E7FF",
             }}
             itemStyle={{ color: rangeOptions[range].fill }}
             cursor={{ fill: "rgba(147, 51, 234, 0.1)" }}
           />


           {chartType === "area" ? (
             <Area
               type="monotone"
               dataKey="applications"
               stroke={rangeOptions[range].fill}
               fillOpacity={1}
               fill="url(#colorApps)"
             />
           ) : (
             <Bar
               dataKey="applications"
               fill={rangeOptions[range].fill}
               radius={[8, 8, 0, 0]}
             />
           )}
         </ChartComponent>
       </ResponsiveContainer>
     </CardContent>
   </Card>
     {/* Payments Table */}
  
     <Card className="flex flex-col h-[500px] bg-white border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800">
 {/* Header stays at top */}
 <CardHeader className="shrink-0">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
   <div>
     <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
       Job Listings
     </CardTitle>
   
   </div>


   {/* Input + Select inline */}
   <div className="flex gap-2 items-end">
     <Input
       placeholder="Search by title or company"
       value={searchQuery}
       onChange={(e) => {
         setSearchQuery(e.target.value);
         setPage(1);
       }}
       className="w-[200px]"
     />
     <Select
       value={statusFilter}
       onValueChange={(val) => {
         setStatusFilter(val);
         setPage(1);
       }}
     >
       <SelectTrigger className="w-[160px]">
         <SelectValue placeholder="Filter by Status" />
       </SelectTrigger>
       <SelectContent className="border-gray-200">
         {statusOptions.map(({ label, value }) => (
           <SelectItem key={value} value={value}>
             {label}
           </SelectItem>
         ))}
       </SelectContent>
     </Select>
   </div>
 </div>
</CardHeader>




 {/* Scrollable table area */}
 <CardContent className="flex-grow overflow-y-auto">
   <Table>
     <TableHeader>
       <TableRow className = "border-blue-200">
         <TableHead onClick={() => handleSort("title")} className="cursor-pointer">
           Job Title <SortIcon column="title" />
         </TableHead>
         <TableHead onClick={() => handleSort("company")} className="cursor-pointer">
           Company <SortIcon column="company" />
         </TableHead>
         <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
           Status <SortIcon column="status" />
         </TableHead>
         <TableHead onClick={() => handleSort("created_at")} className="cursor-pointer text-right">
           Posted At <SortIcon column="created_at" />
         </TableHead>
         <TableHead />
       </TableRow>
     </TableHeader>
     <TableBody>
       {loading ? (
         <TableRow>
           <TableCell colSpan={5} className="text-center">
             Loading...
           </TableCell>
         </TableRow>
       ) : paginatedJobs.length === 0 ? (
         <TableRow>
           <TableCell colSpan={5} className="text-center text-muted-foreground">
             No jobs found.
           </TableCell>
         </TableRow>
       ) : (
         paginatedJobs.map((job) => (
           <TableRow key={job.id} className = "border-0">
             <TableCell className="font-medium">{job.title}</TableCell>
             <TableCell>{job.company}</TableCell>
             <TableCell>
             <Badge className={getBadgeClass(job.status)}>
 {job.status}
</Badge>
             </TableCell>
             <TableCell className="text-right">
               {dayjs(job.created_at).format("MMM D, YYYY")}
             </TableCell>
             <TableCell className="text-right">
             <DropdownMenu>
 <DropdownMenuTrigger asChild>
   <Button variant="ghost" size="sm">
     <MoreHorizontal className="h-4 w-4" />
   </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className = "border-gray-200">
   <DropdownMenuItem
     onClick={() => window.open(`/dashboard/jobs/${job.id}`, "_blank")}
   >
     <Eye className="w-4 h-4 mr-2 text-blue-600" />
     View Job
   </DropdownMenuItem>


   <DropdownMenuItem
     onClick={() => handleJobStatusChange(job.id, "Approved")}
   >
     <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
     Approve
   </DropdownMenuItem>


   <DropdownMenuItem
     onClick={() => handleJobStatusChange(job.id, "Rejected")}
   >
     <XCircle className="w-4 h-4 mr-2 text-red-600" />
     Reject
   </DropdownMenuItem>
 </DropdownMenuContent>
</DropdownMenu>




             </TableCell>
           </TableRow>
         ))
       )}
     </TableBody>
   </Table>
 </CardContent>


 {/* Fixed footer at bottom */}
 <div className="shrink-0 border-t border-gray-200 dark:border-neutral-700 p-4 flex justify-between items-center">
   <div className="text-sm text-gray-600 dark:text-gray-400">
     Page {page} of {totalPages}
   </div>
   <div className="space-x-2">
     <Button
       variant="secondary"
       disabled={page === 1}
       onClick={() => setPage((p) => Math.max(p - 1, 1))}
     >
       Previous
     </Button>
     <Button
       variant="secondary"
       disabled={page === totalPages || totalPages === 0}
       onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
     >
       Next
     </Button>
   </div>
 </div>
</Card>
   </>
 );
}




function TotalJobsCard() {
 const [thisMonthCount, setThisMonthCount] = useState(null);
 const [lastMonthCount, setLastMonthCount] = useState(null);
 const [percentChange, setPercentChange] = useState(null);
 const [jobsThisMonth, setJobsThisMonth] = useState([]);
 const [loadingJobs, setLoadingJobs] = useState(false);


 useEffect(() => {
   async function fetchCounts() {
     const now = new Date();


     // Date ranges
     const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
     const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
     const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
     const startOfThisMonthForLast = new Date(now.getFullYear(), now.getMonth(), 1);


     // Count jobs this month
     const { count: thisCount, error: thisError } = await supabase
       .from("job_listings")
       .select("*", { count: "exact", head: true })
       .gte("created_at", startOfThisMonth.toISOString())
       .lt("created_at", startOfNextMonth.toISOString());


     if (thisError) {
       console.error("Error fetching this month jobs:", thisError);
       return;
     }
     setThisMonthCount(thisCount);


     // Count jobs last month
     const { count: lastCount, error: lastError } = await supabase
       .from("job_listings")
       .select("*", { count: "exact", head: true })
       .gte("created_at", startOfLastMonth.toISOString())
       .lt("created_at", startOfThisMonthForLast.toISOString());


     if (lastError) {
       console.error("Error fetching last month jobs:", lastError);
       return;
     }
     setLastMonthCount(lastCount);


     // Calculate percent change safely
     if (lastCount === 0 && thisCount > 0) {
       setPercentChange(100);
     } else if (lastCount === 0 && thisCount === 0) {
       setPercentChange(0);
     } else {
       const change = ((thisCount - lastCount) / lastCount) * 100;
       setPercentChange(change.toFixed(1));
     }
   }


   fetchCounts();
 }, []);


 // Fetch all jobs this month for dialog when opened
 async function fetchJobsThisMonth() {
   setLoadingJobs(true);


   const now = new Date();
   const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
   const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);


   const { data, error } = await supabase
     .from("job_listings")
     .select("*")
     .gte("created_at", startOfThisMonth.toISOString())
     .lt("created_at", startOfNextMonth.toISOString())
     .order("created_at", { ascending: false });


   if (error) {
     console.error("Error fetching job listings for dialog:", error);
     setJobsThisMonth([]);
   } else {
     setJobsThisMonth(data);
   }


   setLoadingJobs(false);
 }


 const isPositive = percentChange >= 0;






 return (
   <Card className="bg-white border border-gray-200 h-35 flex flex-col justify-between px-4 py-2">
 <CardHeader className="p-0">
   <div className="text-sm text-gray-600">Total Jobs</div>
 </CardHeader>


 <CardContent className="p-0 flex flex-col justify-between flex-grow">
   <div>
     <div className="text-2xl font-bold text-gray-900 leading-tight">
       {thisMonthCount !== null ? thisMonthCount.toLocaleString() : "Loading..."}
     </div>
     <div className="text-[11px] text-gray-500 mt-0.5">
       {percentChange !== null && lastMonthCount !== null
         ? `${percentChange >= 0 ? "" : ""} Compared to last month (${lastMonthCount.toLocaleString()} jobs)`
         : ""}
     </div>
   </div>


   <div className="flex items-center justify-between text-[11px] mt-1">
   <span className="text-gray-600">Details</span>
     <div className="flex items-center space-x-1">
       {percentChange !== null && (
         <>
           <span
             className={`font-semibold ${
               isPositive ? "text-green-600" : "text-red-600"
             }`}
           >
             {percentChange >= 0 ? "+" : ""}
             {percentChange}%
           </span>
           <TrendingUp
             className={`w-3 h-3 ${
               isPositive ? "text-green-600" : "text-red-600 rotate-180"
             }`}
           />
         </>
       )}
     </div>
   </div>
 </CardContent>
</Card>


 );
}


// Sidebar component - renders TotalJobsCard and other cards
function Sidebar() {


 const [recruiters, setRecruiters] = useState([]);


useEffect(() => {
 const fetchRecruiters = async () => {
   const { data, error } = await supabase
     .from("users")
     .select("id, first_name, last_name, email, image_url")
     .eq("role", "recruiter");


   if (error) {
     console.error("Error fetching recruiters:", error);
   } else {
     setRecruiters(data);
   }
 };


 fetchRecruiters();
}, []);


const [students, setStudents] = useState([]);


 useEffect(() => {
   const fetchStudents = async () => {
     const { data, error } = await supabase
       .from("users")
       .select("id, first_name, last_name, email, image_url")
       .eq("role", "student");


     if (error) {
       console.error("Error fetching students:", error);
     } else {
       setStudents(data);
     }
   };


   fetchStudents();
 }, []);
 return (
   <>
     <TotalJobsCard />


     {/* Subscriptions Chart */}
     <Card className="flex flex-col flex-grow bg-white border border-gray-200">
     <CardHeader>
       <CardTitle className="text-lg font-semibold text-gray-900">Students</CardTitle>
       <p className="text-sm text-gray-500">List of all student users.</p>
     </CardHeader>


     <CardContent className="flex-grow overflow-y-auto max-h-[400px] space-y-4">
       {students.length === 0 ? (
         <div className="text-sm text-gray-500">No students found.</div>
       ) : (
         students.map((user) => {
           const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
           const initials = name
             ? name.match(/\b\w/g)?.join("").slice(0, 2).toUpperCase()
             : "??";
           const email = user.email || `${name.replace(" ", "").toLowerCase()}@example.com`;


           return (
             <div key={user.id} className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <Avatar className="w-8 h-8">
                   {user.image_url ? (
                     <img src={user.image_url} alt={name} className="rounded-full" />
                   ) : (
                     <AvatarFallback className="text-xs bg-gray-100">{initials}</AvatarFallback>
                   )}
                 </Avatar>
                 <div>
                   <div className="text-sm font-medium text-gray-900">{name || "Unnamed Student"}</div>
                   <div className="text-xs text-gray-500">{email}</div>
                 </div>
               </div>


               <div className="flex items-center space-x-2">
                 <Badge variant="outline" className="text-xs text-white bg-blue-500 border-none">Student</Badge>
               
               </div>
             </div>
           );
         })
       )}
     </CardContent>
   </Card>


     {/* Team Members */}
     <Card className="flex flex-col flex-grow bg-white border border-gray-200">
 <CardHeader>
   <CardTitle className="text-lg font-semibold text-gray-900">Active Recruiters</CardTitle>
   <p className="text-sm text-gray-500">Recruiters at JobSpot</p>
 </CardHeader>


 <CardContent className="flex-grow overflow-y-auto">
   <div className="space-y-4">
     {recruiters.length === 0 ? (
       <div className="text-sm text-gray-500">No recruiters found.</div>
     ) : (
       recruiters.map((user) => {
         const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
         const initials = name
           ? name.match(/\b\w/g)?.join("").slice(0, 2).toUpperCase()
           : "??";
         const email = user.email || `${name.replace(" ", "").toLowerCase()}@example.com`;


         return (
           <div key={user.id} className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <Avatar className="w-8 h-8">
                 {user.image_url ? (
                   <img src={user.image_url} alt={name} className="rounded-full" />
                 ) : (
                   <AvatarFallback className="text-xs bg-gray-100">
                     {initials}
                   </AvatarFallback>
                 )}
               </Avatar>
               <div>
                 <div className="text-sm font-medium text-gray-900">{name || "Unnamed Recruiter"}</div>
                 <div className="text-xs text-gray-500">{email}</div>
               </div>
             </div>
             <div className="flex items-center space-x-2">
               <Badge variant="outline" className="text-xs bg-blue-400 text-white border-none">Recruiter</Badge>
              
             </div>
           </div>
         );
       })
     )}
   </div>
 </CardContent>
</Card>


   </>
 );
}

