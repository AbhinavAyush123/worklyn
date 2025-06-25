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
import { Phone, Mail, MapPin as LocationEdit, Link as LinkIcon } from 'lucide-react';


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
   opacity: isDragging ? 0.8 : 1,
   position: 'relative',
   cursor: isDragging ? 'grabbing' : 'grab',
 };


 return (
   <div
     ref={setNodeRef}
     style={style}
     {...attributes}
     {...listeners}
     data-section-id={id}
     tabIndex={0}
     className="group relative"
   >
     {children}
     <div className="absolute -left-6 top-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
       <div className="w-4 h-4 rounded-full bg-gray-300"></div>
     </div>
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


 const isSectionVisible = (key) => {
   switch (key) {
     case 'header':
       return true;
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


 const visibleSections = sectionOrder.filter(isSectionVisible);


 function handleDragEnd(event) {
   const { active, over } = event;
   if (over && active.id !== over.id) {
     const oldIndex = visibleSections.indexOf(active.id);
     const newIndex = visibleSections.indexOf(over.id);
     const newVisibleOrder = arrayMove(visibleSections, oldIndex, newIndex);


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
     <Card className="p-10 max-w-full mx-auto bg-white rounded-sm shadow-none border border-gray-200 print:p-12 print:border-0 print:shadow-none text-gray-800 font-sans">
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
                   <div key="header" className="mb-8">
                     <div className="text-center">
                       <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                         {contactInfo.name || 'Your Name'}
                       </h1>
                       <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                         {contactInfo.phone && (
                           <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                             <Phone size={14} className="opacity-70" />
                             {contactInfo.phone}
                           </a>
                         )}
                         {contactInfo.email && (
                           <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                             <Mail size={14} className="opacity-70" />
                             {contactInfo.email}
                           </a>
                         )}
                         {contactInfo.address && (
                           <span className="flex items-center gap-1">
                             <LocationEdit size={14} className="opacity-70" />
                             {contactInfo.address}
                           </span>
                         )}
                         {contactInfo.website && (
                           <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                             <LinkIcon size={14} className="opacity-70" />
                             {contactInfo.website.replace(/^https?:\/\//, '')}
                           </a>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               case 'summary':
                 return (
                   <div key="summary" className="mb-8">
                     <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">
                       Professional Summary
                     </h2>
                     <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                       {summary}
                     </p>
                   </div>
                 );
               case 'skills':
                 return (
                   <div key="skills" className="mb-8">
                     <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">
                       Skills
                     </h2>
                     <div className="flex flex-wrap gap-2">
                       {skills.map((skill) => (
                         <Badge
                           key={skill}
                           variant="outline"
                           className="rounded-sm bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                         >
                           {skill}
                         </Badge>
                       ))}
                     </div>
                   </div>
                 );
               case 'work':
                 return (
                   <div key="work" className="mb-8">
                     <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">
                       Work Experience
                     </h2>
                     <div className="space-y-6">
                       {workExperiences.map((exp) => (
                         <div key={exp.id} className="pl-4 border-l-2 border-gray-200">
                           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                             <h3 className="font-medium text-gray-900">
                               {exp.position || 'Position'}
                             </h3>
                             {(exp.startDate || exp.endDate) && (
                               <span className="text-sm text-gray-500">
                                 {exp.startDate} — {exp.endDate || 'Present'}
                               </span>
                             )}
                           </div>
                           {exp.company && (
                             <div className="text-sm text-gray-600 mb-2">
                               {exp.company}
                               {exp.location && ` • ${exp.location}`}
                             </div>
                           )}
                           {exp.description && (
                             <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                               {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                                 <li key={i}>{line}</li>
                               ))}
                             </ul>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               case 'education':
                 return (
                   <div key="education" className="mb-8">
                     <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">
                       Education
                     </h2>
                     <div className="space-y-4">
                       {education.map((edu) => (
                         <div key={edu.id} className="pl-4 border-l-2 border-gray-200">
                           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                             <h3 className="font-medium text-gray-900">
                               {edu.institution || 'Institution'}
                             </h3>
                             {edu.graduationDate && (
                               <span className="text-sm text-gray-500">
                                 {edu.graduationDate}
                               </span>
                             )}
                           </div>
                           <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600">
                             <span>
                               {edu.degree}
                               {edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}
                             </span>
                             {edu.gpa && (
                               <span className="text-gray-500">GPA: {edu.gpa}</span>
                             )}
                           </div>
                           {edu.achievements && (
                             <ul className="list-disc pl-5 text-gray-700 mt-1 space-y-1 text-sm">
                               {edu.achievements.split('\n').filter(line => line.trim()).map((line, i) => (
                                 <li key={i}>{line}</li>
                               ))}
                             </ul>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               case 'activities':
                 return (
                   <div key="activities" className="mb-8">
                     <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">
                       Extracurricular Activities
                     </h2>
                     <div className="space-y-4">
                       {activities.map((activity) => (
                         <div key={activity.id} className="pl-4 border-l-2 border-gray-200">
                           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                             <h3 className="font-medium text-gray-900">
                               {activity.name || 'Activity'}
                             </h3>
                             {(activity.startDate || activity.endDate) && (
                               <span className="text-sm text-gray-500">
                                 {activity.startDate} — {activity.endDate || 'Present'}
                               </span>
                             )}
                           </div>
                           {activity.role && (
                             <div className="text-sm text-gray-600 mb-1">
                               {activity.role}
                               {activity.organization && ` • ${activity.organization}`}
                             </div>
                           )}
                           {activity.description && (
                             <ul className="list-disc pl-5 text-gray-700 mt-1 space-y-1 text-sm">
                               {activity.description.split('\n').filter(line => line.trim()).map((line, i) => (
                                 <li key={i}>{line}</li>
                               ))}
                             </ul>
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


           return (
             <SortableItem key={sectionKey} id={sectionKey}>
               {content}
             </SortableItem>
           );
         })}
       </SortableContext>
     </Card>
   </DndContext>
 );
}



