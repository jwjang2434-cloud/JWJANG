
import React, { useState, useEffect } from 'react';
import { REFERENCE_DOCS, LATEST_NOTICE } from '../constants';
import { UserProfile, ViewPage, UserRole, ReferenceDoc, Notice } from '../types';
import BioRhythm from './BioRhythm';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onNavigate: (page: ViewPage) => void;
  activeView: ViewPage;
  user: UserProfile;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenDocument: (doc: ReferenceDoc) => void;
  onOpenNotice: (notice: Notice) => void;
}

interface MenuItem {
  id: ViewPage;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  onNavigate, 
  activeView, 
  user, 
  onLogout, 
  onOpenSettings, 
  onOpenDocument,
  onOpenNotice
}) => {
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  const isAdmin = user.role === UserRole.ADMIN;
  // 스크린샷 요청에 맞춘 강제 순서 적용을 위해 키 버전 업그레이드
  const storageKey = 'sidebarMenuOrder_GLOBAL_v3'; 

  // 기본 메뉴 아이템 정의 (HR 챗봇 제외 - 고정)
  const defaultMenuItems: MenuItem[] = [
    { 
      id: 'ORG_CHART', 
      label: '조직도', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    },
    { 
      id: 'MEETING', 
      label: '회의실 예약', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    },
    { 
      id: 'MENU', 
      label: '금주의 식단', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /></svg>
    },
    { 
      id: 'SNACK', 
      label: '금주의 간식', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      id: 'CAFE', 
      label: '사내 카페', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" /></svg>
    },
    { 
      id: 'BUS', 
      label: '통근버스 정보', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
    },
    { 
      id: 'REGULATIONS', 
      label: '사내 규정', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    { 
      id: 'BROCHURE', 
      label: '회사 브로슈어', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    },
    { 
      id: 'NEWSLETTER', 
      label: '사보 열람', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
    },
    { 
      id: 'FORMS', 
      label: '서식 자료실', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
    },
    { 
      id: 'SUGGESTION', 
      label: '건의사항', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
    }
  ];

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    // LocalStorage에서 전역 순서 불러오기
    const savedOrder = localStorage.getItem(storageKey);
    if (savedOrder) {
      try {
        const parsedIds: ViewPage[] = JSON.parse(savedOrder);
        // 저장된 순서대로 아이템 정렬
        const orderedItems: MenuItem[] = [];
        parsedIds.forEach(id => {
          const item = defaultMenuItems.find(i => i.id === id);
          if (item) orderedItems.push(item);
        });
        
        // 새로 추가된 메뉴가 있다면 뒤에 붙임
        defaultMenuItems.forEach(item => {
          if (!orderedItems.find(o => o.id === item.id)) orderedItems.push(item);
        });

        return orderedItems;
      } catch (e) {
        console.error("Failed to parse menu order", e);
      }
    }
    return defaultMenuItems;
  });

  const saveMenuOrder = (newItems: MenuItem[]) => {
    setMenuItems(newItems);
    const orderIds = newItems.map(i => i.id);
    localStorage.setItem(storageKey, JSON.stringify(orderIds));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...menuItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    saveMenuOrder(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index >= menuItems.length - 1) return;
    const newItems = [...menuItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    saveMenuOrder(newItems);
  };

  const getButtonClass = (viewName: ViewPage) => {
    const isActive = activeView === viewName;
    return `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-indigo-600 text-white font-medium shadow-md' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    } ${isReordering ? 'cursor-default opacity-80' : 'cursor-pointer'}`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-none">InnoPortal</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">한일후지코리아(주)</p>
          </div>
        </div>

        {/* Notice Widget (필독 공지) - 클릭 시 팝업 오픈 */}
        <div className="px-4 mt-6 mb-4">
           <button 
             onClick={() => onOpenNotice(LATEST_NOTICE)}
             className="w-full group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-4 text-left shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 border border-white/10"
            >
              <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1 mr-2 overflow-hidden">
                      <p className="text-indigo-100 text-xs font-medium mb-0.5">필독 공지</p>
                      <h3 className="text-white font-bold text-sm truncate">{LATEST_NOTICE.title}</h3>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
           </button>
        </div>

        {/* User Profile */}
        <div className="px-4 mb-3">
          <div className="p-3 bg-slate-800/50 rounded-xl flex items-center gap-3 border border-slate-700/50 backdrop-blur-sm">
            <img src={user.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                 <p className="text-sm font-medium text-white truncate">{user.name}</p>
                 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                   isAdmin 
                   ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                   : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                 }`}>
                    {isAdmin ? '관리자' : '일반'}
                 </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user.department}</p>
            </div>
            {/* BioRhythm passes user birthdate */}
            <BioRhythm birthDate={user.birthDate} />
            <button 
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
              title="개인 설정"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>

        {/* Notice Board Button (공지사항) */}
        <div className="px-4 mb-4">
           <button 
             onClick={() => onNavigate('NOTICE_BOARD')}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg border transition-all group ${
                activeView === 'NOTICE_BOARD' 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-800 hover:text-white'
             }`}
           >
             <svg className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
             <span className="font-bold text-sm">공지사항</span>
           </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</div>
            {isAdmin && (
              <button 
                onClick={() => setIsReordering(!isReordering)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${isReordering ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-slate-700 hover:text-slate-300'}`}
                title="관리자: 메뉴 순서 변경 (전체 적용)"
              >
                {isReordering ? '완료' : '순서설정'}
              </button>
            )}
          </div>
          
          {/* HR Chatbot (Fixed Top) */}
          <button 
            onClick={() => onNavigate('CHAT')}
            className={`w-full flex items-center gap-3 px-3 py-3 mb-3 rounded-lg transition-all group border ${
                activeView === 'CHAT' 
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50' 
                : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span className="text-sm font-medium">HR 챗봇</span>
            {activeView === 'CHAT' && <span className="ml-auto w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>}
          </button>

          {/* Reorderable Menu Items */}
          <div className="space-y-1 pb-4">
            {menuItems.map((item, index) => (
              <div key={item.id} className={`flex items-center gap-1 group/item ${isReordering ? 'bg-slate-800/50 rounded-lg p-1 border border-slate-700' : ''}`}>
                 {isReordering && (
                   <div className="flex flex-col gap-0.5 px-1">
                      <button 
                        onClick={() => handleMoveUp(index)} 
                        disabled={index === 0}
                        className="text-slate-500 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                      >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button 
                        onClick={() => handleMoveDown(index)} 
                        disabled={index === menuItems.length - 1}
                        className="text-slate-500 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                      >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                   </div>
                 )}
                 <button 
                   onClick={() => !isReordering && onNavigate(item.id)} 
                   className={getButtonClass(item.id)}
                   disabled={isReordering}
                 >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                    {isReordering && <span className="ml-auto text-xs text-slate-600">≡</span>}
                 </button>
              </div>
            ))}
          </div>

          <div className="py-2">
            <div className="border-t border-slate-800"></div>
          </div>

          {/* Knowledge Base */}
          <div>
            <button 
              onClick={() => setIsKnowledgeBaseOpen(!isKnowledgeBaseOpen)}
              className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-800/50 rounded-lg transition-colors group mb-2"
            >
              <span>연동된 지식 베이스</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isKnowledgeBaseOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isKnowledgeBaseOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              {REFERENCE_DOCS.map((doc) => (
                <div 
                  key={doc.id} 
                  onClick={() => onOpenDocument(doc)}
                  className="group flex items-center justify-between px-3 py-2 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <svg className={`w-4 h-4 flex-shrink-0 ${doc.type === 'PDF' ? 'text-red-400' : doc.type === 'DOC' ? 'text-blue-400' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs truncate group-hover:text-white">{doc.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={onLogout}
             className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2 transition-colors hover:bg-slate-800 rounded-lg group"
            >
             <svg className="w-4 h-4 group-hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             로그아웃
           </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
