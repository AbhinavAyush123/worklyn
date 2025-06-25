"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function computeSummary(percentiles) {
  function getSalaryAt(p) {
    for (let i = 0; i < percentiles.length; i++) {
      if (percentiles[i].percentile === p) return percentiles[i].salary;
      if (percentiles[i].percentile > p && i > 0) {
        const p1 = percentiles[i - 1].percentile;
        const s1 = percentiles[i - 1].salary;
        const p2 = percentiles[i].percentile;
        const s2 = percentiles[i].salary;
        const ratio = (p - p1) / (p2 - p1);
        return s1 + ratio * (s2 - s1);
      }
    }
    return percentiles[percentiles.length - 1].salary;
  }

  const avgYearly =
    percentiles.reduce((sum, p) => sum + p.salary, 0) / percentiles.length;
  const hourly = (yearly) => yearly / 2080;

  return {
    junior: { yearly: getSalaryAt(25), hourly: hourly(getSalaryAt(25)) },
    mid: { yearly: getSalaryAt(50), hourly: hourly(getSalaryAt(50)) },
    senior: { yearly: getSalaryAt(75), hourly: hourly(getSalaryAt(75)) },
    average: { yearly: avgYearly, hourly: hourly(avgYearly) },
  };
}

export default function SalaryTrend() {
  const { user } = useUser();
  const [jobTitle, setJobTitle] = useState("");
  const [hasCheckedMajor, setHasCheckedMajor] = useState(false);
  const [percentiles, setPercentiles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
   const [range, setRange] = useState("7D");
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


  useEffect(() => {
    async function fetchAndRenderMajor() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("users")
        .select("intended_major")
        .eq("id", user.id)
        .single();

      if (error) {
        setError("Could not fetch intended major");
        setHasCheckedMajor(true);
        return;
      }

      if (data?.intended_major) {
        setJobTitle(data.intended_major);
        handleGetTrend(data.intended_major);
      }

      setHasCheckedMajor(true);
    }

    fetchAndRenderMajor();
  }, [user?.id]);

  async function handleGetTrend(title = jobTitle) {
    setLoading(true);
    setError("");
    setPercentiles([]);
    setSummary(null);
    try {
      const res = await fetch("/api/salary-trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: title }),
      });
      if (!res.ok) throw new Error("Failed to fetch salary data");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const filtered = data.percentiles.filter(
        (p) => p.percentile > 0 && p.percentile < 100
      );

      setPercentiles(filtered);
      setSummary(computeSummary(filtered));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const customTooltip = ({ payload }) => {
    if (!payload || !payload.length) return null;
    const { percentile, salary } = payload[0].payload;
    return (
      <div className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 shadow">
        <h1 className="font-bold">{percentile}th Percentile</h1>
        <div>${salary.toLocaleString()}</div>
      </div>
    );
  };

  return (
    <Card className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg rounded-2xl shadow-sm">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-2xl font-semibold text-zinc-800 dark:text-white">Salary Trends</CardTitle>
  
        <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:flex-row lg:items-center">
          <input
            type="text"
            placeholder={
              hasCheckedMajor && !jobTitle ? "Please select a job" : "Enter job title"
            }
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <Button
            onClick={() => handleGetTrend()}
            disabled={loading || !jobTitle.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
          >
            {loading ? "Loading..." : "Get Trend"}
          </Button>
          <Select value={chartType} onValueChange={setChartType}>
  <SelectTrigger className="w-[150px] cursor-pointer">
    <SelectValue placeholder="Chart Type" />
  </SelectTrigger>
  <SelectContent className="border-0">
    <SelectItem value="bar">Bar Chart</SelectItem>
    <SelectItem value="area">Area Chart</SelectItem>
  </SelectContent>
</Select>
  
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className = "hover:bg-gray-300 cursor-pointer" disabled={!summary}>
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Salary Summary Details</DialogTitle>
                <DialogDescription>
                  Detailed salary info by experience level.
                </DialogDescription>
              </DialogHeader>
  
              {!summary ? (
                <p>No data available. Please get a trend first.</p>
              ) : (
                <table className="w-full mt-3 text-sm text-left">
                  <thead className="text-zinc-500">
                    <tr>
                      <th className="py-2">Level</th>
                      <th className="text-right py-2">Yearly</th>
                      <th className="text-right py-2">Hourly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["junior", "mid", "senior", "average"].map((lvl) => (
                      <tr key={lvl} className="border-t border-zinc-200 dark:border-zinc-700">
                        <td className="py-2">
                          {lvl === "junior"
                            ? "Junior (25%)"
                            : lvl === "mid"
                            ? "Mid (50%)"
                            : lvl === "senior"
                            ? "Senior (75%)"
                            : "Average"}
                        </td>
                        <td className="text-right py-2">
                          $
                          {summary[lvl].yearly.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="text-right py-2">
                          ${summary[lvl].hourly.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
  
              <DialogClose asChild>
                <Button className="w-full mt-4">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
  
      <CardContent className="h-[300px]">
        {error && <p className="text-red-500 text-sm mb-2">Error: {error}</p>}
  
        {percentiles.length > 0 && (
          <div className="w-full flex justify-center items-center h-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart
                  data={percentiles}
                  margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                  barCategoryGap="20%"
                >
                  <defs>
                    <linearGradient id="purpleWhiteGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#f3e8ff" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                 
                  <XAxis
                    dataKey="percentile"
                    tickFormatter={(val) => `${val}%`}
                    stroke="#9CA3AF"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    stroke="#9CA3AF"
                    tick={{ fill: "currentColor" }}
                  />
                  <Tooltip
                    content={customTooltip}
                    cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                  />
                  <Bar dataKey="salary" fill="url(#purpleWhiteGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart
                  data={percentiles}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colorMap[range].fill} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={colorMap[range].fill} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                 
                  <XAxis
                    dataKey="percentile"
                    tickFormatter={(val) => `${val}%`}
                    stroke="#9CA3AF"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    stroke="#9CA3AF"
                    tick={{ fill: "currentColor" }}
                  />
                  <Tooltip
                    content={customTooltip}
                    cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="salary"
                    stroke={colorMap[range].fill}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}  