
import React, { useState } from 'react';

interface TeacherAuthProps {
  onAuthSuccess: () => void;
  onBack: () => void;
}

const TeacherAuth: React.FC<TeacherAuthProps> = ({ onAuthSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Updated password to Ahm123 as requested
    if (password === 'Ahm123') {
      onAuthSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-center">शिक्षक लॉगिन</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">पासवर्ड टाका</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className={`w-full p-3 rounded-xl border ${error ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none`}
            placeholder="पासवर्ड येथे टाका"
          />
          {error && <p className="text-red-500 text-xs mt-1">चुकीचा पासवर्ड. पुन्हा प्रयत्न करा.</p>}
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">लॉगिन</button>
        <button type="button" onClick={onBack} className="w-full text-slate-500 font-medium py-2">परत जा</button>
      </form>
    </div>
  );
};

export default TeacherAuth;
