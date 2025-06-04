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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import {
  User,
  Briefcase,
  MessageCircle,
  LayoutTemplate,
  Pencil,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href) => pathname?.startsWith(href);

  return (
    <Sidebar className="border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-zinc-900">
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 48 48"
            className="drop-shadow-md"
          >
            <path
              fill="#0ea5e9"
              d="M2.141 34l3.771 6.519C6.656 41.991 8.18 43 9.94 43h25.03l-5.194-9H2.141zM45.859 34.341c0-.872-.257-1.683-.697-2.364L30.977 7.319C30.245 5.94 28.794 5 27.124 5h-7.496l21.91 37.962 3.454-5.982c.681-1.164.867-1.671.867-2.639zM25.838 28L16.045 11.038 6.252 28z"
            />
          </svg>
          <Link
            href="/"
            className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight"
          >
            Aspire UI
          </Link>
        </div>
      </SidebarHeader>

      {/* Browse Jobs Button */}
      <div className="px-4 pt-2">
        <Link href="/jobs">
          <Button
            variant="default"
            className="w-full justify-center text-sm gap-2 bg-sky-500 text-white hover:bg-sky-600"
          >
            <Briefcase className="h-4 w-4" />
            Browse Jobs
          </Button>
        </Link>
      </div>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-black dark:text-white">General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { label: "Profile", icon: User, href: "/profile" },
                { label: "Chat", icon: MessageCircle, href: "/chat" },
              ].map(({ label, icon: Icon, href }) => {
                const active = isActive(href);
                return (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={href}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          active
                            ? "bg-muted text-sky-600 font-medium hover:text-sky-600"
                            : "hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className={clsx("h-4 w-4", active ? "text-sky-500" : "text-gray-500")} />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-black dark:text-white">Resume</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { label: "Resume Selector", icon: LayoutTemplate, href: "/dashboard/resume/resume-selector" },
                { label: "Resume Builder", icon: Pencil, href: "/dashboard/resume/resume-builder" },
              ].map(({ label, icon: Icon, href }) => {
                const active = isActive(href);
                return (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={href}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          active
                            ? "bg-muted text-sky-600 font-medium hover:text-sky-600"
                            : "hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className={clsx("h-4 w-4", active ? "text-sky-500" : "text-gray-500")} />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Settings + Help */}
      <div className="px-4 pt-4 pb-2 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-muted px-3 py-2 rounded-lg transition"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          Settings
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-muted px-3 py-2 rounded-lg transition"
        >
          <HelpCircle className="w-4 h-4 text-gray-500" />
          Help
        </Link>
      </div>

      <SidebarFooter className="border-t border-gray-200 dark:border-neutral-800">
        <Account />
      </SidebarFooter>
    </Sidebar>
  );
}

export function Account() {
  const { user, isSignedIn } = useUser();
  if (!isSignedIn || !user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full text-left px-4 py-3 flex items-center gap-3 rounded-xl hover:bg-muted transition">
          <UserButton />
          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-800 dark:text-white">
              {user.firstName}
            </span>
            <span className="text-xs text-muted-foreground">
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
