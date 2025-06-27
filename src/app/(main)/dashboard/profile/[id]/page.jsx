"use client"
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaEdit } from 'react-icons/fa';
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
 User,
 Mail,
 School,
 GraduationCap,
 MapPin,
 FileText,
 Briefcase,
 Link,
 Linkedin,
 Edit3,
 Save,
 Plus,
 X,
 Star,
 Award,
 BookOpen,
 SquarePen
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';


export default function ProfilePage() {
 const [isDark, setIsDark] = useState(false);
 const [loading, setLoading] = useState(false);
 const [activeTab, setActiveTab] = useState('preview');
 const [newSkill, setNewSkill] = useState('');
 const [newUserType, setNewUserType] = useState('');
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [file, setFile] = useState(null);
 const { user: currentUser } = useUser();
 const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
 );
 const { id } = useParams();
 const [profileUserData, setProfileUserData] = useState(null);
 const [isSelf, setIsSelf] = useState(false);


 // Fetch the profile user data
 useEffect(() => {
   const fetchProfileUser = async () => {
     try {
       setIsLoading(true);
      
       // Check if we're viewing our own profile
       const viewingOwnProfile = currentUser?.id === id;
       setIsSelf(viewingOwnProfile);


       // Fetch the profile data
       const { data, error } = await supabase
         .from('users')
         .select('*')
         .eq('id', id)
         .single();


       if (error) throw error;


       if (data) {
         setProfileUserData(data);
       } else {
         toast.error('User not found');
       }
     } catch (error) {
       console.error('Error fetching profile data:', error);
       toast.error('Failed to load profile data');
     } finally {
       setIsLoading(false);
     }
   };


   if (id) {
     fetchProfileUser();
   }
 }, [id, currentUser]);


 // Only allow editing if it's your own profile
 useEffect(() => {
   if (!isSelf) {
     setActiveTab('preview');
   }
 }, [isSelf]);


 const addSkill = () => {
   if (newSkill.trim() && !profileUserData.skills.includes(newSkill.trim())) {
     setProfileUserData(prev => ({
       ...prev,
       skills: [...prev.skills, newSkill.trim()]
     }));
     setNewSkill('');
   }
 };


 const removeSkill = (skill) => {
   setProfileUserData(prev => ({
     ...prev,
     skills: prev.skills.filter(s => s !== skill)
   }));
 };


 const addUserType = () => {
   const trimmedType = newUserType.trim();
   if (trimmedType && !(profileUserData.user_types || []).includes(trimmedType)) {
     setProfileUserData(prev => ({
       ...prev,
       user_types: [...(prev.user_types || []), trimmedType]
     }));
     setNewUserType('');
   }
 };


 const removeUserType = (type) => {
   setProfileUserData(prev => ({
     ...prev,
     user_types: prev.user_types.filter(t => t !== type)
   }));
 };


 const uploadProfileImage = async (selectedFile) => {
   if (!isSelf) return;
    try {
     setLoading(true);
      // Upload to Clerk
     await currentUser.setProfileImage({ file: selectedFile });
     toast.success("Profile picture updated!");
      // Fetch updated user info from your API route
     const response = await fetch("/api/get-clerk-user", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ userId: currentUser.id }),
     });
      const data = await response.json();
      if (response.ok) {
       const updatedImageUrl = data.image_url;
        // Update Supabase
       const { error } = await supabase
         .from("users")
         .update({ image_url: updatedImageUrl })
         .eq("id", currentUser.id);
        if (error) {
         toast.error("Failed to sync image to Supabase.");
       } else {
        
         setProfileUserData((prev) => ({
           ...prev,
           image_url: updatedImageUrl,
         }));
       }
     } else {
       toast.error(`Error fetching Clerk user: ${data.error || "Unknown error"}`);
     }
      setFile(null);
   } catch (err) {
     console.error("Upload error:", err);
     toast.error("Image upload or sync failed.");
   } finally {
     setLoading(false);
   }
 };
 
 const inputRef = useRef("");
 function handleClick() {
   inputRef.current?.click();
 }
 const handleFileChange = (e) => {
   const selectedFile = e.target.files[0];
   if (selectedFile) {
     setFile(selectedFile);
     uploadProfileImage(selectedFile);
   }
 };


 const saveProfile = async () => {
   if (!isSelf) return;
  
   try {
     setIsSaving(true);
     const { error } = await supabase
       .from('users')
       .update({
         first_name: profileUserData.first_name,
         last_name: profileUserData.last_name,
         email: profileUserData.email,
         role: profileUserData.role,
         user_types: profileUserData.user_types,
         school: profileUserData.school,
         intended_major: profileUserData.intended_major,
         bio: profileUserData.bio,
         education_level: profileUserData.education_level,
         skills: profileUserData.skills,
         resume_url: profileUserData.resume_url,
         location: profileUserData.location,
         portfolio_url: profileUserData.portfolio_url,
         linkedin_url: profileUserData.linkedin_url,
         has_onboarded: true
       })
       .eq('id', currentUser.id);


     if (error) throw error;


     toast.success('Profile updated successfully!');
     setActiveTab('preview');
   } catch (error) {
     console.error('Error saving profile:', error);
     toast.error('Failed to update profile');
   } finally {
     setIsSaving(false);
   }
 };


 const getInitials = () => {
   return `${profileUserData?.first_name?.[0] || ''}${profileUserData?.last_name?.[0] || ''}`.toUpperCase();
 };


 if (isLoading || !profileUserData) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
     </div>
   );
 }


 return (
  <Suspense fallback={<div className="p-4">Loading page...</div>}>

  
   <div className="min-h-screen transition-colors bg-white duration-300 dark:bg-slate-950">
     <div className="container mx-auto p-6 max-w-6xl">
       <Tabs value={activeTab} onValueChange={isSelf ? setActiveTab : undefined} className="space-y-6">
         <TabsList className="grid w-1/4 grid-cols-2 bg-blue-100 dark:bg-slate-800 p-1 rounded-md">
           <TabsTrigger
             value="preview"
             className="rounded-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
           >
             <User className="w-4 h-4 mr-2" />
             Preview
           </TabsTrigger>
           {isSelf && (
             <TabsTrigger
               value="edit"
               className="rounded-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
          
             >
               <Edit3 className="w-4 h-4 mr-2" />
               Edit
             </TabsTrigger>
           )}
         </TabsList>


         {/* Preview Tab */}
         <TabsContent value="preview" className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Profile Card */}
             <Card className="lg:col-span-1 bg-gradient-to-br from-blue-500 to-indigo-800 text-white border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
               <CardContent className="p-8 text-center relative">
                 <div className="relative w-max mx-auto mb-6">
                   <Avatar className="w-32 h-32 ring-4 ring-white/20 hover:ring-white/40 transition-all duration-300 border-none">
                   <AvatarImage
 src={isSelf ? currentUser.imageUrl : profileUserData.image_url}
 style={{
   objectFit: "cover",
   objectPosition: "center",
   width: "100%",
   height: "100%",
 }}
/>


                     <AvatarFallback className="text-2xl bg-white/20 text-white">
                       {getInitials()}
                     </AvatarFallback>
                   </Avatar>


                   {isSelf && (
                     <>
                    <Button
       onClick={handleClick}
       className="absolute -bottom-4 right-0 pl-5 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-lg transition"
       title="Change profile picture"
       variant="Ghost"
     >
       <SquarePen classame = "w-10 h-10"/>
     </Button>
     <input
     value= ""
       ref={inputRef}
       type="file"
       id="profile-upload"
       accept="image/*"
       onChange={handleFileChange}
       className="hidden"
     />
                     </>
                   )}
                 </div>
                
                 <h2 className="text-2xl font-bold mb-2">
                   {profileUserData.first_name} {profileUserData.last_name}
                 </h2>
                 <p className="text-blue-100 mb-4 capitalize">{profileUserData.role}</p>
                 <div className="flex flex-wrap gap-2 justify-center mb-6">
                   {profileUserData.user_types?.map((type, index) => (
                     <Badge key={index} variant="secondary" className="bg-white/20 text-white hover:bg-white/30 transition-colors">
                       {type}
                     </Badge>
                   ))}
                 </div>
                 <div className="space-y-3 text-sm">
                   {profileUserData.email && (
                     <div className="flex items-center justify-center gap-2 text-blue-100">
                       <Mail className="w-4 h-4" />
                       {profileUserData.email}
                     </div>
                   )}
                   {profileUserData.location && (
                     <div className="flex items-center justify-center gap-2 text-blue-100">
                       <MapPin className="w-4 h-4" />
                       {profileUserData.location}
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>


             {/* Info Cards */}
             <div className="lg:col-span-2 space-y-6">
               {/* Bio Card */}
               <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <User className="w-5 h-5 text-blue-600" />
                     About Me
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                     {profileUserData.bio || 'No bio available.'}
                   </p>
                 </CardContent>
               </Card>


               {/* Education Card */}
               <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <GraduationCap className="w-5 h-5 text-blue-600" />
                     Education
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">School</Label>
                       <p className="text-slate-800 dark:text-slate-200">{profileUserData.school || 'Not specified'}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Intended Major</Label>
                       <p className="text-slate-800 dark:text-slate-200">{profileUserData.intended_major || 'Not specified'}</p>
                     </div>
                   </div>
                   <div>
                     <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Education Level</Label>
                     <p className="text-slate-800 dark:text-slate-200">{profileUserData.education_level || 'Not specified'}</p>
                   </div>
                 </CardContent>
               </Card>


               {/* Skills Card */}
               <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <Award className="w-5 h-5 text-blue-600" />
                     Skills
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="flex flex-wrap gap-2">
                     {profileUserData.skills?.map((skill, index) => (
                       <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                         {skill}
                       </Badge>
                     ))}
                   </div>
                 </CardContent>
               </Card>


               {/* Links Card */}
               <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <Link className="w-5 h-5 text-blue-600" />
                     Links
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {profileUserData.portfolio_url && (
                     <a href={profileUserData.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                       <Briefcase className="w-4 h-4" />
                       Portfolio
                     </a>
                   )}
                   {profileUserData.linkedin_url && (
                     <a href={profileUserData.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                       <Linkedin className="w-4 h-4" />
                       LinkedIn
                     </a>
                   )}
                   {profileUserData.resume_url && (
                     <a href={profileUserData.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                       <FileText className="w-4 h-4" />
                       Resume
                     </a>
                   )}
                 </CardContent>
               </Card>
             </div>
           </div>
         </TabsContent>


         {/* Edit Tab (only visible if viewing own profile) */}
         {isSelf && (
           <TabsContent value="edit" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Personal Information */}
               <Card className="hover:shadow-lg transition-all duration-300 border-gray-200">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <User className="w-5 h-5 text-blue-600" />
                     Personal Information
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="firstName">First Name</Label>
                       <Input
                         id="firstName"
                         value={profileUserData.first_name}
                         onChange={(e) => setProfileUserData(prev => ({ ...prev, first_name: e.target.value }))}
                         className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="lastName">Last Name</Label>
                       <Input
                         id="lastName"
                         value={profileUserData.last_name}
                         onChange={(e) => setProfileUserData(prev => ({ ...prev, last_name: e.target.value }))}
                         className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                       id="email"
                       type="email"
                       value={profileUserData.email}
                       onChange={(e) => setProfileUserData(prev => ({ ...prev, email: e.target.value }))}
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="location">Location</Label>
                     <Input
                       id="location"
                       value={profileUserData.location}
                       onChange={(e) => setProfileUserData(prev => ({ ...prev, location: e.target.value }))}
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                     />
                   </div>
                 </CardContent>
               </Card>


               {/* Education */}
               <Card className="hover:shadow-lg transition-all duration-300 border-gray-200">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <GraduationCap className="w-5 h-5 text-blue-600" />
                     Education
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="school">School</Label>
                     <Input
                       id="school"
                       value={profileUserData.school}
                       onChange={(e) => setProfileUserData(prev => ({ ...prev, school: e.target.value }))}
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="major">Intended Major</Label>
                     <Input
                       id="major"
                       value={profileUserData.intended_major}
                       onChange={(e) => setProfileUserData(prev => ({ ...prev, intended_major: e.target.value }))}
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="educationLevel">Education Level</Label>
                     <Select
                       value={profileUserData.education_level}
                       onValueChange={(value) => setProfileUserData(prev => ({ ...prev, education_level: value }))}
                     >
                       <SelectTrigger className="hover:border-blue-400 focus:border-blue-500 transition-colors w-full">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="border-gray-200">
                         <SelectItem value="High School">High School</SelectItem>
                         <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                         <SelectItem value="Graduate">Graduate</SelectItem>
                         <SelectItem value="PhD">Doctorate</SelectItem>
                         <SelectItem value="Trade School">Trade School</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </CardContent>
               </Card>


               {/* Bio */}
               <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300 border-gray-200">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <FileText className="w-5 h-5 text-blue-600" />
                     Bio
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <Textarea
                     value={profileUserData.bio}
                     onChange={(e) => setProfileUserData(prev => ({ ...prev, bio: e.target.value }))}
                     placeholder="Tell us about yourself..."
                     className="min-h-[120px] hover:border-blue-400 focus:border-blue-500 transition-colors resize-none"
                   />
                 </CardContent>
               </Card>


               {/* Skills */}
               <Card className="hover:shadow-lg transition-all duration-300 border-gray-200">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <Award className="w-5 h-5 text-blue-600" />
                     Skills
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex gap-2">
                     <Input
                       value={newSkill}
                       onChange={(e) => setNewSkill(e.target.value)}
                       placeholder="Add a skill..."
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                       onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                     />
                     <Button onClick={addSkill} size="sm" className="bg-blue-600 hover:bg-blue-700 transition-colors">
                       <Plus className="w-4 h-4" />
                     </Button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {profileUserData.skills?.map((skill, index) => (
                       <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors group">
                         {skill}
                         <X
                           className="w-3 h-3 ml-1 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                           onClick={() => removeSkill(skill)}
                         />
                       </Badge>
                     ))}
                   </div>
                 </CardContent>
               </Card>


               {/* User Types */}
               <Card className="hover:shadow-lg transition-all duration-300 border-gray-200">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <Star className="w-5 h-5 text-blue-600" />
                     Personal Tags
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex gap-2">
                     <Input
                       value={newUserType}
                       onChange={(e) => setNewUserType(e.target.value)}
                       placeholder="Add user type..."
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                       onKeyPress={(e) => e.key === 'Enter' && addUserType()}
                     />
                     <Button onClick={addUserType} size="sm" className="bg-blue-600 hover:bg-blue-700 transition-colors">
                       <Plus className="w-4 h-4" />
                     </Button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {profileUserData.user_types?.map((type, index) => (
                       <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors group">
                         {type}
                         <X
                           className="w-3 h-3 ml-1 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                           onClick={() => removeUserType(type)}
                         />
                       </Badge>
                     ))}
                   </div>
                 </CardContent>
               </Card>


               {/* Links */}
               <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300 border-gray-200">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                     <Link className="w-5 h-5 text-blue-600" />
                     Links
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="portfolio">Portfolio URL</Label>
                     <Input
                       id="portfolio"
                       type="url"
                       value={profileUserData.portfolio_url}
                       onChange={(e) => setProfileUserData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="linkedin">LinkedIn URL</Label>
                     <Input
                       id="linkedin"
                       type="url"
                       value={profileUserData.linkedin_url}
                       onChange={(e) => setProfileUserData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="resume">Resume URL</Label>
                     <Input
                       id="resume"
                       type="url"
                       value={profileUserData.resume_url}
                       onChange={(e) => setProfileUserData(prev => ({ ...prev, resume_url: e.target.value }))}
                       className="hover:border-blue-400 focus:border-blue-500 transition-colors"
                     />
                   </div>
                 </CardContent>
               </Card>


               {/* Save Button */}
               <div className="lg:col-span-2">
                 <Button
                   onClick={saveProfile}
                   disabled={isSaving}
                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                 >
                   <Save className="w-4 h-4 mr-2" />
                   {isSaving ? 'Saving...' : 'Save Changes'}
                 </Button>
               </div>
             </div>
           </TabsContent>
         )}
       </Tabs>
     </div>
   </div>
   </Suspense>
 );
}



