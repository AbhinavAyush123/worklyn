// components/edit-job-form.jsx
'use client'


import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'


export function EditJobForm({ job, onSuccess, onCancel }) {
 const [loading, setLoading] = useState(false)
 const form = useForm({
   defaultValues: {
     title: job.title,
     company: job.company,
     location: job.location,
     description: job.description,
     salary: job.salary,
     job_type: job.job_type,
     experience: job.experience,
     work_mode: job.work_mode,
   }
 })


 const onSubmit = async (values) => {
   try {
     setLoading(true)
     const { error } = await supabase
       .from('job_listings')
       .update(values)
       .eq('id', job.id)
    
     if (error) throw error
    
     toast.success('Job updated successfully')
     onSuccess({ ...job, ...values })
   } catch (error) {
     toast.error('Failed to update job')
     console.error(error)
   } finally {
     setLoading(false)
   }
 }


 return (
   <Form {...form}>
     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
       <FormField
         control={form.control}
         name="title"
         render={({ field }) => (
           <FormItem>
             <FormLabel>Job Title</FormLabel>
             <FormControl>
               <Input {...field} />
             </FormControl>
             <FormMessage />
           </FormItem>
         )}
       />
      
       <FormField
         control={form.control}
         name="company"
         render={({ field }) => (
           <FormItem>
             <FormLabel>Company</FormLabel>
             <FormControl>
               <Input {...field} />
             </FormControl>
             <FormMessage />
           </FormItem>
         )}
       />
      
       <FormField
         control={form.control}
         name="location"
         render={({ field }) => (
           <FormItem>
             <FormLabel>Location</FormLabel>
             <FormControl>
               <Input {...field} />
             </FormControl>
             <FormMessage />
           </FormItem>
         )}
       />
      
       <FormField
         control={form.control}
         name="description"
         render={({ field }) => (
           <FormItem>
             <FormLabel>Description</FormLabel>
             <FormControl>
               <Textarea {...field} rows={5} />
             </FormControl>
             <FormMessage />
           </FormItem>
         )}
       />
      
       <div className="grid grid-cols-3 gap-4">
         <FormField
           control={form.control}
           name="salary"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Salary</FormLabel>
               <FormControl>
                 <Input {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />
        
         <FormField
           control={form.control}
           name="job_type"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Job Type</FormLabel>
               <FormControl>
                 <Input {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />
        
         <FormField
           control={form.control}
           name="experience"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Experience</FormLabel>
               <FormControl>
                 <Input {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />
       </div>
      
       <div className="flex justify-end gap-2 pt-4">
         <Button
           type="button"
           variant="secondary"
           onClick={onCancel}
           disabled={loading}
         >
           Cancel
         </Button>
         <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
           {loading ? 'Saving...' : 'Save Changes'}
         </Button>
       </div>
     </form>
   </Form>
 )
}



