import React, { useState, useEffect } from 'react';
import { AppView, Exam, StudentAnswers, GradingReport, Question, BoundingBox, QuestionType } from './types';
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

/**
 * पब्लिश करण्यासाठी सूचना:
 * १. शिक्षक पॅनलमध्ये जाऊन पेपर बनवा.
 * २. 'Copy Code' बटण दाबून पेपरचा कोड कॉपी करा.
 * ३. खालील रिकाम्या कंसात [] तो पेस्ट करा. (उदा. [ {id: '...', title: '...'} ])
 */
const PRESET_EXAMS: Exam[] = [
  {
    "id": "ac25ac9d-343d-4a51-a2b4-51c722512ee9",
    "timestamp": 1766247784341,
    "title": "पूर्व उच्च प्राथमिक शिष्यवृत्ती परीक्षा (इयत्ता 5 वी), फेब्रुवारी 2025 - माध्यम : मराठी - पेपर I",
    "questions": [
      {
        "id": 0,
        "questionText": "खाली दिलेल्या अर्थाचा योग्य वाक्प्रचार पर्यायांतून निवडा:\nशरण जाणे -",
        "options": ["नाकी नऊ येणे", "नाक ठेचणे", "नाक उडविणे", "नाक घासणे"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 1,
        "subject": "Marathi"
      },
      {
        "id": 1,
        "questionText": "खालील अक्षरे जुळवून अर्थपूर्ण शब्द बनवा व त्यातील शेवटचे अक्षर पर्यायांतून निवडा:\nग, वं, ज, त, र",
        "options": ["ग", "त", "र", "ज"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 1,
        "subject": "Marathi"
      },
      {
        "id": 2,
        "questionText": "कविताच्या धावण्याच्या गतीकडे विजेंद्र सिंग यांनी लक्ष पुरवले आणि त्याची प्रचिती म्हणजेच कविताचे यश.\nअधोरेखित शब्दासाठी योग्य समानार्थी शब्द पर्यायांतून निवडा:",
        "options": ["अनुभव", "अभिव्यक्ती", "अवधान", "अनुकरण"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 1,
        "subject": "Marathi"
      },
      {
        "id": 3,
        "questionText": "खालील आकृतीतील रिकाम्या जागी कोणत्या पर्यायातील अक्षरे क्रमाने घेतल्यास अर्थपूर्ण शब्द होतील?",
        "options": ["प, म, जा, रं", "रा, प, स, च", "रा, र, स, रं", "र, रा, न, ग"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 1,
        "diagramBox": { "ymin": 591, "xmin": 371, "ymax": 664, "xmax": 690 },
        "diagramUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/AARCAJQA2IDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAcBAgUGCAQDCf/EAGwQAAEDBAEDAwEDBgUJEAwJDQEAAgMEBQYRBwgSIRMxQVEUImEJFRYycYEjQpHR8BcYMzVVk6Gz0yQlJig4UmJyc3aCg5WxstI0Q0RFU2N0dZKjtMEZJyk5VleElJai4TY3RkhUZXeGwsPx/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EAB0RAQEBAQADAQEBAAAAAAAAAAARASESMUECYVH/2gAMAwEAAhEDEQA/AP1TREQEREBERARa3yHnNDxrg97yi6dxobVTPqZGs/Wfr2aPxJIA/Ern7DuqTkWGvtN05A4wdi2C3mZkFLeY6wSvpXSECI1Eetsa4kDuOtEjx76sqV1Ki+bJO8AjRaRsEH3C+iiiIiAiIgIiICIiJRERFEREBERAREQERESiIiKofAVvfr39/oFcfYqEOV+H+QckzunynCuS6nGW09MGmyVNMJ6KolaT+sNgta4aBI2fkIlTdvSuWlcW55JnOOmWupPzbfqGU0d0t7jt1NUs/WaD8tPhzXfLSD8rdUKIqH2XNOddSPIVXyPfMa4v45GY02OvEV1r6msFKwTdvcYYy4eXAEfj+GiChXS6LS+JuTqPljDaS+UlPNQyuc6GroKlvbNSTsJbJE8fBaQR/hW6IoiIgIiICIiCh9lQE++lctT5Lxa4Zrg93strvdTjtwqoe2G5Uf8AZIH72CPw+Dr42iVtQfshXKBuNpc24XvlsxXPsnGZWi6/wVsyOSnEErKkDZp5wCR94bLHb86IPnW537vZCrkREUREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAVDvR17/iqqjv1Tv20ggC9codQFDd6umoOFbPc6KOVzIqxmWRRiZoPh4a6MOGx50QCtG5B6rOaeLqe0TZHwnbKNl2uEVspC3KopO+okOmMPbGdftPhfXqZoc95C56wrj6zZbVYPiVba5rhU3Ohd2TTzMkIdEHAgghvYQAR+sSd60oM6uL5eOKocDxL9PI+TKukyClutPb6kBtzjdE77sbizYe15IAJHdvfgrcYrppvLfUSe0ngi19h87GYU/t/6Kx186kcvreVcmxa20tkxluLWaG618F+k75ap74/UMMbo3drQ3w0vHd5PtpePGOf+XMNrLNc+XMMtthxG+VkdDT1FBUd09vkk/sQnaXHYcfGxrR9wsF1qW+O2Z9x5WYrjFuvnIGSVDqCD860zJ6GWK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"
      },
      {
        "id": 4,
        "questionText": "‘काटे केतकीच्या झाडा । आत जन्मला केवडा ।’\nया ओवीची रचना कोणी केली आहे?",
        "options": ["संत तुकाराम", "संत शेख महमंद", "संत चोखामेळा", "संत जनाबाई"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 2,
        "subject": "Marathi"
      },
      {
        "id": 5,
        "questionText": "उत्कृष्ट, उतार, उत्तम, उतरण, उत्तेजन हे शब्द वर्णानुक्रमे लावल्यास मध्यभागी येणाऱ्या शब्दाचा पर्याय निवडा:",
        "options": ["उत्तम", "उतार", "उत्कृष्ट", "उतरण"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 2,
        "subject": "Marathi"
      },
      {
        "id": 6,
        "questionText": "खालील पर्यायांतील आलंकारिक नसलेला शब्द निवडा:",
        "options": ["बहिणाबाई", "कंसमामा", "अहिल्याबाई", "नारदमुनी"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 2,
        "subject": "Marathi"
      },
      {
        "id": 7,
        "questionText": "खाली दिलेल्या शब्दसमूहाबद्दल अचूक शब्द पर्यायांतून निवडा:\n‘तोंडातोंडी चालत आलेली गोष्ट’",
        "options": ["भाकडकथा", "हृदयद्रावक", "बिनबोभाट", "दंतकथा"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 2,
        "subject": "Marathi"
      },
      {
        "id": 8,
        "questionText": "प्राणी व त्यांचा निवारा यांच्या जोडीतील चुकीचा पर्याय निवडा:",
        "options": ["घोड्याचा - तबेला", "हत्तीचा - पिलखाना", "सिंहाची - जाळी", "पोपटाची - ढोली"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 2,
        "subject": "Marathi"
      },
      {
        "id": 9,
        "questionText": "खाली दिलेल्या पर्यायांतील चुकीची जोडी ओळखा.",
        "options": ["वेब - आंतरजाल", "युझर - वापरकर्ता", "डिस्क - तबकडी", "थ्रीडी - त्रिमिती"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 2,
        "subject": "Marathi"
      },
      {
        "id": 10,
        "questionText": "माणसांचे बाह्य सौंदर्य कशाने वाढत नाही?",
        "options": ["उंची वस्त्राने", "विचाराने", "मूल्यवान दागिन्याने", "दिखाऊ दागिन्याने"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 3,
        "contextBox": { "ymin": 150, "xmin": 88, "ymax": 305, "xmax": 915 },
        "contextText": "सौंदर्य तर विविध प्रकारचे असते. काहींचे रूप सुंदर असते, काही अलंकारांमुळे सुंदर दिसतात, काहींची वस्त्रे सुंदर असतात. प्रत्येकजण आपापल्या परीने सुंदर दिसण्याचा प्रयत्न करतो. वस्त्रे व मूल्यवान अलंकार ही साधने माणसाचे बाह्य सौंदर्य वाढवतात. शरीर शृंगारणे हे सोपे असते, त्यासाठी फार परिश्रम करण्याची आवश्यकता नसते. ज्यांना खरे दागिने मिळतात, ते खऱ्या दागिन्यांनी देह शृंगारतात. स्वस्त आणि दिखाऊ दागिन्यांनीसुद्धा देह शृंगारता येतो. अनेक लोक मिळेल त्या साधनांचा उपयोग करून आपले बाह्य रूप देखणे करण्याचा प्रयत्न करतात. देह सजवला, की आपण सुंदर झालो, अशी त्यांची कल्पना असते.",
        "subject": "Marathi"
      },
      {
        "id": 11,
        "questionText": "वरील उताऱ्याशी विसंगत असणारे विधान पुढीलपैकी कोणते?",
        "options": ["शरीर शृंगारण्यासाठी फार परिश्रम करावे लागतात.", "खऱ्या दागिन्यांनी देह सुंदर करता येतो.", "काया सजवली की आपण देखणे दिसतो.", "सुंदर अलंकारांमुळे आपले रूप सुंदर दिसते."],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 3,
        "contextBox": { "ymin": 150, "xmin": 88, "ymax": 305, "xmax": 915 },
        "subject": "Marathi"
      },
      {
        "id": 12,
        "questionText": "‘मेहनत करणे’ या अर्थाने कोणता वाक्प्रचार उताऱ्यात आलेला आहे?",
        "options": ["अलंकृत करणे", "कल्पना करणे", "शृंगार करणे", "परिश्रम करणे"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 3,
        "contextBox": { "ymin": 150, "xmin": 88, "ymax": 305, "xmax": 915 },
        "subject": "Marathi"
      },
      {
        "id": 13,
        "questionText": "आठवण कुठे लपलेली नसते?",
        "options": ["चैत्रपालवीत", "हृदयाच्या कप्प्यात", "सागराच्या निळाईत", "वसंतातल्या मोहरात"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 4,
        "contextBox": { "ymin": 140, "xmin": 200, "ymax": 445, "xmax": 800 },
        "contextText": "कधी आठवण लपलेली असते हृदयाच्या बंद कप्प्यात, कधी आठवण लपलेली असते वसंतातल्या गुलमोहरात. कधी ती लपलेली असते सागराच्या अथांग निळाईत, तर कधी ती लपलेली असते बहरलेल्या चैत्रपालवीत. या साऱ्यांभोवती फिरत असतो श्वास आपला मंद धुंद, आणि यातूनच मग दरवळतो तो आठवणीचा बकुळगंध.",
        "subject": "Marathi"
      },
      {
        "id": 14,
        "questionText": "पुढीलपैकी कोणत्या शब्दाचा समानार्थी शब्द कवितेत आला आहे?",
        "options": ["तन्मय", "उथळ", "विसर", "सरिता"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 4,
        "contextBox": { "ymin": 140, "xmin": 200, "ymax": 445, "xmax": 800 },
        "subject": "Marathi"
      },
      {
        "id": 15,
        "questionText": "आठवणींचा बकुळगंध असे का म्हटले असावे?",
        "options": ["खूप आठवणी असतात.", "त्या दीर्घकाळ स्मरणात राहतात.", "त्या वारंवार विसरतात.", "त्यांच्यामुळे श्वास मंदावतो."],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 4,
        "contextBox": { "ymin": 140, "xmin": 200, "ymax": 445, "xmax": 800 },
        "subject": "Marathi"
      },
      {
        "id": 16,
        "questionText": "खाली दिलेल्या ओळीतील क्रियापद ओळखा:\n‘गाणे गाऊन मला उठविसी मित्र जिवाचा खरा.’",
        "options": ["उठविसी", "गाऊन", "खरा", "गाणे"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 5,
        "subject": "Marathi"
      },
      {
        "id": 17,
        "questionText": "खाली दिलेल्या पर्यायांतून पुल्लिंगी शब्द ओळखा:",
        "options": ["पोळी", "थाळी", "माळी", "चाळी"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 5,
        "subject": "Marathi"
      },
      {
        "id": 18,
        "questionText": "खाली दिलेल्या पर्यायांतून वचनप्रकारानुसार वेगळा शब्द ओळखा:",
        "options": ["लिंबू", "संत्रे", "मूल", "देव"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 5,
        "subject": "Marathi"
      },
      {
        "id": 19,
        "questionText": "खाली दिलेल्या वाक्यातील उद्देश्य भाग ओळखा:\n‘खो-खोच्या आजच्या सामन्यात मानसीचा धाकटा मुलगा चांगला खेळला.’",
        "options": ["खो-खोच्या आजच्या सामन्यात", "मानसीचा धाकटा मुलगा", "खेळला", "चांगला खेळला"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 5,
        "subject": "Marathi"
      },
      {
        "id": 20,
        "questionText": "पुढे दिलेल्या शब्दांमध्ये एकूण किती अशुद्ध शब्द आलेले आहेत?\n(प्रशिक्षक, क्रिडामहोत्सव, निरिक्षण, वाहतूक, दुरचित्रवाणी, मानवनिर्मीत, शीर्षक, ग्रामगिता, खंजिरी)",
        "options": ["पाच", "चार", "दोन", "तीन"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 5,
        "subject": "Marathi"
      },
      {
        "id": 21,
        "questionText": "जत्रेसाठी गावोगावचे नामवंत ........... आले होते.",
        "options": ["कवी", "नर्तक", "कलाकार", "मल्ल"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 6,
        "subject": "Marathi"
      },
      {
        "id": 22,
        "questionText": "त्यांचे ........... पाहण्यासाठी लोकांनी तोबा गर्दी केली होती.",
        "options": ["नृत्य", "सादरीकरण", "द्वंद्व", "कलाविष्कार"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 6,
        "subject": "Marathi"
      },
      {
        "id": 23,
        "questionText": "प्रत्येकाची पिळदार ........... प्रेक्षकांचे लक्ष वेधून घेत होती.",
        "options": ["शैली", "शरीरयष्टी", "कला", "कविता"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 6,
        "subject": "Marathi"
      },
      {
        "id": 24,
        "questionText": "खाली दिलेल्या शब्दांत एक अर्थपूर्ण म्हण आहे. ती शोधून तिच्या योग्य अर्थाचा पर्याय निवडा:\n‘खाव्या अंदिली धार’",
        "options": ["शहाण्याला शब्दांचा मार.", "भपका मोठा, पण प्रत्यक्षात वागणूक शून्य.", "मोठ्या माणसात देखील दोष आढळतात.", "गरज एकीकडे मदत दुसरीकडे."],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 6,
        "subject": "Marathi"
      },
      {
        "id": 25,
        "questionText": "23 किग्रॅ 500 ग्रॅम + 21 किग्रॅ 750 ग्रॅम = किती?",
        "options": ["45 किग्रॅ 250 ग्रॅम", "45 किग्रॅ 750 ग्रॅम", "44 किग्रॅ 250 ग्रॅम", "44 किग्रॅ 750 ग्रॅम"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 8,
        "subject": "Maths"
      },
      {
        "id": 26,
        "questionText": "899999 + 1001 = किती ?",
        "options": ["890990", "900990", "901000", "891000"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 8,
        "subject": "Maths"
      },
      {
        "id": 27,
        "questionText": "3/4, 1/4, 7/4, 5/4, 9/4 या अपूर्णांकांची उतरत्या क्रमाने मांडणी केल्यास पहिला अपूर्णांक व मधला अपूर्णांक यांची बेरीज किती?",
        "options": ["3/2", "7/2", "4", "5/2"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 8,
        "subject": "Maths"
      },
      {
        "id": 28,
        "questionText": "शेखरने बाजारातून 45 रूपये प्रति किलोग्रॅम दराने अर्धा किलोग्रॅम टोमॅटो, 30 रूपये प्रति किलोग्रॅम दराने दीड किलोग्रॅम कांदे व 56 रूपये प्रति किलोग्रॅम दराने सव्वा किलोग्रॅम भेंडी खरेदी केली तर त्याने बाजारात एकूण किती रूपये खर्च केले?",
        "options": ["137 रूपये", "67.5 रूपये", "131 रूपये", "137.5 रूपये"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 8,
        "subject": "Maths"
      },
      {
        "id": 29,
        "questionText": "शाळेला सोमवार दिनांक 2 मे 2022 पासून 32 दिवसांची सुट्टी लागली तर सुट्टीनंतर शाळा कोणत्या वारी सुरू होईल?",
        "options": ["बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 10,
        "subject": "Maths"
      },
      {
        "id": 30,
        "questionText": "राहुलने 58500 रूपयांना घेतलेली मोटारसायकल 64250 रूपयांना विकली तर त्याला या व्यवहारात किती रूपये नफा अथवा तोटा झाला?",
        "options": ["5750 रूपये तोटा", "5750 रूपये नफा", "6250 रूपये नफा", "6250 रूपये तोटा"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 10,
        "subject": "Maths"
      },
      {
        "id": 31,
        "questionText": "इष्टिकाचितीला अनुक्रमे किती पृष्ठे व कडा असतात?",
        "options": ["6, 12", "6, 8", "8, 12", "8, 6"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 10,
        "subject": "Maths"
      },
      {
        "id": 32,
        "questionText": "सोबतच्या आकृतीत किती त्रिकोण तयार झाले आहेत?",
        "options": ["9", "10", "11", "13"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 10,
        "diagramBox": { "ymin": 529, "xmin": 218, "ymax": 716, "xmax": 466 },
        "subject": "Maths"
      },
      {
        "id": 33,
        "questionText": "द.सा.द.शे. 8 दराने 3500 रूपयांचे 2 वर्षांचे सरळव्याज किती?",
        "options": ["280 रूपये", "560 रूपये", "480 रूपये", "260 रूपये"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 12,
        "subject": "Maths"
      },
      {
        "id": 34,
        "questionText": "पोपटांची संख्या सुतारपक्ष्यांच्या संख्येपेक्षा कितीने जास्त आहे?",
        "options": ["4 ने जास्त", "12 ने जास्त", "16 ने जास्त", "28 ने जास्त"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 12,
        "subject": "Maths"
      },
      {
        "id": 35,
        "questionText": "मोरांची संख्या एकूण पक्ष्यांच्या शेकडा किती आहे?",
        "options": ["4%", "20%", "15%", "30%"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 12,
        "subject": "Maths"
      },
      {
        "id": 36,
        "questionText": "एका आयताची परिमिती 38 सेमी असून लांबी 12 सेमी आहे तर त्या आयताचे क्षेत्रफळ किती?",
        "options": ["456 चौ.सेमी.", "100 चौ.सेमी.", "312 चौ.सेमी.", "84 चौ.सेमी."],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 14,
        "subject": "Maths"
      },
      {
        "id": 37,
        "questionText": "जर M = 4 व N = 2 तर M × N + M ÷ N = किती?",
        "options": ["12", "10", "6", "8"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 14,
        "subject": "Maths"
      },
      {
        "id": 38,
        "questionText": "जॉनने 2 रीम कागदांपैकी 40 डझन कागद पुस्तक छपाईसाठी वापरले व आणखी 2 दस्ते कागद छपाई करताना खराब झाले तर किती कागद शिल्लक राहिले?",
        "options": ["38 डझन", "39 डझन", "20 दस्ते", "3 ग्रोस"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 14,
        "subject": "Maths"
      },
      {
        "id": 39,
        "questionText": "40 दशक × 10 दशक = किती?",
        "options": ["400 दशक", "4000 दशक", "400 हजार", "40 शतक"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 14,
        "subject": "Maths"
      },
      {
        "id": 40,
        "questionText": "खालीलपैकी कोणता अपूर्णांक आकृतीत रेखांकित केलेल्या भागाचा सममूल्य अपूर्णांक दर्शवितो?",
        "options": ["3/8", "5/8", "1/3", "5/9"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 14,
        "diagramBox": { "ymin": 530, "xmin": 230, "ymax": 690, "xmax": 450 },
        "subject": "Maths"
      },
      {
        "id": 41,
        "questionText": "खाली दिलेल्या पदावलीत चौकटीत अनुक्रमे कोणती चिन्हे येतील?\n15 [ ] 6 [ ] 8 [ ] 65 [ ] 5 = 50",
        "options": ["×, +, –, ÷", "+, –, ×, ÷", "–, +, ×, ÷", "+, ×, –, ÷"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 16,
        "subject": "Maths"
      },
      {
        "id": 42,
        "questionText": "6, 3, 0, 7 व 4 हे अंक प्रत्येकी एकदाच वापरून तयार होणाऱ्या पाच अंकी लहानात लहान सम संख्येची निमपट किती?",
        "options": ["1738", "30476", "15337", "15238"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 16,
        "subject": "Maths"
      },
      {
        "id": 43,
        "questionText": "आयुषने पावणेचार लाख रूपयांचा ट्रॅक्टर व सव्वापासष्ट हजार रूपयांचे मळणीयंत्र खरेदी केले, तर त्याने एकूण किती रूपये खर्च केले?",
        "options": ["490250 रूपये", "440250 रूपये", "439175 रूपये", "540250 रूपये"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 16,
        "subject": "Maths"
      },
      {
        "id": 44,
        "questionText": "7/17 - [ ] = 2/51 तर [ ] च्या जागी कोणता अपूर्णांक येईल?",
        "options": ["19/51", "5/51", "5/17", "19/17"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 16,
        "subject": "Maths"
      },
      {
        "id": 45,
        "questionText": "सई दररोज सकाळी 112 मीटर बाजू असलेल्या चौरसाकृती बागेला 5 फेऱ्या मारते तर सई दररोज किती अंतर चालते?",
        "options": ["448 मी", "560 मी", "2 किमी 240 मी", "1 किमी 792 मी"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 18,
        "subject": "Maths"
      },
      {
        "id": 46,
        "questionText": "सांगलीहून एक रेल्वे सोमवारी सकाळी 10 वा. 20 मिनिटांनी निघाली व दुसऱ्या दिवशी मंगळवारी दुपारी 2 वा. 15 मिनिटांनी अमरावतीला पोहचली तर त्या रेल्वेला अमरावतीला पोहचण्यास किती वेळ लागला?",
        "options": ["27 तास 55 मि.", "28 तास 5 मि.", "3 तास 55 मि.", "28 तास 55 मि."],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 18,
        "subject": "Maths"
      },
      {
        "id": 47,
        "questionText": "(प + 4) ही एक विषम संख्या आहे तर त्या संख्येनंतर क्रमाने येणारी सातवी सम संख्या कोणती?",
        "options": ["(प + 11)", "(प + 18)", "(प + 17)", "(प + 10)"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 18,
        "subject": "Maths"
      },
      {
        "id": 48,
        "questionText": "एक कपाट 5650 रूपयांना विकल्यास जेवढा तोटा होतो तेवढाच नफा ते कपाट 8350 रूपयांस विकल्यास होतो, तर कपाटाची खरेदी किमती किती?",
        "options": ["7100 रूपये", "7050 रूपये", "6950 रूपये", "7000 रूपये"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 18,
        "subject": "Maths"
      },
      {
        "id": 49,
        "questionText": "200 रूपयांच्या 40 नोटा देऊन 500 रूपयांच्या किती नोटा येईल?",
        "options": ["16", "18", "14", "160"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 20,
        "subject": "Maths"
      },
      {
        "id": 50,
        "questionText": "खालीलपैकी कोणती संख्या 17 ने विभाज्य नाही?",
        "options": ["217", "272", "153", "459"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 20,
        "subject": "Maths"
      },
      {
        "id": 51,
        "questionText": "शामरावांनी दुकानातून 1485 रूपयांचा किराणा घेतला. त्यांनी दुकानदाराला 5 रू., 10 रू., 50 रू. व 100 रूपयांच्या प्रत्येकी समान नोटा देऊन बिलाची नेमकी रक्कम दिली तर शामरावांनी दुकानदाराला एकूण किती नोटा दिल्या?",
        "options": ["9", "28", "36", "32"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 20,
        "subject": "Maths"
      },
      {
        "id": 52,
        "questionText": "एका संख्येला 25 ने भागल्यास भागाकार 26 येतो व बाकी 2 उरते. जर त्याच संख्येला 30 ने भागल्यास भागाकार व बाकी अनुक्रमे किती असेल?",
        "options": ["25, 7", "25, 4", "21, 22", "22, 8"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 20,
        "subject": "Maths"
      },
      {
        "id": 53,
        "questionText": "खालीलपैकी कोणत्या अपूर्णांकाचे पूर्णांकयुक्त अपूर्णांकात रूपांतर 3 5/7 होईल?",
        "options": ["35/7", "37/5", "22/7", "26/7"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 20,
        "subject": "Maths"
      },
      {
        "id": 54,
        "questionText": "एका बागेत निलगिरीची 36% झाडे आहेत. बागेत एकूण 450 झाडे असल्यास निलगिरीची झाडे किती?",
        "options": ["126", "144", "162", "180"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 22,
        "subject": "Maths"
      },
      {
        "id": 55,
        "questionText": "वर्तुळाच्या सर्वात मोठ्या जीवेची लांबी 15 सेंटीमीटर असल्यास त्या वर्तुळाच्या त्रिज्येची लांबी किती?",
        "options": ["30 सेमी", "7.5 सेमी", "15 सेमी", "8.5 सेमी"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 22,
        "subject": "Maths"
      },
      {
        "id": 56,
        "questionText": "60 या संख्येचे एकूण विभाजक हे 75 या संख्येच्या एकूण विभाजकांपेक्षा कितीने जास्त अथवा कमी आहेत?",
        "options": ["6 ने कमी", "6 ने जास्त", "4 ने जास्त", "4 ने कमी"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 22,
        "subject": "Maths"
      },
      {
        "id": 57,
        "questionText": "खाली दिलेल्या संख्यांच्या जोड्यांपैकी सहमूळ संख्यांच्या जोड्या किती?\n(15, 51); (16, 61); (21, 22); (17, 19)",
        "options": ["3", "4", "1", "2"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 22,
        "subject": "Maths"
      },
      {
        "id": 58,
        "questionText": "5.487 या दशांश अपूर्णांकातील अधोरेखित अंकांच्या स्थानिक किमतींचा गुणाकार किती?",
        "options": ["28", "0.28", "0.028", "0.0028"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 22,
        "subject": "Maths"
      },
      {
        "id": 59,
        "questionText": "56 मीटर लांबीच्या दोरीचे 8 मीटरचा एक याप्रमाणे समान लांबीचे तुकडे करण्यासाठी दोरी किती ठिकाणी कापावी लागेल?",
        "options": ["7", "8", "6", "4"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 24,
        "subject": "Maths"
      },
      {
        "id": 60,
        "questionText": "120 चे 15% = [ ] चे 12% तर [ ] = किती?",
        "options": ["200", "140", "250", "150"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 24,
        "subject": "Maths"
      },
      {
        "id": 61,
        "questionText": "सोबतच्या आकृतीत लघुकोनांची संख्या ही विशालकोनांपेक्षा कितीने जास्त आहे?",
        "options": ["7", "8", "6", "9"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 24,
        "diagramBox": { "ymin": 372, "xmin": 379, "ymax": 536, "xmax": 684 },
        "subject": "Maths"
      },
      {
        "id": 62,
        "questionText": "‘पावणे तेरा हजार’ ही संख्या आंतरराष्ट्रीय संख्या चिन्हात कशी लिहाल?",
        "options": ["१२७५०", "13750", "12750", "१३७५०"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 24,
        "subject": "Maths"
      },
      {
        "id": 63,
        "questionText": "7 6/100 हा अपूर्णांक दशांश अपूर्णांकाच्या स्वरूपात कसा लिहाल?",
        "options": ["7.06", "7.6", "6.07", "7.006"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 26,
        "subject": "Maths"
      },
      {
        "id": 64,
        "questionText": "खालीलपैकी असत्य विधान कोणते?",
        "options": ["त्रिमितीय वस्तूंची लांबी, रुंदी व उंची ही तीनही मापे मोजता येतात.", "त्रिमितीय वस्तूचा द्विमितीय आराखडा म्हणजे त्या वस्तूची घडण होय.", "सर्व त्रिमितीय वस्तू सर्व बाजूंनीसारख्या दिसतात.", "घनाची पृष्ठे चौरसाकृती असतात."],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 26,
        "subject": "Maths"
      },
      {
        "id": 65,
        "questionText": "पाच अंकी मोठ्यात मोठ्या संख्येतून कोणती संख्या वजा केल्यास चार अंकी सर्वात लहान विषम संख्या मिळेल?",
        "options": ["98998", "98999", "98888", "101000"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 26,
        "subject": "Maths"
      },
      {
        "id": 66,
        "questionText": "एक घड्याळ 4560 रूपयांस विकले तर व्यवहारात 470 रूपये नफा होतो तर घड्याळाची खरेदी किंमत किती?",
        "options": ["4110 रूपये", "5030 रूपये", "4090 रूपये", "4070 रूपये"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 26,
        "subject": "Maths"
      },
      {
        "id": 67,
        "questionText": "1 तास 22 मिनिटे 15 सेकंद = किती सेकंद?",
        "options": ["3637 सेकंद", "4935 सेकंद", "3622 सेकंद", "4920 सेकंद"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 26,
        "subject": "Maths"
      },
      {
        "id": 68,
        "questionText": "58721 मधील दशकस्थानच्या अंकाची स्थानिक किंमत हजारस्थानच्या अंकाच्या स्थानिक किंमतीच्या किती पट आहे?",
        "options": ["400", "1/400", "4000", "1/4000"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 28,
        "subject": "Maths"
      },
      {
        "id": 69,
        "questionText": "54718 मधील अधोरेखित अंकांच्या दर्शनी किंमतीचा गुणाकार किती?",
        "options": ["5", "500000", "50000", "50"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 28,
        "subject": "Maths"
      },
      {
        "id": 70,
        "questionText": "खालीलपैकी कोणते परस्पर रूपांतर चुकीचे आहे?",
        "options": ["537 मीटर = 5.37 हेक्टोमीटर", "23.5 डेसिमीटर = 235 सेंटीमीटर", "35 डेकामीटर = 0.35 किलोमीटर", "5725 सेंटीमीटर = 57.25 डेकामीटर"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 28,
        "subject": "Maths"
      },
      {
        "id": 71,
        "questionText": "5, 0, 4, 8 व 6 हे अंक प्रत्येकी एकदाच वापरून 8 ने नि:शेष भाग जाणारी पाच अंकी मोठ्यात मोठी संख्या कोणती?",
        "options": ["86540", "80456", "86504", "65408"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 28,
        "subject": "Maths"
      },
      {
        "id": 72,
        "questionText": "रशिदने 37 रूपये प्रति किलोग्रॅम दराने 27 किलोग्रॅम साखर खरेदी केली. त्याने सर्व साखर 940 रूपयांस विकली तर त्याला किती रूपये नफा अथवा तोटा झाला?",
        "options": ["49 रूपये नफा", "49 रूपये तोटा", "59 रूपये नफा", "59 रूपये तोटा"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 30,
        "subject": "Maths"
      },
      {
        "id": 73,
        "questionText": "द.सा.द.शे. 12 1/2 दराने 6000 रूपयांचे सरळव्याज 3750 रूपये होण्यासाठी किती कालावधी लागेल?",
        "options": ["4 वर्षे", "3 वर्षे", "6 वर्षे", "5 वर्षे"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 30,
        "subject": "Maths"
      },
      {
        "id": 74,
        "questionText": "आरोहीने दुकानातून 17 रूपयांचे दही, 72 रूपयांचे दूध व पावणेछप्पन्न रूपयांचे पनीर घेतले व दुकानदाराला दोनशे रूपयांची नोट दिली तर दुकानदार आरोहीला किती रूपये परत करेल?",
        "options": ["54.25", "55.75", "55.25", "53.5"],
        "type": QuestionType.MULTIPLE_CHOICE,
        "pageIndex": 30,
        "subject": "Maths"
      }
    ]
  }
];

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
      // Combine hardcoded preset exams with locally saved ones
      const combined = [...PRESET_EXAMS.map(e => ({ ...e, isPreset: true })), ...allExams];
      setExams(combined);
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
      setError("कृपया आधी 'API Key' निवडा.");
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
        const pIdx = q.pageIndex !== undefined ? q.pageIndex : 0;
        const pageImg = pageImages[pIdx] || pageImages[0];
        
        let contextUrl = undefined;
        let diagramUrl = undefined;
        let optionsUrls = undefined;

        if (q.contextBox && pageImg) contextUrl = await cropImage(pageImg, q.contextBox);
        if (q.diagramBox && pageImg) diagramUrl = await cropImage(pageImg, q.diagramBox);
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
      setError(err.message || 'काहीतरी चुकले.');
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
            const viewport = page.getViewport({ scale: 2.5 });
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
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleDeleteExam = async (id: string) => {
    if (window.confirm('हा पेपर कायमचा हटवायचा आहे का?')) {
      await storageService.deleteExam(id);
      await loadExams();
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
      setError('निकाल तयार करताना त्रुटी आली.');
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
        return <StudentPanel exams={exams} onRefresh={loadExams} onSelectExam={(e, name) => { setCurrentExam(e); setStudentName(name); setView(AppView.TAKING_EXAM); }} onBack={() => setView(AppView.HOME)} />;
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
