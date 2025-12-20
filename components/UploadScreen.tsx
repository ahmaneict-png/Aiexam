
import React, { useRef } from 'react';

interface UploadScreenProps {
  onFileSelect: (file: File) => void;
  error: string | null;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onFileSelect, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileSelect(event.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-xl w-full">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">आपली परीक्षा PDF अपलोड करा</h2>
        <p className="text-slate-500 mb-10 leading-relaxed">
          तुमची परीक्षा फाईल येथे ड्रॅग करा किंवा निवडा. AI आपोआप प्रश्न काढेल आणि तुमच्यासाठी एक डिजिटल टेस्ट तयार करेल.
        </p>
        
        <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl py-12 px-6 transition-all duration-300"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1">फाईल अपलोड करण्यासाठी क्लिक करा</p>
            <p className="text-slate-400 text-sm">केवळ PDF फाईल</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadScreen;
