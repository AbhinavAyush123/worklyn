"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  CalendarCheck2,
  ClockArrowDown,
  Bookmark,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import SalaryTrend from "./components/graph";
import ApplicationHistoryCard from "./components/appliedJobs";
import { supabase } from "@/lib/supabase";
import { subDays, isAfter } from "date-fns";
import StatusOverTimeChart from "./components/rejectedappliedgraph";
import InterviewCard from "./components/interviewCard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import ExpiringJobsCard from "./components/jobsCard";

dayjs.extend(utc);

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const StudentDashboardClient = () => {
  const [interviews, setInterviews] = useState([]);
  const [nextInterviewText, setNextInterviewText] = useState("Loading...");
  const { user } = useUser();
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalChangePercent, setTotalChangePercent] = useState(null);
  const [lastWeekApplications, setLastWeekApplications] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastWeekPending, setLastWeekPending] = useState(0);
  const [pendingChangePercent, setPendingChangePercent] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchApplications() {
      const { data, error } = await supabase
        .from("appliedjobs")
        .select("applied_at")
        .eq("user_id", user.id);

      if (error) return console.error(error);
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const fourteenDaysAgo = subDays(now, 14);
      const last7 = data.filter((d) => isAfter(new Date(d.applied_at), sevenDaysAgo)).length;
      const prev7 = data.filter((d) => {
        const date = new Date(d.applied_at);
        return date > fourteenDaysAgo && date <= sevenDaysAgo;
      }).length;

      setTotalApplications(data.length);
      setLastWeekApplications(last7);
      setTotalChangePercent(prev7 === 0 ? null : (((last7 - prev7) / prev7) * 100).toFixed(1));
    }

    fetchApplications();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchPendingApplications() {
      const { data, error } = await supabase
        .from("appliedjobs")
        .select("applied_at, status")
        .eq("user_id", user.id)
        .eq("status", "Applied");

      if (error) return console.error(error);

      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const fourteenDaysAgo = subDays(now, 14);
      const last7 = data.filter((d) => isAfter(new Date(d.applied_at), sevenDaysAgo)).length;
      const prev7 = data.filter((d) => {
        const date = new Date(d.applied_at);
        return date > fourteenDaysAgo && date <= sevenDaysAgo;
      }).length;

      setPendingCount(data.length);
      setLastWeekPending(last7);
      setPendingChangePercent(prev7 === 0 ? null : (((last7 - prev7) / prev7) * 100).toFixed(1));
    }

    fetchPendingApplications();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const fetchInterviews = async () => {
      const { data } = await supabase
        .from("interviews")
        .select("interview_at")
        .eq("student_id", user.id)
        .gt("interview_at", new Date().toISOString())
        .order("interview_at", { ascending: true });

      setInterviews(data || []);
      if (data && data.length > 0) {
        const next = dayjs(data[0].interview_at);
        const now = dayjs();
        const label = next.isSame(now, "day")
          ? `Today at ${next.format("h:mm A")}`
          : next.isSame(now.add(1, "day"), "day")
          ? `Tomorrow at ${next.format("h:mm A")}`
          : next.format("MMM D [at] h:mm A");

        setNextInterviewText(`Next: ${label}`);
      } else {
        setNextInterviewText("No upcoming interviews");
      }
    };

    fetchInterviews();
  }, [user]);

  const metricCard = (title, icon, count, changePercent, subtitle, index) => (
    <motion.div
      custom={index}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="rounded-2xl p-5 dark:from-zinc-900 dark:to-zinc-800 shadow-md hover:shadow-lg transition"
    >
      <CardTitle className="flex items-center justify-between mb-3">
        <h3 className="text-zinc-700 dark:text-zinc-100 font-semibold flex gap-2 items-center">{icon}{title}</h3>
       
      </CardTitle>
      <CardContent className="flex justify-between items-center py-4">
  <span className="text-4xl font-bold text-zinc-900 dark:text-white">{count}</span>
  {changePercent !== null && (
    <span className={`px-3 py-1 rounded-full text-sm ${changePercent >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
      {changePercent >= 0 ? "↑" : "↓"} {Math.abs(changePercent)}%
    </span>
  )}
</CardContent>
      <CardFooter className="text-xs text-gray-500">{subtitle}</CardFooter>
    </motion.div>
  );

  return (
    <motion.div
      className="px-4 sm:px-6 md:px-8 mt-5 max-w-7xl mx-auto min-h-screen flex flex-col gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metricCard("Total Applications", <Bookmark className="text-gray-500" />, totalApplications, totalChangePercent, `Compared to (${lastWeekApplications} last week)`, 0)}
        {metricCard("Applications Pending", <ClockArrowDown className="text-gray-500" />, pendingCount, pendingChangePercent, `Compared to (${lastWeekPending} last week)`, 1)}
        {metricCard("Interviews Scheduled", <CalendarCheck2 className="text-gray-500" />, interviews.length, null, nextInterviewText, 2)}
        {metricCard("Jobs Saved", <Bookmark className="text-gray-500" />, 132, null, "Compared to last week", 3)}
      </div>

      {/* Interview + Chart */}
      <motion.div className="flex flex-col lg:flex-row gap-4 sm:gap-6" variants={fadeIn} custom={4} initial="hidden" animate="visible">
        <div className="w-full lg:w-1/2">
          <InterviewCard />
        </div>
        <Card className="h-80 w-full lg:w-1/2 rounded-2xl border-0 shadow-md  dark:from-zinc-900 dark:to-zinc-800">
          <CardContent className="h-full">
            <StatusOverTimeChart />
          </CardContent>
        </Card>
      </motion.div>

      {/* Salary + Applications */}
      <motion.div className="space-y-6" variants={fadeIn} custom={5} initial="hidden" animate="visible">
        <div className="h-96 w-full">
          <SalaryTrend />
        </div>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6 mt-12">
          <div className="w-full md:w-1/2">
            <ApplicationHistoryCard />
          </div>
          <div className="w-full md:w-1/2">
            <Card className="h-82 w-full border-2 border-gray-100 rounded-2xl shadow-md dark:from-zinc-900 dark:to-zinc-800">
              <CardContent className="h-full p-4">
                <ExpiringJobsCard />
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboardClient;
