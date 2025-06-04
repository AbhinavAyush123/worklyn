import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import ResumeSelectorPage from '../components/resume-selector'

const page = () => {
  return (
    <div className="md:px-20 mt-5  max-w-8xl mx-auto w-full">
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
                <BreadcrumbPage>Selector</BreadcrumbPage>
            </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-5'>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-t from-sky-500 via-sky-600 to-sky-500">
            Resume Selector
            </h1>
        </div>
        <ResumeSelectorPage/>
    </div>
  )
}

export default page