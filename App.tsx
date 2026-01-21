
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { storage } from './services/storage';
import LoginView from './views/LoginView';
import TeacherDashboard from './views/TeacherDashboard';
import StudentDashboard from './views/StudentDashboard';
import TestingView from './views/TestingView';
import ReviewView from './views/ReviewView';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'testing' | 'review'>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState(5);

  useEffect(() => {
    const saved = storage.getAuth();
    if (saved) setUser(saved);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    storage.setAuth(u);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    storage.setAuth(null);
    setView('dashboard');
  };

  const handleSelectMode = (mode: 'testing' | 'review', grade: number) => {
    setSelectedGrade(grade);
    setView(mode);
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {user.role === 'teacher' ? (
        <TeacherDashboard />
      ) : (
        <>
          {view === 'dashboard' && (
            <StudentDashboard user={user} onSelectMode={handleSelectMode} />
          )}
          {view === 'testing' && (
            <TestingView user={user} grade={selectedGrade} onComplete={() => setView('dashboard')} />
          )}
          {view === 'review' && (
            <ReviewView user={user} onBack={() => setView('dashboard')} />
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
