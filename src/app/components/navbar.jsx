"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Navbar() {
  const [theme, setTheme] = useState("light");
  const { user, isSignedIn } = useUser();

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
    <header className="fixed top-0 z-50 bg-white dark:bg-zinc-900 w-full border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between py-3 px-4 md:px-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
             <Image 
                    src="/logo.png" 
                    alt="Dashboard preview"
                    width={30}
                     height={30}
                     className='bg-blue-500 rounded-sm'
                  />
            <Link href="/" className="text-lg font-bold text-blue-600 dark:text-blue-400">
              Worklyn
            </Link>
          </div>

          <nav className="hidden md:flex gap-2 items-center">
            <Link href="/listings">
              <Button variant="ghost" className="text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                Listings
              </Button>
            </Link>
            <Link href="/resume">
              <Button variant="ghost" className="text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                Resume
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400 flex items-center gap-2">
                Profile
                <span className="bg-blue-100 px-2 rounded text-blue-800 font-semibold text-xs border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                  new
                </span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="hover:text-blue-600 dark:hover:text-blue-400">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <div className="hidden md:flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button variant="secondary" className="hover:text-blue-600 dark:hover:text-blue-400">
                    Login
                  </Button>
                </Link>
                <div className="w-[1px] h-9 bg-gray-300 dark:bg-gray-700" />
                <Link href="/sign-up">
                  <Button className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-[0_8px_15px_-4px_rgba(37,99,235,0.4)] transition duration-300">
                    Sign Up
                    <span className="group-hover:translate-x-[2px] transition-transform duration-200 ease-in-out">→</span>
                  </Button>
                </Link>
              </>
            ) : (
              <SignOutButton>
                <Button variant="secondary" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
                  Sign Out
                </Button>
              </SignOutButton>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTitle className="hidden">
                hello
              </SheetTitle>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-6">
                <div className="flex flex-col gap-1 mt-10">
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                      Home
                    </Button>
                  </Link>
                  <Link href="/listings">
                    <Button variant="ghost" className="w-full justify-start text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                      Listings
                    </Button>
                  </Link>
                  <Link href="/resume">
                    <Button variant="ghost" className="w-full justify-start text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                      Resume
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                      Profile
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="pt-4 border-t border-muted mt-4 flex flex-col gap-3">
                    {!isSignedIn ? (
                      <>
                        <Link href="/login">
                          <Button variant="secondary" className="w-full hover:text-blue-600 dark:hover:text-blue-400">
                            Login
                          </Button>
                        </Link>
                        <Link href="/signup">
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            Sign Up
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <SignOutButton>
                        <Button variant="secondary" className="w-full hover:text-blue-600 dark:hover:text-blue-400">
                          Sign Out
                        </Button>
                      </SignOutButton>
                    )}
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