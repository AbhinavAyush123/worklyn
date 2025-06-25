"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { MoreVertical, Clock, ExternalLink, Bookmark, AlertCircle, CheckCircle2 } from "lucide-react";

const ExpiringJobsCard = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsavingIds, setUnsavingIds] = useState(new Set());

  useEffect(() => {
    if (!user?.id) return;

    async function fetchSavedJobs() {
      setLoading(true);

      const { data, error } = await supabase
        .from("savedjobs")
        .select(`
          id,
          job_listings (
            id,
            title,
            company,
            deadline
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        toast.error("Failed to fetch saved jobs.");
        setLoading(false);
        return;
      }

      const now = dayjs();
      const jobsWithStatus = (data || [])
        .map((item) => {
          const job = item.job_listings;
          const deadline = job?.deadline ? dayjs(job.deadline) : null;
          const isExpired = deadline ? deadline.isBefore(now) : false;
          const daysLeft = deadline && !isExpired ? deadline.diff(now, "day") : 0;

          return {
            savedJobId: item.id,
            jobId: job?.id,
            title: job?.title,
            company: job?.company,
            deadline: job?.deadline,
            isExpired,
            daysLeft,
          };
        })
        .filter((j) => j.deadline)
        .sort((a, b) => {
          if (a.isExpired && !b.isExpired) return 1;
          if (!a.isExpired && b.isExpired) return -1;
          return a.daysLeft - b.daysLeft;
        });

      setJobs(jobsWithStatus);
      setLoading(false);
    }

    fetchSavedJobs();
  }, [user?.id]);

  async function handleUnsave(savedJobId) {
    if (!savedJobId) return;

    setUnsavingIds((prev) => new Set(prev).add(savedJobId));

    const { error } = await supabase
      .from("savedjobs")
      .delete()
      .eq("id", savedJobId);

    if (error) {
      toast.error("Failed to remove job.");
      setUnsavingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(savedJobId);
        return newSet;
      });
      return;
    }

    setJobs((prev) => prev.filter((job) => job.savedJobId !== savedJobId));
    setUnsavingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(savedJobId);
      return newSet;
    });

    toast.success("Job removed from saved list.");
  }

  const activeExpiringCount = jobs.filter((job) => !job.isExpired).length;

  // Helper to get company initials for avatar
  function getCompanyInitials(name) {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  // Helper to get urgency styling
  function getUrgencyStyle(daysLeft, isExpired) {
    if (isExpired) return "text-red-500 bg-red-50 dark:bg-red-950/50";
    if (daysLeft <= 1) return "text-amber-600 bg-amber-50 dark:bg-amber-950/50";
    if (daysLeft <= 3) return "text-orange-600 bg-orange-50 dark:bg-orange-950/50";
    return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50";
  }

  return (
    <div className="h-full w-full flex flex-col">
      <header className="flex justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Saved Jobs
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Track your application deadlines
            </p>
          </div>
        </div>
        {activeExpiringCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-sm opacity-25"></div>
            <span className="relative inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
              <Clock className="w-4 h-4" />
              {activeExpiringCount}
            </span>
          </motion.div>
        )}
      </header>

      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full mb-4"
            />
            <p className="text-center text-zinc-500 dark:text-zinc-400 font-medium">
              Loading saved jobs…
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-center text-zinc-500 dark:text-zinc-400 font-medium mb-2">
              No saved jobs yet
            </p>
            <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm">
              Save jobs to track their deadlines here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {jobs.map((job, index) => (
                <motion.div
                  key={job.savedJobId}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    job.isExpired
                      ? "bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20"
                  }`}
                >
                  {/* Gradient overlay for active jobs */}
                  {!job.isExpired && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  {/* Urgency indicator */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    job.isExpired 
                      ? "bg-zinc-300 dark:bg-zinc-600" 
                      : job.daysLeft <= 1 
                        ? "bg-gradient-to-b from-red-500 to-orange-500" 
                        : job.daysLeft <= 3 
                          ? "bg-gradient-to-b from-orange-500 to-yellow-500"
                          : "bg-gradient-to-b from-emerald-500 to-green-500"
                  }`} />

                  <div className="flex items-center gap-3 p-3 pl-4">
                    {/* Company Avatar */}
                    <div className="flex-shrink-0 relative">
                      <div
                        className={`w-10 h-10 rounded-lg shadow-sm flex items-center justify-center font-semibold text-sm text-white transition-transform duration-200 group-hover:scale-105 ${
                          job.isExpired 
                            ? "bg-zinc-400" 
                            : "bg-gradient-to-br from-indigo-500 to-purple-600"
                        }`}
                        title={job.company || "Company"}
                      >
                        {getCompanyInitials(job.company)}
                      </div>
                      {!job.isExpired && job.daysLeft <= 1 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3 className={`font-semibold text-sm mb-0.5 truncate ${
                        job.isExpired ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
                      }`}>
                        {job.title}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mb-1.5">
                        {job.company}
                      </p>
                      
                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyStyle(job.daysLeft, job.isExpired)}`}>
                        {job.isExpired ? (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Expired</span>
                          </>
                        ) : job.daysLeft <= 1 ? (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Due {job.daysLeft === 0 ? 'today' : 'tomorrow'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{job.daysLeft} day{job.daysLeft !== 1 ? "s" : ""} left</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Options for ${job.title}`}
                            className={`p-2 h-auto rounded-lg transition-colors ${
                              job.isExpired 
                                ? "hover:bg-zinc-100 dark:hover:bg-zinc-700" 
                                : "hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                            }`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent 
                          align="end" 
                          sideOffset={5} 
                          className="w-40 border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm shadow-xl"
                        >
                          {!job.isExpired && job.jobId && (
                            <DropdownMenuItem
                              className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`jobs/${job.jobId}`, '_blank');
                              }}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Apply Now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsave(job.savedJobId);
                            }}
                            disabled={unsavingIds.has(job.savedJobId)}
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            {unsavingIds.has(job.savedJobId) ? "Removing..." : "Unsave"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiringJobsCard;