"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <>
     <h1
        className="mt-8 bg-gradient-to-br from-sky-400 to-sky-600 py-4 bg-clip-text text-center text-4xl font-semibold tracking-tight text-transparent md:text-6xl"
      >
        Make Your Career Start Here
      </h1>

      <p className="text-center text-gray-500 dark:text-gray-300 mt-6 max-w-2xl mx-auto px-4 text-sm md:text-base">
        Discover job opportunities tailored for students. Apply with one click, get verified, and land your first gig faster than ever.
      </p>

      <div className="flex justify-center gap-6 mt-8">
        <Button className='group bg-gradient-to-r from-sky-400 to-sky-500 text-white font-semibold hover:shadow-[0_8px_15px_-4px_rgba(56,189,248,0.6)] transition duration-300'>
             Get Started
             <span className="group-hover:translate-x-[2px] transition-transform duration-200 ease-in-out">
                →
            </span>
        </Button>
        <Button variant="outline" size="lg">
          Browse Jobs
        </Button>
      </div>
    </>

   
  );
}
