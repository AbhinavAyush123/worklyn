"use client"
import React, { Suspense, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
 MapPin,
 DollarSign,
 Clock,
 Monitor,
 GraduationCap,
 ArrowLeft,
 Building2,
 Calendar,
 Bookmark,
 BookmarkCheck,
 Share2,
 ExternalLink,
 Users,
 CheckCircle2,
 Briefcase,
 Star,
 Flag,
 ArrowRight,
 Upload,
 FileText,
 AlertCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"


const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default function JobDetailsPage() {
 const params = useParams()
 const router = useRouter()
 const { id } = params
 const { user, isLoaded, isSignedIn } = useUser()
 const [job, setJob] = useState(null)
 const [loading, setLoading] = useState(true)
 const [dialogOpen, setDialogOpen] = useState(false)
 const [hasApplied, setHasApplied] = useState(false)
 const [isSaved, setIsSaved] = useState(false)
 const [userRole, setUserRole] = useState(null)
 const [applicationData, setApplicationData] = useState({
   name: '',
   email: '',
   resumeOption: '', // 'select' or 'upload'
   selectedResume: '',
   uploadedFile: null,
   coverLetter: ''
 })
 const [submitting, setSubmitting] = useState(false)
 const [error, setError] = useState('')


 // Sample resumes for the select dropdown
 const savedResumes = [
   'Software Engineer Resume 2024.pdf',
   'Full Stack Developer CV.pdf',
   'Frontend Specialist Resume.pdf'
 ]


 useEffect(() => {
   const fetchData = async () => {
     // Fetch job details
     const { data: jobData, error: jobError } = await supabase
       .from("job_listings")
       .select("*")
       .eq("id", id)
       .single()


     if (!jobError) {
       setJob(jobData)
     }


     // Check if user has already applied and saved (only if user is loaded and signed in)
     if (isLoaded && isSignedIn && user && jobData) {
       // Check user role
       const { data: userData, error: userError } = await supabase
         .from("users")
         .select("role")
         .eq("id", user.id)
         .single()
      
       if (!userError && userData) {
         setUserRole(userData.role)
       }


       // Check if already applied
       const { data: applicationData } = await supabase
         .from("appliedjobs")
         .select("id")
         .eq("user_id", user.id)
         .eq("job_id", id)
         .single()
      
       setHasApplied(!!applicationData)


       // Check if job is saved
       const { data: savedJobData } = await supabase
         .from("savedjobs")
         .select("id")
         .eq("user_id", user.id)
         .eq("job_id", id)
         .single()
      
       setIsSaved(!!savedJobData)
     }


     setLoading(false)
   }


   if (id && isLoaded) fetchData()
 }, [id, isLoaded, isSignedIn, user])


 // Save job function
 const saveJob = async () => {
   if (!user?.id) {
     toast.error('Please sign in to save jobs')
     return
   }


   try {
     if (isSaved) {
       // Remove from saved jobs
       const { error } = await supabase
         .from('savedjobs')
         .delete()
         .eq('user_id', user.id)
         .eq('job_id', id)


       if (error) throw error


       setIsSaved(false)
       toast.warning('Job removed from saved list')
     } else {
       // Add to saved jobs
       const { error } = await supabase
         .from('savedjobs')
         .insert([
           {
             user_id: user.id,
             job_id: id
           }
         ])


       if (error) throw error


       setIsSaved(true)
       toast.success('Job saved successfully!')
     }
   } catch (error) {
     console.error('Error saving job:', error)
     toast.error('Failed to save job. Please try again.')
   }
 }


 const handleInputChange = (field, value) => {
   setApplicationData(prev => ({
     ...prev,
     [field]: value
   }))
   // Clear error when user starts typing
   if (error) setError('')
 }


 const handleFileUpload = (event) => {
   const file = event.target.files[0]
   if (file && file.type === 'application/pdf') {
     if (file.size > 10 * 1024 * 1024) { // 10MB limit
       setError('File size must be less than 10MB')
       return
     }
     setApplicationData(prev => ({
       ...prev,
       uploadedFile: file,
       resumeOption: 'upload',
       selectedResume: '' // Clear selected resume when uploading
     }))
     setError('')
   } else {
     setError('Please upload a PDF file only.')
   }
 }


 const handleSubmitApplication = async () => {
   setError('')
  
   // Validation
   if (!isSignedIn || !user) {
     setError('You must be signed in to apply for jobs.')
     return
   }


   if (!applicationData.name || !applicationData.email) {
     setError('Please fill in all required fields.')
     return
   }


   if (!applicationData.selectedResume && !applicationData.uploadedFile) {
     setError('Please select or upload a resume.')
     return
   }


   // Email validation
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   if (!emailRegex.test(applicationData.email)) {
     setError('Please enter a valid email address.')
     return
   }


   setSubmitting(true)
  
   try {
     // Check if user has already applied
     const { data: existingApplication } = await supabase
       .from("appliedjobs")
       .select("id")
       .eq("user_id", user.id)
       .eq("job_id", id)
       .single()


     if (existingApplication) {
       setError('You have already applied for this job.')
       setSubmitting(false)
       return
     }


     let resumeUrl = ''
    
     // Handle resume upload to 'resumes' bucket
     if (applicationData.uploadedFile) {
       // Upload the resume file to the 'resumes' bucket
       const file = applicationData.uploadedFile
       const resumeFileName = `resume_${user.id}${job.id}.pdf`


       const { data, error } = await supabase.storage
         .from('job-images')
         .upload(resumeFileName, file, {
           contentType: 'application/pdf',
           upsert: true
         })


       if (error) {
         throw new Error(`Failed to upload resume: ${error.message}`)
       }


       // Get the public URL of the uploaded file
       const { data: publicUrlData } = supabase
         .storage
         .from('job-images')
         .getPublicUrl(resumeFileName)


       resumeUrl = publicUrlData.publicUrl
     } else if (applicationData.selectedResume) {
       resumeUrl = `selected:${applicationData.selectedResume}`
     }


     // Insert application into appliedjobs table with cover letter as text
     const { data, error: insertError } = await supabase
       .from("appliedjobs")
       .insert([
         {
           user_id: user.id,
           job_id: id,
           status: 'Applied',
           applied_at: new Date().toISOString(),
           resume_url: resumeUrl,
           cover_letter: applicationData.coverLetter.trim() || null,
         }
       ])
       .select()


     if (insertError) {
       console.error('Insert error:', insertError)
       throw new Error(insertError.message)
     }


     // Success!
     setHasApplied(true)
     setDialogOpen(false)
     setApplicationData({
       name: '',
       email: '',
       resumeOption: '',
       selectedResume: '',
       uploadedFile: null,
       coverLetter: ''
     })


     // Show success message
     toast.success("Application has been sent successfully")
    
   } catch (error) {
     console.error('Application submission error:', error)
     setError(`Failed to submit application: ${error.message}`)
   } finally {
     setSubmitting(false)
   }
 }


 if (loading) {
   return (
     <div className="min-h-screen bg-gray-50">
       <div className="animate-pulse">
         {/* Content skeleton */}
         <div className="max-w-7xl mx-auto px-6 py-8">
           <div className="flex justify-between items-start mb-8">
             <div className="flex-1">
               <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
               <div className="h-6 w-32 bg-gray-200 rounded"></div>
             </div>
             <div className="h-10 w-32 bg-gray-200 rounded"></div>
           </div>
          
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
               <div className="h-96 bg-gray-200 rounded"></div>
               <div className="h-48 bg-gray-200 rounded"></div>
             </div>
             <div className="h-80 bg-gray-200 rounded"></div>
           </div>
         </div>
       </div>
     </div>
   )
 }


 if (!job) {
   return (
     <div className="min-h-screen bg-gray-50">
       <div className="max-w-5xl mx-auto px-6 py-8">
         <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
           <Briefcase className="h-16 w-16 text-gray-400" />
           <div className="space-y-2">
             <h1 className="text-2xl font-semibold">Job not found</h1>
             <p className="text-gray-600 max-w-md">
               The job listing you're looking for doesn't exist or has been removed.
             </p>
           </div>
           <Button onClick={() => router.back()} variant="outline">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to Jobs
           </Button>
         </div>
       </div>
     </div>
   )
 }


 // Function to check if user can apply (is student)
 const canApply = isLoaded && isSignedIn && userRole === 'student'


 return (
  <Suspense fallback={<div className="p-4">Loading page...</div>}>

  
   <div className="min-h-screen dark:bg-bg-neutral-900">
     {/* Main Content */}
     <div className="max-w-6xl mx-auto px-6 mt-10">
       {/* Job Title and Actions */}
       <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8 space-y-4 lg:space-y-0">
         <div className="flex-1">
           <Link href="/dashboard/jobs">
             <Button variant="ghost">
               <ArrowLeft/>
               Back to Jobs
             </Button>
           </Link>
          
           <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white mt-3">{job.title}</h1>
           <div className="flex items-center gap-2 mb-4">
             <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">{job.company}</span>
           </div>
          
           <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4 dark:text-white">
             <div className="flex items-center gap-1">
               <MapPin className="h-4 w-4" />
               {job.location}
             </div>
             <div className="flex items-center gap-1">
               {job.salary}
             </div>
             <div className="flex items-center gap-1">
               <Clock className="h-4 w-4" />
               {job.job_type}
             </div>
             <div className="flex items-center gap-1">
               <Monitor className="h-4 w-4" />
               {job.work_mode}
             </div>
           </div>


           <div className="flex flex-wrap gap-2">
             <Badge className="bg-green-100 text-green-800 border-green-200">
               <CheckCircle2 className="h-3 w-3 mr-1" />
               Actively hiring
             </Badge>
             <Badge variant="secondary">{job.experience}</Badge>
             <Badge variant="secondary">Posted {new Date(job.created_at).toLocaleDateString()}</Badge>
             {hasApplied && (
               <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                 <CheckCircle2 className="h-3 w-3 mr-1" />
                 Applied
               </Badge>
             )}
             {isSaved && (
               <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                 <BookmarkCheck className="h-3 w-3 mr-1" />
                 Saved
               </Badge>
             )}
           </div>
         </div>
        
         <div className="flex items-center gap-3">
           {!isLoaded ? (
             // Show loading state while Clerk is loading
             <Button disabled className="px-8">
               Loading...
             </Button>
           ) : !isSignedIn ? (
             <SignInButton mode="modal">
               <Button className="group bg-gradient-to-r from-violet-500 via-fuchsia-600 to-pink-500 px-8 dark:text-white">
                 Sign In to Apply
                 <ArrowRight className="group-hover:rotate-360 transition duration-200"/>
               </Button>
             </SignInButton>
           ) : hasApplied ? (
             <Button disabled className="px-8">
               <CheckCircle2 className="mr-2 h-4 w-4" />
               Applied
             </Button>
           ) : canApply ? (
             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
               <DialogTrigger asChild>
                 <Button className="group bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 px-8 dark:text-white">
                   Apply Now
                   <ArrowRight className="group-hover:rotate-360 transition duration-200"/>
                 </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[500px] border-neutral-200 dark:border-neutral-900">
                 <DialogHeader>
                   <DialogTitle>Apply for {job.title}</DialogTitle>
                   <DialogDescription>
                     Submit your application for this position at {job.company}. Your resume will be uploaded to secure storage and your cover letter will be saved with your application.
                   </DialogDescription>
                 </DialogHeader>
                
                 {error && (
                   <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                     <AlertCircle className="h-4 w-4" />
                     {error}
                   </div>
                 )}
                
                 <div className="grid gap-4 py-4">
                   {/* Name Field */}
                   <div className="grid gap-2">
                     <Label htmlFor="name">Full Name *</Label>
                     <Input
                       id="name"
                       value={applicationData.name}
                       onChange={(e) => handleInputChange('name', e.target.value)}
                       placeholder="Enter your full name"
                     />
                   </div>
                  
                   {/* Email Field */}
                   <div className="grid gap-2">
                     <Label htmlFor="email">Email Address *</Label>
                     <Input
                       id="email"
                       type="email"
                       value={applicationData.email}
                       onChange={(e) => handleInputChange('email', e.target.value)}
                       placeholder="Enter your email address"
                     />
                   </div>
                  
                   {/* Resume Section */}
                   <div className="grid gap-3">
                     <Label>Resume *</Label>
                    
                     {/* Select from saved resumes */}
                     {/* <div className="space-y-2">
                       <Label className="text-sm font-normal">Select from saved resumes:</Label>
                       <Select
                         value={applicationData.selectedResume}
                         onValueChange={(value) => {
                           handleInputChange('selectedResume', value)
                           handleInputChange('resumeOption', 'select')
                           handleInputChange('uploadedFile', null)
                         }}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Choose a saved resume" />
                         </SelectTrigger>
                         <SelectContent>
                           {savedResumes.map((resume, index) => (
                             <SelectItem key={index} value={resume}>
                               <div className="flex items-center gap-2">
                                 <FileText className="h-4 w-4" />
                                 {resume}
                               </div>
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div> */}
                    
                     {/* Or upload new resume */}
                     <div className="space-y-2">
                       <Label className="text-sm font-normal">Or upload a new resume:</Label>
                       <div className="flex items-center gap-2">
                         <Input
                           id="resume-upload"
                           type="file"
                           accept=".pdf"
                           onChange={handleFileUpload}
                           className="cursor-pointer"
                         />
                         <Upload className="h-4 w-4 text-gray-400" />
                       </div>
                       {applicationData.uploadedFile && (
                         <p className="text-sm text-green-600 flex items-center gap-1">
                           <CheckCircle2 className="h-4 w-4" />
                           {applicationData.uploadedFile.name} ready to upload
                         </p>
                       )}
                       <p className="text-xs text-gray-500">PDF files only, max 10MB</p>
                     </div>
                   </div>


                   {/* Cover Letter (Optional) */}
                   <div className="grid gap-2">
                     <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                     <Textarea
                       id="coverLetter"
                       value={applicationData.coverLetter}
                       onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                       placeholder="Write a brief cover letter... (This will be saved with your application)"
                       rows={4}
                     />
                     {applicationData.coverLetter.trim() && (
                       <p className="text-xs text-blue-600 flex items-center gap-1">
                         <FileText className="h-3 w-3" />
                         Cover letter will be saved with your application
                       </p>
                     )}
                   </div>
                 </div>
                
                 <DialogFooter>
                   <Button
                     variant="secondary"
                     onClick={() => setDialogOpen(false)}
                     disabled={submitting}
                   >
                     Cancel
                   </Button>
                   <Button
                     onClick={handleSubmitApplication}
                     disabled={submitting}
                     className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:text-white"
                   >
                     {submitting ? 'Submitting...' : 'Submit Application'}
                   </Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
           ) : (
             <Button disabled className="px-8" variant="outline">
               Only students can apply
             </Button>
           )}
          
           {/* Updated Save Button with proper functionality */}
           {!isLoaded ? (
             <Button disabled variant="secondary">
               <Bookmark className="h-4 w-4" />
               Save
             </Button>
           ) : !isSignedIn ? (
             <SignInButton mode="modal">
               <Button variant="secondary">
                 <Bookmark className="h-4 w-4" />
                 Save
               </Button>
             </SignInButton>
           ) : (
             <Button
               variant="secondary"
               onClick={saveJob}
               className={`${
                 isSaved
                   ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 dark:bg-fuchsia-900 dark:text-fuchsia-200 dark:border-fuchsia-700'
                   : ''
               }`}
             >
               {isSaved ? (
                 <BookmarkCheck className="h-4 w-4" />
               ) : (
                 <Bookmark className="h-4 w-4" />
               )}
               {isSaved ? 'Saved' : 'Save'}
             </Button>
           )}
         </div>
       </div>


       {/* Content Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-8">
           {/* Description */}
           <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-neutral-900">
             <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-white">Description:</h2>
             <div className="text-gray-700 leading-relaxed mb-6 dark:text-white">
               {job.description}
             </div>
           </div>


           {/* Required Skills */}
           {job.tags && (
             <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-neutral-900">
               <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Required Skills</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {job.tags.replace(/\[|\]|"/g, "").split(",").map((tag, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg dark:bg-neutral-800">
                     <CheckCircle2 className="h-5 w-5 text-green-600" />
                     <span className="font-medium text-gray-900 dark:text-white">{tag.trim()}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>


         {/* Sidebar */}
         <div className="space-y-6">
           {/* Job Summary */}
           <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-neutral-900">
             <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Job Summary</h3>
             <div className="space-y-4 ">
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-white">Experience Level:</span>
                 <span className="font-medium">{job.experience}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-white">Job Type:</span>
                 <span className="font-medium">{job.job_type}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-white">Work Mode:</span>
                 <span className="font-medium">{job.work_mode}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-white">Location:</span>
                 <span className="font-medium">{job.location}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-white">Posted:</span>
                 <span className="font-medium">{new Date(job.created_at).toLocaleDateString()}</span>
               </div>
             </div>
           </div>


           {/* Actions */}
           <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-neutral-900">
             <div className="space-y-3">
               {!isLoaded ? (
                 // Show loading state while Clerk is loading
                 <Button disabled className="w-full" size="lg">
                   Loading...
                 </Button>
               ) : !isSignedIn ? (
                 <SignInButton mode="modal">
                   <Button className="group w-full bg-gradient-to-r from-violet-500 via-fuchsia-600 to-pink-500 dark:text-white" size="lg">
                     Sign In to Apply
                     <ArrowRight className="group-hover:rotate-360 transition duration-200"/>
                   </Button>
                 </SignInButton>
               ) : hasApplied ? (
                 <Button disabled className="w-full" size="lg">
                   <CheckCircle2 className="h-4 w-4 mr-2" />
                   Applied
                 </Button>
               ) : canApply ? (
                 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                   <DialogTrigger asChild>
                     <Button className="group w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:text-white" size="lg">
                       Apply Now
                       <ArrowRight className="group-hover:rotate-360 transition duration-200"/>
                     </Button>
                   </DialogTrigger>
                 </Dialog>
               ) : (
                 <Button disabled className="w-full" size="lg" variant="outline">
                   Only students can apply
                 </Button>
               )}
              
               {/* Updated Save Button in sidebar with same functionality */}
               {!isLoaded ? (
                 <Button disabled variant="secondary" className="w-full" size="lg">
                   <Bookmark className="h-4 w-4 mr-2" />
                   Save Job
                 </Button>
               ) : !isSignedIn ? (
                 <SignInButton mode="modal">
                   <Button variant="secondary" className="w-full" size="lg">
                     <Bookmark className="h-4 w-4 mr-2" />
                     Save Job
                   </Button>
                 </SignInButton>
               ) : (
                 <Button
                   variant="secondary"
                   className={`w-full ${
                     isSaved
                       ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 dark:bg-fuchsia-900 dark:text-fuchsia-200 dark:border-fuchsia-700'
                       : ''
                   }`}
                   size="lg"
                   onClick={saveJob}
                 >
                   {isSaved ? (
                     <>
                       <BookmarkCheck className="h-4 w-4 mr-2" />
                       Saved
                     </>
                   ) : (
                     <>
                       <Bookmark className="h-4 w-4 mr-2" />
                       Save Job
                     </>
                   )}
                 </Button>
               )}
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
   </Suspense>
 )
}