
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import MeetingRoom from './components/MeetingRoom';
import FormsLibrary from './components/FormsLibrary';
import WeeklyMenu from './components/WeeklyMenu';
import CompanyCafe from './components/CompanyCafe';
import WeeklySnack from './components/WeeklySnack';
import CommuterBus from './components/CommuterBus';
import Suggestions from './components/Suggestions';
import NewsletterViewer from './components/NewsletterViewer';
import CompanyBrochure from './components/CompanyBrochure';
import { OrganizationChart } from './components/OrganizationChart';
import CompanyRegulations from './components/CompanyRegulations';
import Login from './components/Login';
import NoticePopup from './components/NoticePopup';
import SettingsModal from './components/SettingsModal';
import PDFViewer from './components/PDFViewer';
import NoticeBoard from './components/NoticeBoard';
import { LATEST_NOTICE } from './constants';
import { ViewPage, UserProfile, LLMConfig, ReferenceDoc, Notice } from './types';

const App: React.FC = () => {
  // [개발 연동 주석]: 전역 상태 관리 (Redux, Recoil 등) 권장
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewPage>('CHAT');
  const [showNotice, setShowNotice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Selected Notice for Popup (Allows viewing any notice, not just latest)
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  // Notice to be viewed in the NoticeBoard (Detail View)
  const [noticeToViewInBoard, setNoticeToViewInBoard] = useState<Notice | null>(null);

  // Document Viewer State
  const [activeDocument, setActiveDocument] = useState<ReferenceDoc | null>(null);

  // LLM Config State
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'gemini',
    apiKey: '',
    modelName: 'gemini-2.5-flash'
  });

  // Theme State - Default to Dark
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Biorhythm State
  const [showBiorhythm, setShowBiorhythm] = useState(() => {
    return localStorage.getItem('showBiorhythm') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('showBiorhythm', String(showBiorhythm));
  }, [showBiorhythm]);

  // Initialize Theme and LLM Config from LocalStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to Dark mode if no preference is saved
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }

    const savedLlmConfig = localStorage.getItem('llmConfig');
    if (savedLlmConfig) {
      try {
        setLlmConfig(JSON.parse(savedLlmConfig));
      } catch (e) {
        console.error("Failed to parse LLM config", e);
      }
    }
  }, []);

  // Notice Popup Check Logic (Auto-show latest on login)
  useEffect(() => {
    if (user) {
      const storageKey = `hide_notice_${user.id}`;
      const storedData = localStorage.getItem(storageKey);

      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          const now = new Date().getTime();
          if (parsedData.noticeId === LATEST_NOTICE.id && parsedData.expires > now) {
            setActiveNotice(null);
          } else {
            setActiveNotice(LATEST_NOTICE);
          }
        } catch (e) {
          setActiveNotice(LATEST_NOTICE);
        }
      } else {
        setActiveNotice(LATEST_NOTICE);
      }
    } else {
      setActiveNotice(null);
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveLlmConfig = (newConfig: LLMConfig) => {
    setLlmConfig(newConfig);
    localStorage.setItem('llmConfig', JSON.stringify(newConfig));
  };

  const handleNavigation = (page: ViewPage) => {
    setCurrentView(page);
    // 다른 메뉴로 이동할 때, 상세 보기용 공지 상태 초기화 (목록부터 보게 하기 위함)
    if (page !== 'NOTICE_BOARD') {
      setNoticeToViewInBoard(null);
    }
    if (window.innerWidth < 1024) { // Mobile 환경에서 메뉴 클릭 시 사이드바 자동 닫기
      setSidebarOpen(false);
    }
  };

  // 팝업에서 '게시물 바로가기' 클릭 시 처리
  const handleGoToPostFromPopup = (notice: Notice) => {
    setActiveNotice(null); // 팝업 닫기
    setNoticeToViewInBoard(notice); // 상세 볼 공지 설정
    setCurrentView('NOTICE_BOARD'); // 화면 전환
  };

  // 로그아웃 처리
  const handleLogout = () => {
    // confirm 없이 즉시 로그아웃
    setUser(null);
    setCurrentView('CHAT');
    setSidebarOpen(false);
    setActiveNotice(null);
    setActiveDocument(null);
    setNoticeToViewInBoard(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Notice Popup */}
      {activeNotice && (
        <NoticePopup
          notice={activeNotice}
          onClose={() => setActiveNotice(null)}
          userId={user.id}
          onGoToPost={handleGoToPostFromPopup}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        llmConfig={llmConfig}
        onSaveLlmConfig={handleSaveLlmConfig}
        showBiorhythm={showBiorhythm}
        onToggleBiorhythm={setShowBiorhythm}
      />

      {/* Document Viewer Modal (For Sidebar Linked Docs) */}
      {activeDocument && (
        <PDFViewer
          title={activeDocument.title}
          onClose={() => setActiveDocument(null)}
          user={user}
          type={activeDocument.type === 'PDF' ? 'PDF' : 'IMAGE'}
          allowDownload={false} // 연동된 지식 베이스 문서도 다운로드 금지
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={handleNavigation}
        activeView={currentView}
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
        onOpenDocument={(doc) => setActiveDocument(doc)}
        onOpenNotice={(notice) => setActiveNotice(notice)}
      />

      <main className="flex-1 flex flex-col relative h-full w-full overflow-hidden transition-all duration-300">

        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="flex flex-col justify-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight transition-colors">
                {user.companyName}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Smart HR Portal System</span>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            {/* System Status Indicator (Desktop only) */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-800/50 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              System Online
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={theme === 'light' ? '다크 모드로 변경' : '라이트 모드로 변경'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            {/* Notification Icon */}
            <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="알림">
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </div>
            </button>

            {/* Settings Icon */}
            <button
              onClick={() => setShowSettings(true)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="설정"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </header>

        {/* View Content Area - Scroll Fix Applied */}
        <div className={`flex-1 relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${currentView === 'CHAT' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className={`w-full h-full ${currentView === 'CHAT' ? 'block' : 'hidden'}`}>
            <ChatInterface userCompany={user.companyName} userName={user.name} llmConfig={llmConfig} />
          </div>

          {currentView === 'MEETING' && <MeetingRoom user={user} />}
          {currentView === 'FORMS' && <FormsLibrary user={user} />}
          {currentView === 'MENU' && <WeeklyMenu user={user} llmConfig={llmConfig} />}
          {currentView === 'CAFE' && <CompanyCafe user={user} />}
          {currentView === 'SNACK' && <WeeklySnack user={user} />}
          {currentView === 'BUS' && <CommuterBus user={user} />}
          {currentView === 'SUGGESTION' && <Suggestions user={user} />}
          {currentView === 'NEWSLETTER' && <NewsletterViewer user={user} />}
          {currentView === 'BROCHURE' && <CompanyBrochure />}
          {currentView === 'ORG_CHART' && <OrganizationChart user={user} showBiorhythm={showBiorhythm} />}
          {currentView === 'REGULATIONS' && <CompanyRegulations user={user} />}
          {currentView === 'NOTICE_BOARD' && <NoticeBoard user={user} externalSelectedNotice={noticeToViewInBoard} />}
        </div>

      </main>
    </div>
  );
};

export default App;
