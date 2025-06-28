'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useUser } from '@clerk/nextjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Bookmark, Filter, List, Grid, Search, X, BookmarkCheck } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from "react"
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'




const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)




const tags = [
'Remote', 'Full-time', 'Part-time', 'Internship', 'Contract', 'Entry Level',
'Mid Level', 'Senior Level', 'Tech', 'Marketing', 'Design', 'Finance',
'Customer Support', 'Product Management', 'HR', 'Sales', 'Healthcare',
'Legal', 'Engineering', 'Operations'
]




const salaryRanges = [
{ label: 'Any', value: '' },
{ label: '$30k+', value: '30000' },
{ label: '$50k+', value: '50000' },
{ label: '$80k+', value: '80000' },
{ label: '$100k+', value: '100000' },
{ label: '$120k+', value: '120000' }
]




const experienceLevels = [
'Entry Level', 'Mid Level', 'Senior Level'
]




const JOBS_PER_PAGE = 6




export default function JobsFilterPage() {
const [selectedTags, setSelectedTags] = useState([])
const [jobs, setJobs] = useState([])
const [savedJobs, setSavedJobs] = useState(new Set())
const [loading, setLoading] = useState(true)
const [searchQuery, setSearchQuery] = useState('')
const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
const [salaryFilter, setSalaryFilter] = useState('')
const [experienceFilter, setExperienceFilter] = useState([])
const [locationFilter, setLocationFilter] = useState('')
const [currentPage, setCurrentPage] = useState(1)
const searchParams = useSearchParams()
const { user, isLoaded } = useUser()




useEffect(() => {
  setSearchQuery(searchParams.get('query') || '')
}, [searchParams])




useEffect(() => {
  const fetchJobs = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false })




      const { data, error } = await query




      if (!error) {
        setJobs(data)
      } else {
        console.error('Error fetching jobs:', error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }




  fetchJobs()
}, [])




// Fetch saved jobs for the current user
useEffect(() => {
  const fetchSavedJobs = async () => {
    if (!user?.id) return




    try {
      const { data, error } = await supabase
        .from('savedjobs')
        .select('job_id')
        .eq('user_id', user.id)




      if (!error && data) {
        setSavedJobs(new Set(data.map(item => item.job_id)))
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
    }
  }




  if (isLoaded && user) {
    fetchSavedJobs()
  }
}, [user, isLoaded])




const saveJob = async (jobId) => {
  if (!user?.id) {
    toast.error('Please sign in to save jobs')
    return
  }




  try {
    const isSaved = savedJobs.has(jobId)
     if (isSaved) {
      // Remove from saved jobs
      const { error } = await supabase
        .from('savedjobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId)




      if (error) throw error




      setSavedJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
  
      toast.success('Job removed from saved list')
    } else {
      // Add to saved jobs
      const { error } = await supabase
        .from('savedjobs')
        .insert([
          {
            user_id: user.id,
            job_id: jobId
          }
        ])




      if (error) throw error




      setSavedJobs(prev => new Set([...prev, jobId]))
  
      toast.success('Job saved successfully!')
    }
  } catch (error) {
    console.error('Error saving job:', error)
    toast.error('Failed to save job. Please try again.')
  }
}




const saveFriend = async (jobId) => {
  if (!user?.id) {
    toast.error('Please sign in to send friend requests')
    return
  }




  try {
    // 1. Fetch recruiter ID from job_listings table
    const { data: job, error: jobError } = await supabase
      .from('job_listings')
      .select('posted_by')
      .eq('id', jobId)
      .single()




    if (jobError || !job?.posted_by) {
      console.error(jobError)
      toast.error('Failed to fetch recruiter info.')
      return
    }




    const receiverId = job.posted_by




    // Prevent sending a request to yourself
    if (receiverId === user.id) {
      toast.error('You cannot send a request to yourself.')
      return
    }




    // 2. Check if a request already exists
    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('id')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .maybeSingle()




    if (existingRequest) {
      toast('Friend request already exists between you and this user.')
      return
    }




    // 3. Insert friend request
    const { error: insertError } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'Accepted'
      })




    if (insertError) {
      console.error(insertError)
      toast.error('Failed to send friend request.')
    } else {
      toast.success('Recruiter Added, view them in Chat!')
    }
  } catch (err) {
    console.error(err)
    toast.error('Something went wrong.')
  }
}




const toggleTag = (tag) => {
  setSelectedTags((prev) =>
    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
  )
  setCurrentPage(1) // Reset to first page when filters change
}




const toggleExperience = (level) => {
  setExperienceFilter((prev) =>
    prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
  )
  setCurrentPage(1) // Reset to first page when filters change
}




const clearFilters = () => {
  setSelectedTags([])
  setSalaryFilter('')
  setExperienceFilter([])
  setLocationFilter('')
  setCurrentPage(1)
}




const filteredJobs = jobs.filter((job) => {
  // Tag filtering
  const matchesTags =
    selectedTags.length === 0 ||
    selectedTags.some((tag) =>
      job.tags?.toLowerCase().includes(tag.toLowerCase()) ||
      job.job_type?.toLowerCase() === tag.toLowerCase() ||
      job.experience?.toLowerCase() === tag.toLowerCase()
    )




  // Search query filtering
  const matchesSearch =
    !searchQuery ||
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())




  // Salary filtering
  const matchesSalary =
    !salaryFilter ||
    (job.salary && parseInt(job.salary.replace(/[^0-9]/g, '')) >= parseInt(salaryFilter))




  // Experience filtering
  const matchesExperience =
    experienceFilter.length === 0 ||
    experienceFilter.some(level =>
      job.experience?.toLowerCase().includes(level.toLowerCase())
    )




  // Location filtering
  const matchesLocation =
    !locationFilter ||
    job.location?.toLowerCase().includes(locationFilter.toLowerCase())




  return matchesTags && matchesSearch && matchesSalary && matchesExperience && matchesLocation
})




// Pagination logic
const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
const paginatedJobs = filteredJobs.slice(
  (currentPage - 1) * JOBS_PER_PAGE,
  currentPage * JOBS_PER_PAGE
)




const JobCardSkeleton = () => (
  <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 bg-white dark:bg-neutral-900 shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    <div className="flex items-center gap-4 mb-3">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <div className="flex flex-wrap gap-4 mb-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
    </div>
    <div className="space-y-2 mb-4">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="flex justify-between gap-3">
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-1/2 rounded-lg" />
    </div>
  </div>
)




return (
  <Suspense fallback={<div>Loading...</div>}>
    <div className="w-full px-4 md:px-8 lg:px-8 mt-5 flex flex-col items-center">
      {/* Search and Filter Bar */}
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center gap-4">
          <ScrollArea className="w-full overflow-x-auto">
            <div className="flex items-center gap-2 py-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer whitespace-nowrap ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                      : 'rounded-sm border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400'
                  }`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>




          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="text-blue-700 border-blue-300">
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] px-10">
                <SheetHeader>
                  <SheetTitle>Filter Jobs</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <Label className="block mb-2">Salary Range</Label>
                    <div className="flex flex-wrap gap-2">
                      {salaryRanges.map((range) => (
                        <Badge
                          key={range.value}
                          variant={salaryFilter === range.value ? 'default' : 'outline'}
                          onClick={() => {
                            setSalaryFilter(range.value)
                            setCurrentPage(1)
                          }}
                          className={`cursor-pointer ${
                            salaryFilter === range.value
                              ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                              : ''
                          }`}
                        >
                          {range.label}
                        </Badge>
                      ))}
                    </div>
                  </div>




                  <div>
                    <Label className="block mb-2">Experience Level</Label>
                    <div className="flex flex-wrap gap-2">
                      {experienceLevels.map((level) => (
                        <Badge
                          key={level}
                          variant={experienceFilter.includes(level) ? 'default' : 'outline'}
                          onClick={() => toggleExperience(level)}
                          className={`cursor-pointer ${
                            experienceFilter.includes(level)
                              ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                              : ''
                          }`}
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>




                  <div>
                    <Label className="block mb-2">Location</Label>
                    <Input
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => {
                        setLocationFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>




                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>




      {/* Results Count */}
      <div className="w-full flex justify-between items-center mt-4">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
        </div>
        {(selectedTags.length > 0 || salaryFilter || experienceFilter.length > 0 || locationFilter) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-500 dark:text-neutral-400"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>




      {/* Jobs Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-12 gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full">
            <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No jobs found</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
          <Button variant="secondary" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
            {paginatedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobs.has(job.id)}
                onSave={() => saveJob(job.id)}
                sendReq={() => saveFriend(job.id)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="ghost"
                className="border-gray-200 border-2 mb-6"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    className = "border-gray-200 border-2 mb-6"
                    variant={currentPage === pageNum ? 'ghost' : 'ghost'}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              <Button
                variant="ghost"
                className="border-2 border-gray-200"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="w-full space-y-4 mt-2">
            {paginatedJobs.map((job) => (
              <JobListCard
                key={job.id}
                job={job}
                isSaved={savedJobs.has(job.id)}
                onSave={() => saveJob(job.id)}
                sendReq={() => saveFriend(job.id)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="border-2 border-gray-200"
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    className = "border-2 border-gray-200"
                    variant={currentPage === pageNum ? 'ghost' : 'ghost'}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              <Button
                variant="ghost"
                className = "border-2 border-gray-200"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  </Suspense>
)
}




function JobCard({ job, isSaved, onSave, sendReq }) {
return (
  <Suspense fallback={<div>Loading...</div>}>
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 bg-neutral-50 dark:bg-neutral-900 shadow-sm transition-colors hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
      <div className="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400 mb-2">
        <span>{new Date(job.created_at).toLocaleDateString()}</span>
        <Button
          variant="ghost"
          size="icon"
          className={`hover:bg-blue-100 dark:hover:bg-blue-900/50 ${
            isSaved ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'
          }`}
          onClick={onSave}
        >
          {isSaved ? (
            <BookmarkCheck size={16} className="fill-current" />
          ) : (
            <Bookmark size={16} />
          )}
        </Button>
      </div>




      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 bg-white rounded-lg dark:bg-neutral-700 flex items-center justify-center">
          {job?.image_url ? (
            <img
              src={job.image_url}
              alt={job?.company || 'Company'}
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
              {job?.company?.slice(0, 2).toUpperCase() || '??'}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{job.title}</h3>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{job.company}</p>
        </div>
      </div>




      <div className="flex flex-wrap gap-4 text-xs text-neutral-600 dark:text-neutral-400 mb-3">
        {job.job_type && <span>{job.job_type}</span>}
        {job.work_mode && <span>{job.work_mode}</span>}
        {job.salary && <span>{job.salary}</span>}
        {job.experience && <span>{job.experience}</span>}
        {job.location && <span>{job.location}</span>}
      </div>




      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">
        {job.description}
      </p>




      {job.tags && (
        <ScrollArea className="w-full overflow-x-auto mb-4">
          <div className="flex gap-2">
            {job.tags.replace(/\[|\]|"/g, '').split(',').map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="whitespace-nowrap border-neutral-200 text-neutral-400 rounded-sm dark:border-neutral-700"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}




      <div className="flex justify-between items-center gap-3">
        <Link href={`/dashboard/jobs/${job.id}`} className='w-full'>
          <Button variant="secondary" className="w-full hover:bg-blue-100 dark:hover:bg-blue-900/50">
            Details
          </Button>
        </Link>
        <Button
          className="w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 text-white hover:opacity-90 dark:bg-gradient-to-r dark:from-blue-600 dark:via-blue-500 dark:to-blue-400"
          onClick={sendReq}
        >
          Contact
        </Button>
      </div>
    </div>
  </Suspense>
)
}




function JobListCard({ job, isSaved, onSave, sendReq }) {
return (
  <Suspense fallback={<div>Loading...</div>}>
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-5 bg-neutral-50 dark:bg-neutral-900 shadow-sm transition-colors hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg dark:bg-neutral-700 flex items-center justify-center mt-1">
            {job.company && (
              <span className="font-medium text-xs text-neutral-600 dark:text-neutral-300">
                {job.company.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{job.title}</h3>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{job.company}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {job.job_type && <span>{job.job_type}</span>}
              {job.work_mode && <span>{job.work_mode}</span>}
              {job.salary && <span>{job.salary}</span>}
              {job.experience && <span>{job.experience}</span>}
              {job.location && <span>{job.location}</span>}
            </div>
          </div>
        </div>




        <div className="flex flex-col sm:items-end gap-2">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {new Date(job.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`hover:bg-blue-100 dark:hover:bg-blue-900/50 ${
                isSaved ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'
              }`}
              onClick={onSave}
            >
              {isSaved ? (
                <BookmarkCheck size={16} className="fill-current" />
              ) : (
                <Bookmark size={16} />
              )}
            </Button>
            <Link href={`/dashboard/jobs/${job.id}`}>
              <Button variant="secondary" className="hover:bg-blue-100 dark:hover:bg-blue-900/50">
                Details
              </Button>
            </Link>
            <Button
              className="bg-gradient-to-br from-blue-700 to-blue-500 text-white hover:opacity-90 dark:bg-gradient-to-r dark:from-blue-600 dark:via-blue-500 dark:to-blue-400"
              onClick={sendReq}
            >
              Contact
            </Button>
          </div>
        </div>
      </div>




      {job.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4 line-clamp-2">
          {job.description}
        </p>
      )}




      {job.tags && (
        <ScrollArea className="w-full overflow-x-auto mt-4">
          <div className="flex gap-2">
            {job.tags.replace(/\[|\]|"/g, '').split(',').map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="whitespace-nowrap border-neutral-200 text-neutral-400 rounded-sm dark:border-neutral-700"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  </Suspense>
)
}












