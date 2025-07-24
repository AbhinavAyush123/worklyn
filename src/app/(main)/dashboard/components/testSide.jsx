"use client";


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
import Image from "next/image";
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
import {
 UserButton,
 useUser,
 SignOutButton,
} from "@clerk/nextjs";
import {
 User,
 Briefcase,
 MessageCircle,
 LayoutTemplate,
 Settings,
 LogOut,
 HelpCircle,
 Home,
 FileText,
 ChevronDown,
 ChevronRight,
 CalendarDays,
 Users,
 FileSearch,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState, useEffect,Suspense } from "react";
import { supabase } from "@/lib/supabase";


export function AppSidebar() {
 const pathname = usePathname();
 const isActive = (href) => pathname?.startsWith(href);
 const [isResumeOpen, setIsResumeOpen] = useState(isActive("/dashboard/resume"));
 const { user } = useUser();
 const [firstName, setFirstName] = useState("");
 const [role, setRole] = useState(null);
 const [loading, setLoading] = useState(true);


 useEffect(() => {
   const fetchUserData = async () => {
     if (!user) return;


     try {
       setLoading(true);
       const { data, error } = await supabase
         .from("users")
         .select("first_name, role")
         .eq("id", user.id)
         .single();


       if (error) {
         console.error("Error fetching user:", error.message);
       } else {
         setFirstName(data.first_name || "");
         setRole(data.role);
       }
     } catch (error) {
       console.error("Error:", error);
     } finally {
       setLoading(false);
     }
   };


   fetchUserData();
 }, [user]);




 const isRecruiter = role === "recruiter";
 const isStudent = role === "student";


 return (
   <Suspense fallback={<div className="p-4">Loading page...</div>}>


  
   <Sidebar className="border-r border-blue-200 dark:border-neutral-800">
     <SidebarHeader className=" py-3 bg-blue-500 dark:bg-black">
       <div className="flex items-top ">
         <Image
           src="/logo.png"
           alt="Dashboard preview"
           width={40}
           height={30}
           className="rounded-sm"
         />
         <div>
           <Link
           href="/"
           className="text-xl font-bold tracking-tight text-white hover:text-blue-100 dark:hover:text-blue-400 transition-colors"
         >
           Worklyn
         </Link>
         <p className="text-white text-xs">
           Sandra Day O'Connor HS
         </p>
         </div>
        
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
                 <Link href="/dashboard" className="flex gap-3 items-center">
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
                 <Link href="/dashboard/jobs" className="flex gap-3 items-center">
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
                 isActive("/dashboard/messages")
                   ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                   : "text-blue-100 dark:text-neutral-300"
               )}>
                 <Link href="/dashboard/messages" className="flex items-center gap-3">
                   <MessageCircle className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                   <span>Chat</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton asChild className={clsx(
                 "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                 isActive(`/dashboard/profile`)
                   ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                   : "text-blue-100 dark:text-neutral-300"
               )}>
                 <Link href={`/dashboard/profile/${user?.id}`} className="flex items-center gap-3">
                   <User className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                   <span>Profile</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>


             {isStudent && (
               <SidebarMenuItem>
                 <SidebarMenuButton asChild className={clsx(
                   "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                   isActive("/dashboard/calendar")
                     ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                     : "text-blue-100 dark:text-neutral-300"
                 )}>
                   <Link href="/dashboard/calendar" className="flex items-center gap-3">
                     <CalendarDays className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                     <span>Interviews Calendar</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
             )}


             {isRecruiter && (
               <SidebarMenuItem>
                 <SidebarMenuButton asChild className={clsx(
                   "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                   isActive("/dashboard/interviews")
                     ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300"
                     : "text-blue-100 dark:text-neutral-300"
                 )}>
                   <Link href="/dashboard/interviews" className="flex items-center gap-3">
                     <FileSearch className="h-4 w-4 text-blue-200 dark:text-blue-400" />
                     <span>Interviews</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
             )}
           </SidebarMenu>
         </SidebarGroupContent>
       </SidebarGroup>


       {isStudent && (
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
                   <Link href="/dashboard/interview-prep" className="flex items-center gap-3">
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
                     <SidebarMenuSubItem>
                       <Link href="/dashboard/resume/myResume" className="flex items-center gap-3 px-3 py-2 w-full hover:text-white dark:hover:text-blue-300 transition-colors">
                         My Resumes
                       </Link>
                     </SidebarMenuSubItem>
                     <SidebarMenuSubItem>
                       <Link href="/dashboard/resume/resume-builder" className="flex items-center gap-3 px-3 py-2 w-full hover:text-white dark:hover:text-blue-300 transition-colors">
                         Resume Builder
                       </Link>
                     </SidebarMenuSubItem>
                   </SidebarMenuSub>
                 </CollapsibleContent>
               </Collapsible>
             </SidebarMenu>
           </SidebarGroupContent>
         </SidebarGroup>
       )}
     </SidebarContent>


     <div className="px-4 pt-4 pb-2 space-y-1 bg-blue-500 dark:bg-black">
       
       <Link
         href="/#help"
         className={clsx("flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
           isActive("/help") ? "bg-blue-600 text-white dark:bg-blue-800/30 dark:text-blue-300" : "text-blue-100 dark:text-neutral-300"
         )}
       >
         <HelpCircle className="w-4 h-4 text-blue-200 dark:text-blue-400" />
         Help
       </Link>
     </div>


     <SidebarFooter className="bg-blue-500 dark:bg-black border-t border-blue-600">
       <Account firstName={firstName} />
     </SidebarFooter>
   </Sidebar>
   </Suspense>
 );
}


function Account({ firstName }) {
 const { user, isSignedIn } = useUser();
 if (!isSignedIn || !user) return null;


 return (
<Suspense fallback={<div className="p-4">Loading page...</div>}>
 <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-900/20 transition-colors text-blue-100 dark:text-neutral-300">
 <UserButton
     appearance={{
       elements: {
         avatarBox: "h-8 w-8",
         userButtonPopoverCard: "bg-white dark:bg-neutral-900 text-black dark:text-white",
       },
     }}
     afterSignOutUrl="/"
   />
   <div className="flex flex-col text-sm">
     <span className="font-medium">
       {firstName ? `👋 Hello, ${firstName}!` : ""}
     </span>
     <span className="text-xs text-blue-200 dark:text-muted-foreground">
       {user.primaryEmailAddress?.emailAddress}
     </span>
   </div>


  </div>
</Suspense>


 );
}


