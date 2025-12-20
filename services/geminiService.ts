
import { GoogleGenAI, Type } from "@google/genai";
import { Exam, GradingReport, Question, StudentAnswers, QuestionType } from "../types";

const boxSchema = {
    type: Type.OBJECT,
    properties: {
        ymin: { type: Type.NUMBER, description: "Normalized y-min coordinate (0-1000)" },
        xmin: { type: Type.NUMBER, description: "Normalized x-min coordinate (0-1000)" },
        ymax: { type: Type.NUMBER, description: "Normalized y-max coordinate (0-1000)" },
        xmax: { type: Type.NUMBER, description: "Normalized x-max coordinate (0-1000)" }
    },
    required: ["ymin", "xmin", "ymax", "xmax"]
};

const examExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A suitable title for the exam strictly in Marathi."
        },
        questions: {
            type: Type.ARRAY,
            description: "Exactly 75 questions extracted from the document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    pageIndex: { type: Type.INTEGER, description: "0-based index of the PDF page where this question appears." },
                    contextText: { type: Type.STRING, description: "Full text of the passage, poem, or dialogue if available as text." },
                    contextBox: {
                        ...boxSchema,
                        description: "Bounding box for a visual passage, poem, dialogue, or advertisement block (crop area)."
                    },
                    questionText: { type: Type.STRING, description: "The full text of the question, including any sub-instructions." },
                    options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "List of 4 answer options."
                    },
                    diagramBox: {
                        ...boxSchema,
                        description: "Bounding box for any image, shape, or diagram that is part of the question."
                    },
                    optionsDiagramBoxes: {
                        type: Type.ARRAY,
                        description: "Bounding boxes for cases where options themselves are images (4 boxes).",
                        items: boxSchema
                    },
                    type: {
                        type: Type.STRING,
                        description: `Question type: '${QuestionType.MULTIPLE_CHOICE}'`
                    },
                    subject: { type: Type.STRING, description: "Subject: Marathi, English, Maths, or Intelligence Test." }
                },
                required: ["questionText", "options", "type", "pageIndex"]
            }
        }
    },
    required: ["title", "questions"]
};

export const extractExamFromPdf = async (pdfPagesAsImages: string[]): Promise<Exam> => {
    // Re-instantiate to get latest API Key from dialog
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const model = 'gemini-3-pro-preview';
    
    const prompt = `You are an expert at extracting Maharashtra State Council of Examination (MSCE) Scholarship papers.
    
    GOAL: Extract 75 questions with high spatial accuracy.
    
    VISUAL EXTRACTION RULES:
    1. CONTEXT: If a group of questions (e.g., Q1-3) is based on a passage (उतारा), poem (कविता), or ad (जाहिरात), you MUST provide either 'contextText' or a 'contextBox' for each of those questions.
    2. DIAGRAMS: If a question contains a math shape, clock, map, or any drawing, you MUST provide the 'diagramBox' coordinates.
    3. COORDINATES: All boxes must be [ymin, xmin, ymax, xmax] scaled 0-1000.
    4. LANGUAGE: Questions 1-25 are usually First Language/English, 26-75 are Maths/Intelligence. Keep the text in the original language (Marathi/English).
    
    IMPORTANT: If the PDF contains visual elements like tables or complex charts, use 'contextBox' to capture them as images.`;

    const imageParts = pdfPagesAsImages.map((imgData) => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: imgData,
        },
    }));

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: prompt }, ...imageParts] },
        config: {
            responseMimeType: "application/json",
            responseSchema: examExtractionSchema,
        }
    });

    try {
        const text = response.text;
        const parsedJson = JSON.parse(text);
        return {
            ...parsedJson,
            questions: parsedJson.questions.map((q: any, index: number) => ({ ...q, id: index }))
        };
    } catch (e) {
        console.error("JSON Parsing Error:", e, response.text);
        throw new Error("AI ने पाठवलेली माहिती वाचता आली नाही. कृपया पुन्हा प्रयत्न करा.");
    }
};

const gradingReportSchema = {
    type: Type.OBJECT,
    properties: {
        remedialMessage: { type: Type.STRING },
        gradedQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    isCorrect: { type: Type.BOOLEAN },
                    correctAnswer: { type: Type.STRING },
                    feedback: { type: Type.STRING }
                },
                required: ["id", "isCorrect", "correctAnswer", "feedback"]
            }
        }
    },
    required: ["remedialMessage", "gradedQuestions"]
};

export const generateAnswerKeyAndGrade = async (exam: Exam, studentAnswers: StudentAnswers, studentName: string): Promise<GradingReport> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const model = 'gemini-3-flash-preview';
    
    const examContext = exam.questions.map(q => ({
        id: q.id,
        question: q.questionText,
        options: q.options
    }));

    const prompt = `Grade this Maharashtra Scholarship Exam.
    Compare Student Answers to the Questions and determine the correct option for each.
    Provide constructive feedback in Marathi.
    
    EXAM DATA: ${JSON.stringify(examContext)}
    STUDENT ANSWERS: ${JSON.stringify(studentAnswers)}
    
    Note: Most scholarship questions have options 1, 2, 3, 4. Match the text or index.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: gradingReportSchema
        }
    });

    const parsedReport = JSON.parse(response.text);
    const totalQuestions = exam.questions.length;
    const correctCount = parsedReport.gradedQuestions.filter((q: any) => q.isCorrect).length;

    return { 
        examId: exam.id, 
        examTitle: exam.title,
        studentName: studentName,
        overallScore: Math.round((correctCount / totalQuestions) * 100),
        summary: `एकूण प्रश्न: ${totalQuestions}, बरोबर: ${correctCount}. ${parsedReport.remedialMessage}`,
        gradedQuestions: parsedReport.gradedQuestions.map((gradedQ: any) => {
            const originalQ = exam.questions.find(q => q.id === gradedQ.id);
            return { ...originalQ, ...gradedQ, studentAnswer: studentAnswers[gradedQ.id] || "दिलेले नाही" };
        })
    };
};
