'use client';
import { UserButton, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useState , useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';

import { Textarea } from '@/components/ui/textarea';
import {   Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem, } from '@/components/ui/select';




export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [city, setCity] = useState("");
  const [state, setState] = useState( "");
  const educationOptions = [
    "High School",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Trade School",
    
  ];
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    school: '',
    intendedMajor: '',
    bio: '',
    educationLevel: '',
    skills: '',
    resumeUrl: '',
    location: '',
    portfolioUrl: '',
    linkedinUrl: '',
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setFormData({
        firstName: user.unsafeMetadata?.firstName || '',
        lastName: user.unsafeMetadata?.lastName || '',
        school: user.unsafeMetadata?.school || '',
        intendedMajor: user.unsafeMetadata?.intended_major || '',
        bio: user.unsafeMetadata?.bio || '',
        educationLevel: user.unsafeMetadata?.education_level || '',
        skills: (user.unsafeMetadata?.skills || []).join(', '),
        resumeUrl: user.unsafeMetadata?.resume_url || '',
        location: user.unsafeMetadata?.location || '',
        portfolioUrl: user.unsafeMetadata?.portfolio_url || '',
        linkedinUrl: user.unsafeMetadata?.linkedin_url || '',
      });
    }
  }, [isLoaded, isSignedIn]);


  if (!isLoaded || !isSignedIn) return null;

  const uploadProfileImage = async (selectedFile) => {
    try {
      setLoading(true);
      await user.setProfileImage({ file: selectedFile });
      toast.success('Profile picture updated successfully!');
      setFile(null);
    } catch (err) {
      console.error('Failed to upload image:', err);
      toast.error('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      uploadProfileImage(selectedFile);
    }
  };

  const handleSaveNameUI = async () => {
    try {
      setLoading(true);
      await user.update({
        unsafeMetadata: {
          firstName: firstNameInput || user.unsafeMetadata?.firstName || '',
          lastName: lastNameInput || user.unsafeMetadata?.lastName || '',
        },
      });
      
      toast.success('Name updated successfully!');
    } catch (error) {
      console.error('Failed to update name:', error);
      toast.error('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };



  const handleSaveName = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/update-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstName: firstNameInput,
          lastName: lastNameInput,
        }),
      });
  
      if (!res.ok) throw new Error('Failed to update');
      setOpen(false);
      toast.success('Name updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };



  const handleSaveRest = async () => {
    setLoading(true);
    try {
      // Update Clerk metadata
      await user.update({
        unsafeMetadata: {
          ...formData,
          skills: formData.skills.split(',').map((s) => s.trim()),
        },
      });

      // Update Supabase
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          skills: formData.skills.split(',').map((s) => s.trim()),
        }),
      });

      if (!res.ok) throw new Error('Supabase update failed');
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-gray-50 to-blue-50">
      {/* Hero / Cover */}
      <div className="relative h-64 bg-cover bg-center" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1597773150796-e5c14ebecbf5?fm=jpg&q=60&w=3000)'
      }}>
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Avatar + Edit */}
        <div className="absolute bottom-0 left-32 transform -translate-x-1/2 translate-y-1/2">
          <div className="relative">
            <img src={user.imageUrl} alt="Profile" className="w-52 h-52 rounded-full border-4 border-white object-cover shadow-lg" />
            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer">
              <FaEdit size={16} />
              <input type="file" id="profile-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto mt-20 px-4 md:px-0 pb-12">
        {/* Name + Edit */}
        <div className="text-center mb-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="inline-flex items-center space-x-2 cursor-pointer">
                <h1 className="text-3xl md:text-4xl font-semibold">
                  {user.unsafeMetadata?.firstName} {user.unsafeMetadata?.lastName}
                </h1>
                <FaEdit className="text-gray-500 hover:text-gray-700" />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Edit Name</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                <Input placeholder="First name" value={firstNameInput} onChange={e => setFirstNameInput(e.target.value)} />
                <Input placeholder="Last name" value={lastNameInput} onChange={e => setLastNameInput(e.target.value)} />
              </div>
              <DialogFooter className="mt-4">
                <Button onClick={async () => { await handleSaveName(); await handleSaveNameUI(); }} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Bio */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-gray-600 hover:text-gray-800 italic mt-2">
                {formData.bio || "Add a bio..."}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Edit Bio</DialogTitle></DialogHeader>
              <Textarea
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={e => handleChange('bio', e.target.value)}
                className="mt-4"
              />
              <DialogFooter className="mt-4">
                <Button onClick={handleSaveRest} disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Editable Form */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Edit Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="School" value={formData.school} onChange={e => handleChange('school', e.target.value)} />
            <Input placeholder="Intended Major" value={formData.intendedMajor} onChange={e => handleChange('intendedMajor', e.target.value)} />

            <Select value={formData.educationLevel} onValueChange={val => handleChange('educationLevel', val)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Education Level" />
              </SelectTrigger>
              <SelectContent>
                {educationOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input placeholder="Skills (comma‑separated)" value={formData.skills} onChange={e => handleChange('skills', e.target.value)} />
            
            <Input placeholder="Resume URL" value={formData.resumeUrl} onChange={e => handleChange('resumeUrl', e.target.value)} />
            <Input placeholder="Portfolio URL" value={formData.portfolioUrl} onChange={e => handleChange('portfolioUrl', e.target.value)} />
            <Input placeholder="LinkedIn URL" value={formData.linkedinUrl} onChange={e => handleChange('linkedinUrl', e.target.value)} />
            <Input placeholder="Location" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveRest} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


