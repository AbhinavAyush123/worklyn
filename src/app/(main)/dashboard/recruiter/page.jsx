import { getUserRole } from '@/lib/getUserRole';
import { redirect } from 'next/navigation';


import RecruiterDashboard from './components/dashboardclient';


export default async function StudentDashboardPage() {
 const role = await getUserRole();


 if (role !== 'recruiter') {
   redirect('/unauthorized');
 }


 return <RecruiterDashboard />
  ;
}




