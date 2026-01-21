
import React, { useState } from 'react';
import { User } from '../types';

interface StudentDashboardProps {
  user: User;
  onSelectMode: (mode: 'testing' | 'review', grade: number) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onSelectMode }) => {
  const [selectedGrade, setSelectedGrade] = useState(user.class || 5);
  const grades = Array.from({ length: 8 }, (_, i) => i + 5);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Chào mừng quay trở lại, {user.fullName}!</h2>
        
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-600 uppercase mb-3 text-center">Chọn khối lớp để bắt đầu</label>
          <div className="flex flex-wrap justify-center gap-2">
            {grades.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`w-14 h-14 rounded-full font-bold transition-all ${selectedGrade === g ? 'bg-[#000088] text-white scale-110 shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => onSelectMode('testing', selectedGrade)}
            className="group cursor-pointer bg-slate-50 hover:bg-[#000088] p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#000088] transition-all transform hover:-translate-y-1"
          >
            <div className="text-[#000088] group-hover:text-white transition-colors">
              <h3 className="text-xl font-black uppercase tracking-wider mb-2">Chế độ Kiểm tra</h3>
              <p className="text-sm opacity-80">Làm bài 10 câu hỏi ngẫu nhiên bám sát chương trình lớp {selectedGrade}.</p>
            </div>
          </div>

          <div 
            onClick={() => onSelectMode('review', selectedGrade)}
            className="group cursor-pointer bg-slate-50 hover:bg-[#000088] p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#000088] transition-all transform hover:-translate-y-1"
          >
            <div className="text-[#000088] group-hover:text-white transition-colors">
              <h3 className="text-xl font-black uppercase tracking-wider mb-2">Chế độ Ôn tập</h3>
              <p className="text-sm opacity-80">Xem lại lịch sử bài làm và luyện tập các câu đã từng làm sai.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
