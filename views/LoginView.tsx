
import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const users = storage.getUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username);
    if (user) {
      onLogin(user);
    } else {
      setError('Tên đăng nhập không hợp lệ (Thử: admin, student1, student2)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-[#000088] p-8 text-center">
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">English K12 Master</h1>
          <p className="text-white/70 text-sm mt-2">Hệ thống học tiếng Anh chuẩn Bộ GD&ĐT</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên đăng nhập</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#000088] focus:border-transparent outline-none transition-all"
              placeholder="Nhập tên đăng nhập của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#000088] text-white py-3 rounded-lg font-bold hover:bg-[#000066] transition-colors shadow-lg active:scale-[0.98]"
          >
            ĐĂNG NHẬP
          </button>

          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold">Tài khoản mẫu:</p>
            <p className="text-xs text-slate-400 mt-1 italic">
              Giáo viên: admin | Học sinh: student1, student2
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
