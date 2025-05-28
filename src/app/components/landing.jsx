import React from 'react';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Button } from '@/components/ui/button';
import { Timeline } from './timeline';
import { Cta } from './cta';
import Testimonials from './testimonials';
import Footer from './footer';

const Hero = () => {
  return (
    <div className="w-full flex justify-center relative px-4 mt-10">
      <BackgroundBeams className="absolute inset-0 z-[-1]" />

      <div className="flex flex-col items-center text-center space-y-6 mt-10 max-w-6xl w-full">
        {/* Title Button */}
        <Button
          variant="secondary"
          className="bg-gray-100 px-6 py-2 hover:scale-105 rounded-full hover:bg-gray-200 dark:bg-white dark:text-gray-900 shadow-none"
        >
          Introducing Aspire 🎉
        </Button>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white">
          Make Your Future Happen
        </h1>

        <div className="flex flex-wrap justify-center items-center text-3xl sm:text-5xl lg:text-7xl font-bold gap-4 text-gray-900 dark:text-white">
          With{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500">
            One Click
          </span>
        </div>

        {/* Description */}
        <p className="text-base hidden sm:flex text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-4 px-2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo repellendus doloremque
          assumenda dolores unde ullam numquam sunt necessitatibus dolor. Ipsam laborum.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-10">
          <Button
            variant="secondary"
            className="hover:bg-gray-200 dark:bg-white dark:text-gray-900 text-gray-800 shadow-none w-48"
          >
            Search Jobs
          </Button>

          <div className="hidden sm:block w-[1px] h-9 bg-gray-300 dark:bg-gray-600" />

          <Button className="group w-48 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-semibold hover:shadow-[0_8px_15px_-4px_rgba(56,189,248,0.6)] transition duration-300">
            Get Started
            <span className="ml-2 group-hover:translate-x-[2px] transition-transform duration-200 ease-in-out">
              →
            </span>
          </Button>
        </div>

        {/* Image */}
        <div className="w-full flex justify-center items-center mt-10 px-4">
          <img
            src="https://www.qualtrics.com/m/assets/support/wp-content/uploads//2021/03/sat-dash.png"
            alt="Descriptive alt text"
            className="w-full sm:w-3/4 lg:w-2/3 h-auto rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 hover:scale-105 transition-transform duration-300 ease-in-out"
          />
        </div>

        {/* Testimonials */}
        <div className="w-full mt-10">
          <Testimonials />
        </div>

        {/* Timeline */}
        <div className="w-full">
          <Timeline />
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-10 px-4">
          <Cta />
        </div>

        {/* Footer */}
        <div className="mt-20 w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Hero;
