
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-[#000088] text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">ENGLISH K12 – MASTER</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.fullName}</p>
              <p className="text-xs opacity-80 uppercase tracking-widest">{user.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm font-medium transition-colors border border-white/30"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
