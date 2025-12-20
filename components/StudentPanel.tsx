
import React, { useState } from 'react';
import { Exam } from '../types';

interface StudentPanelProps {
  exams: Exam[];
  onSelectExam: (exam: Exam, name: string) => void;
  onBack: () => void;
}

const StudentPanel: React.FC<StudentPanelProps> = ({ exams, onSelectExam, onBack }) => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [name, setName] = useState('');

  const handleStart = () => {
    if (selectedExam && name.trim()) {
      onSelectExam(selectedExam, name.trim());
    }
  };

  return (
    <div className="max-w-4xl w-full">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold text-slate-900">उपलब्ध परीक्षा</h2>
        <button onClick={onBack} className="text-slate-500 font-medium px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">परत जा</button>
      </div>

      {selectedExam ? (
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="text-2xl font-bold mb-6 text-center text-slate-800">निवडलेला पेपर: {selectedExam.title}</h3>
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">आपले पूर्ण नाव लिहा (सक्तीचे):</label>
              <input 
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 text-lg rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                placeholder="उदा. गणेश पाटील"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setSelectedExam(null)}
                className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
              >
                रद्द करा
              </button>
              <button 
                disabled={!name.trim()}
                onClick={handleStart}
                className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 disabled:opacity-30 disabled:shadow-none hover:bg-indigo-700 transition-all"
              >
                परीक्षा सुरु करा
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium shadow-sm">
              कोणतीही परीक्षा उपलब्ध नाही. कृपया शिक्षकांशी संपर्क साधा.
            </div>
          ) : (
            exams.map(exam => (
              <button 
                key={exam.id}
                onClick={() => setSelectedExam(exam)}
                className="group text-left bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 hover:border-indigo-500 hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">पेपर निवडा</div>
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">{exam.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                   एकूण प्रश्न: {exam.questions.length}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPanel;
