'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

dayjs.extend(utc);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function InterviewCard() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    if (!user) return;

    const fetchInterviews = async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          id,
          interview_at,
          interview_end,
          job_listings (company),
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
      <div className="w-[100%]" data-swapy-slot="interview">
        <Card
          data-swapy-item="interview"
          className="h-full w-full border-0 shadow-sm rounded-xl bg-white p-4 overflow-hidden"
        >
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
                  <div className="text-sm text-gray-500">No interviews on this day.</div>
                )}
                {filtered.map((intv) => {
                  const recruiter = intv.recruiter;
                  const job = intv.job_listings;
                  const startTime = dayjs(intv.interview_at);
                  const endTime = intv.interview_end ? dayjs(intv.interview_end) : null;


                  

                  return (
                    <div
                    key={intv.id}
                    className="group flex items-center gap-4 p-3 rounded-xl bg-gray-100 hover:bg-gradient-to-r from-[#f3e8ff] to-[#c0b1f5] scale-98 transition-colors  transform transition-transform duration-300 ease-in-out hover:scale-100"
                  >
                    <img
                      src={recruiter?.image_url || 'https://via.placeholder.com/100'}
                      alt={`${recruiter?.first_name} ${recruiter?.last_name}`}
                      className="w-10 h-10 rounded-full"
                    />
                  
                    <div>
                      <div className="font-semibold text-sm">
                        {recruiter?.first_name} {recruiter?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {job?.company || 'Unknown Company'}
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
                        {startTime.format('h:mm A')}
                        {endTime ? ` - ${endTime.format('h:mm A')}` : ''}
                      </div>
                    </div>
                  
                    <div className="ml-auto">
                         <Button
                            className="flex items-center gap-1 rounded-md px-4 py-2 text-sm bg-purple-500 text-white hover:bg-purple-600"
                           
                          >
                            <Video className="w-4 h-4" />
                            Details
                          </Button>
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
