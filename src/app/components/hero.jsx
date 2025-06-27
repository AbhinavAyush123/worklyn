"use client";

import React, { useRef, useState } from "react";
import { ArrowRight, FileText, Video, MessageSquare, Bell, Briefcase, Users, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Hero() {
  const containerRef = useRef(null);
  const dashboardRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: dashboardRef,
    offset: ["start end", "end end"]
  });

  // Optimized scroll transforms
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 1.03]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [8, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.5], [0, 1, 1]);
  
  // This will disable 3D effects after animation completes
  const perspective = useTransform(scrollYProgress, [0, 0.5, 0.51], ["100px", "100px", "none"], {
    clamp: true
  });

  const handleEnter = () => {
    setHasEntered(true);
  };

  if (!hasEntered) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-38">
  <div className="bg-blue-500 p-8 rounded-[2rem] shadow-2xl scale-145 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 48 48">
      <path
        fill="#ffffff"
        d="M2.141 34l3.771 6.519.001.001C6.656 41.991 8.18 43 9.94 43l.003 0 0 0h25.03l-5.194-9H2.141zM45.859 34.341c0-.872-.257-1.683-.697-2.364L30.977 7.319C30.245 5.94 28.794 5 27.124 5h-7.496l21.91 37.962 3.454-5.982C45.673 35.835 45.859 35.328 45.859 34.341zM25.838 28L16.045 11.038 6.252 28z"
      />
    </svg> 
  </div>

  
    <Button 
      size="sm" 
      variant="default"
      className="text-sm px-6 py-2  rounded-sm font-medium  transition  hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]  duration-200 "
      onClick={handleEnter}
    >
      Enter Platform
    </Button>

</div>

      </div>
    );
  }

  return (
    <div ref={containerRef} className="overflow-hidden">
      <section className="w-full min-h-screen flex items-center justify-center mt-45 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            {/* Logo Animation */}
            <motion.div
              initial={{ 
                scale: 3,
                opacity: 1,
                y: 90
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}
              transition={{ 
                duration: 1.2,
                ease: [0.1, 0.9, 0.4, 1],
                delay: 0.2
              }}
              className="flex flex-col items-center gap-1 mb-6"
            >
              <motion.div 
                className="bg-blue-500 p-5 rounded-3xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 48 48">
                  <path
                    fill="#ffffff"
                    d="M2.141 34l3.771 6.519.001.001C6.656 41.991 8.18 43 9.94 43l.003 0 0 0h25.03l-5.194-9H2.141zM45.859 34.341c0-.872-.257-1.683-.697-2.364L30.977 7.319C30.245 5.94 28.794 5 27.124 5h-7.496l21.91 37.962 3.454-5.982C45.673 35.835 45.859 35.328 45.859 34.341zM25.838 28L16.045 11.038 6.252 28z"
                  />
                </svg> 
              </motion.div>
            </motion.div>

            {/* Main Content - Hero text remains large */}
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
            >
              Your gateway to student opportunities
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="text-md md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed"
            >
              The ultimate platform connecting students with internships, part-time jobs, and career resources.
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button size="lg" className="text-white group text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-all"/>
              </Button>
              <Button variant="secondary" className="text-sm" size="lg">
                Browse Jobs
              </Button>
            </motion.div>

            {/* Optimized Dashboard Section */}
            <div ref={dashboardRef} className="w-full pt-20 pb-20 flex justify-center">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.8, ease: "easeIn" }}
                style={{
                  perspective,
                  transformStyle: "preserve-3d",
                  width: "100%",
                  maxWidth: "1400px",
                  margin: "0 auto"
                }}
              >
                <motion.div
                  style={{
                    scale,
                    rotateX,
                    opacity,
                    transformOrigin: 'center top',
                    willChange: 'transform, opacity'
                  }}
                  className="rounded-xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] bg-white dark:bg-gray-800 mb-20 scale-130"
                >
                  <Image
                    src="/dashboard.png"
                    alt="Dashboard preview"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Smaller text */}
      <section className="w-full py-30 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-500 mb-4"
            >
              Student-Centric Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-base text-gray-600 dark:text-gray-300"
            >
              Everything you need to stand out in your job search
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto mb-6">
            {/* First Box - Blue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start mb-4">
                <div className="p-3 rounded-xl bg-white/20 mr-4 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI Resume Builder</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Our AI analyzes job descriptions and tailors your resume to match exactly what employers are looking for.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-white/90 border border-blue-600">
                  Try Now
                </Button>
              </div>
            </motion.div>

            {/* Second Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mr-4 flex-shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Interview Prep</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Practice with mock interviews and get real-time feedback to ace your next interview.
                  </p>
                </div>
              </div>
             
            </motion.div>

            {/* Third Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mr-4 flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Job Matching</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Our algorithm matches you with jobs that fit your skills, schedule, and career goals.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-blue-600 dark:border-blue-400">
                  Find Jobs
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* Fourth Box - Full width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="md:col-span-2 rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mr-4 flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Mentorship Network</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Connect with industry professionals and alumni who can guide you through your career journey. Get personalized advice, resume reviews, and insider tips.
                  </p>
                </div>
              </div>
             
            </motion.div>

            {/* Fifth Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mr-4 flex-shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Job Alerts</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Get notified when new jobs matching your criteria are posted.
                  </p>
                </div>
              </div>
              
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-center">
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-bold">10K+</div>
                <div className="text-blue-100 text-xs md:text-sm">Job Listings</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-bold">95%</div>
                <div className="text-blue-100 text-xs md:text-sm">Success Rate</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-bold">50+</div>
                <div className="text-blue-100 text-xs md:text-sm">Top Companies</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Smaller text */}
      <section className="w-full py-30 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-500 mb-4">
              What Students Are Saying
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Real stories from students who've launched their careers with our platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-blue-50 dark:bg-gray-800 rounded-xl p-5 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Student"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Emily Chen</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">High School Senior</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                "This site helped me land my first internship! The resume builder and mock interviews were a game-changer."
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-blue-50 dark:bg-gray-800 rounded-xl p-5 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Student"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Jordan Malik</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Community College Student</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                "The job listings are actually relevant and easy to apply for. I check this site every week for new postings."
              </p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-blue-50 dark:bg-gray-800 rounded-xl p-5 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://randomuser.me/api/portraits/women/65.jpg"
                  alt="Student"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Ava Rodríguez</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">First-Year University Student</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                "The video interview feature helped me get comfortable before the real thing. I love how intuitive everything is."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Smaller text */}
      <section className="w-full py-24 mb-10 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-5">
              <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-500 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Everything you need to know about our student job platform.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-neutral-400 dark:border-neutral-600">
                <AccordionTrigger className="text-left hover:no-underline px-4 py-3">
                  <span className="text-base font-medium text-gray-900 dark:text-white">How does the job matching work?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 px-4 pb-3 text-sm">
                  Our algorithm analyzes your profile, skills, availability, and career interests to match you with relevant job opportunities. The more complete your profile, the better our matches will be.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-neutral-400 dark:border-neutral-600">
                <AccordionTrigger className="text-left hover:no-underline px-4 py-3">
                  <span className="text-base font-medium text-gray-900 dark:text-white">Is there a cost to use the platform?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 px-4 pb-3 text-sm">
                  No, our platform is completely free for students. We partner with employers who cover the costs to help connect them with talented students like you.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-neutral-400 dark:border-neutral-600">
                <AccordionTrigger className="text-left hover:no-underline px-4 py-3">
                  <span className="text-base font-medium text-gray-900 dark:text-white">What types of jobs are available?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 px-4 pb-3 text-sm">
                  We list internships (paid and unpaid), part-time jobs, summer jobs, co-op positions, and entry-level roles specifically targeted at students and recent graduates.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-neutral-400 dark:border-neutral-600">
                <AccordionTrigger className="text-left hover:no-underline px-4 py-3">
                  <span className="text-base font-medium text-gray-900 dark:text-white">How do I get help with my resume?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 px-4 pb-3 text-sm">
                  Our AI resume builder provides instant feedback, and you can also schedule a free review with one of our career advisors through the mentorship network.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-neutral-400 dark:border-neutral-600">
                <AccordionTrigger className="text-left hover:no-underline px-4 py-3">
                  <span className="text-base font-medium text-gray-900 dark:text-white">Can I use this platform if I'm an international student?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 px-4 pb-3 text-sm">
                  Absolutely! Many of our job listings are open to international students. We also have filters to help you find employers who sponsor visas or offer CPT/OPT opportunities.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section - Smaller text */}
      <div className="w-full flex justify-center py-20 bg-background px-4">
  <div className="w-full max-w-5xl rounded-2xl shadow-xl bg-blue-200 p-10 md:p-16">
    <div className="text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold text-blue-700 mb-6"
      >
        Ready to jumpstart your career?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
        className="text-base text-neutral-600 mb-8 max-w-2xl mx-auto"
      >
        Join thousands of students who've found their dream opportunities through our platform.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Button 
          size="default" 
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Free Account
        </Button>
        <Button 
          variant="secondary" 
          size="default" 
          className=""
        >
          Browse Jobs
        </Button>
      </motion.div>
    </div>
  </div>
</div>
<footer className="w-full bg-blue-50 dark:bg-background text-blue-600 dark:text-white text-sm py-6">
  <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
    <p className="text-blue-600 dark:text-white">&copy; {new Date().getFullYear()} YourCompany. All rights reserved.</p>
    <div className="flex gap-4">
      <a href="#" className="hover:text-blue-300 transition">Privacy</a>
      <a href="#" className="hover:text-blue-300 transition">Terms</a>
      <a href="#" className="hover:text-blue-300 transition">Contact</a>
    </div>
  </div>
</footer>


    </div>
  );
}