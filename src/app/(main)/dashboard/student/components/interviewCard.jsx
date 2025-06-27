'use client';


import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Video, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export default function InterviewCard() {
 const { user } = useUser();
 const [interviews, setInterviews] = useState([]);
 const [selectedDate, setSelectedDate] = useState(dayjs());
 const [direction, setDirection] = useState(0);


 useEffect(() => {
   if (!user) return;


   const fetchInterviews = async () => {
     const { data, error } = await supabase
       .from('interviews')
       .select(`
         id,
         interview_at,
         interview_end,
         meeting_link,
         mode,
         job_listings (company, image_url),
         recruiter:recruiter_id (first_name, last_name, image_url)
       `)
       .eq('student_id', user.id)
       .order('interview_at', { ascending: true });


     if (error) {
       console.error('Error fetching interviews:', error);
     } else {
       setInterviews(data || []);
     }
   };


   fetchInterviews();
 }, [user]);


 const nextDay = () => {
   setDirection(1);
   setSelectedDate((prev) => prev.add(1, 'day'));
 };


 const prevDay = () => {
   setDirection(-1);
   setSelectedDate((prev) => prev.subtract(1, 'day'));
 };


 const filtered = interviews.filter((intv) =>
   dayjs(intv.interview_at).isSame(selectedDate, 'day')
 );


 return (
   <div className="flex gap-4 h-80">
     <div className="w-[100%]">
       <Card className="h-full w-full border-0 shadow-sm rounded-xl bg-white p-4 overflow-hidden dark:bg-neutral-900">
         <div className="flex items-center justify-between">
           <h2 className="text-lg font-semibold">Upcoming Interview</h2>
         </div>


         <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
           <div className="flex items-center gap-2">
             <ChevronLeft className="w-4 h-4 cursor-pointer" onClick={prevDay} />
             <span>{selectedDate.format('dddd MMM DD, YYYY')}</span>
             <ChevronRight className="w-4 h-4 cursor-pointer" onClick={nextDay} />
           </div>
         </div>


         {/* Animated Interview List */}
         <div className="relative overflow-hidden max-h-[calc(100%-80px)] pr-1 min-h-[140px] ">
           <AnimatePresence mode="wait" initial={false}>
             <motion.div
               key={selectedDate.format('YYYY-MM-DD')}
               initial={{ x: direction === 1 ? 300 : -300, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: direction === 1 ? -300 : 300, opacity: 0 }}
               transition={{ duration: 0.3 }}
               className="space-y-4"
             >
               {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] text-gray-400 dark:text-gray-500 select-none">
                <Calendar className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">No interviews scheduled</p>
                {/* <p className="text-sm mt-1">Check another day or contact recruiter</p> */}
              </div>
               )}
               {filtered.map((intv) => {
                 const recruiter = intv.recruiter;
                 const job = intv.job_listings;


                 const startTime = dayjs(intv.interview_at);
                 const endTime = intv.interview_end ? dayjs(intv.interview_end) : null;
                 const now = dayjs();
                 const hasMeetingLink = intv.meeting_link && intv.meeting_link.trim() !== '';
                 const isPastEnd = endTime && now.isAfter(endTime);


                 // Debugging info
                 console.log("NOW:", now.format(), "| END:", endTime?.format(), "| isPastEnd:", isPastEnd);


                 return (
                   <div
                     key={intv.id}
                     className="group flex items-center gap-4 p-3 rounded-xl bg-gray-100 hover:bg-blue-50 scale-98 transition-colors dark:bg-neutral-600 dark:text-white transform transition-transform duration-300 ease-in-out hover:scale-100"
                   >
                     {job?.image_url ? (
 <img
   src={job.image_url}
   alt={job.company || 'Company Logo'}
   className="w-10 h-10 rounded-full object-cover"
 />
) : (
 <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
   {job?.company?.slice(0, 2).toUpperCase() || 'NA'}
 </div>
)}




                     <div>
                       <div className="font-semibold text-sm">
                         {recruiter?.first_name} {recruiter?.last_name}
                       </div>
                       <div className="text-xs text-gray-600  dark:text-white ">
                         {job?.company || 'Unknown Company'}
                       </div>
                       <div className="text-xs text-gray-700 mt-1 dark:text-white">
                         {startTime.format('h:mm A')}
                         {endTime ? ` - ${endTime.format('h:mm A')}` : ''}
                       </div>
                     </div>


                     <div className="ml-auto">
 {hasMeetingLink ? (
   isPastEnd ? (
     <Button
       disabled
       className="flex items-center gap-1 rounded-md px-4 py-2 text-sm bg-gray-400 cursor-not-allowed"
     >
       <Video className="w-4 h-4" />
       Ended
     </Button>
   ) : (
     <a
       href={intv.meeting_link}
       target="_blank"
       rel="noopener noreferrer"
     >
       <Button className="flex items-center gap-1 rounded-md px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white">
         <Video className="w-4 h-4" />
         Join
       </Button>
     </a>
   )
 ) : (
   intv.mode && (
     <Badge
       variant="secondary"
       className="text-xs px-2 py-1 rounded-md bg-blue-500 text-white dark:bg-blue-800 dark:text-blue-200"
     >
       {intv.mode}
     </Badge>
   )
 )}
</div>


                   </div>
                 );
               })}
             </motion.div>
           </AnimatePresence>
         </div>
       </Card>
     </div>
   </div>
 );
}



