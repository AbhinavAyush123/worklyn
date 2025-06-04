import { getUserRole } from '@/lib/getUserRole';
import { redirect } from 'next/navigation';

export default async function RecruiterDashboard() {
  const role = await getUserRole();

  if (role !== 'recruiter') {
    return redirect('/unauthorized');
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">💼 Welcome, Recruiter!</h1>
    </div>
  );
}
