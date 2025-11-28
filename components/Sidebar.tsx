import React, { useState, useEffect } from 'react';
import { UserProfile, ViewPage, UserRole, ReferenceDoc, Notice, MenuItem, MenuCategory, AttendanceRecord } from '../types';
import BioRhythm from './BioRhythm';
import { getLocalIpAddress } from '../utils/networkUtils';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onNavigate: (page: ViewPage) => void;
  activeView: ViewPage;
  user: UserProfile;
  onLogout: () => void;
  onOpenDocument: (doc: ReferenceDoc) => void;
  onOpenNotice: (notice: Notice) => void;
  menuItems: MenuCategory[];
  onUpdateMenuItems: (newItems: MenuCategory[]) => void;
  latestNotice: Notice | null;
  onAttendanceCheckIn: (record: AttendanceRecord) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  onNavigate,
  activeView,
  user,
  onLogout,
  onOpenDocument,
  onOpenNotice,
  menuItems,
  onUpdateMenuItems,
  latestNotice,
  onAttendanceCheckIn
}) => {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  useEffect(() => {
    getLocalIpAddress().then(ip => {
      console.log('Resolved IP:', ip);
      setIpAddress(ip);
    });
  }, []);

  const handleCopyIp = () => {
    if (!ipAddress) {
      setCopyFeedback('Wait...');
      setTimeout(() => setCopyFeedback(''), 1000);
      return;
    }
    navigator.clipboard.writeText(ipAddress);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const isAdmin = user.role === UserRole.ADMIN;

  const getButtonClass = (viewName: ViewPage) => {
    const isActive = activeView === viewName;
    return `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
      ? 'bg-indigo-600 text-white font-medium shadow-md'
      : 'text-slate-400 hover:text-white hover:bg-slate-800'
      } cursor-pointer`;
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
            <p className="text-[10px] text-slate-500 mt-0.5">{user.companyName || '한일후지코리아(주)'}</p>
          </div>
        </div>

        {/* Notice Widget (필독 공지) - 클릭 시 팝업 오픈 */}
        {latestNotice && (
          <div className="px-4 mt-6 mb-4">
            <button
              onClick={() => onOpenNotice(latestNotice)}
              className="w-full group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-4 text-left shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 border border-white/10"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1 mr-2 overflow-hidden">
                  <p className="text-indigo-100 text-xs font-medium mb-0.5">필독 공지</p>
                  <h3 className="text-white font-bold text-sm truncate">{latestNotice.title}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="px-4 mb-3">
          <div className="relative z-20 p-3 bg-slate-800/50 rounded-xl flex items-center gap-3 border border-slate-700/50 backdrop-blur-sm">
            <img src={user.customAvatarUrl || user.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <p className="text-sm font-medium text-white truncate">{user.customNickname || user.name}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isAdmin
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
          </div>
        </div>

        {/* IP Address Display */}
        <div className="px-4 mb-2 flex justify-center">
          <button
            onClick={handleCopyIp}
            className="text-[10px] text-slate-500 font-mono bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50 hover:bg-slate-700 hover:text-slate-300 transition-colors cursor-pointer min-w-[120px] text-center"
            title="Click to copy IP"
          >
            {copyFeedback || (ipAddress ? `Internal IP: ${ipAddress}` : 'Internal IP: Checking...')}
          </button>
        </div>

        {/* Attendance Check-in Button (출근하기) */}
        <div className="px-4 mb-3">
          <button
            onClick={async () => {
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, '0');
              const day = String(now.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;

              const record: AttendanceRecord = {
                id: `${user.id}_${now.getTime()}`,
                userId: user.id,
                userName: user.name,
                userDepartment: user.department,
                checkInTime: now.toISOString(),
                date: dateStr
              };

              onAttendanceCheckIn(record);

              const popup = document.createElement('div');
              popup.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in';
              popup.innerHTML = `
                <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                  <div class="text-center">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                      <svg class="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">출근 완료!</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-1">출근 시간</p>
                    <p class="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}</p>
                    <button onclick="this.closest('.fixed').remove()" class="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
                      확인
                    </button>
                  </div>
                </div>
              `;
              document.body.appendChild(popup);

              setTimeout(() => {
                if (popup.parentNode) {
                  popup.remove();
                }
              }, 3000);
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border transition-all group bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-500 shadow-md hover:from-green-700 hover:to-emerald-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-bold text-sm">출근하기</span>
          </button>
        </div>

        {/* Notice Board Button (공지사항) */}
        <div className="px-4 mb-4">
          <button
            onClick={() => onNavigate('NOTICE_BOARD')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg border transition-all group ${activeView === 'NOTICE_BOARD'
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


          {/* Categorized Menu Items */}
          <div className="space-y-6 pb-4">
            {menuItems.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors group"
                  >
                    <span>{category.label}</span>
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className={`space-y-1 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {category.items
                      .filter(item => {
                        // 관리자 전용 메뉴는 관리자만 볼 수 있음
                        if (item.id === 'ADMIN_ATTENDANCE' || item.id === 'ADMIN_USER_LIST') {
                          return isAdmin;
                        }
                        return true;
                      })
                      .map((item) => (
                        <div key={item.id} className="flex items-center gap-1 group/item">
                          <button
                            onClick={() => onNavigate(item.id)}
                            className={getButtonClass(item.id)}
                          >
                            {item.icon}
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.id === 'ADMIN_ATTENDANCE' && (
                              <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded border border-red-500/30">
                                관리자
                              </span>
                            )}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="py-2">
            <div className="border-t border-slate-800"></div>
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
      </aside >
    </>
  );
};

export default Sidebar;
