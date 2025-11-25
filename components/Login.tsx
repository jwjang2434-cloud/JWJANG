
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
    <div className="min-h-screen flex overflow-hidden bg-slate-900">
      {/* Left Side - Video Background (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 flex-col relative overflow-hidden bg-slate-900">
        {/* Text Area - Above Video */}
        <div className="relative z-20 w-full pt-20 pb-10 px-10 text-center bg-slate-900">
          <h2 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg tracking-tight">Welcome to K-Group</h2>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative overflow-hidden rounded-tr-[4rem]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/login_bg.mp4" type="video/mp4" />
          </video>
          {/* Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
        </div>
      </div>

      {/* Right Side - Login Sidebar */}
      <div className="w-full md:w-[480px] lg:w-[520px] bg-white dark:bg-slate-900 flex flex-col justify-center p-8 lg:p-12 relative z-10 shadow-2xl border-l border-slate-200 dark:border-slate-800">
        <div className="w-full max-w-sm mx-auto">
          {/* Header Design */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-white font-bold text-3xl">H</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">한일후지코리아(주)</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">K-Group Portal System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">아이디</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 placeholder-slate-400"
                placeholder="사번 또는 아이디 입력"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">비밀번호</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 placeholder-slate-400"
                placeholder="비밀번호 입력"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl text-white font-bold text-base transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] mt-4
                        ${isLoading
                  ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              최초 접속 시 초기 비밀번호는 관리자가 설정합니다.<br />
              계정 발급 문의: <strong>인사총무팀 (내선 317)</strong>
            </p>
            <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-4">
              © 2024 Hanil Fuji Korea. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
