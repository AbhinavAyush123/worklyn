"use client";
import React from "react";
import { twMerge } from "tailwind-merge";
import { TracingBeam } from "@/components/ui/tracing-beam";
import {
  Search,
  FileText,
  Send,
  BadgeCheck,
  Briefcase,
} from "lucide-react";

export function Timeline() {
  return (
    <TracingBeam className="px-6 mt-20">
      <div className="max-w-2xl mx-auto antialiased pt-4 relative">
        {processSteps.map((item, index) => (
          <div key={`step-${index}`} className="mb-20"> 
            <h2 className=" text-gray-900 dark:text-white  rounded-full text-sm w-fit  py-1 mb-4">
              Step {index + 1}
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <item.icon className="w-8 h-8 text-sky-500" />
              <p className={twMerge("text-xl font-semibold")}>
                {item.title}
              </p>
            </div>

            <div className="text-sm prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}

const processSteps = [
  {
    title: "Browse Opportunities",
    description: (
      <>
        <p>
          Use our intuitive search to discover internships, part-time jobs, and full-time roles tailored for students. Filter by interests, location, or employer type.
        </p>
      </>
    ),
    icon: Search,
  },
  {
    title: "Create a Student Profile",
    description: (
      <>
        <p>
          Sign up and showcase your skills, education, and resume. Employers will use your profile to assess your fit for the role.
        </p>
      </>
    ),
    icon: FileText,
  },
  {
    title: "Apply with One Click",
    description: (
      <>
        <p>
          Once your profile is ready, you can apply to jobs instantly. Save time and apply directly through the platform.
        </p>
      </>
    ),
    icon: Send,
  },
  {
    title: "Get Verified",
    description: (
      <>
        <p>
          Our admin team ensures your applications are legitimate, and your profile verified to give employers confidence.
        </p>
      </>
    ),
    icon: BadgeCheck,
  },
  {
    title: "Start Your Journey",
    description: (
      <>
        <p>
          If selected, you'll be contacted by the employer to begin your student career journey. Simple, fast, and stress-free.
        </p>
      </>
    ),
    icon: Briefcase,
  },
];
