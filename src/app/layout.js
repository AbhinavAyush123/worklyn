import './globals.css';
import { Poppins } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import SidebarWrapper from './components/SidebarWrapper';
import { Suspense } from 'react';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Student Job Portal',
  description: 'Find jobs and internships made for students',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={poppins.variable}>
        <body className="antialiased">
          <SidebarWrapper>
            <Suspense fallback={<div className="p-4">Loading page...</div>}>
              {children}
            </Suspense>
            <Toaster richColors={true} position="top-right" />
          </SidebarWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
