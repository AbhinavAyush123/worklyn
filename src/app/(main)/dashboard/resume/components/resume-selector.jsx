'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ResumeSelectorPage() {
  const [resumes] = useState([
    { id: 'r1', title: 'Software Engineer Resume', createdAt: '2024-05-01' },
    { id: 'r2', title: 'Product Manager Resume', createdAt: '2024-06-10' },
    { id: 'r3', title: 'Data Scientist Resume', createdAt: '2024-07-22' },
  ]);

  const [activeResumeId, setActiveResumeId] = useState('r2');

  function handleSelectResume(id) {
    setActiveResumeId(id);
    // TODO: persist active resume
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Select Your Active Resume</h1>

      <div className="space-y-4">
        {resumes.map((resume) => {
          const isActive = resume.id === activeResumeId;
          return (
            <Card
              key={resume.id}
              onClick={() => handleSelectResume(resume.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectResume(resume.id);
                }
              }}
              className={`cursor-pointer flex justify-between items-center ${
                isActive ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div>
                <h2 className="text-lg font-semibold">{resume.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Created on{' '}
                  {new Date(resume.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {isActive && (
                <Badge variant="secondary" className="select-none">
                  Active
                </Badge>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => alert('Add new resume')}>
          + Create New Resume
        </Button>
      </div>
    </main>
  );
}
