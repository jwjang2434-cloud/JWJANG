
import React, { useState, useEffect } from 'react';
import { UserProfile, LLMConfig, UserRole } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  llmConfig: LLMConfig;
  onSaveLlmConfig: (newConfig: LLMConfig) => void;
  showBiorhythm: boolean;
  onToggleBiorhythm: (show: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  theme,
  toggleTheme,
  llmConfig,
  onSaveLlmConfig,
  showBiorhythm,
  onToggleBiorhythm
}) => {
  const [notifications, setNotifications] = useState(true);
  const [autoLogin, setAutoLogin] = useState(false);
  const [localConfig, setLocalConfig] = useState<LLMConfig>(llmConfig);

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(llmConfig);
    }
  }, [isOpen, llmConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveLlmConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">개인 설정</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* User Info Summary */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <img src={user.avatarUrl} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
            <div>
              <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.department} | {user.companyName}</p>
            </div>
          </div>

          {/* Settings Options */}
          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">화면 모드</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">다크 모드를 적용하여 눈의 피로를 줄입니다.</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">알림 수신</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">중요 공지 및 결재 알림을 받습니다.</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${notifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${notifications ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {/* Auto Login */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">자동 로그인</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">개인 PC에서만 사용하세요.</p>
              </div>
              <button
                onClick={() => setAutoLogin(!autoLogin)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${autoLogin ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${autoLogin ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {/* Biorhythm Visibility */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">바이오리듬 표시</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">조직도 및 카드에 바이오리듬을 표시합니다.</p>
              </div>
              <button
                onClick={() => onToggleBiorhythm(!showBiorhythm)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${showBiorhythm ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${showBiorhythm ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {/* Admin Only: AI Settings */}
            {isAdmin && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">AI 모델 설정</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">관리자 전용</span>
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Provider</label>
                    <select
                      value={localConfig.provider}
                      onChange={(e) => setLocalConfig({ ...localConfig, provider: e.target.value as 'gemini' | 'openai' })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="gemini">Gemini</option>
                      <option value="openai">OpenAI (준비중)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">모델명 (Model Name)</label>
                    <input
                      type="text"
                      value={localConfig.modelName}
                      onChange={(e) => setLocalConfig({ ...localConfig, modelName: e.target.value })}
                      placeholder="예: gemini-2.0-flash"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">API Key</label>
                    <input
                      type="password"
                      value={localConfig.apiKey}
                      onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                      placeholder="API Key를 입력하세요"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-right">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
