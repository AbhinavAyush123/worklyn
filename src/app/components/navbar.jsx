// components/Navbar.tsx
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, Moon, Sun } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (stored === "dark" || (!stored && systemDark)) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
    } else {
      setTheme("light")
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
  }

  return (
    <header className="bg-white dark:bg-zinc-900 w-full border-b border-dashed">
      <div className="flex items-center justify-between  py-3  mx-10">
        {/* Logo */}
        <div className="flex items-center gap-20">
            <div className="flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
                <path fill="#42a5f5" d="M2.141 34l3.771 6.519.001.001C6.656 41.991 8.18 43 9.94 43l.003 0 0 0h25.03l-5.194-9H2.141zM45.859 34.341c0-.872-.257-1.683-.697-2.364L30.977 7.319C30.245 5.94 28.794 5 27.124 5h-7.496l21.91 37.962 3.454-5.982C45.673 35.835 45.859 35.328 45.859 34.341zM25.838 28L16.045 11.038 6.252 28z"></path>
                </svg>  
                 <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-white">
                     Aspire UI
                </Link> 
            </div>
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10 items-center">
            <Link href="/listings" className="text-sm hover:text-black">Listings</Link>
            <Link href="/resume" className="text-sm hover:text-gray-900">Resume</Link>
            <Link href="/profile" className="text-sm hover:text-gray-900 gap-2 flex items-center">
                Profile
                <span className="bg-green-200 px-2 rounded text-green-800 font-semibold text-xs border border-green-600">
                    new
                </span>
            </Link>
            <Link href="/dasboard" className="text-sm hover:text-gray-900">Dashboard</Link>
        </nav>

        </div>
        
        {/* Right Side: Theme + Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Custom Theme Toggle */}
          <div className="flex items-center gap-3">
            <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <div className="hidden md:flex items-center gap-3">
                <Button variant="secondary" className="bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-none">
                    Login
                </Button>
                <div className="w-[1px] h-9 mx-3 bg-gray-300 "></div>
                <Button className="group bg-gradient-to-r from-sky-400 to-sky-500 text-white font-semibold hover:shadow-[0_8px_15px_-4px_rgba(56,189,248,0.6)] transition duration-300">
                    Sign Up 
                    <span className="group-hover:translate-x-[2px] transition-transform duration-200 ease-in-out">
                        →
                    </span>
                </Button>
            </div>
          </div>
          

          {/* Mobile Sheet */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="flex flex-col mt-6 gap-4">
                  <Link href="/" className="text-base">Home</Link>
                  <Link href="/about" className="text-base">About</Link>
                  <Link href="/contact" className="text-base">Contact</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
