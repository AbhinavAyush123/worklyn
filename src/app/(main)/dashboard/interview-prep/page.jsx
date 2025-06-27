'use client'


import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
 Breadcrumb,
 BreadcrumbItem,
 BreadcrumbLink,
 BreadcrumbList,
 BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card , CardContent} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
 Dialog,
 DialogTrigger,
 DialogContent,
 DialogTitle,
 DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Trophy, Brain, XCircle, CheckCircle } from 'lucide-react'
import {
 LineChart,
 BarChart,
 Bar,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 AreaChart,
 Area,
} from 'recharts'
import { Badge } from '@/components/ui/badge'


const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL || '',
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)


export default function DashboardPage() {
 const router = useRouter()
 const { userId, isLoaded } = useAuth()


 const [quizzes, setQuizzes] = useState([])
 const [openNew, setOpenNew] = useState(false)
 const [topic, setTopic] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState(null)


 const [avgScore, setAvgScore] = useState(0)
 const [totalQuestions, setTotalQuestions] = useState(0)
 const [latestScore, setLatestScore] = useState(0)
 const [scoreTrend, setScoreTrend] = useState([])


 const [selectedQuiz, setSelectedQuiz] = useState(null)


 useEffect(() => {
   if (!isLoaded || !userId) return
   async function fetchQuizzes() {
     const { data, error } = await supabase
       .from('quizzes')
       .select('*')
       .eq('user_id', userId)
       .order('created_at', { ascending: false })


     if (error) {
       console.error(error)
       return
     }


     const qs = data || []
     setQuizzes(qs)


     const scores = qs.map(q => q.score).filter(s => typeof s === 'number')
     if (scores.length > 0) {
       setAvgScore(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))
       setLatestScore(scores[0])
       setScoreTrend(qs.slice(0, 6).reverse().map((q, i) => ({
         name: `Week ${i + 1}`,
         score: q.score,
         correct: Math.round((q.score / 100) * (q.questions?.length || 0)),
         incorrect: (q.questions?.length || 0) - Math.round((q.score / 100) * (q.questions?.length || 0)),
       })))
     } else {
       setAvgScore(0)
       setLatestScore(0)
       setScoreTrend([])
     }


     setTotalQuestions(qs.reduce((sum, q) =>
       sum + (Array.isArray(q.questions) ? q.questions.length : 0)
       , 0))
   }


   fetchQuizzes()
 }, [isLoaded, userId])


 const createQuiz = async () => {
   setLoading(true)
   setError(null)
   try {
     const res = await fetch('/api/generate-quiz', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ topic })
     })
     if (!res.ok) throw new Error((await res.json()).error)
     const { id } = await res.json()
     setOpenNew(false)
     router.push(`/dashboard/interview-prep/quiz/${id}`)
   } catch (e) {
     setError(e.message)
   } finally {
     setLoading(false)
   }
 }


 return (
   <div className="md:px-10 mt-7 max-w-8xl w-full">
           <Breadcrumb>
               <BreadcrumbList>
                 <BreadcrumbItem>
                   <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                 </BreadcrumbItem>
                 <BreadcrumbSeparator />
                 <BreadcrumbItem>
                   <BreadcrumbLink href="interview-prep">Inteview Preparation</BreadcrumbLink>
                 </BreadcrumbItem>
               </BreadcrumbList>
             </Breadcrumb>
     <div className="flex justify-between items-center  mb-4">
       <div>
         <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">
           Interview Preparation
         </h1>
         <p className="text-sm text-neutral-500 mt-1">Powered by AI</p>
       </div>
     </div>


     <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
       {/* Average Score Card */}
       <Card className="relative overflow-hidden border-none w-full p-5 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white shadow-md hover:shadow-xl transition duration-300">
         <div className="flex flex-col gap-2 z-10 relative">
           <div className="flex justify-between text-sm">
             <span>Average Score</span>
             <Trophy size={16} className="text-white" />
           </div>
           <p className="text-3xl font-bold">{avgScore}%</p>
         </div>
         <div className="absolute inset-0 rounded-2xl bg-radial-gradient opacity-20 pointer-events-none" />
       </Card>


       {/* Total Questions Card */}
       <Card className="relative overflow-hidden border border-neutral-200 dark:border-neutral-800 w-full p-5 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition duration-300 hover:ring-2 hover:ring-fuchsia-200/40 dark:hover:ring-fuchsia-500/20">
         <div className="flex flex-col gap-2 z-10 relative">
           <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
             <span>Questions Practiced</span>
             <Brain size={16} className="text-blue-600" />
           </div>
           <p className="text-3xl font-semibold text-primary">{totalQuestions}</p>
         </div>
       </Card>


       {/* Latest Score Card */}
       <Card className="relative overflow-hidden border border-neutral-200 dark:border-neutral-800 w-full p-5 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition duration-300 hover:ring-2 hover:ring-violet-200/40 dark:hover:ring-violet-500/20">
         <div className="flex flex-col gap-2 z-10 relative">
           <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
             <span>Latest Score</span>
             <Trophy size={16} className="text-blue-500" />
           </div>
           <p className="text-3xl font-semibold text-primary">{latestScore}%</p>
         </div>
       </Card>
     </div>




     <Card className="border-neutral-200 shadow-none px-5 border-dashed   mt-7 dark:border-none">
       <div className='flex flex-col gap-2'>


      
       <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400">
         Performance Trend
       </h2>
       <h3 className="text-sm text-neutral-500">Quiz scores over time</h3>


       <Tabs defaultValue="line" >
         <TabsList className="my-2">
           <TabsTrigger value="line">Line Graph</TabsTrigger>
           <TabsTrigger value="area">Area Graph</TabsTrigger>
         </TabsList>


         <TabsContent value="line">
           <div className="h-72 w-full">
             {scoreTrend.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={scoreTrend}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="name" />
                   <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
                   <Tooltip formatter={v => `${v}%`} />
                   <Line type="monotone" dataKey="score" stroke="#7e4cd7" strokeWidth={2} dot={{ r: 4 }} />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <p className="text-sm text-neutral-500">No data yet</p>
             )}
           </div>
         </TabsContent>


         <TabsContent value="area">
           <div className="h-72 w-full">
             {scoreTrend.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={scoreTrend}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="correct" stackId="a" fill="#7e4cd7" />
                 {/* <Bar dataKey="incorrect" stackId="a" fill="#ef4444" /> */}
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <p className="text-sm text-neutral-500">No data yet</p>
           )}


           </div>
         </TabsContent>
       </Tabs>
       </div>
     </Card>


     <div className="mt-10">
       <div className='flex w-full justify-between'>
         <div className='mb-10'>
           <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400">
             Recent Quizzes
           </h2>
           <p className='text-neutral-500'>
             Review your recent quizzes
           </p>
         </div>
         <Dialog open={openNew} onOpenChange={setOpenNew} >
           <DialogTrigger asChild>
             <Button variant="secondary" className="hover:bg-neutral-200">Start new quiz</Button>
           </DialogTrigger>
           <DialogContent>
             <DialogTitle>Enter quiz topic</DialogTitle>
             <Input
               placeholder="e.g. React, JS, Algorithms"
               value={topic}
               onChange={e => setTopic(e.target.value)}
             />
             {error && <p className="text-red-500 mt-2">{error}</p>}
             <DialogFooter>
               <Button onClick={createQuiz} disabled={loading || !topic.trim()}>
                 {loading ? 'Creating...' : 'Generate Quiz'}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>


       {quizzes.length === 0 && (
         <p className="text-sm text-muted-foreground">No quizzes found.</p>
       )}


       <div  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {quizzes.map(q => {
           const done = q.progress >= (q.questions?.length || 0)
           return (
             <Dialog
 key={q.id}
 open={!!selectedQuiz?.id && selectedQuiz.id === q.id}
 onOpenChange={(open) => {
   if (!open) setSelectedQuiz(null)
 }}
>
 <DialogTrigger asChild>
   <Card
 onClick={() =>
   done ? setSelectedQuiz(q) : router.push(`/dashboard/interview-prep/quiz/${q.id}`)
 }
 className="p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:shadow-md transition-shadow duration-200 rounded-2xl cursor-pointer group"
>
 <div className="flex items-center justify-between">
   <h3 className="text-xl font-semibold text-primary">
     {q.title || 'Quiz 1'}
   </h3>
   {done ? (
     <Badge className="bg-green-100 text-green-800 border border-green-400 px-2 py-0.5 rounded-md text-xs font-medium">
       Completed
     </Badge>
   ) : (
     <Badge className="bg-rose-100 text-rose-800 border border-rose-400 px-2 py-0.5 rounded-md text-xs font-medium">
       Incomplete
     </Badge>
   )}
 </div>


 <div className="mt-3 text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
   <p>
     <span className="font-medium">Score:</span>{' '}
     {done ? `${q.score}%` : 'Not completed'}
   </p>
   <p>
     <span className="font-medium">Date:</span>{' '}
     {new Date(q.created_at).toLocaleDateString()}
   </p>
 </div>


 <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400">
   <span className="font-medium text-neutral-800 dark:text-neutral-200">Topic:</span>{' '}
   {q.topic || 'No topic'}
 </div>
</Card>


 </DialogTrigger>


 {done && selectedQuiz?.id === q.id && (
   <DialogContent className="max-w-6xl  border-neutral-200">
     <DialogTitle className="text-2xl font-bold flex gap-2 items-center">
       <span className='bg-clip-text text-transparent  bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400'>
         Quiz Results
       </span>
         🏆
       </DialogTitle>


     <div className='w-full flex flex-col justify-center items-center'>
       <p className="mb-1 font-bold text-xl">{q.score}.0%</p>
       <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
         <div
           className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 transition-all"
           style={{ width: `${q.score || 0}%` }}
         />
       </div>
     </div>


     <div className="mt-8">
 <p className="mb-4 font-semibold text-lg text-neutral-800 dark:text-neutral-200">
   Question Breakdown
 </p>
 <ul className="space-y-4 max-h-72 overflow-y-auto pr-2">
   {(q.questions || []).map((question, i) => {
     const userAnswer = q.selected_answers?.[i] ?? null
     const correctAnswer = question.answer ?? null
     const isCorrect = userAnswer === correctAnswer


     return (
       <Card
         key={i}
         className="border border-neutral-200 dark:border-neutral-700 relative"
       >
         <CardContent className=" space-y-2">
           {/* Icon in top right */}
           <div className="absolute top-4 right-4">
             {isCorrect ? (
               <CheckCircle className="text-green-500" size={20} />
             ) : (
               <XCircle className="text-red-500" size={20} />
             )}
           </div>


           <p className="font-semibold text-primary">{question.question}</p>
           <p className="text-sm text-neutral-700 dark:text-neutral-300">
             <span className="font-medium">Your answer:</span>{' '}
             <span className={isCorrect ? 'text-green-600' : 'text-red-500'}>
               {userAnswer ?? 'No answer'}
             </span>
           </p>
           {!isCorrect && (
             <p className="text-sm text-neutral-700 dark:text-neutral-300">
               <span className="font-medium">Correct answer:</span>{' '}
               <span className="text-green-600">{correctAnswer}</span>
             </p>
           )}
         </CardContent>
       </Card>
     )
   })}
 </ul>
</div>


     <DialogFooter>
       <Button variant="secondary" onClick={() => setSelectedQuiz(null)}>
         Close
       </Button>
     </DialogFooter>
   </DialogContent>
 )}
</Dialog>


           )
         })}
       </div>
     </div>
   </div>
 )
}





