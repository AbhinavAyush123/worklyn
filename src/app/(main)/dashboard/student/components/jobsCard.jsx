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

import { MoreVertical, Clock, ExternalLink, Bookmark, AlertCircle, CheckCircle2  } from "lucide-react";

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
  function getUrgencyStyle(daysLeft, isExpired) {
    if (isExpired) return "text-red-500 bg-red-50 dark:bg-red-950/50";
    if (daysLeft <= 1) return "text-amber-600 bg-amber-50 dark:bg-amber-950/50";
    if (daysLeft <= 3) return "text-orange-600 bg-orange-50 dark:bg-orange-950/50";
    return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50";
  }

  return (
    <div className="h-full w-full flex flex-col">
      <header className="flex justify-between items-center mb-5 flex-shrink-0">
  <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
    <Bookmark className="w-5 h-5 " />
    <span>Saved Jobs</span>
  </div>
  {activeExpiringCount > 0 && (
    <span className="inline-block bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full select-none">
      {activeExpiringCount}
    </span>
  )}
</header>


      <div className="flex-grow overflow-y-auto pr-0">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading saved jobs…
          </p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No saved jobs yet.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {jobs.map((job) => (
              <motion.div
                key={job.savedJobId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                className={`group flex items-center gap-4 p-3  group relative overflow-hidden rounded-2xl  transition-all duration-300 
                  ${
                    job.isExpired
                       ? "bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 hover:bg-gray-50"
                  }
                  mb-3
                `}
              >
                {/* Company Logo Placeholder */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                    job.isExpired 
                      ? "bg-zinc-300 dark:bg-zinc-600" 
                      : job.daysLeft <= 1 
                        ? "bg-gradient-to-b from-red-500 to-orange-500" 
                        : job.daysLeft <= 3 
                          ? "bg-gradient-to-b from-orange-500 to-yellow-500"
                          : "bg-gradient-to-b from-emerald-500 to-green-500"
                  }`} />

<div className="flex items-center justify-between w-full gap-4 ">
  {/* LEFT SIDE: Avatar + job info */}
  <div className="flex items-center gap-3 min-w-0">
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

    <div className="min-w-0">
      <h3 className={`font-semibold text-sm mb-0.5 truncate ${
        job.isExpired ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
      }`}>
        {job.title}
      </h3>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mb-1.5">
        {job.company}
      </p>
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
  </div>

  {/* RIGHT SIDE: Menu */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Options for ${job.title}`}
        className="ml-auto cursor-pointer "
      >
        <MoreVertical className="w-10 h-10  cursor-pointer" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={5} className="w-40 border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm shadow-xl">
      {!job.isExpired && job.jobId && (
        <Link href={`jobs/${job.jobId}`}>
         <DropdownMenuItem
                              className="cursor-pointer text-black dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                              onClick={(e) => {
                                e.stopPropagation();
                               
                              }}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Apply Now
                            </DropdownMenuItem>
        </Link>
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

              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ExpiringJobsCard;
