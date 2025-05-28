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
    <div className="py-20 bg-muted/5 text-center flex flex-col items-center w-full">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 flex flex-wrap justify-center gap-2 text-center">
        <span>Student Success</span>
        <span className="bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-sky-500 to-sky-600">
          Stories
        </span>
      </h2>


      {/* Carousel container */}
      <div className="overflow-hidden w-full max-w-6xl px-4" ref={emblaRef}>
        <div className="flex gap-6 w-full">
          {testimonials.map((t, i) => (
            <Card
              key={i}
              className="flex-shrink-0 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 max-w-sm mx-auto shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-center">{t.icon}</div>
                <p className="text-muted-foreground text-sm max-w-sm line-clamp-3">“{t.text}”</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
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
