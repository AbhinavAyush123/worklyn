'use client';

import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { MessageCircle, ThumbsUp, Briefcase, User, Star, Smile } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    icon: <MessageCircle className="h-6 w-6 text-sky-500" />,
    name: 'Emma Rodriguez',
    role: 'College Student',
    text: 'I landed my first internship thanks to this portal!',
  },
  {
    icon: <ThumbsUp className="h-6 w-6 text-sky-500" />,
    name: 'Liam Johnson',
    role: 'Freelancer',
    text: 'Helped me find gigs that fit my class schedule.',
  },
  {
    icon: <Briefcase className="h-6 w-6 text-sky-500" />,
    name: 'Sophia Lee',
    role: 'Software Intern',
    text: 'One click and I was hired. Amazing!',
  },
  {
    icon: <User className="h-6 w-6 text-sky-500" />,
    name: 'Noah Patel',
    role: 'High School Senior',
    text: 'Great place to find my first job experience.',
  },
  {
    icon: <Star className="h-6 w-6 text-sky-500" />,
    name: 'Ava Nguyen',
    role: 'Design Student',
    text: 'Found freelance clients in days!',
  },
  {
    icon: <Smile className="h-6 w-6 text-sky-500" />,
    name: 'Mason Clark',
    role: 'Web Developer',
    text: 'Loved how fast and easy it was.',
  },
];

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <div className="py-20 bg-muted/5 text-center max-w-3xl flex flex-col items-center mx-auto w-full">
      <h2 className="text-3xl font-bold mb-8 flex gap-2">Student Success 
        <span className='bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-sky-500  to-sky-600 '>
            Stories
        </span>
        </h2>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 px-4">
          {testimonials.map((t, i) => (
            <Card
              key={i}
              className="min-w-[250px] max-w-sm flex-shrink-0 mx-auto shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-center">{t.icon}</div>
                <p className="text-muted-foreground text-sm max-w-sm">“{t.text}”</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-6 gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`w-3 h-3 rounded-full ${
              selectedIndex === i ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
