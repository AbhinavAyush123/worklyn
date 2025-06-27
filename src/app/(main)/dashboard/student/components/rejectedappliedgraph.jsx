'use client';


import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 Cell,
} from 'recharts';


const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export default function StatusOverTimeChart() {
 const { user } = useUser();
 const [statusCounts, setStatusCounts] = useState([]);


 useEffect(() => {
   if (!user) return;


   const fetchData = async () => {
     const { data, error } = await supabase
       .from('appliedjobs')
       .select('status')
       .eq('user_id', user.id);


     if (error) {
       console.error('Supabase error:', error);
       return;
     }


     const counts = { Accepted: 0, Rejected: 0, Pending: 0 };


     data?.forEach(({ status }) => {
       if (status === 'Accepted') counts.Accepted++;
       else if (status === 'Rejected') counts.Rejected++;
       else counts.Pending++;
     });


     const formatted = [
       { status: 'Accepted', count: counts.Accepted },
       { status: 'Rejected', count: counts.Rejected },
       { status: 'Pending', count: counts.Pending },
     ].filter((entry) => entry.count > 0);


     setStatusCounts(formatted);
   };


   fetchData();
 }, [user]);


 const blueGradientId = 'blueGradient';


 const customTooltip = ({ active, payload }) => {
   if (active && payload?.length) {
     const { status, count } = payload[0].payload;
     return (
       <div
         className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-3 py-2 rounded shadow text-sm text-gray-900 dark:text-gray-100"
         style={{ minWidth: 140 }}
       >
         <strong>{status}</strong>: {count} applications
       </div>
     );
   }
   return null;
 };


 return (
   <ResponsiveContainer width="100%" height={300}>
     <BarChart
       data={statusCounts}
       margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
       barCategoryGap="20%"
     >
       <defs>
         <linearGradient id={blueGradientId} x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
           <stop offset="100%" stopColor="#ffffff" stopOpacity={0.5} />
         </linearGradient>
       </defs>


       <XAxis
         dataKey="status"
         stroke="#9CA3AF"
         tick={{ fill: 'currentColor' }}
         tickLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
         axisLine={{ stroke: '#9CA3AF' }}
         className="dark:text-gray-300"
       />
       <YAxis
         allowDecimals={false}
         tickFormatter={(val) => `${val}`}
         stroke="#9CA3AF"
         tick={{ fill: 'currentColor' }}
         tickLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
         axisLine={{ stroke: '#9CA3AF' }}
         className="dark:text-gray-300"
       />
       <Tooltip
         content={customTooltip}
         cursor={{ fill: 'rgba(59, 130, 246, 0.15)' }} // blueish lighter cursor
         wrapperStyle={{ outline: 'none' }}
       />
       <Bar dataKey="count" radius={[6, 6, 0, 0]}>
         {statusCounts.map((_, index) => (
           <Cell key={`cell-${index}`} fill={`url(#${blueGradientId})`} />
         ))}
       </Bar>
     </BarChart>
   </ResponsiveContainer>
 );
}





