'use client';

import React, { useEffect, useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import { AuroraBackground } from '@/components/ui/aurora-background';
import Link from 'next/link';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Page = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && systemDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <AuroraBackground className="min-h-screen flex flex-col items-center justify-center relative px-4">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Button variant="outline" className="group dark:text-white">
            <ArrowLeft className="group-hover:translate-x-[-3px] transition duration-200" />
               Back
           </Button>
        </Link>
        
      </div>

      <div className="absolute top-6 right-6">
        <Button variant="outline" size="icon" className="dark:text-white" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </AuroraBackground>
  );
};

export default Page;
