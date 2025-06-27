'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useUser } from '@clerk/nextjs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  LocationEdit,
  Mail,
  Phone,
  Save,
  User,
  Download,
  Plus,
  X,
  Sparkles,
  Award,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { toast } from 'sonner';
import ResumePreview from '../components/resume-preview';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation';

const defaultSectionOrder = [
  'header',
  'summary',
  'skills',
  'work',
  'education',
  'activities',
];

export default function ResumeBuilderPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const { user, isSignedIn } = useUser();
  const [open, setOpen] = useState(false)
  const [resumeName, setResumeName] = useState("")
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  const router = useRouter();

  // Form states
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [workExperiences, setWorkExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);

  // Load resume data if editing
  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .single();

        if (error) throw error;

        if (data) {
          setContactInfo(data.contact_info || {});
          setSummary(data.summary || '');
          setSkills(data.skills || []);
          setWorkExperiences(data.work_experiences || []);
          setEducation(data.education || []);
          setActivities(data.activities || []);
          setSectionOrder(data.sectionOrder || defaultSectionOrder);
          setResumeName(data.name || '');
        }
      } catch (error) {
        console.error('Error loading resume:', error);
        toast.error('Failed to load resume');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  // Theme handling
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || (!stored && systemDark)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // Form handlers
  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Work Experience functions
  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    }]);
  };

  const updateWorkExperience = (id, field, value) => {
    setWorkExperiences(workExperiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeWorkExperience = (id) => {
    setWorkExperiences(workExperiences.filter(exp => exp.id !== id));
  };

  // Education functions
  const addEducation = () => {
    setEducation([...education, {
      id: Date.now(),
      institution: '',
      degree: '',
      gpa: '',
      graduationDate: '',
    }]);
  };

  const updateEducation = (id, field, value) => {
    setEducation(education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  // Activity functions
  const addActivity = () => {
    setActivities([...activities, {
      id: Date.now(),
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    }]);
  };

  const updateActivity = (id, field, value) => {
    setActivities(activities.map(activity =>
      activity.id === id ? { ...activity, [field]: value } : activity
    ));
  };

  const removeActivity = (id) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  // Save function
  const handleSaveResume = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save your resume");
      return;
    }

    if (!resumeName.trim()) {
      toast.error("Please enter a resume name");
      return;
    }

    setIsSaving(true);

    try {
      const resumeData = {
        user_id: user.id,
        name: resumeName,
        contact_info: contactInfo,
        summary,
        skills,
        work_experiences: workExperiences,
        education,
        activities,
        sectionOrder: sectionOrder,
        updated_at: new Date().toISOString()
      };

      if (resumeId) {
        // Update existing resume
        const { error } = await supabase
          .from('resumes')
          .update(resumeData)
          .eq('id', resumeId);

        if (error) throw error;
        toast.success("Resume updated successfully");
        router.push('/dashboard/resume/myResume');
      } else {
        // Create new resume
        const { error } = await supabase
          .from('resumes')
          .insert([resumeData]);

        if (error) throw error;
        toast.success("Resume created successfully");
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error(error.message || 'Failed to save resume');
    } finally {
      setIsSaving(false);
      setOpen(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const margin = 0.5;
      let yPos = margin;
      const lineHeight = 0.25;
      const pageWidth = 8.5 - (margin * 2);

      if (contactInfo.name) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(contactInfo.name, margin, yPos);
        yPos += lineHeight * 1.5;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let contactLine = [];
      if (contactInfo.phone) contactLine.push(contactInfo.phone);
      if (contactInfo.email) contactLine.push(contactInfo.email);
      if (contactInfo.address) contactLine.push(contactInfo.address);
    
      if (contactLine.length > 0) {
        doc.text(contactLine.join(' | '), margin, yPos);
        yPos += lineHeight * 1.5;
      }

      sectionOrder.forEach(section => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(section.charAt(0).toUpperCase() + section.slice(1), margin, yPos);
        yPos += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        switch(section) {
          case 'summary':
            if (summary) {
              const splitText = doc.splitTextToSize(summary, pageWidth);
              doc.text(splitText, margin, yPos);
              yPos += lineHeight * splitText.length;
            }
            break;
          
          case 'skills':
            if (skills.length > 0) {
              doc.text(skills.join(', '), margin, yPos);
              yPos += lineHeight;
            }
            break;
          
          case 'work':
            if (workExperiences.length > 0) {
              workExperiences.forEach(exp => {
                doc.setFont('helvetica', 'bold');
                doc.text(`${exp.company || 'Company'}`, margin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(`${exp.position || 'Position'}`, margin + 3, yPos, {
                  align: 'right',
                  maxWidth: pageWidth - 3
                });
                yPos += lineHeight;
                
                const dates = `${exp.startDate || 'Start'} - ${exp.endDate || 'Present'}`;
                doc.text(dates, margin, yPos);
                yPos += lineHeight;
                
                if (exp.description) {
                  const splitDesc = doc.splitTextToSize(exp.description, pageWidth);
                  doc.text(splitDesc, margin + 0.25, yPos);
                  yPos += lineHeight * splitDesc.length;
                }
                yPos += lineHeight * 0.5;
              });
            }
            break;
          
          case 'education':
            if (education.length > 0) {
              education.forEach(edu => {
                doc.setFont('helvetica', 'bold');
                doc.text(`${edu.institution || 'Institution'}`, margin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(`${edu.degree || 'Degree'}`, margin + 3, yPos, {
                  align: 'right',
                  maxWidth: pageWidth - 3
                });
                yPos += lineHeight;
                
                let eduDetails = [];
                if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);
                if (edu.graduationDate) eduDetails.push(`Graduated: ${edu.graduationDate}`);
                
                if (eduDetails.length > 0) {
                  doc.text(eduDetails.join(' | '), margin, yPos);
                  yPos += lineHeight;
                }
                yPos += lineHeight * 0.5;
              });
            }
            break;
          
          case 'activities':
            if (activities.length > 0) {
              activities.forEach(activity => {
                doc.setFont('helvetica', 'bold');
                doc.text(`${activity.name || 'Activity'}`, margin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(`${activity.role || 'Role'}`, margin + 3, yPos, {
                  align: 'right',
                  maxWidth: pageWidth - 3
                });
                yPos += lineHeight;
                
                const dates = `${activity.startDate || 'Start'} - ${activity.endDate || 'Present'}`;
                doc.text(dates, margin, yPos);
                yPos += lineHeight;
                
                if (activity.description) {
                  const splitDesc = doc.splitTextToSize(activity.description, pageWidth);
                  doc.text(splitDesc, margin + 0.25, yPos);
                  yPos += lineHeight * splitDesc.length;
                }
                yPos += lineHeight * 0.5;
              });
            }
            break;
        }

        yPos += lineHeight;
        
        if (yPos > 10.5) {
          doc.addPage();
          yPos = margin;
        }
      });

      doc.save(`${resumeName || 'resume'}.pdf`);
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  //Job Description improve
  const improveDescription = async (id) => {
    const exp = workExperiences.find((e) => e.id === id);
    if (!exp) return;

    try {
      const res = await fetch('/api/improve-work-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: exp.description,
          company: exp.company,
          position: exp.position,
        }),
      });

      toast.promise(
        res,
        {
          loading: 'Improving your summary...',
          success: () => 'Your response has been improved',
          error: () => 'Error improving your summary',
        }
      );

      const data = await res.json();

      if (data?.result) {
        updateWorkExperience(id, 'description', data.result);
      } else {
        alert('AI did not return a result.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  //Activity Description AI Improve
  const improveActivityDescription = async (id) => {
    const activity = activities.find((e) => e.id === id);

    try {
      const res = await fetch('/api/improve-activity-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: activity.description,
        }),
      });

      toast.promise(
        res,
        {
          loading: 'Improving your summary...',
          success: () => 'Your response has been improved',
          error: () => 'Error improving your summary',
        }
      );

      const data = await res.json();

      if (data?.result) {
        updateActivity(id, 'description', data.result);
      } else {
        alert('AI did not return a result.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  //Summary AI improve
  const improveSummary = async () => {
    if (!summary.trim()) return;

    try {
      const apiCall = fetch('/api/improve-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      }).then(res => res.json());

      toast.promise(
        apiCall,
        {
          loading: 'Improving your summary...',
          success: () => 'Your response has been improved',
          error: () => 'Error improving your summary',
        }
      );

      const data = await apiCall;

      if (data?.result) {
        setSummary(data.result);
      } else {
        alert("No result from AI.");
      }
    } catch (error) {
      console.error("Error calling internal API:", error);
      alert("Something went wrong.");
    }
  };

  if (isLoading && resumeId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-4">Loading page...</div>}>

    
    <div className="md:px-7 mt-7 max-w-8xl w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/resume/myResume">My Resumes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/resume/resume-builder">Resume Builder</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
          {resumeId ? 'Edit Resume' : 'Resume Builder'}
        </h1>
        <div className="flex gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex gap-2 bg-blue-600 hover:bg-blue-700 items-center">
                <Save size={18} />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogTrigger>
            <DialogContent className="border-neutral-200 dark:border-neutral-800 w-100 h-60">
              <DialogHeader>
                <DialogTitle>
                  {resumeId ? 'Update Resume Name' : 'Name Your Resume'}
                </DialogTitle>
                <DialogDescription>
                  Enter a name to {resumeId ? 'update' : 'save'} this resume
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="e.g. Frontend Engineer Resume"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                className="mt-2"
              />
              <DialogFooter>
                <Button
                  disabled={!resumeName.trim() || isSaving}
                  onClick={handleSaveResume}
                >
                  {isSaving ? "Saving..." : resumeId ? "Update Resume" : "Save Resume"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            className="flex gap-2 items-center"
            onClick={handleDownloadPDF}
          >
            <Download size={18} />
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="form" className="w-full mt-10">
        <TabsList className="w-full max-w-xs">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="markdown">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="w-full mt-8">
          {/* Contact Info Section */}
          <h2 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 flex items-center gap-2 text-xl mb-4 dark:text-white">
            <User size={24} className='text-blue-500'/>
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700'>
              Contact Information
            </span>
          </h2>

          <Card className="border-gray-200 p-6 shadow-none space-y-6 dark:border-none bg-neutral-50 dark:bg-neutral-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={contactInfo.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Phone size={15} />
                  Mobile Number
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  inputMode="tel"
                  placeholder="(602) 839-7445"
                  value={contactInfo.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail size={15} />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={contactInfo.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                  <LocationEdit size={15} />
                  Mailing Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="1234 W Main St, Phoenix, AZ 85001"
                  value={contactInfo.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Summary Section */}
          <div className="mt-12">
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-xl">
              Professional Summary
            </span>
            <Card className="shadow-none border-none bg-transparent pb-0">
              <Textarea
                placeholder="Write a summary of your experience..."
                className="min-h-[120px]"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </Card>
            <Button
              variant="ghost"
              className="group gap-2 mt-2 text-blue-500 hover:text-blue-500 border border-blue-100 hover:bg-white hover:border-blue-300 dark:border-blue-800 dark:hover:bg-black dark:hover:border-blue-900"
              onClick={improveSummary}
            >
              <Sparkles size={15} className='0'/> Improve with AI
            </Button>
          </div>

          {/* Education Section */}
          <div className="mt-6">
            <h2 className="font-bold text-blue-500 text-xl flex gap-2 items-center dark:text-white">
              <GraduationCap size={15} />
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700'>Education</span>
            </h2>
            <Card className="border-none shadow-none space-y-4 bg-transparent">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 border border-border/50 rounded-lg bg-neutral-50 dark:bg-neutral-900 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Education Entry</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>School Name</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="Lincoln High School"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree/Program</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="High School Diploma"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA</Label>
                      <Input
                        type="number"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        placeholder="Enter your GPA eg. 3.7"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Graduation Date</Label>
                      <Input
                        value={edu.graduationDate}
                        type="date"
                        onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                        placeholder="Expected May 2025"
                        className="bg-background/80"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="default" onClick={addEducation}>
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </Card>
          </div>

          {/* Skills Section */}
          <div className="mt-6">
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-xl">Skills</span>
            <Card className="shadow-none border-none space-y-4 bg-transparent">
              <div className="flex space-x-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill..."
                />
                <Button onClick={addSkill} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} className="rounded-sm">
                    {skill}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                      onClick={() => removeSkill(skill)}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Work Experience Section */}
          <div className="mt-6">
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-xl">Work Experience</span>
            <Card className="shadow-none border-none space-y-6 bg-transparent dark:border-gray-600">
              {workExperiences.map((exp) => (
                <div key={exp.id} className="p-4 border border-border/50 rounded-md space-y-5 bg-neutral-50 dark:bg-neutral-900">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm">Work Experience Entry</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkExperience(exp.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company/Employer</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                        placeholder="Local Coffee Shop"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)}
                        placeholder="Barista (Part-time)"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                        placeholder="June 2023"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                        placeholder="Present"
                        className="bg-background/80"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                      placeholder="Describe your role and achievements..."
                      className="bg-background/80 min-h-[100px]"
                    />
                    <Button
                      variant="ghost"
                      className="group flex items-center gap-2 mt-2 text-blue-500 hover:text-blue-500 border border-blue-100 hover:bg-white hover:border-blue-300 dark:border-blue-800 dark:hover:bg-black dark:hover:border-blue-900"
                      onClick={() => improveDescription(exp.id)}
                    >
                      <Sparkles size={15} className=''/>
                      Improve with AI
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Button onClick={addWorkExperience} variant="default" className="flex items-center gap-2 w-full">
                  <Plus className="w-4 h-4" />
                  Add Experience
                </Button>
              </div>
            </Card>
          </div>

          {/* Extracurricular Activities Section */}
          <div className="mt-6">
            <h2 className="font-bold text-blue-500 text-xl mb-4 flex items-center gap-2 dark:text-white">
              <Award size={24} />
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700'>
                Extracurricular Activities
              </span>
            </h2>
            <Card className="border-none shadow-none space-y-6 bg-transparet">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 border-border/50 rounded-md space-y-5 bg-neutral-50 dark:bg-neutral-900">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm">Activity Entry</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeActivity(activity.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Activity Name</Label>
                      <Input
                        value={activity.name}
                        onChange={(e) => updateActivity(activity.id, 'name', e.target.value)}
                        placeholder="Student Council"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role/Position</Label>
                      <Input
                        value={activity.role}
                        onChange={(e) => updateActivity(activity.id, 'role', e.target.value)}
                        placeholder="Class Representative"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={activity.startDate}
                        onChange={(e) => updateActivity(activity.id, 'startDate', e.target.value)}
                        placeholder="Sept 2023"
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={activity.endDate}
                        onChange={(e) => updateActivity(activity.id, 'endDate', e.target.value)}
                        placeholder="Present"
                        className="bg-background/80"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={activity.description}
                      onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                      placeholder="Describe your involvement and achievements..."
                      className="bg-background/80 min-h-[100px]"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 mt-2 text-blue-500 hover:text-blue-500 border border-blue-100 hover:bg-white hover:border-blue-300 dark:border-blue-800 dark:hover:bg-black dark:hover:border-blue-900"
                    onClick={() => improveActivityDescription(activity.id)}
                  >
                    <Sparkles size={15} className=''/>
                    Improve with AI
                  </Button>
                </div>
              ))}
              <Button onClick={addActivity} variant="default" className="flex items-center gap-2 w-full">
                <Plus className="w-4 h-4" />
                Add Activity
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="markdown" className="mt-6">
          <div id='resume-container'>
            <ResumePreview 
              contactInfo={contactInfo} 
              summary={summary} 
              skills={skills} 
              workExperiences={workExperiences} 
              education={education} 
              activities={activities} 
              sectionOrder={sectionOrder} 
              setSectionOrder={setSectionOrder}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </Suspense>
  );
}