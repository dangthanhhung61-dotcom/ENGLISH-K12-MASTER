
import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../services/storage';
import { Question, TestResult, User, QuestionType, AppSettings } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const TeacherDashboard: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'reports' | 'settings'>('questions');
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  
  // AI Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiGrade, setAiGrade] = useState(5);
  const [aiType, setAiType] = useState<QuestionType>('grammar');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(storage.getSettings());

  useEffect(() => {
    setQuestions(storage.getQuestions());
    setResults(storage.getResults());
    setStudents(storage.getUsers().filter(u => u.role === 'student'));
    setAppSettings(storage.getSettings());
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = filterGrade === 'all' || q.grade.toString() === filterGrade;
      const matchesType = filterType === 'all' || q.type === filterType;
      return matchesSearch && matchesGrade && matchesType;
    });
  }, [questions, searchQuery, filterGrade, filterType]);

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) {
      alert("Vui lòng nhập chủ đề để AI bắt đầu tạo!");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 1 English multiple-choice question for Grade ${aiGrade} level in Vietnam. 
        Topic: ${aiTopic}. 
        Type: ${aiType}. 
        The explanation must be in Vietnamese. 
        Ensure the question is academic and accurate.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of exactly 4 strings for options A, B, C, D."
              },
              correctAnswer: { type: Type.STRING, description: "Must exactly match one of the items in the options array." },
              explanation: { type: Type.STRING, description: "Detailed explanation in Vietnamese." }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      
      setEditingQuestion({
        ...data,
        grade: aiGrade,
        type: aiType
      });
      setAiTopic(''); 
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Có lỗi xảy ra khi tạo câu hỏi bằng AI. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      storage.saveQuestions(updated);
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    if (!editingQuestion.options?.includes(editingQuestion.correctAnswer || '')) {
      alert("Đáp án đúng phải trùng khớp với một trong các lựa chọn!");
      return;
    }

    let updated: Question[];
    if (editingQuestion.id) {
      updated = questions.map(q => q.id === editingQuestion.id ? (editingQuestion as Question) : q);
    } else {
      const newQ = { ...editingQuestion, id: `q${Date.now()}` } as Question;
      updated = [...questions, newQ];
    }

    setQuestions(updated);
    storage.saveQuestions(updated);
    setEditingQuestion(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(appSettings);
    alert("Cấu hình đã được lưu thành công!");
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'questions' ? 'text-[#000088] border-b-2 border-[#000088]' : 'text-slate-500 hover:text-[#000088]'}`}
        >
          Ngân hàng câu hỏi
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'reports' ? 'text-[#000088] border-b-2 border-[#000088]' : 'text-slate-500 hover:text-[#000088]'}`}
        >
          Báo cáo học tập
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'settings' ? 'text-[#000088] border-b-2 border-[#000088]' : 'text-slate-500 hover:text-[#000088]'}`}
        >
          Cấu hình
        </button>
      </div>

      {activeTab === 'questions' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#000088]/5 to-transparent p-6 rounded-2xl border border-[#000088]/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="text-[#000088]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/></svg>
              <h3 className="text-sm font-black text-[#000088] uppercase tracking-widest">Trợ lý ảo AI English</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Chủ đề (ví dụ: "Thì Hiện tại hoàn thành")</label>
                <input 
                  type="text" 
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Nhập chủ đề..."
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#000088]/20 focus:border-[#000088]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Khối lớp</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#000088]/20"
                  value={aiGrade}
                  onChange={(e) => setAiGrade(parseInt(e.target.value))}
                >
                  {[5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Khối {g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Dạng bài</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#000088]/20"
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value as QuestionType)}
                >
                  <option value="grammar">Grammar</option>
                  <option value="vocabulary">Vocabulary</option>
                  <option value="cloze">Cloze</option>
                </select>
              </div>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className={`w-full bg-[#000088] text-white py-2 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#000066] active:scale-95'}`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ĐANG TẠO...
                  </>
                ) : 'TẠO BẰNG AI'}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ngân hàng câu hỏi</h2>
            <button
              onClick={() => setEditingQuestion({ grade: 5, type: 'grammar', question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' })}
              className="bg-white border-2 border-[#000088] text-[#000088] px-6 py-2.5 rounded-lg font-bold hover:bg-[#000088] hover:text-white shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              THÊM THỦ CÔNG
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
            <div className="flex-grow min-w-[250px]">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tìm kiếm nội dung</label>
              <input 
                type="text" 
                placeholder="Tìm theo nội dung câu hỏi..." 
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#000088]/20 focus:border-[#000088]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Khối lớp</label>
              <select 
                className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#000088]/20"
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {[5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Dạng</label>
              <select 
                className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#000088]/20"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="cloze">Cloze</option>
              </select>
            </div>
            <button 
              onClick={() => { setSearchQuery(''); setFilterGrade('all'); setFilterType('all'); }}
              className="text-sm font-semibold text-[#000088] hover:underline px-2 py-2"
            >
              Đặt lại
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-bold">Khối</th>
                    <th className="px-6 py-4 font-bold">Dạng</th>
                    <th className="px-6 py-4 font-bold w-1/2">Nội dung câu hỏi</th>
                    <th className="px-6 py-4 font-bold">Đáp án</th>
                    <th className="px-6 py-4 font-bold text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        Không tìm thấy câu hỏi nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-bold text-[#000088]">Lớp {q.grade}</td>
                        <td className="px-6 py-4 text-xs font-semibold uppercase text-slate-400">
                          <span className="bg-slate-100 px-2 py-1 rounded">{q.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800 leading-relaxed">{q.question}</td>
                        <td className="px-6 py-4 text-sm font-black text-green-600">{q.correctAnswer}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => setEditingQuestion(q)} className="p-2 text-slate-400 hover:text-[#000088] hover:bg-[#000088]/5 rounded transition-all" title="Sửa">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Xóa">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Tiến độ học sinh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(s => {
              const studentResults = results.filter(r => r.studentId === s.userId);
              const avgScore = studentResults.length > 0 ? (studentResults.reduce((acc, curr) => acc + curr.score, 0) / studentResults.length).toFixed(1) : 0;
              return (
                <div key={s.userId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#000088]/10 flex items-center justify-center text-[#000088] font-black">
                      {s.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{s.fullName}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lớp {s.class}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-black">Trung bình</p>
                      <p className="text-xl font-black text-[#000088]">{avgScore}/10</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-black">Bài tập</p>
                      <p className="text-xl font-black text-slate-600">{studentResults.length}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cấu hình hệ thống</h2>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Số lượng câu hỏi mỗi bài kiểm tra</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    min="5" 
                    max="50" 
                    required
                    value={appSettings.questionsPerTest}
                    onChange={(e) => setAppSettings({ ...appSettings, questionsPerTest: parseInt(e.target.value) })}
                    className="w-32 border-2 border-slate-100 rounded-xl p-3 focus:border-[#000088] outline-none transition-colors font-bold text-lg text-center"
                  />
                  <p className="text-sm text-slate-400 italic">Mặc định là 10. Giới hạn từ 5 đến 50 câu.</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button 
                  type="submit" 
                  className="bg-[#000088] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#000066] shadow-lg shadow-[#000088]/20 transition-all active:scale-95"
                >
                  LƯU CẤU HÌNH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Modal Editor */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-0 shadow-2xl overflow-hidden">
            <div className="bg-[#000088] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-wider">
                {editingQuestion.id ? 'Cập nhật câu hỏi' : 'Kiểm tra câu hỏi AI / Thủ công'}
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Khối lớp</label>
                  <select
                    required
                    value={editingQuestion.grade}
                    onChange={e => setEditingQuestion({...editingQuestion, grade: parseInt(e.target.value)})}
                    className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-[#000088] outline-none transition-colors font-bold"
                  >
                    {[5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Khối {g}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Dạng câu hỏi</label>
                  <select
                    value={editingQuestion.type}
                    onChange={e => setEditingQuestion({...editingQuestion, type: e.target.value as QuestionType})}
                    className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-[#000088] outline-none transition-colors font-bold"
                  >
                    <option value="grammar">Grammar (Ngữ pháp)</option>
                    <option value="vocabulary">Vocabulary (Từ vựng)</option>
                    <option value="cloze">Cloze (Điền từ)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nội dung câu hỏi</label>
                <textarea
                  required
                  placeholder="Nhập đề bài tại đây..."
                  value={editingQuestion.question}
                  onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})}
                  className="w-full border-2 border-slate-100 rounded-xl p-4 min-h-[100px] focus:border-[#000088] outline-none transition-colors font-medium resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Lựa chọn & Đáp án đúng</label>
                <div className="grid grid-cols-1 gap-3">
                  {editingQuestion.options?.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-[#000088] flex-shrink-0">
                        {String.fromCharCode(65+idx)}
                      </div>
                      <input
                        required
                        placeholder={`Lựa chọn ${String.fromCharCode(65+idx)}...`}
                        value={opt}
                        onChange={e => {
                          const newOpts = [...(editingQuestion.options || [])];
                          newOpts[idx] = e.target.value;
                          const isCorrect = editingQuestion.correctAnswer === opt;
                          setEditingQuestion({
                            ...editingQuestion, 
                            options: newOpts,
                            correctAnswer: isCorrect ? e.target.value : editingQuestion.correctAnswer
                          });
                        }}
                        className="flex-grow border-2 border-slate-100 rounded-xl p-2.5 focus:border-[#000088] outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingQuestion({...editingQuestion, correctAnswer: opt})}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all border-2 ${editingQuestion.correctAnswer === opt && opt !== '' ? 'bg-[#00ff66] text-white border-[#00ff66]' : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'}`}
                      >
                        {editingQuestion.correctAnswer === opt && opt !== '' ? 'ĐÁP ÁN ĐÚNG' : 'CHỌN ĐÚNG'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Lời giải thích chi tiết (Tiếng Việt)</label>
                <textarea
                  placeholder="Giải thích tại sao đáp án đó lại đúng..."
                  value={editingQuestion.explanation}
                  onChange={e => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                  className="w-full border-2 border-slate-100 rounded-xl p-4 min-h-[80px] focus:border-[#000088] outline-none transition-colors font-medium text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingQuestion(null)} 
                  className="px-8 py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  HỦY BỎ
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3 bg-[#000088] text-white rounded-xl font-bold hover:bg-[#000066] shadow-lg shadow-[#000088]/20 transition-all active:scale-95"
                >
                  LƯU CÂU HỎI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
