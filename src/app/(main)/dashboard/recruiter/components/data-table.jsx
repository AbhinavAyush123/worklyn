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
import { ArrowUpDown, ChevronDown, MoreHorizontal, PlusIcon, Eye, Pencil, Trash2, Clipboard, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog'
import { EditJobForm } from './edit-job-form'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'


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
     const { error } = await supabase
       .from('appliedjobs')
       .update({ status: newStatus })
       .eq('id', applicationId)
    
     if (error) throw error
    
     setApplications(applications.map(app =>
       app.id === applicationId ? { ...app, status: newStatus } : app
     ))
    
     toast.success(`Application ${newStatus}`)
   } catch (err) {
     console.error('Error updating application status:', err)
     toast.error('Failed to update application')
   }
 }


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
       <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-fuchsia-600 to-pink-500 flex flex-col gap-2">
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
           className="bg-purple-600 hover:bg-purple-700 group"
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
   </div>
 )
}

