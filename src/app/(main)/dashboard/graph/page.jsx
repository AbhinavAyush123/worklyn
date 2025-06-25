'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthlyCalendarUI() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [selectedDate, setSelectedDate] = useState(null); // dayjs or null
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Calculate date ranges based on viewMode
  let start, end;

  if (viewMode === 'month') {
    start = currentMonth.startOf('month').startOf('week');
    end = currentMonth.endOf('month').endOf('week');
  } else if (viewMode === 'week') {
    start = (selectedDate || dayjs()).startOf('week');
    end = start.add(6, 'day');
  } else {
    // day view
    start = selectedDate ? selectedDate.startOf('day') : dayjs().startOf('day');
    end = selectedDate ? selectedDate.endOf('day') : dayjs().endOf('day');
  }

  // Build days array for month/week views
  const days = [];
  if (viewMode === 'month' || viewMode === 'week') {
    for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
      days.push(d);
    }
  }

  // Fetch interviews for the date range
  useEffect(() => {
    if (!user) return;

    async function fetchInterviews() {
      const from = start.toISOString();
      const to = end.toISOString();

      const { data, error } = await supabase
        .from('interviews')
        .select(`
          id,
          interview_at,
          interview_end,
          recruiter:recruiter_id (first_name, last_name),
          job_listings (company, title, location, description)
        `)
        .eq('student_id', user.id)
        .gte('interview_at', from)
        .lte('interview_at', to)
        .order('interview_at', { ascending: true });

      if (error) {
        console.error('Error loading interviews:', error);
        setInterviews([]);
      } else {
        setInterviews(data || []);
      }
    }

    fetchInterviews();
  }, [user, start, end]);

  // Helper to get interviews on a date string 'YYYY-MM-DD'
  const getInterviewsForDate = (dateStr) => {
    return interviews.filter(
      (intv) => dayjs(intv.interview_at).format('YYYY-MM-DD') === dateStr
    );
  };

  // Navigation handlers
  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  const prevWeek = () => {
    if (selectedDate) setSelectedDate(selectedDate.subtract(1, 'week'));
    else setSelectedDate(dayjs().subtract(1, 'week'));
  };
  const nextWeek = () => {
    if (selectedDate) setSelectedDate(selectedDate.add(1, 'week'));
    else setSelectedDate(dayjs().add(1, 'week'));
  };

  const prevDay = () => {
    if (selectedDate) setSelectedDate(selectedDate.subtract(1, 'day'));
    else setSelectedDate(dayjs().subtract(1, 'day'));
  };
  const nextDay = () => {
    if (selectedDate) setSelectedDate(selectedDate.add(1, 'day'));
    else setSelectedDate(dayjs().add(1, 'day'));
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setViewMode('day');
  };

  const handleInterviewClick = (intv) => {
    setSelectedInterview(intv);
    setDialogOpen(true);
  };

  return (
    <div className="p-6">
      {/* Top controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Navigation buttons depending on view */}
        <div className="flex gap-2">
          {viewMode === 'month' && (
            <>
              <Button onClick={prevMonth} variant="outline" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button onClick={nextMonth} variant="outline" size="icon">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
          {viewMode === 'week' && (
            <>
              <Button onClick={prevWeek} variant="outline" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button onClick={nextWeek} variant="outline" size="icon">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
          {viewMode === 'day' && (
            <>
              <Button onClick={prevDay} variant="outline" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button onClick={nextDay} variant="outline" size="icon">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Current period display */}
        <h2 className="text-lg font-semibold">
          {viewMode === 'month' && currentMonth.format('MMMM, YYYY')}
          {viewMode === 'week' && selectedDate
            ? `${selectedDate.startOf('week').format('MMM D')} - ${selectedDate
                .endOf('week')
                .format('MMM D, YYYY')}`
            : ''}
          {viewMode === 'day' && selectedDate && selectedDate.format('dddd, MMMM D, YYYY')}
        </h2>

        {/* View mode buttons */}
        <div className="flex gap-2">
          <Button
            className={viewMode === 'month' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            className={viewMode === 'week' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
            onClick={() => {
              setViewMode('week');
              if (!selectedDate) setSelectedDate(dayjs());
            }}
          >
            Week
          </Button>
          <Button
            className={viewMode === 'day' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
            onClick={() => {
              setViewMode('day');
              if (!selectedDate) setSelectedDate(dayjs());
            }}
          >
            Day
          </Button>
        </div>

        {/* Add Schedule button */}
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">+ Add Schedule</Button>
      </div>

      {/* Content */}

      {/* Month View */}
      {(viewMode === 'month') && (
        <>
          {/* Week Headers */}
          <div className="grid grid-cols-7 mb-2 text-center font-medium text-gray-500">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dateStr = day.format('YYYY-MM-DD');
              const isInMonth = day.month() === currentMonth.month();

              const dayInterviews = getInterviewsForDate(dateStr);

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] border border-gray-100 p-1 rounded-sm relative ${
                    isInMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                  }`}
                  onClick={() => handleDayClick(day)}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                  aria-label={`${day.format('dddd, MMMM D')}, ${dayInterviews.length} interviews`}
                >
                  <div className="text-sm font-medium mb-1">{day.date()}</div>

                  {/* Render interview cards for this day */}
                  {dayInterviews.map((intv) => {
                    const startTime = dayjs(intv.interview_at).format('h:mm A');
                    const endTime = intv.interview_end
                      ? dayjs(intv.interview_end).format('h:mm A')
                      : dayjs(intv.interview_at).add(30, 'minute').format('h:mm A');

                    return (
                      <Card
                        key={intv.id}
                        className="text-xs p-1 mb-1 cursor-pointer bg-blue-200 text-blue-800 border-l-4 border-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInterviewClick(intv);
                        }}
                      >
                        <CardContent className="p-1">
                          <div className="font-semibold truncate">
                            {intv.recruiter?.first_name} {intv.recruiter?.last_name}
                          </div>
                          <div className="text-[10px] truncate">
                            {intv.job_listings?.company || 'Unknown Company'}
                          </div>
                          <div className="text-[10px]">
                            {startTime}–{endTime}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Week View with Time Axis */}
      {viewMode === 'week' && (
  <div className="flex border border-gray-200 h-[1120px] select-none" style={{ fontSize: 12 }}>
    {/* Time labels */}
    <div className="w-16 border-r text-gray-500">
      {Array.from({ length: 14 }).map((_, i) => {
        const hour = 7 + i; // 7AM to 8PM
        return (
          <div
            key={hour}
            className="h-20 flex items-center justify-end pr-1 border-b border-gray-100"
            aria-hidden="true"
          >
            {dayjs().hour(hour).minute(0).format('h A')}
          </div>
        );
      })}
    </div>

    {/* Days columns */}
    <div className="flex-1 grid grid-cols-7 relative">
      {daysOfWeek.map((day, dayIndex) => {
        const currentDay = start.add(dayIndex, 'day');
        const dateStr = currentDay.format('YYYY-MM-DD');
        const dayInterviews = getInterviewsForDate(dateStr);

        return (
          <div key={day} className="border-r border-gray-200 relative">
            {/* Day header */}
            <div className="text-center font-semibold border-b border-gray-200 p-1 sticky top-0 bg-white z-10 select-none">
              {currentDay.format('ddd D')}
            </div>

            {/* Hour grid lines */}
            <div className="absolute top-8 left-0 right-0 bottom-0 pointer-events-none">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 border-b border-gray-100"
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Interviews */}
            <div className="absolute top-8 left-0 right-0">
              {dayInterviews.map((intv) => {
                const start = dayjs(intv.interview_at);
                const end = intv.interview_end ? dayjs(intv.interview_end) : start.add(30, 'minute');

                // Clamp start/end to 7AM - 9PM range
                const dayStart = currentDay.hour(7).minute(0).second(0);
                const dayEnd = currentDay.hour(21).minute(0).second(0);

                const clampedStart = start.isBefore(dayStart) ? dayStart : start;
                const clampedEnd = end.isAfter(dayEnd) ? dayEnd : end;

                // Calculate top offset and height in minutes from 7AM
                const minutesFromStart = clampedStart.diff(dayStart, 'minute');
                const durationMinutes = clampedEnd.diff(clampedStart, 'minute');

                // 80px per hour = 80 / 60 px per minute
                const pxPerMinute = 80 / 60;
                const topOffset = minutesFromStart * pxPerMinute;
                const height = Math.max(durationMinutes * pxPerMinute, 20);

                return (
                  <Card
                    key={intv.id}
                    onClick={() => handleInterviewClick(intv)}
                    className="absolute left-1 right-1 bg-blue-200 text-blue-800 border-l-4 border-blue-800 text-xs cursor-pointer overflow-hidden"
                    style={{
                      top: `${topOffset}px`,
                      height: `${height}px`,
                    }}
                  >
                    <CardContent className="p-1">
                      <div className="font-semibold truncate">
                        {intv.recruiter?.first_name} {intv.recruiter?.last_name}
                      </div>
                      <div className="truncate text-[10px]">{intv.job_listings?.company}</div>
                      <div className="text-[10px]">
                        {start.format('h:mm A')} – {end.format('h:mm A')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

      {/* Day View */}
      {viewMode === 'day' && selectedDate && (
        <div>
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => setViewMode('month')}
          >
            ← Back to Month View
          </Button>

          <h3 className="mb-4 font-semibold text-lg">
            Interviews on {selectedDate.format('dddd, MMMM D, YYYY')}
          </h3>

          {getInterviewsForDate(selectedDate.format('YYYY-MM-DD')).length === 0 && (
            <p>No interviews scheduled for this day.</p>
          )}

          <div className="space-y-3">
            {getInterviewsForDate(selectedDate.format('YYYY-MM-DD')).map((intv) => {
              const startTime = dayjs(intv.interview_at).format('h:mm A');
              const endTime = intv.interview_end
                ? dayjs(intv.interview_end).format('h:mm A')
                : dayjs(intv.interview_at).add(30, 'minute').format('h:mm A');

              return (
                <Card
                  key={intv.id}
                  onClick={() => handleInterviewClick(intv)}
                  className="text-sm cursor-pointer bg-blue-200 text-blue-800 border-l-4 border-blue-800"
                >
                  <CardContent className="p-3">
                    <div className="font-semibold truncate">
                      {intv.recruiter?.first_name} {intv.recruiter?.last_name}
                    </div>
                    <div className="truncate">
                      {intv.job_listings?.company || 'Unknown Company'}
                    </div>
                    <div>
                      {startTime} – {endTime}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Dialog for job details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>Company:</strong> {selectedInterview.job_listings?.company}
              </div>
              <div>
                <strong>Job Title:</strong> {selectedInterview.job_listings?.title}
              </div>
              <div>
                <strong>Recruiter:</strong> {selectedInterview.recruiter?.first_name}{' '}
                {selectedInterview.recruiter?.last_name}
              </div>
              <div>
                <strong>Time:</strong>{' '}
                {dayjs(selectedInterview.interview_at).format('h:mm A')} –{' '}
                {selectedInterview.interview_end
                  ? dayjs(selectedInterview.interview_end).format('h:mm A')
                  : dayjs(selectedInterview.interview_at).add(30, 'minute').format('h:mm A')}
              </div>
              <div>
                <strong>Location:</strong> {selectedInterview.job_listings?.location || 'N/A'}
              </div>
              <div>
                <strong>Description:</strong>{' '}
                {selectedInterview.job_listings?.description || 'No description provided.'}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
