'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin as LocationEdit } from 'lucide-react';

// Sortable item wrapper for each section
function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#e5e7eb' : undefined, // gray background on drag
    borderRadius: '6px',
    boxShadow: isDragging
      ? '0 4px 8px rgba(0,0,0,0.1)'
      : undefined,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-section-id={id}
      tabIndex={0} // keyboard accessible
    >
      {children}
    </div>
  );
}

export default function ResumePreview({
  contactInfo,
  summary,
  skills,
  workExperiences,
  education,
  activities,
  sectionOrder,
  setSectionOrder,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Check if section is visible
  const isSectionVisible = (key) => {
    switch (key) {
      case 'header':
        return true; // always visible
      case 'summary':
        return Boolean(summary);
      case 'skills':
        return skills.length > 0;
      case 'work':
        return workExperiences.length > 0;
      case 'education':
        return education.length > 0;
      case 'activities':
        return activities.length > 0;
      default:
        return false;
    }
  };

  // Filter visible sections for DndKit sorting context
  const visibleSections = sectionOrder.filter(isSectionVisible);

  // Handle drag end to reorder sections
  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = visibleSections.indexOf(active.id);
      const newIndex = visibleSections.indexOf(over.id);
      const newVisibleOrder = arrayMove(visibleSections, oldIndex, newIndex);

      // Build full new order including hidden sections in same spots
      const newOrder = [];
      let visibleIndex = 0;
      for (const section of sectionOrder) {
        if (isSectionVisible(section)) {
          newOrder.push(newVisibleOrder[visibleIndex]);
          visibleIndex++;
        } else {
          newOrder.push(section);
        }
      }
      setSectionOrder(newOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Card className="p-8 max-w-8xl mx-auto bg-white rounded-sm shadow-none border border-gray-200 print:p-10 print:border-0 print:shadow-none text-gray-900">

        <SortableContext
          items={visibleSections}
          strategy={verticalListSortingStrategy}
        >
          {sectionOrder.map((sectionKey) => {
            if (!isSectionVisible(sectionKey)) return null;

            const content = (() => {
              switch (sectionKey) {
                case 'header':
                  return (
                    <div key="header">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">{contactInfo.name || 'Your Name'}</h1>
                        <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-gray-600">
                          {contactInfo.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {contactInfo.phone}
                            </span>
                          )}
                          {contactInfo.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {contactInfo.email}
                            </span>
                          )}
                          {contactInfo.address && (
                            <span className="flex items-center gap-1">
                              <LocationEdit size={14} />
                              {contactInfo.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                case 'summary':
                  return (
                    <div key="summary">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold border-b pb-1 mb-2">Professional Summary</h2>
                        <p className="text-sm whitespace-pre-line">{summary}</p>
                      </div>
                    </div>
                  );
                case 'skills':
                  return (
                    <div key="skills">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold border-b pb-1 mb-2">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="rounded-sm dark:text-gray-900">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                case 'work':
                  return (
                    <div key="work">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold border-b pb-1 mb-2">Work Experience</h2>
                        {workExperiences.map((exp) => (
                          <div key={exp.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{exp.position || 'Position'}</h3>
                              {(exp.startDate || exp.endDate) && (
                                <span className="text-sm text-gray-600">
                                  {exp.startDate} - {exp.endDate}
                                </span>
                              )}
                            </div>
                            {exp.company && (
                              <div className="text-sm text-gray-600 mb-1">{exp.company}</div>
                            )}
                            {exp.description && (
                              <p className="text-sm whitespace-pre-line">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                case 'education':
                  return (
                    <div key="education">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold border-b pb-1 mb-2">Education</h2>
                        {education.map((edu) => (
                          <div key={edu.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{edu.institution || 'Institution'}</h3>
                              {edu.graduationDate && (
                                <span className="text-sm text-gray-600">{edu.graduationDate}</span>
                              )}
                            </div>
                            {(edu.degree || edu.gpa) && (
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>{edu.degree}</span>
                                {edu.gpa && <span>GPA: {edu.gpa}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                case 'activities':
                  return (
                    <div key="activities">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold border-b pb-1 mb-2">Extracurricular Activities</h2>
                        {activities.map((activity) => (
                          <div key={activity.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{activity.name || 'Activity'}</h3>
                              {(activity.startDate || activity.endDate) && (
                                <span className="text-sm text-gray-600">
                                  {activity.startDate} - {activity.endDate}
                                </span>
                              )}
                            </div>
                            {activity.role && (
                              <div className="text-sm text-gray-600 mb-1">{activity.role}</div>
                            )}
                            {activity.description && (
                              <p className="text-sm whitespace-pre-line">{activity.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })();

            return <SortableItem key={sectionKey} id={sectionKey}>{content}</SortableItem>;
          })}
        </SortableContext>
      </Card>
    </DndContext>
  );
}
