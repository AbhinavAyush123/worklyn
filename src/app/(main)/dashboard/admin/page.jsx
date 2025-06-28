import { getUserRole } from '@/lib/getUserRole';
import { redirect } from 'next/navigation';




import Dashboard from './components/admindash';


export default async function StudentDashboardPage() {
 const role = await getUserRole();


 if (role !== 'admin') {
   redirect('/unauthorized');
 }


 return <Dashboard />
  ;
}






