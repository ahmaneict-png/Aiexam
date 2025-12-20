
import React, { useState } from 'react';
import { Exam } from '../types';
import UploadScreen from './UploadScreen';

interface TeacherPanelProps {
  exams: Exam[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  uploadError: string | null;
  hasKey: boolean;
  onSelectKey: () => void;
}

const TeacherPanel: React.FC<TeacherPanelProps> = ({ exams, onUpload, onDelete, onBack, uploadError, hasKey, onSelectKey }) => {
  const [showUpload, setShowUpload] = useState(false);

  const downloadExamFile = (exam: Exam) => {
    const dataStr = JSON.stringify(exam);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${exam.title.replace(/\s+/g, '_')}_Paper.exam`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-5xl w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-black text-[#8e1b2e]">शिक्षक डॅशबोर्ड</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onSelectKey}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all ${hasKey ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200 animate-bounce'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
            {hasKey ? 'Key Active' : 'API Key निवडा'}
          </button>
          
          <button onClick={onBack} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">होम</button>
          
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="px-6 py-2 bg-[#8e1b2e] text-white font-black rounded-xl hover:bg-[#a62138] transition-all shadow-lg shadow-red-100"
          >
            {showUpload ? 'यादी पहा' : '+ नवीन पेपर बनवा'}
          </button>
        </div>
      </div>

      {!hasKey && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-sm">
            <p className="text-amber-800 font-black">महत्वाची सूचना:</p>
            <p className="text-amber-700 text-sm font-medium">प्रगत Gemini 3 प्रो मॉडेल्स वापरण्यासाठी तुम्हाला स्वतःची API Key निवडावी लागेल. कृपया वरील बटणावर क्लिक करा.</p>
        </div>
      )}

      {showUpload ? (
        <UploadScreen onFileSelect={onUpload} error={uploadError} />
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800">साठवलेले पेपर्स ({exams.length})</h3>
          </div>
          {exams.length === 0 ? (
            <div className="text-center py-24 text-slate-300 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl font-bold">अद्याप कोणतेही पेपर्स नाहीत.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map(exam => (
                <div key={exam.id} className="p-6 border-2 border-slate-50 bg-white rounded-[2rem] flex items-center justify-between hover:border-[#8e1b2e] transition-all group">
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 text-lg leading-tight mb-1">{exam.title}</h4>
                    <p className="text-xs text-[#8e1b2e] font-black uppercase tracking-widest">{exam.questions.length} प्रश्न</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadExamFile(exam)}
                      title="विद्यार्थ्यांसाठी डाऊनलोड करा"
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDelete(exam.id)}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherPanel;
