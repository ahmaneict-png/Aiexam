
import React from 'react';
import { GradingReport } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ReportScreenProps {
  report: GradingReport;
  onGoHome: () => void;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ report, onGoHome }) => {
  const correctCount = report.gradedQuestions.filter(q => q.isCorrect).length;
  const total = report.gradedQuestions.length;
  const score = report.overallScore;

  const data = [
    { name: 'बरोबर', value: correctCount },
    { name: 'चुकीचे', value: total - correctCount },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  const sendWhatsAppResult = () => {
    const teacherNumber = '919766599780';
    const message = `*AI परीक्षा निकाल*\n\n` +
                    `*विद्यार्थी:* ${report.studentName}\n` +
                    `*विषय:* ${report.examTitle}\n` +
                    `*निकाल:* ${report.summary}\n` +
                    `*एकूण गुण:* ${report.overallScore}%`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${teacherNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="max-w-4xl w-full space-y-8 pb-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center border border-slate-100">
        <div className="mb-6 flex flex-col items-center">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">अंतिम निकाल</span>
            <h2 className="text-4xl font-extrabold text-slate-900">{report.studentName}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-10">
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-black text-slate-900">{score}%</span>
              <span className="text-xs text-slate-400 font-bold tracking-tighter uppercase">Score</span>
            </div>
          </div>
          
          <div className="text-left">
            <div className="p-6 bg-indigo-50/80 rounded-3xl border-2 border-indigo-100 shadow-sm">
                <h4 className="text-indigo-900 font-black text-lg mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    परीक्षेचा गोषवारा
                </h4>
                <div className="text-slate-800 font-bold text-lg leading-relaxed whitespace-pre-wrap">
                    {report.summary}
                </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
            onClick={sendWhatsAppResult}
            className="flex-1 max-w-sm px-8 py-5 bg-[#25D366] text-white font-black rounded-2xl hover:bg-[#128C7E] transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3 text-lg"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.149l-.664 2.43 2.483-.652c.816.512 1.83.839 2.922.839 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.766-5.766zm3.386 8.216c-.147.414-.727.76-1.13.805-.402.045-.902.164-2.593-.538-2.039-.845-3.355-2.92-3.456-3.055-.102-.135-.828-.999-.828-1.921 0-.922.484-1.375.656-1.571.173-.196.369-.245.492-.245.123 0 .245.002.352.006.111.004.258-.043.404.308.147.352.503 1.23.547 1.319.044.089.073.192.015.308-.058.117-.088.192-.176.293-.088.102-.185.228-.264.305-.088.089-.18.185-.078.357.102.172.454.75 0.974 1.21.67.593 1.233.777 1.405.863.172.086.273.071.374-.043.102-.115.432-.503.547-.674.116-.172.23-.143.388-.086.158.058 1.002.473 1.176.56.174.087.291.13.334.204.043.073.043.428-.104.842zM22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"/>
            </svg>
            व्हॉटसॲपवर पाठवा
            </button>

            <button 
            onClick={onGoHome}
            className="flex-1 max-w-sm px-8 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 text-lg"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            होम स्क्रीनवर जा
            </button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-800 px-4">प्रश्नांचे विश्लेषण (Quick Feedback)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.gradedQuestions.map((q, idx) => (
            <div key={q.id} className={`bg-white border-2 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between ${q.isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg
                        ${q.isCorrect ? 'bg-green-500 shadow-green-100' : 'bg-red-500 shadow-red-100'}`}>
                        {idx + 1}
                    </div>
                    <div className="flex-1">
                        <p className="text-lg font-bold text-slate-800 leading-tight line-clamp-2">{q.questionText}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className={`p-3 rounded-xl border-2 text-sm font-bold ${q.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        तुमचे उत्तर: {q.studentAnswer}
                    </div>
                    {!q.isCorrect && (
                        <div className="p-3 bg-indigo-50 border-2 border-indigo-200 text-indigo-900 rounded-xl text-sm font-bold">
                            अचूक उत्तर: {q.correctAnswer}
                        </div>
                    )}
                    <div className="p-3 bg-slate-50 rounded-xl border-2 border-slate-100 italic text-slate-600 text-sm font-medium">
                        {q.feedback}
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
