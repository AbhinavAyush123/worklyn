"use client";

import React, { useEffect, useState, useMemo,Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus, CalendarCheck2, MapPin, Link2, NotebookText, Search, Filter } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InterviewsPage() {
  const { user, isLoaded } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startingInterview, setStartingInterview] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!isLoaded || !user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("interviews")
        .select(`
          id,
          interview_at,
          interview_end,
          location,
          mode,
          notes,
          meeting_link,
          student:student_id (
            id,
            first_name,
            last_name,
            email
          ),
          job:job_id (
            id,
            title,
            company
          )
        `)
        .eq("recruiter_id", user.id)
        .order("interview_at", { ascending: true });

      if (error) console.error("Error loading interviews:", error);
      else setInterviews(data || []);
      setLoading(false);
    };

    fetchInterviews();
  }, [isLoaded, user]);

  const handleStartInterview = async (interviewId) => {
    setStartingInterview(interviewId);
    try {
      // First create the interview room
      const res = await fetch("/api/create-interview-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interviewId,
          recruiterId: user.id
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create interview room");
      }

      const data = await res.json();

      if (!data.url) {
        throw new Error("No room URL returned from API");
      }

      // Update the interview with the meeting link
      const { error: updateError } = await supabase
        .from("interviews")
        .update({ meeting_link: data.url })
        .eq("id", interviewId);

      if (updateError) throw updateError;

      // Refresh the interviews list
      const { data: updatedInterviews } = await supabase
        .from("interviews")
        .select(`
          id,
          interview_at,
          interview_end,
          location,
          mode,
          notes,
          meeting_link,
          student:student_id (
            id,
            first_name,
            last_name,
            email
          ),
          job:job_id (
            id,
            title,
            company
          )
        `)
        .eq("recruiter_id", user.id)
        .order("interview_at", { ascending: true });

      setInterviews(updatedInterviews || []);

      // Open the room in a new tab
      window.open(data.url, "_blank");

    } catch (error) {
      console.error('Error starting interview:', error);
      alert("Error starting interview: " + error.message);
    } finally {
      setStartingInterview(null);
    }
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        interview.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.job?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${interview.student?.first_name} ${interview.student?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

      // Mode filter
      const matchesMode = modeFilter === "all" || interview.mode === modeFilter;

      // Date filter
      const now = new Date();
      const interviewDate = new Date(interview.interview_at);
      let matchesDate = true;
      
      if (dateFilter === "today") {
        matchesDate = interviewDate.toDateString() === now.toDateString();
      } else if (dateFilter === "upcoming") {
        matchesDate = interviewDate > now;
      } else if (dateFilter === "past") {
        matchesDate = interviewDate < now;
      }

      return matchesSearch && matchesMode && matchesDate;
    });
  }, [interviews, searchTerm, modeFilter, dateFilter]);

  const openInterviewDetails = (interview) => {
    setSelectedInterview(interview);
    setDialogOpen(true);
  };

  if (!isLoaded || loading) {
    return (
      <Suspense fallback={<div>Loading...</div>}>

      
      <div className="flex items-center justify-center h-64 text-blue-600 dark:text-blue-400">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading interviews...
      </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>

    
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400">
          My Interviews
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
          <Link href="/dashboard/recruiter" className="flex items-center text-white">
            <CalendarPlus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Link>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by job, company or student..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by mode" />
              </div>
            </SelectTrigger>
            <SelectContent className="border-none">
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <CalendarCheck2 className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by date" />
              </div>
            </SelectTrigger>
            <SelectContent className="border-none">
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredInterviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <CalendarCheck2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {interviews.length === 0 ? 'No upcoming interviews' : 'No matching interviews'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {interviews.length === 0 ? 'Schedule your first interview to get started' : 'Try adjusting your search or filters'}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
            <Link href="/interviews/schedule" className="flex items-center">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Schedule Interview
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInterviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700 h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-900 dark:text-gray-100 line-clamp-1">
                  {interview.job?.title || "Untitled Role"}
                </CardTitle>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {interview.job?.company || "Unknown Company"}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 flex-1">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-full">
                      <CalendarCheck2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(interview.interview_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(interview.interview_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-full">
                      <NotebookText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {interview.student?.first_name} {interview.student?.last_name}
                    </p>
                  </div>
                </div>

                
              </CardContent>
              <CardFooter className="flex justify-between pt-0 pb-2">
                <div className="flex justify-between w-full">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => openInterviewDetails(interview)}
                  >
                    Details
                  </Button>
                  {interview.meeting_link ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                      disabled
                    >
                      <CalendarCheck2 className="w-3 h-3 mr-1" />
                      Started
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`text-xs h-8 ${
                        interview.mode === 'virtual' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/30'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/30'
                      }`}
                      onClick={() => handleStartInterview(interview.id)}
                      disabled={startingInterview === interview.id}
                    >
                      {startingInterview === interview.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          {interview.mode === 'virtual' ? (
                            <>
                              <Link2 className="w-3 h-3 mr-1" />
                              Start Meeting
                            </>
                          ) : (
                            <>
                              <CalendarCheck2 className="w-3 h-3 mr-1" />
                              Start Interview
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Interview Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedInterview && (
          <DialogContent className="sm:max-w-[600px] border-neutral-200 dark:border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">
                Interview Details
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {selectedInterview.job?.title} at {selectedInterview.job?.company}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(selectedInterview.interview_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(selectedInterview.interview_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {selectedInterview.interview_end && (
                      <>
                        {' - '}
                        {new Date(selectedInterview.interview_end).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Student</h4>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedInterview.student?.first_name} {selectedInterview.student?.last_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedInterview.student?.email}
                </p>
              </div>

              {selectedInterview.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedInterview.location}</p>
                </div>
              )}

              {selectedInterview.mode && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Mode</h4>
                  <Badge className={
                    selectedInterview.mode === 'virtual' ? 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-200' :
                    selectedInterview.mode === 'in-person' ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-200' :
                    'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-200'
                  }>
                    {selectedInterview.mode}
                  </Badge>
                </div>
              )}

              {selectedInterview.meeting_link && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Meeting Link</h4>
                  <Button
                    variant="link"
                    className="p-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    asChild
                  >
                    <a href={selectedInterview.meeting_link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Link2 className="w-4 h-4 mr-2" />
                      Join Meeting
                    </a>
                  </Button>
                </div>
              )}

              {selectedInterview.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mt-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {selectedInterview.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
    </Suspense>
  );
}