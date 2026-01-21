
import React, { useState, useEffect } from 'react';
import { Question, User, TestResult, TestDetail } from '../types';
import { storage } from '../services/storage';

interface TestingViewProps {
  user: User;
  grade: number;
  onComplete: () => void;
}

const TestingView: React.FC<TestingViewProps> = ({ user, grade, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [details, setDetails] = useState<TestDetail[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const settings = storage.getSettings();
    const all = storage.getQuestions().filter(q => q.grade === grade);
    const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, settings.questionsPerTest);
    setQuestions(shuffled);
  }, [grade]);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const handleConfirm = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    const correct = selectedAnswer === questions[currentIndex].correctAnswer;
    setDetails([...details, {
      questionId: questions[currentIndex].id,
      userChoice: selectedAnswer,
      isCorrect: correct
    }]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const score = details.filter(d => d.isCorrect).length;
    const result: TestResult = {
      resultId: `r${Date.now()}`,
      studentId: user.userId,
      grade,
      score,
      date: new Date().toISOString().split('T')[0],
      details
    };
    storage.saveResult(result);
    setIsFinished(true);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 italic">Không có câu hỏi nào cho khối lớp này. Vui lòng quay lại sau.</p>
        <button onClick={onComplete} className="mt-4 text-[#000088] underline">Quay lại Dashboard</button>
      </div>
    );
  }

  if (isFinished) {
    const score = details.filter(d => d.isCorrect).length;
    const total = questions.length;
    const ratio = score / total;
    
    let rank = '';
    if (ratio >= 0.9) rank = 'Xuất sắc';
    else if (ratio >= 0.7) rank = 'Tốt';
    else if (ratio >= 0.5) rank = 'Cần cố gắng';
    else rank = 'Cần luyện tập thêm';

    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-[#000088] text-white p-8 text-center">
          <h2 className="text-2xl font-black uppercase mb-1">Kết quả bài làm</h2>
          <p className="opacity-70 text-sm">Lớp {grade} - {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <div className="p-8 text-center space-y-6">
          <div>
            <span className="text-6xl font-black text-[#000088]">{score}</span>
            <span className="text-2xl text-slate-400 font-bold">/{total}</span>
          </div>
          <div className="py-3 px-6 rounded-full inline-block bg-slate-100 text-[#000088] font-bold text-lg border-2 border-[#000088]/20">
            {rank}
          </div>
          <div className="pt-6">
            <button
              onClick={onComplete}
              className="w-full bg-[#000088] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#000066] transition-colors"
            >
              HOÀN THÀNH & QUAY LẠI
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-[#000088] uppercase tracking-widest">Kiểm tra khối {grade}</h2>
          <p className="text-slate-500 text-sm">Câu hỏi {currentIndex + 1} / {questions.length}</p>
        </div>
        <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#000088] transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ";
              if (isAnswered) {
                if (opt === currentQ.correctAnswer) {
                  btnClass += "bg-[#00ff66]/10 border-[#00ff66] text-[#008833]";
                } else if (opt === selectedAnswer) {
                  btnClass += "bg-[#ff0088]/10 border-[#ff0088] text-[#880044]";
                } else {
                  btnClass += "bg-slate-50 border-slate-100 opacity-50";
                }
              } else {
                if (selectedAnswer === opt) {
                  btnClass += "bg-[#000088]/5 border-[#000088] text-[#000088] shadow-md";
                } else {
                  btnClass += "bg-white border-slate-100 hover:border-slate-300";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${selectedAnswer === opt ? 'bg-[#000088] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isAnswered && (
          <div className="bg-slate-50 p-8 border-t border-slate-100">
            <div className="flex gap-4 items-start">
              <div className={`p-2 rounded-lg ${selectedAnswer === currentQ.correctAnswer ? 'bg-[#00ff66]/20' : 'bg-[#ff0088]/20'}`}>
                 <span className="font-bold text-xs uppercase">{selectedAnswer === currentQ.correctAnswer ? 'Đúng' : 'Sai'}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Lời giải thích:</p>
                <p className="text-sm text-slate-600 mt-1 italic">{currentQ.explanation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 flex justify-end">
          {!isAnswered ? (
            <button
              onClick={handleConfirm}
              disabled={!selectedAnswer}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${selectedAnswer ? 'bg-[#000088] text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              XÁC NHẬN
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-[#000088] text-white rounded-xl font-bold shadow-lg hover:bg-[#000066] transition-all"
            >
              {currentIndex < questions.length - 1 ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestingView;
