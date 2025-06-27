'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/app/(main)/dashboard/components/testSide'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, BellIcon, Sun, Moon, Sparkles, X, Loader2, Frown, Bookmark, BookmarkCheck, Bot, Zap } from 'lucide-react'
import { useClerk, useUser } from '@clerk/nextjs'
import NotificationsDialog from './notification'
import clsx from 'clsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function DashboardLayoutContent({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDashboard = pathname?.startsWith('/dashboard')
  const isJobsPage = pathname === '/dashboard/jobs'
  const { signOut } = useClerk()
  const { user, isSignedIn } = useUser()

  const searchQuery = searchParams.get('query') || ''
  const [inputValue, setInputValue] = useState(searchQuery)
  const [aiMode, setAiMode] = useState(false)
  const [aiResults, setAiResults] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const debounceTimeout = useRef(null)
  const aiResultsRef = useRef(null)

  const rotatingWords = [
    'Ask AI for your dream job...',
    'Find your perfect match...',
    'Search the latest jobs...',
    'Let AI guide your career...',
    'Discover hidden opportunities...',
    'Match your skills perfectly...',
  ]
  const [rotatingWordIndex, setRotatingWordIndex] = useState(0)
  const [fadeState, setFadeState] = useState('fade-in')
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const preferred = stored || (systemDark ? 'dark' : 'light')
    setTheme(preferred)
    document.documentElement.classList.toggle('dark', preferred === 'dark')
  }, [])

  useEffect(() => {
    if (!aiMode || inputValue) return
    const interval = setInterval(() => {
      setFadeState('fade-out')
      setTimeout(() => {
        setRotatingWordIndex((prev) => (prev + 1) % rotatingWords.length)
        setFadeState('fade-in')
      }, 500)
    }, 2500)
    return () => clearInterval(interval)
  }, [aiMode, inputValue, rotatingWords.length])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (aiResultsRef.current && !aiResultsRef.current.contains(e.target)) {
        setAiResults(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  const handleChange = (e) => {
    const val = e.target.value
    setInputValue(val)

    if (!aiMode) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
      debounceTimeout.current = setTimeout(() => {
        const encoded = encodeURIComponent(val.trim())
        router.push(val.trim() ? `/dashboard/jobs?query=${encoded}` : `/dashboard/jobs`)
      }, 400)
    }
  }

  const toggleAIMode = () => {
    const newAiMode = !aiMode
    setAiMode(newAiMode)
    setInputValue('')
    setAiResults(null)
    setAiError(null)
    if (!newAiMode && searchQuery) {
      router.push('/dashboard/jobs')
    }
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      aiMode ? await handleAISearch() : router.push(
        inputValue.trim()
          ? `/dashboard/jobs?query=${encodeURIComponent(inputValue.trim())}`
          : `/dashboard/jobs`
      )
    }
  }

  const handleAISearch = async () => {
    if (!inputValue.trim()) return
    setIsAiLoading(true)
    setAiError(null)
    setAiResults(null)

    try {
      const res = await fetch('/api/ai-job-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI API failed')
      setAiResults(data.matches || [])
    } catch (err) {
      setAiError(err.message || 'Failed to get AI suggestions')
    } finally {
      setIsAiLoading(false)
    }
  }

  const AIJobCardSkeleton = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-900/50 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse" />
          <Skeleton className="h-4 w-20" />
        </div>
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
      <div className="space-y-2 mb-4 flex-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-auto">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  )

  const AIJobCard = ({ job }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-900/50 shadow-sm transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 group flex flex-col h-full">
      <div className="flex justify-between items-center text-sm mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">AI Matched</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          {job.company && (
            <span className="font-medium text-xs text-gray-600 dark:text-gray-300">
              {job.company.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{job.company}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
        {job.job_type && <span className="flex items-center gap-1"><Zap size={10} className="text-blue-500" />{job.job_type}</span>}
        {job.work_mode && <span>{job.work_mode}</span>}
        {job.salary && <span>${job.salary}</span>}
        {job.experience && <span>{job.experience}</span>}
        {job.location && <span>{job.location}</span>}
      </div>

      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 flex-1">
        <div className="flex items-start gap-2">
          <Bot size={14} className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {job.reason || job.description}
          </p>
        </div>
      </div>

      {job.tags && (
        <ScrollArea className="w-full overflow-x-auto mb-4">
          <div className="flex gap-2">
            {job.tags.replace(/\[|\]|"/g, '').split(',').map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="whitespace-nowrap border-gray-300 text-gray-700 bg-gray-50 rounded-sm dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800/50"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <div className="mt-auto">
        <Button
          variant="default"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  )

  const renderAIResults = () => {
    if (!isAiLoading && !aiResults && !aiError) return null

    return (
      <div
        ref={aiResultsRef}
        className="absolute top-full left-0 mt-3 w-full max-w-[1000px] z-50 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl"
          style={{
            backdropFilter: 'blur(20px)',
          }}
        />
       
        <div
          className="relative bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.95) 100%)',
            ...(theme === 'dark' && {
              background: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(31,41,55,0.95) 100%)'
            })
          }}
        >
          <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/70 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-700/20 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AI Job Recommendations
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isAiLoading ? 'Analyzing your request...' : `Found ${aiResults?.length || 0} perfect matches`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAiResults(null)
                  setAiError(null)
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[600px] overflow-y-auto">
            {isAiLoading && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    AI is finding your perfect matches...
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <AIJobCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            )}

            {aiError && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Frown className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{aiError}</p>
                <Button
                  variant="outline"
                  onClick={handleAISearch}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Try Again
                </Button>
              </div>
            )}

            {!isAiLoading && !aiError && Array.isArray(aiResults) && aiResults.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No perfect matches yet</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Try refining your search or exploring different keywords.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setInputValue('')
                    setAiResults(null)
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Try New Search
                </Button>
              </div>
            )}

            {!isAiLoading && !aiError && aiResults?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiResults.map((job) => (
                  <AIJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!isDashboard) return <>{children}</>

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex h-screen w-full relative">
          <div className="relative">
            <AppSidebar />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="h-16 w-full border-b bg-white dark:bg-background border-blue-200 dark:border-blue-800 justify-between flex items-center px-4 relative">
              <div className="flex items-center gap-2 w-full relative">
                <SidebarTrigger />
                <div className="h-4 bg-border w-[1px] mx-2" />

                {isJobsPage && (
                  <div className="flex justify-center w-full relative">
                    <div
                      className={clsx(
                        'relative transition-all duration-500 w-full z-50',
                        aiMode ? 'max-w-[1000px]' : 'max-w-[850px]'
                      )}
                    >
                      <div
                        className={clsx(
                          'absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] h-3 rounded-full blur-lg transition-all duration-500 pointer-events-none',
                          aiMode
                            ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 opacity-60 animate-pulse'
                            : 'opacity-0'
                        )}
                      />

                      <div className="relative w-full bg-white dark:bg-neutral-900 rounded-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-20">
                          {aiMode ? (
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          ) : (
                            <Search className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        <Input
                          type="search"
                          placeholder={aiMode ? '' : 'Search for a job'}
                          className={clsx(
                            'pl-10 pr-12 relative z-10 transition-all duration-300',
                            aiMode && 'ring-2 ring-blue-500/40 focus:ring-blue-600 shadow-lg bg-white shadow-blue-100/20 dark:shadow-blue-900/20'
                          )}
                          value={inputValue}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                        />

                        {aiMode && !inputValue && (
                          <span
                            className={clsx(
                              'absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none select-none',
                              'text-blue-400 dark:text-blue-400 z-20 text-sm whitespace-nowrap',
                              fadeState === 'fade-in' ? 'opacity-100 transition-opacity duration-500' : 'opacity-0 transition-opacity duration-500'
                            )}
                            aria-hidden="true"
                          >
                            {rotatingWords[rotatingWordIndex]}
                          </span>
                        )}

                        {(isAiLoading || aiMode) && (
                          <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
                            {isAiLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                  <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                              </div>
                            ) : aiMode && (
                              <div className='bg-transparent'>
                              </div>
                            )}
                          </div>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={toggleAIMode}
                              className={clsx(
                                'absolute right-1 top-1/2 -translate-y-1/2 z-10 transition-all duration-300',
                                aiMode
                                  ? 'text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                              )}
                            >
                              <Sparkles size={18} className={aiMode ? 'animate-pulse' : ''} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-blue-600 text-white text-xs">
                            {aiMode ? 'AI search mode active' : 'Ask AI for your dream job'}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {aiMode && renderAIResults()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 relative z-40">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </Button>

                <NotificationsDialog/>
              </div>
            </div>

            <main className="flex-1 overflow-y-auto relative">
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  )
}

export default function SidebarWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full">
        <div className="h-full w-64 border-r bg-gray-50 dark:bg-gray-900">
          <div className="p-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b flex items-center px-4">
            <Skeleton className="h-9 w-full max-w-md" />
          </div>
          <div className="flex-1 p-4">
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}