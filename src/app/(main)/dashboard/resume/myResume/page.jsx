"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Plus,
  FileText,
  Calendar,
  Search,
  Trash2,
  Edit3,
  Copy,
  Briefcase,
  Award,
  Phone,
  Mail,
  MapPin as LocationEdit,
  Star,
  Clock,
  Filter,
  Grid3X3,
  List,
  ChevronDown
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mini Resume Preview Component
function MiniResumePreview({ resume }) {
  const contactInfo = resume.contact_info || {};
  const summary = resume.summary || '';
  const skills = resume.skills || [];
  const workExperiences = resume.work_experiences || [];

  return (
    <div className="rounded-lg px-2 text-xs leading-relaxed overflow-hidden max-h-37 relative">
      {/* Optional overlay for visual fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-black/80 to-transparent pointer-events-none z-10" />

      {/* Header */}
      <div className="text-center mb-3 relative z-20">
        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mb-1">
          {contactInfo.name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-blue-600 dark:text-blue-300">
          {contactInfo.phone && (
            <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
              <Phone size={8} />
              <span className="truncate max-w-20">{contactInfo.phone}</span>
            </span>
          )}
          {contactInfo.email && (
            <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
              <Mail size={8} />
              <span className="truncate max-w-24">{contactInfo.email}</span>
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="relative z-20">
          <h2 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1">
            Summary
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 p-2 rounded border border-blue-100/50 dark:border-blue-900/40 dark:bg-white/5 line-clamp-2">
            {summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-3 relative z-20">
          <h2 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs px-2 py-0.5 h-5 rounded-full text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 bg-blue-50/80 dark:bg-blue-900/30"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 4 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 h-5 rounded-full text-blue-500 dark:text-blue-200 border-blue-300 dark:border-blue-700 bg-blue-50/80 dark:bg-blue-900/30"
              >
                +{skills.length - 4}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {workExperiences.length > 0 && (
        <div className="mb-2 relative z-20">
          <h2 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Experience</h2>
          {workExperiences.slice(0, 2).map((exp, index) => (
            <div
              key={index}
              className="mb-2 bg-white/60 dark:bg-white/5 p-2 rounded border border-blue-100/50 dark:border-blue-900/40"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate flex-1 mr-2">
                  {exp.position || 'Position'}
                </h3>
                <span className="text-xs text-blue-600 dark:text-blue-300 whitespace-nowrap bg-blue-50 dark:bg-blue-900/30 px-1 py-0.5 rounded">
                  {exp.startDate}
                </span>
              </div>
              {exp.company && (
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">{exp.company}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResumeSelectionPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updated_at');
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const fetchResumes = async () => {
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [isSignedIn, user]);

  const filteredResumes = resumes.filter(resume =>
    (resume.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteResume = async (resumeId) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (error) throw error;

      setResumes(resumes.filter(resume => resume.id !== resumeId));
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleDuplicateResume = async (resume) => {
    try {
      const duplicatedResume = {
        ...resume,
        name: `${resume.name || 'Untitled'} (Copy)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('resumes')
        .insert([duplicatedResume])
        .select()
        .single();

      if (error) throw error;

      setResumes([data, ...resumes]);
      toast.success('Resume duplicated successfully');
    } catch (error) {
      console.error('Error duplicating resume:', error);
      toast.error('Failed to duplicate resume');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleResumeClick = (resumeId) => {
    router.push(`/dashboard/resume/resume-builder?id=${resumeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-xl w-80 mb-4"></div>
            <div className="h-6 bg-blue-100 rounded-lg w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-8 mt-7 max-w-7xl">
        {/* Header Section */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/resume/myResume">My Resumes</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
         
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="">
                <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
                  My Resumes
                </span>
              </h1>
            </div>
            <p className="text-neutral-600 text-sm dark:text-white">
              Build, manage, and organize your professional documents with ease
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-md dark:bg-blue-800">
                <FileText size={16} className="text-blue-600 dark:text-blue-100" />
                <span className="font-medium text-blue-800 dark:text-blue-100">
                  {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-100 px-3 py-2 rounded-md dark:bg-neutral-800">
                <Clock size={16} className="text-neutral-600 dark:text-white" />
                <span className="font-medium text-neutral-800  dark:text-white">
                  Last updated today
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.push('/resume-builder')}
            size="lg"
            className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-600 to-blue-500 dark:text-white"
          >
            <Plus size={22} />
            Create New Resume
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" size={15} />
              <Input
                placeholder="Search your resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredResumes.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-lg">
              <FileText className="text-blue-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              {searchTerm ? 'No resumes found' : 'Your resume collection is empty'}
            </h3>
            <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto">
              {searchTerm
                ? `No resumes match "${searchTerm}". Try adjusting your search terms.`
                : 'Ready to create your first professional resume? Let\'s get started!'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => router.push('/resume-builder')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4 rounded-xl text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus size={20} className="mr-3" />
                Create Your First Resume
              </Button>
            )}
          </div>
        )}

        {/* Resume Grid */}
        {filteredResumes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredResumes.map((resume) => (
              <Card
                key={resume.id}
                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-blue-200/50 dark:border-blue-800/40 bg-white/80 dark:bg-white/5 backdrop-blur-sm hover:bg-white hover:dark:bg-white/10 hover:-translate-y-2 overflow-hidden rounded-2xl shadow-lg hover:border-blue-300 dark:hover:border-blue-500 p-4"
                onClick={() => handleResumeClick(resume.id)}
              >
                <CardContent className="p-0">
                  {/* Resume Preview */}
                  <div>
                    <MiniResumePreview resume={resume} />
                  </div>

                  {/* Resume Info */}
                  <div className="mt-4 border-t border-blue-100 dark:border-blue-900 pt-4">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors flex-1">
                          {resume.name || 'Untitled Resume'}
                        </h3>
                      </div>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <Calendar size={12} className="mr-2 flex-shrink-0" />
                        <span>Updated {formatDate(resume.updated_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/dashboard/resume/resume-builder?id=${resume.id}`)}
                        className="flex-1 text-sm h-9 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-600 dark:to-blue-400 text-white rounded-sm font-medium"
                      >
                        <Edit3 size={14} className="mr-2" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 border-blue-200 dark:border-blue-800 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:border-neutral-800 border-neutral-200 dark:bg-neutral-900 dark:text-white w-100">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{resume.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-sm dark:bg-neutral-800 dark:text-white border-neutral-200">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteResume(resume.id)}
                              className="bg-red-600 hover:bg-red-700 rounded-sm text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Resume Card */}
            <Card
              className="border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-500 cursor-pointer group bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-white/5 dark:to-white/10 backdrop-blur-sm hover:from-blue-100/80 hover:to-indigo-100/80 dark:hover:from-white/10 dark:hover:to-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 p-6"
              onClick={() => router.push('/dashboard/resume/resume-builder')}
            >
              <CardContent className="flex flex-col items-center justify-center text-center h-full min-h-[200px] gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-500 dark:to-indigo-500 flex items-center justify-center group-hover:from-blue-300 group-hover:to-indigo-300 dark:group-hover:from-blue-400 dark:group-hover:to-indigo-400 transition-all duration-500 group-hover:scale-110 shadow-lg">
                  <Plus className="text-blue-700 dark:text-blue-200 group-hover:text-blue-800 dark:group-hover:text-blue-100" size={32} />
                </div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  Create New Resume
                </h3>
                <p>
                  Use our AI resume builder to land your next job
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}