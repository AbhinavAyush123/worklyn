'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/(main)/dashboard/components/testSide';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function SidebarWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <SidebarTrigger className="mt-4 ml-2"/>
          <main className="flex-1 overflow-y-auto">{children}</main>
          
        </div>
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}
