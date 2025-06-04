'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function DashboardRedirect() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    const redirectToRoleDashboard = async () => {
      if (!isSignedIn || !user) return;

      const res = await fetch('/api/get-role');
      const data = await res.json();

      if (data.role === 'recruiter') {
        router.replace('/dashboard/recruiter');
      } else {
        router.replace('/dashboard/student');
      }
    };

    redirectToRoleDashboard();
  }, [isSignedIn]);

  return <p className="p-8">Redirecting to your dashboard...</p>;
}
