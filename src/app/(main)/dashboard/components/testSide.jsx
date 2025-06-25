'use client';


import {
 Sidebar,
 SidebarContent,
 SidebarFooter,
 SidebarGroup,
 SidebarGroupContent,
 SidebarGroupLabel,
 SidebarHeader,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 SidebarMenuSub,
 SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
 DropdownMenu,
 DropdownMenuTrigger,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
 Collapsible,
 CollapsibleTrigger,
 CollapsibleContent,
} from "@/components/ui/collapsible";
import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import {
 User,
 Briefcase,
 MessageCircle,
 LayoutTemplate,
 Settings,
 LogOut,
 HelpCircle,
 Home,
 Search,
 FileText,
 ChevronDown,
 ChevronRight,
 Sparkles,
} from "lucide-react";


import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";


export function AppSidebar() {
 const pathname = usePathname();
 const isActive = (href) => pathname?.startsWith(href);
 const [isResumeOpen, setIsResumeOpen] = useState(isActive("/dashboard/resume"));


 return (
   <Sidebar className="border-r border-blue-200 dark:border-neutral-800">
     <SidebarHeader className="px-4 py-4.5 bg-blue-500 dark:bg-black">
       <div className="flex items-center gap-3">
         <svg
           xmlns="http://www.w3.org/2000/svg"
           width="26"
           height="26"
           viewBox="0 0 48 48"
           className="drop-shadow-md"
         >
           <path
             fill="#ffffff"
             d="M2.141 34l3.771 6.519C6.656 41.991 8.18 43 9.94 43h25.03l-5.194-9H2.141zM45.859 34.341c0-.872-.257-1.683-.697-2.364L30.977 7.319C30.245 5.94 28.794 5 27.124 5h-7.496l21.91 37.962 3.454-5.982c.681-1.164.867-1.671.867-2.639zM25.838 28L16.045 11.038 6.252 28z"
           />
         </svg>
         <Link
           href="/"
           className="text-xl font-bold tracking-tight text-white hover:text-blue-100 dark:hover:text-blue-400 transition-colors"
         >
           Aspire UI
         </Link>
       </div>
     </SidebarHeader>


     <SidebarContent className="pt-2 bg-blue-500 dark:bg-black">
       <SidebarGroup>
         <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-blue-100 dark:text-neutral-400">
           Quick Access
         </SidebarGroupLabel>
         <SidebarGroupContent>
           <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton asChild className={clsx(
                 "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                 isActive("/dashboard")
                   ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                   : "text-blue-100 dark:text-neutral-300"
               )}>
                 <Link
                   href="/dashboard"
                   className="flex gap-3 items-center"
                 >
                   <Home className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                   <span>Dashboard</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton asChild className={clsx(
                 "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                 isActive("/dashboard/jobs")
                   ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                   : "text-blue-100 dark:text-neutral-300"
               )}>
                 <Link
                   href="/dashboard/jobs"
                   className="flex gap-3 items-center"
                 >
                   <Briefcase className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                   <span>Browse Jobs</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
         </SidebarGroupContent>
       </SidebarGroup>


       <SidebarGroup>
         <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-blue-100 dark:text-neutral-400">
           Personal
         </SidebarGroupLabel>
         <SidebarGroupContent>
           <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton asChild className={clsx(
                 "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                 isActive("/dashboard/chat")
                   ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                   : "text-blue-100 dark:text-neutral-300"
               )}>
                 <Link
                   href="/dashboard/chat"
                   className="flex items-center gap-3"
                 >
                   <MessageCircle className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                   <span>Chat</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton asChild className={clsx(
                 "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                 isActive("/dashboard/profile")
                   ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                   : "text-blue-100 dark:text-neutral-300"
               )}>
                 <Link
                   href="/dashboard/profile"
                   className="flex items-center gap-3"
                 >
                   <User className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                   <span>Profile</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
         </SidebarGroupContent>
       </SidebarGroup>


       <SidebarGroup>
         <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-blue-100 dark:text-neutral-400">
           Tools
         </SidebarGroupLabel>
         <SidebarGroupContent>
           <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton asChild className={clsx(
                 "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                 isActive("/dashboard/interview-prep")
                   ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                   : "text-blue-100 dark:text-neutral-300"
               )}>
                 <Link
                   href="/dashboard/interview-prep"
                   className="flex items-center gap-3"
                 >
                   <LayoutTemplate className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                   <span>Interview Preparation</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>
            
             <Collapsible
               open={isResumeOpen}
               onOpenChange={setIsResumeOpen}
               className="group/collapsible"
             >
               <SidebarMenuItem>
                 <CollapsibleTrigger asChild>
                   <SidebarMenuButton className={clsx(
                     "w-full justify-between px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                     isActive("/dashboard/resume")
                       ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                       : "text-blue-100 dark:text-neutral-300"
                   )}>
                     <div className="flex items-center gap-3">
                       <FileText className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                       <span>Resume</span>
                     </div>
                     {isResumeOpen ? (
                       <ChevronDown className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                     )}
                   </SidebarMenuButton>
                 </CollapsibleTrigger>
               </SidebarMenuItem>
               <CollapsibleContent>
                 <SidebarMenuSub>
                   <SidebarMenuSubItem className={clsx(
                     "ml-4 rounded-lg transition-colors hover:bg-blue-600 dark:hover:bg-blue-900/20",
                     isActive("/dashboard/resume/myResume")
                       ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                       : "text-blue-100 dark:text-neutral-300"
                   )}>
                     <Link
                       href="/dashboard/resume/myResume"
                       className="flex items-center gap-3 px-3 py-2 w-full hover:text-white dark:hover:text-blue-300 transition-colors"
                     >
                       My Resumes
                     </Link>
                   </SidebarMenuSubItem>
                   <SidebarMenuSubItem className={clsx(
                     "ml-4 rounded-lg transition-colors hover:bg-blue-600 dark:hover:bg-blue-900/20",
                     isActive("/dashboard/resume/resume-builder")
                       ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                       : "text-blue-100 dark:text-neutral-300"
                   )}>
                     <Link
                       href="/dashboard/resume/resume-builder"
                       className="flex items-center gap-3 px-3 py-2 w-full hover:text-white dark:hover:text-blue-300 transition-colors"
                     >
                       Resume Builder
                     </Link>
                   </SidebarMenuSubItem>
                 </SidebarMenuSub>
               </CollapsibleContent>
             </Collapsible>
           </SidebarMenu>
         </SidebarGroupContent>
       </SidebarGroup>
     </SidebarContent>


     {/* Settings + Help */}
     <div className="px-4 pt-4 pb-2 space-y-1 bg-blue-500 dark:bg-black">
       <Link
         href="/settings"
         className={clsx(
           "flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
           isActive("/settings")
             ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
             : "text-blue-100 dark:text-neutral-300"
         )}
       >
         <Settings className="w-4 h-4 text-blue-200 dark:text-blue-400" />
         Settings
       </Link>
       <Link
         href="/help"
         className={clsx(
           "flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
           isActive("/help")
             ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
             : "text-blue-100 dark:text-neutral-300"
         )}
       >
         <HelpCircle className="w-4 h-4 text-blue-200 dark:text-blue-400" />
         Help
       </Link>
     </div>


     <SidebarFooter className="bg-blue-500 dark:bg-black border-t border-blue-600">
       <Account />
     </SidebarFooter>
   </Sidebar>
 );
}


function Account() {
 const { user, isSignedIn } = useUser();
 if (!isSignedIn || !user) return null;


 return (
   <DropdownMenu>
     <DropdownMenuTrigger asChild>
       <button className="w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-900/20 transition-colors text-blue-100 dark:text-neutral-300">
         <UserButton appearance={{
           elements: {
             avatarBox: "h-8 w-8"
           }
         }} />
         <div className="flex flex-col text-sm">
           <span className="font-medium">
             {user.firstName}
           </span>
           <span className="text-xs text-blue-200 dark:text-muted-foreground">
             {user.primaryEmailAddress?.emailAddress}
           </span>
         </div>
       </button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="end" className="w-56">
       <DropdownMenuItem asChild>
         <Link href="/settings" className="flex items-center gap-2">
           <Settings size={16} />
           Settings
         </Link>
       </DropdownMenuItem>
       <DropdownMenuSeparator />
       <DropdownMenuItem asChild>
         <SignOutButton>
           <button className="flex items-center gap-2 w-full">
             <LogOut size={16} />
             Logout
           </button>
         </SignOutButton>
       </DropdownMenuItem>
     </DropdownMenuContent>
   </DropdownMenu>
 );
}



