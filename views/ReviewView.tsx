import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { TestResult, User, Question } from '../types';

interface ReviewViewProps {
  user: User;
  onBack: () => void;
}

const ReviewView: React.FC<ReviewViewProps> = ({ user, onBack }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'mistakes'>('history');

  useEffect(() => {
    const allResults = storage.getResults().filter(r => r.studentId === user.userId);
    // Sort results by date descending
    setResults(allResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setQuestions(storage.getQuestions());
  }, [user.userId]);

  // Identify questions frequently failed (more than once)
  const failedQuestionIds = results.flatMap(r => r.details.filter(d => !d.isCorrect).map(d => d.questionId));
  const failedCounts = failedQuestionIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topFailedIds = Object.entries(failedCounts)
    // Fix: Use explicit type casting to ensure TS correctly identifies values as numbers for subtraction
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([id]) => id);

  const failedQuestions = topFailedIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as Question[];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-[#000088] uppercase tracking-wider">Khu vực Ôn tập</h2>
        <button onClick={onBack} className="text-slate-500 font-semibold hover:text-[#000088]">← Quay lại</button>
      </div>

      <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-xl">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-4 font-bold transition-all ${activeTab === 'history' ? 'text-[#000088] border-b-4 border-[#000088]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Lịch sử làm bài
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-6 py-4 font-bold transition-all ${activeTab === 'mistakes' ? 'text-[#000088] border-b-4 border-[#000088]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Luyện sai ({failedQuestions.length})
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-sm border border-slate-100 border-t-0">
        {activeTab === 'history' ? (
          <div className="space-y-4">
            {results.length === 0 ? (
              <p className="text-center py-10 text-slate-400 italic">Bạn chưa làm bài kiểm tra nào.</p>
            ) : (
              results.map(res => (
                <div key={res.resultId} className="flex items-center justify-between p-4 border rounded-xl hover:border-[#000088]/30 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">Khối lớp {res.grade}</p>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{new Date(res.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#000088]">{res.score}/10</p>
                    <p className="text-xs font-bold text-slate-400">ĐIỂM SỐ</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
             {failedQuestions.length === 0 ? (
              <p className="text-center py-10 text-slate-400 italic">Chúc mừng! Bạn chưa có câu hỏi sai nào cần luyện tập.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <p className="text-sm text-slate-500 mb-2 italic">Dưới đây là các câu hỏi bạn thường xuyên chọn sai. Hãy ôn lại thật kỹ!</p>
                {failedQuestions.map(q => (
                  <div key={q.id} className="p-6 bg-red-50/30 border border-red-100 rounded-xl space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold bg-[#ff0088] text-white px-2 py-1 rounded uppercase">Lớp {q.grade} - {q.type}</span>
                      <span className="text-xs font-bold text-red-400">Bị sai {failedCounts[q.id]} lần</span>
                    </div>
                    <p className="font-bold text-slate-800">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`p-2 text-sm rounded border ${opt === q.correctAnswer ? 'bg-green-100 border-green-200 font-bold text-green-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                          {opt} {opt === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-white/50 border-l-4 border-[#000088] rounded-r">
                      <p className="text-xs font-bold text-[#000088] uppercase">Lời giải:</p>
                      <p className="text-sm text-slate-600">{q.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewView;