
import React, { useState } from 'react';
import { Exam, StudentAnswers } from '../types';
import QuestionCard from './QuestionCard';

interface ExamScreenProps {
  exam: Exam;
  onSubmit: (answers: StudentAnswers) => void;
  studentName: string;
}

const ExamScreen: React.FC<ExamScreenProps> = ({ exam, onSubmit, studentName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswers>({});

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const goToNext = () => {
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const currentQuestion = exam.questions[currentIndex];

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between px-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
          <span>विद्यार्थी: {studentName}</span>
          <span>वेळ सुरु आहे...</span>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex flex-wrap gap-2 justify-center min-w-[300px]">
          {Array.from({ length: 75 }).map((_, i) => {
            const isTargeted = i < exam.questions.length;
            const q = isTargeted ? exam.questions[i] : null;
            const isAnswered = q && answers[q.id];
            const isCurrent = i === currentIndex;

            return (
              <button
                key={i}
                disabled={!isTargeted}
                onClick={() => isTargeted && setCurrentIndex(i)}
                className={`w-6 h-6 rounded-full text-[9px] flex items-center justify-center transition-all border shrink-0 font-bold
                  ${!isTargeted ? 'bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed' : 
                    isAnswered ? 'bg-green-500 border-green-600 text-white shadow-md shadow-green-100' : 
                    isCurrent ? 'bg-indigo-600 border-indigo-700 text-white scale-110 shadow-lg shadow-indigo-100' : 
                    'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
                  }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          onAnswerChange={handleAnswerChange}
          value={answers[currentQuestion.id] || ''}
      />

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex-1 max-w-[150px] py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-bold disabled:opacity-30 hover:bg-slate-50 transition-all"
        >
          मागील
        </button>
        
        {currentIndex === exam.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="flex-1 max-w-[250px] py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 animate-pulse"
          >
            परीक्षा पूर्ण झाली (सबमिट करा)
          </button>
        ) : (
          <button
            onClick={goToNext}
            className="flex-1 max-w-[180px] py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            पुढील
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamScreen;
