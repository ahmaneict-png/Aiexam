
import React, { useState, useEffect } from 'react';
import { AppView, Exam, StudentAnswers, GradingReport, Question, BoundingBox } from './types';
import Header from './components/Header';
import UploadScreen from './components/UploadScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ExamScreen from './components/ExamScreen';
import ReportScreen from './components/ReportScreen';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';
import TeacherAuth from './components/TeacherAuth';
import WelcomeScreen from './components/WelcomeScreen';
import { extractExamFromPdf, generateAnswerKeyAndGrade } from './services/geminiService';
import { storageService } from './services/storageService';

declare const pdfjsLib: any;
declare const window: any;

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [gradingReport, setGradingReport] = useState<GradingReport | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);

  const checkKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  useEffect(() => {
    checkKey();
    loadExams();
  }, [view]);

  const loadExams = async () => {
    try {
      const allExams = await storageService.getAllExams();
      setExams(allExams);
    } catch (err) {
      console.error("Failed to load exams", err);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const cropImage = async (base64Str: string, box: BoundingBox): Promise<string> => {
    if (!box || box.ymin === undefined) return '';
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');

        const width = img.width;
        const height = img.height;

        // Ensure box values are safe
        const ymin = Math.max(0, box.ymin);
        const xmin = Math.max(0, box.xmin);
        const ymax = Math.min(1000, box.ymax);
        const xmax = Math.min(1000, box.xmax);

        const sx = (xmin / 1000) * width;
        const sy = (ymin / 1000) * height;
        const sw = ((xmax - xmin) / 1000) * width;
        const sh = ((ymax - ymin) / 1000) * height;

        if (sw <= 0 || sh <= 0) return resolve('');

        canvas.width = sw;
        canvas.height = sh;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve('');
      img.src = `data:image/jpeg;base64,${base64Str}`;
    });
  };

  const handleUpload = async (file: File) => {
    if (!hasKey) {
      setError("कृपया आधी 'API Key' निवडा. (डॅशबोर्डवर 'API Key निवडा' बटण आहे)");
      return;
    }

    setError(null);
    setView(AppView.UPLOADING);
    setLoadingMessage('PDF मधून प्रश्न, उतारे आणि आकृत्या शोधत आहे...');
    
    try {
      const pageImages = await convertPdfToImages(file);
      const exam = await extractExamFromPdf(pageImages);
      
      setLoadingMessage('आकृत्या आणि मजकूर तयार करत आहे...');
      const processedQuestions = await Promise.all(exam.questions.map(async (q) => {
        // AI might give a page index, if not default to 0
        const pIdx = q.pageIndex !== undefined ? q.pageIndex : 0;
        const pageImg = pageImages[pIdx] || pageImages[0];
        
        let contextUrl = undefined;
        let diagramUrl = undefined;
        let optionsUrls = undefined;

        if (q.contextBox && pageImg) {
            contextUrl = await cropImage(pageImg, q.contextBox);
        }

        if (q.diagramBox && pageImg) {
            diagramUrl = await cropImage(pageImg, q.diagramBox);
        }

        if (q.optionsDiagramBoxes && q.optionsDiagramBoxes.length > 0 && pageImg) {
            optionsUrls = await Promise.all(q.optionsDiagramBoxes.map(box => cropImage(pageImg, box)));
        }

        return { ...q, contextUrl, diagramUrl, optionsUrls };
      }));

      const generateId = () => {
        try { return crypto.randomUUID(); } catch(e) { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
      };

      const newExam: Exam = {
        ...exam,
        id: generateId(),
        timestamp: Date.now(),
        questions: processedQuestions
      };

      await storageService.saveExam(newExam);
      await loadExams();
      setView(AppView.TEACHER_PANEL);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'काहीतरी चुकले.';
      if (msg.includes("permission") || msg.includes("403")) {
        msg = "तुमच्या API Key ला परवानगी नाही. कृपया दुसरी 'Paid' की निवडा.";
        setHasKey(false);
      }
      setError(msg);
      setView(AppView.TEACHER_PANEL);
    }
  };

  const convertPdfToImages = async (file: File): Promise<string[]> => {
    const images: string[] = [];
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        try {
          if (!pdfjsLib) throw new Error("PDF Library missing");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;
          const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.5 }); // Higher scale for better OCR/Cropping
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            if (context) {
              await page.render({ canvasContext: context, viewport: viewport }).promise;
              images.push(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
            }
          }
          resolve(images);
        } catch (err) { reject(err); }
      };
      fileReader.onerror = () => reject(new Error("File read error"));
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleDeleteExam = async (id: string) => {
    if (window.confirm('हा पेपर कायमचा हटवायचा आहे का?')) {
      try {
        await storageService.deleteExam(id);
        await loadExams();
      } catch (err) {
        alert("पेपर हटवताना तांत्रिक अडथळा आला.");
      }
    }
  };

  const handleExamSubmit = async (answers: StudentAnswers) => {
    if (!currentExam) return;
    setView(AppView.UPLOADING); 
    setLoadingMessage('तुमचे उत्तर तपासून निकाल तयार करत आहे...');
    try {
      const report = await generateAnswerKeyAndGrade(currentExam, answers, studentName);
      setGradingReport(report);
      setView(AppView.VIEWING_REPORT);
    } catch (err: any) {
      setError('निकाल तयार करताना त्रुटी आली. कदाचित सर्व्हर व्यस्त आहे.');
      setView(AppView.TAKING_EXAM);
    }
  };

  const renderContent = () => {
    switch (view) {
      case AppView.HOME:
        return <WelcomeScreen onSelectTeacher={() => setView(AppView.TEACHER_AUTH)} onSelectStudent={() => setView(AppView.STUDENT_PANEL)} />;
      case AppView.TEACHER_AUTH:
        return <TeacherAuth onAuthSuccess={() => setView(AppView.TEACHER_PANEL)} onBack={() => setView(AppView.HOME)} />;
      case AppView.TEACHER_PANEL:
        return <TeacherPanel exams={exams} onUpload={handleUpload} onDelete={handleDeleteExam} onBack={() => setView(AppView.HOME)} uploadError={error} hasKey={hasKey} onSelectKey={handleSelectKey} />;
      case AppView.STUDENT_PANEL:
        return <StudentPanel exams={exams} onSelectExam={(e, name) => { setCurrentExam(e); setStudentName(name); setView(AppView.TAKING_EXAM); }} onBack={() => setView(AppView.HOME)} />;
      case AppView.UPLOADING:
        return <LoadingIndicator message={loadingMessage} />;
      case AppView.TAKING_EXAM:
        return currentExam ? <ExamScreen exam={currentExam} onSubmit={handleExamSubmit} studentName={studentName} /> : null;
      case AppView.VIEWING_REPORT:
        return gradingReport ? <ReportScreen report={gradingReport} onGoHome={() => setView(AppView.HOME)} /> : null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header onHome={() => setView(AppView.HOME)} />
      <main className="flex-grow flex items-center justify-center p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
