"use client"

import React from 'react';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Button } from '@/components/ui/button';
import { Timeline } from './timeline';
import { Cta } from './cta';
import Testimonials from './testimonials';
import Footer from './footer';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const Hero = () => {
  const headingWords = ['Make', 'Your', 'Future', 'Happen'];

  return (
    <div className="w-full flex justify-center relative px-4 mt-10 bg-gradient-b from-gray-100 to-white">
      <BackgroundBeams className="fixed top-0 left-0 w-full h-full z-[-10]" />

      <div className="flex flex-col items-center text-center space-y-6  max-w-6xl w-full">

        {/* Animated Announcement Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type:"spring" ,delay: 0.2, duration: 0.6 }}
        >
          <Button
            variant="secondary"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-600 border border-gray-200 hover:bg-sky-100 shadow-none hover:scale-105 transition dark:bg-gray-800 dark:text-white dark:border-gray-600 mt-20 mb-10"
          >
            <span className="bg-white text-sky-600 dark:bg-gray-700 dark:text-white px-2 py-0.5 rounded-full text-sm">
              📣 Announcement
            </span>
            <span className="text-sm">Introducing Aspire 🎉</span>
          </Button>
        </motion.div>

        {/* Animated Heading */}
        <div className="flex flex-wrap justify-center items-center text-3xl sm:text-5xl lg:text-7xl font-bold gap-2 text-gray-900 dark:text-white">
          {headingWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type:"spring" ,delay: i * 0.2, duration: 1 }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Subheading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type:"spring" ,delay: 1, duration: 0.6 }}
          className="text-3xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white"
        >
          With{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500">
            One Click
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="text-base hidden sm:flex text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-4 px-2"
        >
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo repellendus doloremque
          assumenda dolores unde ullam numquam sunt necessitatibus dolor. Ipsam laborum.
        </motion.p>

        {/* Animated Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="max-w-4xl w-full mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-sky-200 dark:border-gray-700 p-2"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-400 h-4 w-4" />
              <Input 
                placeholder="Job title, keywords, or company" 
                className="pl-10 h-11 text-base border border-sky-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-md focus:border-sky-500 focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-400 h-4 w-4" />
              <Input 
                placeholder="City, state, or remote" 
                className="pl-10 h-11 text-base border border-sky-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-md focus:border-sky-500 focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <Button className="h-11 px-6 text-base font-semibold text-white bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 transition-all duration-200 rounded-md dark:from-sky-500 dark:to-sky-700 dark:hover:from-sky-600 dark:hover:to-sky-800">
              Search Jobs
            </Button>
          </div>
        </motion.div>

        {/* Animated Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.7 }}
          className="w-full flex justify-center items-center mt-10 px-4"
        >
          <img
            src="https://www.qualtrics.com/m/assets/support/wp-content/uploads//2021/03/sat-dash.png"
            alt="Descriptive alt text"
            className="w-full sm:w-3/4 lg:w-full h-auto rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 hover:scale-105 transition-transform duration-300 ease-in-out"
          />
        </motion.div>

        {/* Testimonials, Timeline, CTA, Footer */}
        <div className="w-full mt-10"><Testimonials /></div>
        <div className="w-full"><Timeline /></div>
        <div className="w-full bg-sky-100 rounded-xl px-20 py-10"><Cta /></div>
        <div className="mt-20 w-full"><Footer /></div>
      </div>
    </div>
  );
};

export default Hero;
