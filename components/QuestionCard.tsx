
import React from 'react';
import { Question, QuestionType } from '../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onAnswerChange: (questionId: number, answer: string) => void;
  value: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionNumber, onAnswerChange, value }) => {
  const { id, questionText, contextText, contextUrl, options, type, diagramUrl, optionsUrls } = question;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          प्रश्न {questionNumber}
        </span>
        {question.subject && (
          <span className="text-slate-400 text-sm font-semibold border-b border-slate-100">{question.subject}</span>
        )}
      </div>

      {/* Primary Context (Passage, Poem, Ad, Dialogue) */}
      {(contextUrl || contextText) && (
        <div className="mb-8 p-6 bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden">
          <span className="inline-block px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            खालील माहिती वाचून प्रश्नांची उत्तरे द्या
          </span>
          
          {contextUrl ? (
            <div className="flex justify-center bg-white rounded-xl p-2 border border-amber-100">
              <img 
                src={contextUrl} 
                alt="Context Information" 
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="text-slate-800 font-medium text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
              {contextText}
            </div>
          )}
        </div>
      )}

      {/* Specific Question Diagram */}
      {diagramUrl && (
        <div className="mb-6 p-6 bg-slate-100/50 rounded-2xl flex flex-col items-center border border-slate-200 shadow-inner">
          <span className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest">प्रश्न आकृती</span>
          <div className="w-full flex justify-center">
            <img 
              src={diagramUrl} 
              alt="Question Diagram" 
              className="max-w-full max-h-[300px] object-contain rounded-xl shadow-md border border-white"
            />
          </div>
        </div>
      )}
      
      <p className="text-xl md:text-2xl font-extrabold text-slate-800 leading-tight mb-8">
        {questionText}
      </p>
      
      {type === QuestionType.MULTIPLE_CHOICE && options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {options.map((option, index) => {
            const hasOptionUrl = optionsUrls && optionsUrls[index];
            return (
              <label 
                  key={index} 
                  className={`group relative flex flex-col p-6 rounded-[2rem] cursor-pointer border-2 transition-all duration-200 
                  ${value === option 
                      ? 'border-indigo-600 bg-indigo-50 shadow-lg ring-2 ring-indigo-200' 
                      : 'border-slate-100 bg-slate-50 hover:border-indigo-400 hover:bg-white hover:shadow-md'
                  }`}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${value === option ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' : 'border-slate-300'}`}>
                    <span className="text-xs font-black">{index + 1}</span>
                  </div>
                  <input
                    type="radio"
                    name={`question-${id}`}
                    value={option}
                    checked={value === option}
                    onChange={(e) => onAnswerChange(id, e.target.value)}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <span className={`text-lg block mb-4 ${value === option ? 'text-indigo-900 font-black' : 'text-slate-700 font-bold'}`}>
                      {option}
                    </span>
                    
                    {hasOptionUrl && (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex justify-center hover:border-indigo-500 transition-all overflow-hidden">
                            <img 
                              src={optionsUrls[index]} 
                              alt={`Option ${index+1} Diagram`} 
                              className="max-w-full max-h-[150px] object-contain"
                            />
                        </div>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
