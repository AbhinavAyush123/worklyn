'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export default function JobListingsPage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
  });

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setJobs(data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/job-listings', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ title: '', description: '', company: '', location: '', salary: '' });
      fetchJobs();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Job Title"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company"
          className="w-full border p-2 rounded"
        />
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full border p-2 rounded"
        />
        <input
          name="salary"
          value={form.salary}
          onChange={handleChange}
          placeholder="Salary"
          className="w-full border p-2 rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
          rows={4}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Post Job
        </button>
      </form>

      <div className="space-y-6">
        {jobs.map((job) => (
          <div key={job.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-bold">{job.title}</h2>
            <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
            <p className="mt-2 text-gray-800">{job.description}</p>
            {job.salary && (
              <p className="mt-2 text-green-600 font-semibold">Salary: {job.salary}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
