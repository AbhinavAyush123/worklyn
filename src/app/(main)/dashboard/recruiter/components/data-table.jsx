'use client'

import React, { useState, useEffect } from 'react'
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, ChevronDown, MoreHorizontal, PlusIcon, Eye, Pencil, Trash2, Clipboard, FileText, CalendarClock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { EditJobForm } from './edit-job-form'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'

export default function DataTable({ data }) {
  const { user } = useUser()
  const router = useRouter()
  const [jobs, setJobs] = useState(data || [])
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('jobs')
  const [applicantDetails, setApplicantDetails] = useState({})
  const [coverLetterDialogOpen, setCoverLetterDialogOpen] = useState(false)
  const [selectedCoverLetter, setSelectedCoverLetter] = useState('')
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [interviewForm, setInterviewForm] = useState({
    interview_at: new Date(),
    location: '',
    mode: 'virtual',
    notes: '',
    interview_end: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour later
  })

  const statusColors = {
    'In Review': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Deleted': 'bg-gray-300 text-gray-600 line-through'
  }

  const applicationStatusColors = {
    'Applied': 'bg-yellow-100 text-yellow-800 border-yellow-800',
    'accepted': 'bg-green-100 text-green-800 border-green-800',
    'rejected': 'bg-red-100 text-red-800 border-red-800',
    'Interview Scheduled': 'bg-blue-100 text-blue-800 border-blue-800'
  }

  const fetchApplicantDetails = async (userIds) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds)

      if (error) throw error

      const detailsMap = {}
      users.forEach(user => {
        detailsMap[user.id] = {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
        }
      })
      setApplicantDetails(detailsMap)
    } catch (error) {
      console.error('Error fetching applicant details:', error)
      toast.error('Failed to load applicant details')
    }
  }

  const sendEmail = async (toEmail, subject, body) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toEmail,
          subject,
          html: body,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send email')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  const sendAcceptanceEmail = async (application) => {
    try {
      const applicant = applicantDetails[application.user_id]
      if (!applicant) {
        throw new Error('Applicant details not found')
      }

      const job = jobs.find(j => j.id === application.job_id)
      if (!job) {
        throw new Error('Job details not found')
      }

      const subject = `Congratulations! Your application for ${job.title} has been accepted`
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">Congratulations ${applicant.name}!</h1>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            We're pleased to inform you that your application for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong> has been accepted.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Next steps will be communicated to you shortly by our HR team.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-top: 24px;">
            Best regards,<br>
            <strong>The Hiring Team</strong>
          </p>
        </div>
      `

      await sendEmail(applicant.email, subject, body)
      toast.success('Acceptance email sent successfully')
    } catch (error) {
      console.error('Error sending acceptance email:', error)
      toast.error(`Failed to send acceptance email: ${error.message}`)
    }
  }

  const sendRejectionEmail = async (application) => {
    try {
      const applicant = applicantDetails[application.user_id]
      if (!applicant) {
        throw new Error('Applicant details not found')
      }

      const job = jobs.find(j => j.id === application.job_id)
      if (!job) {
        throw new Error('Job details not found')
      }

      const subject = `Update on your application for ${job.title}`
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">Dear ${applicant.name},</h1>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Thank you for applying for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            After careful consideration, we regret to inform you that we have decided to move forward with other candidates at this time.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            We appreciate your time and interest in our company and encourage you to apply for future openings.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-top: 24px;">
            Best regards,<br>
            <strong>The Hiring Team</strong>
          </p>
        </div>
      `

      await sendEmail(applicant.email, subject, body)
      
    } catch (error) {
      console.error('Error sending rejection email:', error)
      toast.error(`Failed to send rejection email: ${error.message}`)
    }
  }

  const sendInterviewEmail = async (application, interviewDetails) => {
    try {
      const applicant = applicantDetails[application.user_id]
      if (!applicant) {
        throw new Error('Applicant details not found')
      }

      const job = jobs.find(j => j.id === application.job_id)
      if (!job) {
        throw new Error('Job details not found')
      }

      const subject = `Interview Scheduled for ${job.title} position`
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">Dear ${applicant.name},</h1>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            We're pleased to invite you for an interview for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong>.
          </p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2563eb; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Interview Details:</h2>
            <ul style="padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;"><strong>Date:</strong> ${format(interviewDetails.interview_at, 'PPPPp')}</li>
              <li style="margin-bottom: 8px;"><strong>Mode:</strong> ${interviewDetails.mode === 'in-person' ? 'In-Person' : interviewDetails.mode === 'virtual' ? 'Virtual' : 'Phone'}</li>
              ${interviewDetails.mode === 'in-person' ? `<li style="margin-bottom: 8px;"><strong>Location:</strong> ${interviewDetails.location}</li>` : ''}
              ${interviewDetails.notes ? `<li style="margin-bottom: 8px;"><strong>Notes:</strong> ${interviewDetails.notes}</li>` : ''}
            </ul>
          </div>

          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Please let us know if you need to reschedule or have any questions.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-top: 24px;">
            Best regards,<br>
            <strong>The Hiring Team</strong>
          </p>
        </div>
      `

      await sendEmail(applicant.email, subject, body)
     
    } catch (error) {
      console.error('Error sending interview email:', error)
      toast.error(`Failed to send interview email: ${error.message}`)
    }
  }

  useEffect(() => {
    const fetchApplications = async () => {
      if (activeTab === 'applications' && user?.id) {
        try {
          setApplicationsLoading(true)
        
          const { data: jobs, error: jobsError } = await supabase
            .from("job_listings")
            .select("*")
            .eq("posted_by", user.id)

          if (jobsError) throw jobsError

          const jobIds = jobs?.map((job) => job.id) || []

          const { data: applications, error: appError } = await supabase
            .from("appliedjobs")
            .select("*")
            .in("job_id", jobIds)

          if (appError) throw appError

          setApplications(applications || [])

          const userIds = [...new Set(applications.map(app => app.user_id))]
          if (userIds.length > 0) {
            await fetchApplicantDetails(userIds)
          }
        } catch (err) {
          toast.error("Error fetching applications: " + err.message)
          console.error("Error fetching applications:", err)
        } finally {
          setApplicationsLoading(false)
        }
      }
    }

    fetchApplications()
  }, [activeTab, user?.id])

  const handleSoftDeleteJob = async (jobId) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('job_listings')
        .update({ status: 'Deleted' })
        .eq('id', jobId)
        .eq('posted_by', user.id)
    
      if (error) throw error
    
      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, status: 'Deleted' } : job
      ))
    
      toast.success('Job marked as deleted')
    } catch (error) {
      console.error('Error soft deleting job:', error)
      toast.error('Failed to delete job')
    } finally {
      setLoading(false)
    }
  }

  const handleEditJob = (job) => {
    setSelectedJob(job)
    setEditDialogOpen(true)
  }

  const handleJobUpdated = (updatedJob) => {
    setJobs(jobs.map(job =>
      job.id === updatedJob.id ? updatedJob : job
    ))
    setEditDialogOpen(false)
  }

  const handleApplicationStatusChange = async (applicationId, newStatus) => {
    try {
      const application = applications.find(app => app.id === applicationId)
      if (!application) {
        toast.error('Application not found')
        return
      }

      const { error } = await supabase
        .from('appliedjobs')
        .update({ status: newStatus })
        .eq('id', applicationId)
    
      if (error) throw error
    
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ))

      // Send appropriate email based on status change
      if (newStatus === 'accepted') {
        await sendAcceptanceEmail(application)
      } else if (newStatus === 'rejected') {
        await sendRejectionEmail(application)
      }
    
      toast.success(`Application status updated to ${newStatus}`)
    } catch (err) {
      console.error('Error updating application status:', err)
      toast.error('Failed to update application status')
    }
  }

  const handleScheduleInterview = (application) => {
    setSelectedApplication(application)
    setInterviewForm({
      interview_at: new Date(),
      location: '',
      mode: 'virtual',
      notes: '',
      interview_end: new Date(new Date().getTime() + 60 * 60 * 1000)
    })
    setInterviewDialogOpen(true)
  }

  const handleInterviewSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      if (!selectedApplication) {
        toast.error('No application selected')
        return
      }

      // First update the application status to "Interview Scheduled"
      await supabase
        .from('appliedjobs')
        .update({ status: 'Interview Scheduled' })
        .eq('id', selectedApplication.id)

      // Then create the interview record
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          job_id: selectedApplication.job_id,
          recruiter_id: user.id,
          student_id: selectedApplication.user_id,
          interview_at: interviewForm.interview_at.toISOString(),
          interview_end: interviewForm.interview_end.toISOString(),
          location: interviewForm.location,
          mode: interviewForm.mode,
          notes: interviewForm.notes
        })
        .select()

      if (error) throw error

      // Update the applications list
      setApplications(applications.map(app =>
        app.id === selectedApplication.id ? { ...app, status: 'Interview Scheduled' } : app
      ))

      // Send interview email
      await sendInterviewEmail(selectedApplication, interviewForm)

      toast.success('Interview scheduled successfully!')
      setInterviewDialogOpen(false)
      router.push('/dashboard/interviews')
    } catch (error) {
      console.error('Error scheduling interview:', error)
      toast.error('Failed to schedule interview')
    } finally {
      setLoading(false)
    }
  }

  // ... [rest of your component code remains the same until the return statement]

  const jobColumns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={row.original.status === 'Deleted'}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-medium px-0 hover:bg-transparent"
        >
          Job Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/dashboard/jobs/${row.original.id}`)}
          className={`font-medium hover:underline text-left ${
            row.original.status === 'Deleted' ? 'text-gray-500 line-through' : ''
          }`}
          disabled={row.original.status === 'Deleted'}
        >
          {row.getValue('title')}
        </button>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => (
        <div className={`text-neutral-600 ${
          row.original.status === 'Deleted' ? 'line-through' : ''
        }`}>
          {row.getValue('company')}
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className={`text-neutral-600 ${
          row.original.status === 'Deleted' ? 'line-through' : ''
        }`}>
          {row.getValue('location')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') || 'In Review'
        return (
          <Badge className={`capitalize ${statusColors[status]}`}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Posted On',
      cell: ({ row }) => (
        <div className={`text-neutral-500 ${
          row.original.status === 'Deleted' ? 'line-through' : ''
        }`}>
          {new Date(row.getValue('created_at')).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const job = row.original
        const isDeleted = job.status === 'Deleted'
      
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleted}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-neutral-200 dark:border-neutral-800">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                disabled={isDeleted}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditJob(job)}
                disabled={isDeleted}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => !isDeleted && handleSoftDeleteJob(job.id)}
                className={isDeleted ?
                  'text-gray-400 cursor-not-allowed' :
                  'text-red-600 focus:text-red-600 focus:bg-red-50'
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleted ? 'Deleted' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const applicationColumns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'job_title',
      header: 'Job Title',
      cell: ({ row }) => {
        const jobTitle = jobs.find(job => job.id === row.original.job_id)?.title || 'Unknown Job'
        return (
          <button
            onClick={() => router.push(`/dashboard/jobs/${row.original.job_id}`)}
            className="font-medium hover:underline text-left"
          >
            {jobTitle}
          </button>
        )
      },
    },
    {
      accessorKey: 'applicant_name',
      header: 'Applicant Name',
      cell: ({ row }) => {
        const applicant = applicantDetails[row.original.user_id] || {}
        return (
          <div className="text-neutral-600">
            {applicant.name || 'Loading...'}
          </div>
        )
      },
    },
    {
      accessorKey: 'applicant_email',
      header: 'Applicant Email',
      cell: ({ row }) => {
        const applicant = applicantDetails[row.original.user_id] || {}
        return (
          <div className="text-neutral-600">
            {applicant.email || 'Loading...'}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') || 'Applied'
        return (
          <Badge className={`capitalize ${applicationStatusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Applied At',
      cell: ({ row }) => (
        <div className="text-neutral-500">
          {new Date(row.getValue('created_at')).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const application = row.original
        const resumeUrl = application.resume_url
          ? `${application.resume_url}`
          : null
      
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-neutral-200 dark:border-neutral-800">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/jobs/${application.job_id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Job
              </DropdownMenuItem>
              {application.cover_letter && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCoverLetter(application.cover_letter)
                    setCoverLetterDialogOpen(true)
                  }}
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  View Cover Letter
                </DropdownMenuItem>
              )}
              {resumeUrl && (
                <DropdownMenuItem
                  onClick={() => window.open(resumeUrl, '_blank')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleScheduleInterview(application)}
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleApplicationStatusChange(application.id, 'accepted')}
                disabled={application.status === 'accepted'}
              >
                <Checkbox className="mr-2 h-4 w-4" />
                Accept
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleApplicationStatusChange(application.id, 'rejected')}
                disabled={application.status === 'rejected'}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const jobsTable = useReactTable({
    data: jobs,
    columns: jobColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const applicationsTable = useReactTable({
    data: applications,
    columns: applicationColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300 flex flex-col gap-2">
          <span className='text-2xl'>
            {activeTab === 'jobs' ? 'Your Job Listings' : 'Job Applications'}
          </span>
          <span className='text-sm text-neutral-400 font-normal'>
            {activeTab === 'jobs'
              ? 'View every job that you have created'
              : 'View applications for your job postings'}
          </span>
        </h1>
        {activeTab === 'jobs' && (
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 group text-white"
          >
            <Link href="/dashboard/jobs/create">
              <PlusIcon className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-200" />
              Post New Job
            </Link>
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs mb-6">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="flex items-center py-4 justify-between">
            <Input
              placeholder="Filter jobs..."
              value={(jobsTable.getColumn('title')?.getFilterValue() ?? '')}
              onChange={(e) =>
                jobsTable.getColumn('title')?.setFilterValue(e.target.value)
              }
              className="max-w-sm"
            />
          
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="ml-auto">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-neutral-200 dark:border-neutral-800">
                {jobsTable
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.id.replace('_', ' ')}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md">
            <Table className="border-separate border-spacing-y-2">
              <TableHeader className="[&_tr]:border-b-0">
                {jobsTable.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead key={header.id} className="pb-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {jobsTable.getRowModel().rows.length ? (
                  jobsTable.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-gray-50/50 border-b border-gray-100 last:border-b-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={jobColumns.length} className="h-24 text-center">
                      {loading ? 'Loading jobs...' : 'No jobs posted yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              {jobsTable.getFilteredSelectedRowModel().rows.length} of{' '}
              {jobsTable.getFilteredRowModel().rows.length} job(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => jobsTable.previousPage()}
                disabled={!jobsTable.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => jobsTable.nextPage()}
                disabled={!jobsTable.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="flex items-center py-4 justify-between">
            <Input
              placeholder="Filter applications..."
              value={(applicationsTable.getColumn('job_title')?.getFilterValue() ?? '')}
              onChange={(e) =>
                applicationsTable.getColumn('job_title')?.setFilterValue(e.target.value)
              }
              className="max-w-sm"
            />
          
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="ml-auto">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-neutral-200 dark:border-neutral-800">
                {applicationsTable
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.id.replace('_', ' ')}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md">
            <Table className="border-separate border-spacing-y-2">
              <TableHeader className="[&_tr]:border-b-0">
                {applicationsTable.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead key={header.id} className="pb-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {applicationsLoading ? (
                  <TableRow>
                    <TableCell colSpan={applicationColumns.length} className="h-24 text-center">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : applicationsTable.getRowModel().rows.length > 0 ? (
                  applicationsTable.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-gray-50/50 border-b border-gray-100 last:border-b-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={applicationColumns.length} className="h-24 text-center">
                      No applications found for your job postings.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              {applicationsTable.getFilteredSelectedRowModel().rows.length} of{' '}
              {applicationsTable.getFilteredRowModel().rows.length} application(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applicationsTable.previousPage()}
                disabled={!applicationsTable.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applicationsTable.nextPage()}
                disabled={!applicationsTable.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] border-none">
          <DialogHeader>
            <DialogTitle>Edit Job Listing</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <EditJobForm
              job={selectedJob}
              onSuccess={handleJobUpdated}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={coverLetterDialogOpen} onOpenChange={setCoverLetterDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>Cover Letter</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap p-4 bg-gray-50 dark:bg-neutral-800 rounded-md">
            {selectedCoverLetter || 'No cover letter provided'}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="sm:max-w-[625px] border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Set up an interview with {selectedApplication && applicantDetails[selectedApplication.user_id]?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInterviewSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interview_at">Start Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarClock className="mr-2 h-4 w-4" />
                      {interviewForm.interview_at ? format(interviewForm.interview_at, "PPPp") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={interviewForm.interview_at}
                      onSelect={(date) => setInterviewForm({...interviewForm, interview_at: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview_end">End Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarClock className="mr-2 h-4 w-4" />
                      {interviewForm.interview_end ? format(interviewForm.interview_end, "PPPp") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={interviewForm.interview_end}
                      onSelect={(date) => setInterviewForm({...interviewForm, interview_end: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">Interview Mode</Label>
                <Select
                  value={interviewForm.mode}
                  onValueChange={(value) => setInterviewForm({...interviewForm, mode: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-200 dark:border-neutral-800">
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {interviewForm.mode === 'in-person' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="123 Main St, City, State"
                    value={interviewForm.location}
                    onChange={(e) => setInterviewForm({...interviewForm, location: e.target.value})}
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions for the candidate..."
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm({...interviewForm, notes: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInterviewDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}