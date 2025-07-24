"use client"

import React, { useState, useRef, Suspense } from "react"
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabase'
import {
  Alert,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertTriangleIcon,
  ArrowLeft,
  Delete,
  FileText,
  Image as ImageIcon,
  LayoutDashboardIcon,
  List,
  Plus,
  PlusIcon,
  X,
} from "lucide-react"
import { toast } from "sonner"

const CreateJobPage = () => {
  const router = useRouter()
  const fileInputRef = useRef(null)

  // Form state
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [salary, setSalary] = useState("")
  const [jobType, setJobType] = useState("")
  const [workMode, setWorkMode] = useState("")
  const [experience, setExperience] = useState("")
  const [requirements, setRequirements] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Tags state
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState([])

  // Add tag
  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  // Remove tag
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Remove selected image
  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Upload image to Supabase storage
  const uploadImage = async () => {
    if (!imageFile) return null

    setIsUploading(true)
    
    try {
      // Generate unique filename
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${fileName}`

      // Upload the file
      const { data, error } = await supabase.storage
        .from('job-images')
        .upload(filePath, imageFile)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('job-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Publish job
  const handlePublish = async () => {
    if (!title.trim() || !company.trim()) {
      toast.error("Please fill in required fields: Job Title and Company Name")
      return
    }

    setIsUploading(true)
    
    // Upload image first if exists
    let imageUrl = null
    if (imageFile) {
      imageUrl = await uploadImage()
      if (!imageUrl) return
    }

    const payload = {
      title,
      description,
      company,
      location,
      salary,
      job_type: jobType,
      experience,
      work_mode: workMode,
      tags,
      requirements,
      image_url: imageUrl
    }

    try {
      const res = await fetch("/api/jobs-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to publish job")
      }

      toast.success("Job posted successfully")
      router.push("/dashboard/recruiter")
    } catch (error) {
      console.error("Error:", error)
      toast.error(error.message || "An error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="px-4 sm:px-10 mt-5 mb-10 w-full">
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <Button variant="ghost" className="text-neutral-400 dark:text-neutral-500" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" /> Back
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={handlePublish} 
            disabled={isUploading}
          >
            {isUploading ? "Publishing..." : "Publish"}
          </Button>

        </div>
      </div>

      {/* Title */}
      <div className="flex justify-between items-start px-1">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500">
            Create Job
          </h1>
          <p className="text-sm text-neutral-500">Complete all fields below to publish</p>
        </div>
      </div>

      {/* Alert */}
      <Alert className="mt-6 bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200 flex items-center gap-2">
        <AlertTriangleIcon />
        <AlertTitle>This job is unpublished. It will not be visible to users.</AlertTitle>
      </Alert>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto mt-10 space-y-10">
        {/* Customize Job Section */}
        <SectionHeader icon={<LayoutDashboardIcon />} title="Customize Your Job" />

        {/* Job Title & Company Name */}
        <div className="flex gap-6">
          <div className="flex-1">
            <FormField 
              label="Job Title" 
              placeholder="Cashier" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          <div className="flex-1">
            <FormField 
              label="Company Name" 
              placeholder="Netflix Co." 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
              required 
            />
          </div>
        </div>

        {/* Image Upload */}
        <Card className="border border-neutral-200 shadow-none px-5 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold">Company / Job Image</div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <Button variant="ghost" asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                <PlusIcon className="mr-1" /> {imageFile ? "Change Image" : "Add Image"}
              </label>
            </Button>
          </div>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-40 object-fit rounded-md"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
                onClick={removeImage}
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 bg-neutral-100 rounded-md">
              <ImageIcon className="w-10 h-10 text-neutral-400" />
            </div>
          )}
        </Card>

        {/* Job Details */}
        <SectionHeader icon={<FileText />} title="Job Details" />

        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea 
              id="description" 
              placeholder="Provide a clear job summary..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          {/* Job Tags */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Job Tags</Label>
            <div className="relative">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g., Communication, Teamwork"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={addTag}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  onClick={() => removeTag(index)} 
                  className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 rounded-sm cursor-pointer"
                >
                  {tag} &times;
                </Badge>
              ))}
            </div>
          </div>

          <FormField 
            label="Hourly Wage" 
            placeholder="$16 per hour" 
            value={salary} 
            onChange={(e) => setSalary(e.target.value)} 
          />

          {/* Job Type and Work Mode */}
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-2 w-full">
              <Label htmlFor="jobType">Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger id="jobType" className="w-full">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent className="border-neutral-200 dark:border-neutral-800">
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 flex flex-col gap-2 w-full">
              <Label htmlFor="workMode">Work Mode</Label>
              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger id="workMode" className="w-full">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent className="border-neutral-200 dark:border-neutral-800">
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="on-site">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <FormField 
            label="Location" 
            placeholder="123 W Main St." 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
          />
        </div>

        {/* Requirements */}
        <SectionHeader icon={<List />} title="Job Requirements" />
        <div className="space-y-5">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea 
            id="requirements" 
            placeholder="List any required skills, certifications, etc." 
            value={requirements} 
            onChange={(e) => setRequirements(e.target.value)} 
          />
        </div>

        {/* Publish Button */}
        <div className="pt-6">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white"
            onClick={handlePublish}
            disabled={isUploading}
          >
            {isUploading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Reusable Input Field
const FormField = ({ label, placeholder, value, onChange, required }) => (
  <div className="flex flex-col gap-2">
    <Label>
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
)

// Section Header Component
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3">
    <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 p-2 rounded-full">
      {icon}
    </div>
    <h2 className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 font-semibold text-lg">{title}</h2>
  </div>
)

// Wrapper component with Suspense
const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateJobPage />
    </Suspense>
  )
}

export default Page