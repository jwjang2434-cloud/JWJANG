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
import ProfileCustomization from './components/ProfileCustomization';
import PDFViewer from './components/PDFViewer';
import NoticeBoard from './components/NoticeBoard';
import AttendanceRecords from './components/AttendanceRecords';
import AdminAttendance from './components/AdminAttendance';
import AdminUserList from './components/AdminUserList';
import { LATEST_NOTICE, NOTICE_LIST } from './constants';
import DateTimeDisplay from './components/DateTimeDisplay';
import { ViewPage, UserProfile, LLMConfig, ReferenceDoc, Notice, MenuItem, MenuCategory, AttendanceRecord } from './types';
import MenuManagement from './components/MenuManagement';

const App: React.FC = () => {
  console.log("App.tsx: Rendering App component");
  // [개발 연동 주석]: 전역 상태 관리 (Redux, Recoil 등) 권장
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewPage>('NOTICE_BOARD');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileCustomization, setShowProfileCustomization] = useState(false);

  // Selected Notice for Popup (Allows viewing any notice, not just latest)
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);
  const [popupQueue, setPopupQueue] = useState<Notice[]>([]); // Queue for Must Read notices

  // Notice to be viewed in the NoticeBoard (Detail View)
  const [noticeToViewInBoard, setNoticeToViewInBoard] = useState<Notice | null>(null);

  // Global Notices State
  const [allNotices, setAllNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('notices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse notices", e);
        return NOTICE_LIST;
      }
    }
    return NOTICE_LIST;
  });

  // Persist notices
  useEffect(() => {
    localStorage.setItem('notices', JSON.stringify(allNotices));
  }, [allNotices]);

  // Derive Latest Notice (MUST_READ, sorted by date/id)
  const latestNotice = allNotices
    .filter(n => n.type === 'MUST_READ')
    .sort((a, b) => {
      if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.id.localeCompare(a.id);
    })[0] || null;

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

  // System Online Status State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Biorhythm State
  const [showBiorhythm, setShowBiorhythm] = useState(() => {
    return localStorage.getItem('showBiorhythm') !== 'false';
  });

  // Menu Items State
  const [menuItems, setMenuItems] = useState<MenuCategory[]>([
    {
      id: 'WORK_SUPPORT',
      label: '업무 지원',
      items: [
        {
          id: 'MEETING',
          label: '회의실 예약',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        },
        {
          id: 'FORMS',
          label: '신청서 작성',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        },
        {
          id: 'SUGGESTION',
          label: '건의함',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        }
      ]
    },
    {
      id: 'LIFE_SUPPORT',
      label: '생활 지원',
      items: [
        {
          id: 'MENU',
          label: '주간 식단표',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        },
        {
          id: 'CAFE',
          label: '사내 카페',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        },
        {
          id: 'SNACK',
          label: '간식 신청',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>
        },
        {
          id: 'BUS',
          label: '통근버스',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        }
      ]
    },
    {
      id: 'COMPANY_INFO',
      label: '회사 정보',
      items: [
        {
          id: 'NEWSLETTER',
          label: '뉴스레터',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
        },
        {
          id: 'BROCHURE',
          label: '회사 브로슈어',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        },
        {
          id: 'ORG_CHART',
          label: '조직도',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        },
        {
          id: 'REGULATIONS',
          label: '사내 규정',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
        }
      ]
    },
    {
      id: 'ATTENDANCE_MANAGEMENT',
      label: '시스템 관리',
      items: [
        {
          id: 'ADMIN_USER_LIST',
          label: '계정 관리',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        },
        {
          id: 'MENU_MANAGEMENT',
          label: '메뉴 관리',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        }
      ]
    }
  ]);

  const handleUpdateMenuItems = (newItems: MenuCategory[]) => {
    setMenuItems(newItems);
  };

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

    // Data Migration: Update company name for test1 if it's still the default
    const storedUsers = localStorage.getItem('portal_users');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        let updated = false;
        const newUsers = users.map((u: any) => {
          if (u.id === 'test1' && u.companyName === '한일후지코리아(주)') {
            updated = true;
            return { ...u, companyName: '(주)후지글로벌로지스틱' };
          }
          return u;
        });

        if (updated) {
          localStorage.setItem('portal_users', JSON.stringify(newUsers));
          console.log('Migrated user data: Updated test1 company name');
        }
      } catch (e) {
        console.error('Migration failed', e);
      }
    }
  }, []);

  // Notice Popup Check Logic (Auto-show unread MUST_READ notices)
  useEffect(() => {
    if (user) {
      // 1. Get all notices (merged with localStorage if implemented in NoticeBoard, but here we read 'notices' key)
      // We already have allNotices state now

      // 2. Filter MUST_READ notices
      const mustReadNotices = allNotices.filter(n => n.type === 'MUST_READ');

      // 3. Filter out those hidden by user preference
      const unreadNotices = mustReadNotices.filter(notice => {
        const storageKey = `hide_notice_${user.id}_${notice.id}`;
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            const now = new Date().getTime();
            if (parsedData.expires > now) {
              return false; // Hidden and not expired
            }
          } catch (e) {
            return true; // Error parsing, show it
          }
        }
        return true; // No hidden record
      });

      setPopupQueue(unreadNotices);
    } else {
      setPopupQueue([]);
      setActiveNotice(null);
    }
  }, [user]);

  // Process Popup Queue
  useEffect(() => {
    if (popupQueue.length > 0 && !activeNotice) {
      setActiveNotice(popupQueue[0]);
    }
  }, [popupQueue, activeNotice]);

  const handleClosePopup = () => {
    setActiveNotice(null);
    // Remove the current notice from queue after a short delay to allow animation
    setTimeout(() => {
      setPopupQueue(prev => prev.slice(1));
    }, 300);
  };

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

    // Remove from queue so next one shows up
    setTimeout(() => {
      setPopupQueue(prev => prev.slice(1));
    }, 300);
  };

  // 프로필 커스터마이징 저장
  const handleSaveProfile = (customNickname: string, customAvatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, customNickname, customAvatarUrl };
      setUser(updatedUser);
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    // confirm 없이 즉시 로그아웃
    setUser(null);
    setCurrentView('NOTICE_BOARD');
    setIsChatOpen(false);
    setSidebarOpen(false);
    setActiveNotice(null);
    setActiveDocument(null);
    setNoticeToViewInBoard(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
    // return <div style={{ color: 'white', padding: '20px', background: 'red' }}>Login Component Placeholder</div>;
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Notice Popup */}
      {activeNotice && (
        <NoticePopup
          notice={activeNotice}
          onClose={handleClosePopup}
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

      {/* Profile Customization Modal */}
      {showProfileCustomization && user && (
        <ProfileCustomization
          user={user}
          onClose={() => setShowProfileCustomization(false)}
          onSave={handleSaveProfile}
        />
      )}

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
        onOpenDocument={(doc) => setActiveDocument(doc)}
        onOpenNotice={(notice) => setActiveNotice(notice)}
        menuItems={menuItems}
        onUpdateMenuItems={handleUpdateMenuItems}
        latestNotice={latestNotice}
        onAttendanceCheckIn={(record) => {
          console.log('Attendance Check-in:', record);
          const stored = localStorage.getItem('attendance_records');
          const allRecords: AttendanceRecord[] = stored ? JSON.parse(stored) : [];
          allRecords.push(record);
          localStorage.setItem('attendance_records', JSON.stringify(allRecords));

          // Force refresh if looking at attendance page (optional, but good UX)
          // For now, just saving is the priority.
        }}
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
              <span className="text-xs text-slate-500 dark:text-slate-400">K-Group Portal System</span>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            {/* System Status Indicator (Desktop only) */}
            <div className={`hidden xl:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isOnline
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800/50'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {isOnline ? 'System Online' : 'System Offline'}
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

            {/* Profile Customization Button */}
            <button
              onClick={() => setShowProfileCustomization(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="프로필 커스터마이징"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="설정"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>

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

            {/* Date Time Display */}
            <DateTimeDisplay />
          </div>
        </header>

        {/* View Content Area - Scroll Fix Applied */}
        <div className={`flex-1 relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-y-auto`}>

          {/* Floating Chat Widget */}
          <div className={`fixed bottom-20 right-6 z-50 w-[400px] h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 transform origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-bold text-slate-800 dark:text-white">HR Assistant</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <ChatInterface userCompany={user.companyName} userName={user.name} llmConfig={llmConfig} />
            </div>
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isChatOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {isChatOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            )}
          </button>

          {currentView === 'MEETING' && <MeetingRoom user={user} />}
          {currentView === 'FORMS' && <FormsLibrary user={user} />}
          {currentView === 'MENU' && <WeeklyMenu user={user} llmConfig={llmConfig} />}
          {currentView === 'CAFE' && <CompanyCafe user={user} />}
          {currentView === 'SNACK' && <WeeklySnack user={user} />}
          {currentView === 'BUS' && <CommuterBus user={user} />}
          {currentView === 'SUGGESTION' && <Suggestions user={user} />}
          {currentView === 'NEWSLETTER' && <NewsletterViewer user={user} />}
          {currentView === 'BROCHURE' && <CompanyBrochure user={user} />}
          {currentView === 'ORG_CHART' && <OrganizationChart user={user} showBiorhythm={showBiorhythm} />}
          {currentView === 'REGULATIONS' && <CompanyRegulations user={user} />}
          {currentView === 'MENU_MANAGEMENT' && <MenuManagement menuItems={menuItems} onUpdateMenuItems={handleUpdateMenuItems} />}
          {currentView === 'ADMIN_USER_LIST' && <AdminUserList user={user} />}
          {currentView === 'NOTICE_BOARD' && (
            <NoticeBoard
              user={user}
              externalSelectedNotice={noticeToViewInBoard}
              notices={allNotices}
              onNoticesChange={setAllNotices}
            />
          )}
        </div>

      </main>
    </div>
  );
};

export default App;
