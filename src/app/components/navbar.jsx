"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || (!stored && systemDark)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <header className="fixed top-0 z-50 bg-white dark:bg-zinc-900 w-full border-b border-dashed">
      <div className="flex items-center justify-between py-3 px-4 md:px-10">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48">
              <path
                fill="#42a5f5"
                d="M2.141 34l3.771 6.519.001.001C6.656 41.991 8.18 43 9.94 43l.003 0 0 0h25.03l-5.194-9H2.141zM45.859 34.341c0-.872-.257-1.683-.697-2.364L30.977 7.319C30.245 5.94 28.794 5 27.124 5h-7.496l21.91 37.962 3.454-5.982C45.673 35.835 45.859 35.328 45.859 34.341zM25.838 28L16.045 11.038 6.252 28z"
              />
            </svg>
            <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-white">
              Aspire UI
            </Link>
          </div>

          <nav className="hidden md:flex gap-10 items-center">
            <Link href="/listings" className="text-sm hover:text-black dark:hover:text-white">
              Listings
            </Link>
            <Link href="/resume" className="text-sm hover:text-gray-900 dark:hover:text-white">
              Resume
            </Link>
            <Link href="/profile" className="text-sm hover:text-gray-900 flex items-center gap-2 dark:hover:text-white">
              Profile
              <span className="bg-green-200 px-2 rounded text-green-800 font-semibold text-xs border border-green-600">
                new
              </span>
            </Link>
            <Link href="/dashboard" className="text-sm hover:text-gray-900 dark:hover:text-white">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="secondary" className="bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-none">
              Login
            </Button>
            <div className="w-[1px] h-9 bg-gray-300 dark:bg-gray-700" />
            <Button className="group bg-gradient-to-r from-sky-400 to-sky-500 text-white font-semibold hover:shadow-[0_8px_15px_-4px_rgba(56,189,248,0.6)] transition duration-300">
              Sign Up
              <span className="group-hover:translate-x-[2px] transition-transform duration-200 ease-in-out">
                →
              </span>
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-6">
                <div className="flex flex-col gap-5 mt-10">
                  <Link href="/" className="text-base font-medium">
                    Home
                  </Link>
                  <Link href="/listings" className="text-base font-medium">
                    Listings
                  </Link>
                  <Link href="/resume" className="text-base font-medium">
                    Resume
                  </Link>
                  <Link href="/profile" className="text-base font-medium">
                    Profile
                  </Link>
                  <Link href="/dashboard" className="text-base font-medium">
                    Dashboard
                  </Link>
                  <div className="pt-6 border-t border-muted mt-4 flex flex-col gap-3">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                    <Button className="w-full bg-sky-500 text-white">Sign Up</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
