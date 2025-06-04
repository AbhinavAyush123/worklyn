import { getUserRole } from '@/lib/getUserRole';
import { redirect } from 'next/navigation';
import StudentDashboardClient from './StudentDashboardClient';

export default async function StudentDashboardPage() {
  const role = await getUserRole();

  if (role !== 'student') {
    redirect('/unauthorized');
  }

  return <StudentDashboardClient />;
}
