
import React, { useState, useRef } from 'react';
import { Exam } from '../types';
import { storageService } from '../services/storageService';

interface StudentPanelProps {
  exams: Exam[];
  onSelectExam: (exam: Exam, name: string) => void;
  onBack: () => void;
  onRefresh: () => void;
}

const StudentPanel: React.FC<StudentPanelProps> = ({ exams, onSelectExam, onBack, onRefresh }) => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    if (selectedExam && name.trim()) {
      onSelectExam(selectedExam, name.trim());
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const exam = await storageService.importExam(content);
        setError(null);
        onRefresh(); // Refresh list to show new exam
        setSelectedExam(exam); // Auto-select it
      } catch (err: any) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <h2 className="text-3xl font-black text-slate-900">उपलब्ध परीक्षा</h2>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".exam,.json" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-indigo-50 text-indigo-700 font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 border-2 border-indigo-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            पेपर फाईल निवडा
          </button>
          <button onClick={onBack} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">परत जा</button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold">
          {error}
        </div>
      )}

      {selectedExam ? (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-3xl font-black mb-8 text-center text-slate-800 leading-tight">{selectedExam.title}</h3>
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-500 mb-3 uppercase tracking-widest">तुमचे पूर्ण नाव टाका:</label>
              <input 
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-5 text-xl rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold"
                placeholder="उदा. गणेश पाटील"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setSelectedExam(null)}
                className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
              >
                रद्द करा
              </button>
              <button 
                disabled={!name.trim()}
                onClick={handleStart}
                className="flex-[2] py-4 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100 disabled:opacity-30 hover:bg-indigo-700 transition-all"
              >
                परीक्षा सुरु करा
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.length === 0 ? (
            <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400 font-bold shadow-sm flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl">येथे कोणतीही परीक्षा दिसत नाही.</p>
              <p className="text-sm mt-2">शिक्षकांनी दिलेली '.exam' फाईल वरच्या बटणाने अपलोड करा.</p>
            </div>
          ) : (
            exams.map(exam => (
              <button 
                key={exam.id}
                onClick={() => setSelectedExam(exam)}
                className="group text-left bg-white p-8 rounded-[2.5rem] shadow-lg border-2 border-transparent hover:border-indigo-500 hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">पेपर सोडवा</div>
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-tighter">
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
