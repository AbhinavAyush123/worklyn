import React from 'react'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { Button } from '@/components/ui/button'
import { Timeline } from './timeline'
import {Cta} from './cta'
import Testimonials from './testimonials'
import Footer from './footer'
const hero = () => {
  return (
    <div className='w-full flex justify-center'>
        <BackgroundBeams className="absolute inset-0 z-[-1]" />
        <div className='flex flex-col  justify-center  text-center space-y-4 mt-5 text-7xl font-bold text-gray-900 dark:text-white'>
            <div>
                <Button variant="secondary" className='bg-gray-100 px-6 hover:scale-105 rounded-full hover:bg-gray-200 dark:bg-white dark:text-gray-900 shadow-none'>
                    Introducing Aspire 🎉
                </Button>
            </div>
            
            <span>
                Make Your Future Happen
            </span>
            <span className='gap-4 flex justify-center items-center'>
                 With 
                <span className='bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500 font-bold'>
                    One Click
                </span>
            </span>
            <p className='text-sm text-gray-400 dark:text-gray-400 max-w-2xl mx-auto mt-5'>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo repellendus doloremque assumenda dolores unde ullam numquam sunt necessitatibus dolor. Ipsam laborum.
            </p>
            <div className='flex justify-center items-center gap-10 mt-10'>
                <Button variant="secondary" className='hover:bg-gray-200 dark:bg-white dark:text-gray-900 text-gray-800 shadow-none'>
                    Search Jobs
                </Button>

                <div className="w-[1px] h-9 mx-3 bg-gray-300 "></div>

                <Button className='group bg-gradient-to-r from-sky-400 to-sky-500 text-white font-semibold hover:shadow-[0_8px_15px_-4px_rgba(56,189,248,0.6)] transition duration-300'>
                    Get Started
                    <span className="group-hover:translate-x-[2px] transition-transform duration-200 ease-in-out">
                        →
                    </span>
                </Button>
            </div>
            <div className='flex justify-center items-center mt-10'>
            <img
                src="https://www.qualtrics.com/m/assets/support/wp-content/uploads//2021/03/sat-dash.png"
                alt="Descriptive alt text"
                className="w-2/3 border-10 border-gray-300 dark:border-gray-700 h-auto rounded-lg shadow-lg perspective-1000 hover:scale-105 transition-transform duration-300 ease-in-out"
            />
            </div>
            <div>
                <Testimonials />
            </div>
            <div>
                <Timeline />
            </div>
            <div className='max-w-3xl mx-auto mt-10 px-4'>
                <Cta />
            </div>
            <div className='mt-20'>
                <Footer/>
            </div>
            
        </div>
    </div>
  )
}

export default hero