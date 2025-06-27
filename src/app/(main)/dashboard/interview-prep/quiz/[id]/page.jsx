'use client'


import { useParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'


const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default function QuizPage() {
 const { id } = useParams()
 const router = useRouter()


 const [quiz, setQuiz] = useState(null)
 const [loading, setLoading] = useState(true)
 const [currentIndex, setCurrentIndex] = useState(0)
 const [selectedAnswers, setSelectedAnswers] = useState({})
 const [finished, setFinished] = useState(false)
 const [saving, setSaving] = useState(false)
 const [saveError, setSaveError] = useState(null)


 useEffect(() => {
   const fetchQuiz = async () => {
     const { data, error } = await supabase
       .from('quizzes')
       .select()
       .eq('id', id)
       .single()


     if (data) {
       setQuiz(data)
       if (typeof data.progress === 'number' && data.progress < data.questions.length) {
         setCurrentIndex(data.progress)
       }
       if (data.selected_answers) {
         setSelectedAnswers(data.selected_answers)
       }
     } else {
       console.error(error)
     }


     setLoading(false)
   }


   if (id) fetchQuiz()
 }, [id])


 const questions = quiz?.questions || []
 const totalQuestions = questions.length
 const currentQuestion = questions[currentIndex]


 const handleSelect = (value) => {
   setSelectedAnswers((prev) => ({
     ...prev,
     [currentIndex]: value
   }))
 }


 const handleNext = async () => {
   if (currentIndex < totalQuestions - 1) {
     setCurrentIndex(currentIndex + 1)
   } else {
     setFinished(true)
     const correctCount = Object.entries(selectedAnswers).filter(
       ([idx, ans]) => questions[parseInt(idx)].answer === ans
     ).length
     const finalScore = Math.round((correctCount / totalQuestions) * 100)
     await saveScore(finalScore)
   }
 }


 const handleBack = () => {
   if (currentIndex > 0) {
     setCurrentIndex(currentIndex - 1)
   }
 }


 const saveProgressAndExit = async () => {
   setSaving(true)
   setSaveError(null)
   try {
     const { error } = await supabase
       .from('quizzes')
       .update({
         progress: currentIndex,
         selected_answers: selectedAnswers
       })
       .eq('id', id)


     if (error) throw error


     toast.success("Quiz Saved!")
   } catch (err) {
     setSaveError(err.message || 'Failed to save progress')
   } finally {
     setSaving(false)
   }
 }


 const saveScore = async (finalScore) => {
   setSaving(true)
   setSaveError(null)
   try {
     const { error } = await supabase
       .from('quizzes')
       .update({
         score: finalScore,
         progress: totalQuestions,
         selected_answers: selectedAnswers
       })
       .eq('id', id)


     if (error) throw error
   } catch (err) {
     setSaveError(err.message || 'Failed to save score')
   } finally {
     setSaving(false)
   }
 }


 const score = finished
   ? Math.round(
       (Object.entries(selectedAnswers).filter(
         ([idx, ans]) => questions[parseInt(idx)].answer === ans
       ).length /
         totalQuestions) *
         100
     )
   : null


 const handleRetake = () => {
   setSelectedAnswers({})
   setCurrentIndex(0)
   setFinished(false)
   setSaveError(null)
 }


 if (loading) return <p className="p-8">Loading quiz...</p>
 if (!quiz) return <p className="p-8">Quiz not found.</p>


 return (
  <Suspense fallback={<div className="p-4">Loading page...</div>}>

  
   <div className="md:px-10 mt-5 max-w-8xl mx-auto w-full">
     <Link
       href="/dashboard/interview-prep"
       className="flex text-sm items-center text-neutral-600 font-normal gap-2 group"
     >
       <ArrowLeft size={15} className="group-hover:translate-x-[-2px] transition duration-200" />
       <span>Back to Interview Preparation</span>
     </Link>


     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-5">
       <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400">
         Mock Interview
       </h1>
     </div>


     <div className="mt-2 mb-6">
       <h2 className="text-sm text-neutral-500">
         Test your knowledge by answering AI topic-based questions
       </h2>
     </div>


     {!finished ? (
       <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
         <CardContent className="py-2 space-y-6">
           <div className="flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
             <span className="font-semibold">
               Question {currentIndex + 1} of {totalQuestions}
             </span>
           </div>


           <h3 className="text-lg font-medium text-primary">
             {currentQuestion.question}
           </h3>


           <RadioGroup
             onValueChange={handleSelect}
             value={selectedAnswers[currentIndex] || ''}
             className="space-y-4 mt-4"
           >
             {currentQuestion.choices.map((choice, i) => (
               <div key={i} className="flex items-center gap-3 text-sm">
                 <RadioGroupItem
                   value={choice}
                   id={`choice-${i}`}
                   className="border-neutral-300 dark:border-neutral-700"
                 />
                 <Label
                   htmlFor={`choice-${i}`}
                   className="cursor-pointer select-none flex-1"
                 >
                   {choice}
                 </Label>
               </div>
             ))}
           </RadioGroup>


           <div className="flex justify-between items-center pt-6 border-t border-neutral-200 dark:border-neutral-700 mt-6">
             <Button
               variant="secondary"
               onClick={handleBack}
               disabled={currentIndex === 0}
             >
               ← Back
             </Button>


             <div className="flex gap-3">
               <Button
                 variant="secondary"
                 onClick={saveProgressAndExit}
                 disabled={saving}
               >
                 {saving ? 'Saving...' : 'Save & Exit'}
               </Button>
               <Button
                 onClick={handleNext}
                 disabled={!selectedAnswers[currentIndex] || saving}
               >
                 {currentIndex === totalQuestions - 1
                   ? saving
                     ? 'Saving...'
                     : 'Finish Quiz'
                   : 'Next'}
               </Button>
             </div>
           </div>


           {saveError && (
             <p className="mt-4 text-sm font-medium text-red-600">{saveError}</p>
           )}
         </CardContent>
       </Card>
     ) : (
       <div className="max-w-4xl mx-auto space-y-10">
         <div className="text-center">
           <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-fuchsia-600 to-pink-500">
             Quiz Completed!
           </h2>
           <p className="mt-4 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-500">
             Your Score: {score}%
           </p>
           <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-lg">
             Great job! Review your answers below or retake the quiz.
           </p>
         </div>


         <div className="space-y-6 max-h-[600px] overflow-y-auto px-2">
           {questions.map((q, idx) => {
             const userAnswer = selectedAnswers[idx]
             const isCorrect = userAnswer === q.answer


             return (
               <Card
                 key={idx}
                 className={`border ${
                   isCorrect
                     ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                     : 'border-red-400 bg-red-50 dark:bg-red-900/10'
                 } rounded-xl shadow-sm`}
               >
                 <CardContent className="p-6 space-y-2">
                   <p className="font-semibold text-primary text-lg">
                     Q{idx + 1}: {q.question}
                   </p>
                   <p className="text-sm">
                     Your Answer:{' '}
                     <span
                       className={`font-semibold ${
                         isCorrect ? 'text-green-600' : 'text-red-600'
                       }`}
                     >
                       {userAnswer || 'No answer selected'}
                     </span>
                   </p>
                   {!isCorrect && (
                     <p className="text-sm">
                       Correct Answer:{' '}
                       <span className="font-semibold">{q.answer}</span>
                     </p>
                   )}
                 </CardContent>
               </Card>
             )
           })}
         </div>


         <div className="flex justify-center gap-6 mt-4">
           <Button variant="outline" onClick={handleRetake}>
             Retake Quiz
           </Button>
           <Link href="/dashboard/interview-prep">
             <Button variant="secondary">Back to Interview Preparation</Button>
           </Link>
         </div>
       </div>
     )}
   </div>
   </Suspense>
 )
}





