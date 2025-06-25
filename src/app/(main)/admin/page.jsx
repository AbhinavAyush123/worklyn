"use client"
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const { user } = useUser();

  const fetchJobs = async () => {
    const { data, error } = await supabase.from('job_listings').select('*');
    setJobs(data || []);
  };

  const deleteJob = async (id) => {
    await supabase.from('job_listings').delete().eq('id', id);
    fetchJobs();
  };

  useEffect(() => {
    fetchJobs();
  }, []);



  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="border p-4 rounded shadow">
          <h3 className="text-lg font-bold">{job.title}</h3>
          <p>{job.description}</p>
          <p className="text-sm text-gray-500">{job.company} - {job.location}</p>
          <button onClick={() => deleteJob(job.id)} className="text-red-600 mt-2">Delete</button>
        </div>
      ))}
    </div>
  );
}
