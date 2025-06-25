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
  defs,
  linearGradient,
  stop,
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

      const counts = { accepted: 0, rejected: 0, pending: 0 };

      data?.forEach(({ status }) => {
        if (status === 'Accepted') counts.accepted++;
        else if (status === 'Rejected') counts.rejected++;
        else counts.pending++;
      });

      const formatted = [
        { status: 'Accepted', count: counts.accepted },
        { status: 'Rejected', count: counts.rejected },
        { status: 'Pending', count: counts.pending },
      ].filter((entry) => entry.count > 0);

      setStatusCounts(formatted);
    };

    fetchData();
  }, [user]);

  const customTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const { status, count } = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-3 py-2 rounded shadow text-sm">
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
          <linearGradient id="purpleWhiteGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#f3e8ff" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="status"
          stroke="#9CA3AF"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          allowDecimals={false}
          tickFormatter={(val) => `${val}`}
          stroke="#9CA3AF"
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          content={customTooltip}
          cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
        />
        <Bar
          dataKey="count"
          fill="url(#purpleWhiteGradient)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
