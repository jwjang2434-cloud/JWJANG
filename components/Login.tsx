
import React, { useState } from 'react';
import { login } from '../services/authService';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(id, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-300">
        {/* Header Design */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">한일후지코리아(주)</h1>
            <p className="text-slate-400 text-sm mt-1">Smart HR Portal System</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">아이디</label>
              <input 
                type="text" 
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700"
                placeholder="사번 또는 아이디 입력"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">비밀번호</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700"
                placeholder="비밀번호 입력"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-sm transition-all shadow-md hover:shadow-lg transform active:scale-[0.98]
                ${isLoading 
                  ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              최초 접속 시 초기 비밀번호는 관리자가 설정합니다.<br/>
              계정 발급 문의: <strong>인사총무팀 (내선 317)</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
