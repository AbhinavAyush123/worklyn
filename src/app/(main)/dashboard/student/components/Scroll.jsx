'use client';
import { useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiMapPin, FiBriefcase } from 'react-icons/fi';

const initialJobs = [
  {
    id: 1,
    title: 'Intern UX Designer',
    company: 'Maximoz Team',
    salary: '$14,000 - $25,000',
    location: 'London, England',
    type: 'Full-time',
    color: '#3b82f6',
  },
  {
    id: 2,
    title: 'Senior UX Designer',
    company: 'Incacxyz Studios',
    salary: '$21,000 - $25,000',
    location: 'Manchester, England',
    type: 'Freelance, Part-time',
    color: '#06b6d4',
  },
  {
    id: 3,
    title: 'Freelance UI Designer',
    company: 'Noonatu Team',
    salary: '$14,000 - $25,000',
    location: 'London, England',
    type: 'Full-time',
    color: '#facc15',
  },
  {
    id: 4,
    title: 'nigg UI Designer',
    company: 'Noonatu Team',
    salary: '$14,000 - $25,000',
    location: 'London, England',
    type: 'Full-time',
    color: '#facc15',
  },
  {
    id: 5,
    title: 'ayush UI Designer',
    company: 'Noonatu Team',
    salary: '$14,000 - $25,000',
    location: 'London, England',
    type: 'Full-time',
    color: '#facc15',
  },
];

export default function HorizontalInfiniteSlider() {
  const [jobs, setJobs] = useState(initialJobs);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  const slide = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const container = containerRef.current;
    if (!container) return;

    container.style.transition = 'transform 0.5s ease-in-out';
    container.style.transform =
      direction === 'right' ? 'translateX(-33.3333%)' : 'translateX(33.3333%)';

    setTimeout(() => {
      container.style.transition = 'none';

      const newJobs =
        direction === 'right'
          ? [...jobs.slice(1), jobs[0]]
          : [jobs[jobs.length - 1], ...jobs.slice(0, jobs.length - 1)];

      setJobs(newJobs);
      container.style.transform = 'translateX(0)';
      void container.offsetWidth;

      setTimeout(() => {
        setIsAnimating(false);
      }, 20);
    }, 500);
  };

  return (
    <div>
      {/* Left Button */}
      <button
        onClick={() => slide('left')}
       
        aria-label="Slide Left"
      >
        <FaChevronLeft />
      </button>

      {/* Right Button */}
      <button
        onClick={() => slide('right')}
      
        aria-label="Slide Right"
      >
        <FaChevronRight />
      </button>

      {/* Cards Track */}
      <div className="overflow-hidden w-full">
        <div
          ref={containerRef}
          className="flex"
          style={{ transform: 'translateX(0%)' }}
        >
          {jobs.map((job) => (
            <div key={job.id} className="w-1/3 flex-shrink-0 transition ">
              <div className="bg-white rounded-xl shadow p-4 flex gap-4 flex-col h-[300px]">
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: job.color }}
                  >
                    {job.title.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="text-xs text-gray-500">{job.company}</p>
                  </div>
                </div>
                <p className="text-sm font-medium">{job.salary} <span className="text-gray-400 text-xs">/ monthly</span></p>
                <div className="text-gray-500 text-xs flex flex-wrap gap-4 mt-auto">
                  <span className="flex items-center gap-1"><FiMapPin /> {job.location}</span>
                  <span className="flex items-center gap-1"><FiBriefcase /> {job.type}</span>
                </div>
                <button className="mt-2 text-[#188fdf] text-sm font-medium hover:underline self-start">View Maps</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
