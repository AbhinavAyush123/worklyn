'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger
} from '@/components/ui/tabs';
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { toast, Toaster } from 'sonner';
import ResumePreview from '../components/resume-preview';

export default function ResumeBuilderPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState("light");
  const { user, isSignedIn } = useUser();
  
  // Contact Information
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Professional Summary
  const [summary, setSummary] = useState('');

  // Skills
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // Work Experience
  const [workExperiences, setWorkExperiences] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([
  'header',
  'summary',
  'skills',
  'work',
  'education',
  'activities',
]);


  // Education
  const [education, setEducation] = useState([]);

  // Extracurricular Activities
  const [activities, setActivities] = useState([]);
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

  // Handle contact info changes
  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  // Add/remove skills
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
    const newExperience = {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setWorkExperiences((prev) => [...prev, newExperience]);
  };

  const updateWorkExperience = (id, field, value) => {
    setWorkExperiences((prev) =>
      prev.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeWorkExperience = (id) => {
    setWorkExperiences((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Education functions
  const addEducation = () => {
    const newEntry = {
      id: Date.now(),
      institution: '',
      degree: '',
      gpa: '',
      graduationDate: '',
    };
    setEducation((prev) => [...prev, newEntry]);
  };

  const removeEducation = (id) => {
    setEducation((prev) => prev.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id, field, value) => {
    setEducation((prev) =>
      prev.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  // Activity functions
  const addActivity = () => {
    const newActivity = {
      id: Date.now(),
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setActivities((prev) => [...prev, newActivity]);
  };

  const updateActivity = (id, field, value) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, [field]: value } : activity
      )
    );
  };

  const removeActivity = (id) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
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



  // Save to Supabase
 const handleSaveResume = async () => {
    if (!isSignedIn) {
      toast.success("Saved your Resume");
      return;
    }
    console.log('Clerk user id:', user.id);


    setIsSaving(true);

    try {
      const resumeData = {
        contact_info: contactInfo,
        summary,
        skills,
        work_experiences: workExperiences,
        education,
        activities,
        sectionOrder:sectionOrder,
      };

      const res = await fetch('/api/save-resume', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // <-- important to send cookies
  body: JSON.stringify(resumeData),
});


      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save resume');
      }

      toast.success("Resume is saved")
    } catch (error) {
      toast({
        title: "Error saving resume",
        description: error.message,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  
  // Generate PDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-container');
    if (!element) {
      alert('Resume container not found!');
      return;
    }
    
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;
    
    const opt = {
      margin: 0.3,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: true, scrollY: -window.scrollY },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    
    html2pdf().set(opt).from(element).save();
};


  return (
   <div className="md:px-10 mt-5  max-w-8xl  w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/resume">Resume</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Builder</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-5">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-t from-sky-500 via-sky-600 to-sky-500">
          Resume Builder
        </h1>
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="hover:text-sky-600">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button 
            variant="destructive" 
            className="flex gap-2 items-center"
            onClick={handleSaveResume}
            disabled={isSaving}
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save"}
          </Button>
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
          <h2 className="font-bold text-sky-500 flex items-center gap-2 text-xl mb-4 dark:text-white">
            <User size={24} />
            Contact Information
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
            <h2 className="font-bold text-sky-500 text-xl dark:text-white">Professional Summary</h2>
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
                  className="group gap-2 mt-2 text-pink-500 hover:text-pink-500 border border-pink-100 hover:bg-white hover:border-pink-300 dark:border-pink-800 dark:hover:bg-black dark:hover:border-pink-900"
                  onClick={improveSummary}
                >
                  <Sparkles size={15} className='0'/> Improve with AI
              </Button>

          </div>

          {/* Education Section */}
          <div className="mt-6">
            <h2 className="font-bold text-sky-500 text-xl flex gap-2 items-center dark:text-white">
              <GraduationCap size={15} />
              <span>Education</span>
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
              <Button variant="outline" onClick={addEducation}>
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </Card>
          </div>

          {/* Skills Section */}
          <div className="mt-6">
            <h2 className="font-bold text-sky-500 text-xl dark:text-white">Skills</h2>
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
            <h2 className="font-bold text-sky-500 text-xl dark:text-white">Work Experience</h2>
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
                      className="group flex items-center gap-2 mt-2 text-pink-500 hover:text-pink-500 border border-pink-100 hover:bg-white hover:border-pink-300 dark:border-pink-800 dark:hover:bg-black dark:hover:border-pink-900"
                      onClick={() => improveDescription(exp.id)}
                    >
                      <Sparkles size={15} className=''/>
                      Improve with AI
                    </Button>

                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Button onClick={addWorkExperience} variant="outline" className="flex items-center gap-2 w-full">
                  <Plus className="w-4 h-4" />
                  Add Experience
                </Button>
              </div>
            </Card>
          </div>

          {/* Extracurricular Activities Section */}
          <div className="mt-6">
            <h2 className="font-bold text-sky-500 text-xl mb-4 flex items-center gap-2 dark:text-white">
              <Award size={24} />
              Extracurricular Activities
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
                      className="flex items-center gap-2 mt-2 text-pink-500 hover:text-pink-500 border border-pink-100 hover:bg-white hover:border-pink-300 dark:border-pink-800 dark:hover:bg-black dark:hover:border-pink-900"
                      onClick={() => improveActivityDescription(activity.id)}
                    >
                      <Sparkles size={15} className=''/>
                      Improve with AI
                  </Button>
                </div>
              ))}
              <Button onClick={addActivity} variant="outline" className="flex items-center gap-2 w-full">
                <Plus className="w-4 h-4" />
                Add Activity
              </Button>
            </Card>
          </div>
          
        </TabsContent>

        <TabsContent value="markdown" className="mt-6">
          <div id='resume-container'>
              <ResumePreview contactInfo={contactInfo} summary={summary} skills={skills} workExperiences={workExperiences} education={education} activities={activities} sectionOrder={sectionOrder} setSectionOrder={setSectionOrder}/>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}