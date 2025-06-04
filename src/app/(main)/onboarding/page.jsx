'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/save-user', { method: 'POST' });
    }
  }, [isLoaded]);

  const handleSelectRole = async (role) => {
    if (!isLoaded || !user) return;

    setLoading(true);
    const res = await fetch('/api/onboard-user', {
      method: 'POST',
      body: JSON.stringify({ role }),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);

    if (res.ok) {
      const destination = role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/student';
      router.push(destination);
    } else {
      alert('Something went wrong. Try again.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Are you a...</h1>
      <div className="flex gap-4">
        <button
          onClick={() => handleSelectRole('student')}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          Student
        </button>
        <button
          onClick={() => handleSelectRole('recruiter')}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={loading}
        >
          Recruiter
        </button>
      </div>
    </main>
  );
}
