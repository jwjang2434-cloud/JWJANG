
import React, { useState, useEffect } from 'react';
import { UserProfile, Notice } from '../types';
import { NOTICE_LIST } from '../constants';

interface NoticeBoardProps {
  user: UserProfile;
  externalSelectedNotice: Notice | null; // 외부에서(팝업 등) 선택된 공지
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ user, externalSelectedNotice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'MUST_READ' | 'GENERAL' | 'MENU'>('ALL');
  const [currentView, setCurrentView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 외부에서 특정 공지를 보라고 요청이 오면 (예: 팝업에서 '게시물 바로가기' 클릭)
  useEffect(() => {
    if (externalSelectedNotice) {
        setSelectedNotice(externalSelectedNotice);
        setCurrentView('DETAIL');
    }
  }, [externalSelectedNotice]);

  const filteredNotices = NOTICE_LIST.filter(notice => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = notice.title.toLowerCase().includes(term) || 
                          (notice.author?.toLowerCase() || '').includes(term);
    const matchesFilter = filter === 'ALL' || notice.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getBadgeColor = (type: string) => {
    switch(type) {
        case 'MUST_READ': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        case 'MENU': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
        default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getTypeLabel = (type: string) => {
      switch(type) {
          case 'MUST_READ': return '필독';
          case 'MENU': return '식단';
          default: return '일반';
      }
  };

  const handleNoticeClick = (notice: Notice) => {
      setSelectedNotice(notice);
      setCurrentView('DETAIL');
  };

  const handleBackToList = () => {
      setSelectedNotice(null);
      setCurrentView('LIST');
  };

  if (currentView === 'DETAIL' && selectedNotice) {
      return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in-up">
                {/* Detail Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getBadgeColor(selectedNotice.type)}`}>
                            {getTypeLabel(selectedNotice.type)}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{selectedNotice.date}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 leading-tight">
                        {selectedNotice.title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-medium">작성자: {selectedNotice.author || '관리자'}</span>
                    </div>
                </div>

                {/* Detail Body */}
                <div className="p-8 min-h-[300px]">
                    <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-line text-slate-700 dark:text-slate-300">
                        {selectedNotice.content}
                    </div>
                </div>

                {/* Detail Footer */}
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button 
                        onClick={handleBackToList}
                        className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">공지사항</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">한일후지코리아의 주요 소식과 공지를 확인하세요.</p>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="검색어 입력..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 lg:w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors" 
                />
               <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['ALL', 'MUST_READ', 'GENERAL', 'MENU'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                      filter === f 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                    {f === 'ALL' ? '전체' : getTypeLabel(f)}
                </button>
            ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 w-20 text-center hidden sm:table-cell">번호</th>
                        <th className="px-6 py-4 w-24 text-center">구분</th>
                        <th className="px-6 py-4">제목</th>
                        <th className="px-6 py-4 w-32 text-center hidden md:table-cell">작성자</th>
                        <th className="px-6 py-4 w-32 text-center">작성일</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredNotices.length > 0 ? (
                        filteredNotices.map((notice, index) => (
                            <tr 
                              key={notice.id} 
                              onClick={() => handleNoticeClick(notice)}
                              className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4 text-center text-slate-400 hidden sm:table-cell">{filteredNotices.length - index}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeColor(notice.type)}`}>
                                        {getTypeLabel(notice.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {notice.title}
                                    </span>
                                    {notice.type === 'MUST_READ' && (
                                        <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 hidden md:table-cell">{notice.author || '관리자'}</td>
                                <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">{notice.date}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                등록된 공지사항이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination (Mock) */}
        {filteredNotices.length > 0 && (
            <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">&lt;</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 text-white shadow-sm">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">&gt;</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default NoticeBoard;
