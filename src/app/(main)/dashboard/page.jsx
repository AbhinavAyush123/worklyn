'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

function DashboardRedirectContent() {
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

export default function DashboardRedirect() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <DashboardRedirectContent />
    </Suspense>
  );
}