import React, { useState, useEffect } from 'react';
import { UserProfile, Notice, UserRole } from '../types';
import { NOTICE_LIST } from '../constants';

interface NoticeBoardProps {
    user: UserProfile;
    externalSelectedNotice: Notice | null; // 외부에서(팝업 등) 선택된 공지
    notices: Notice[];
    onNoticesChange: (notices: Notice[]) => void;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ user, externalSelectedNotice, notices, onNoticesChange }) => {
    const [categories, setCategories] = useState<string[]>(() => {
        const saved = localStorage.getItem('notice_categories');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse categories", e);
                return ['MUST_READ', 'GENERAL', 'MENU'];
            }
        }
        return ['MUST_READ', 'GENERAL', 'MENU'];
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<string>('ALL');
    const [currentView, setCurrentView] = useState<'LIST' | 'DETAIL'>('LIST');
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

    // Write Modal State
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [newNotice, setNewNotice] = useState<Partial<Notice>>({
        type: 'GENERAL',
        title: '',
        content: ''
    });

    // Category Management Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    // Delete Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null);

    const isAdmin = user.role === UserRole.ADMIN;

    useEffect(() => {
        localStorage.setItem('notice_categories', JSON.stringify(categories));
    }, [categories]);

    // 외부에서 특정 공지를 보라고 요청이 오면 (예: 팝업에서 '게시물 바로가기' 클릭)
    useEffect(() => {
        if (externalSelectedNotice) {
            setSelectedNotice(externalSelectedNotice);
            setCurrentView('DETAIL');
        }
    }, [externalSelectedNotice]);

    const filteredNotices = notices.filter(notice => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = notice.title.toLowerCase().includes(term) ||
            (notice.author?.toLowerCase() || '').includes(term);
        const matchesFilter = filter === 'ALL' || notice.type === filter;
        return matchesSearch && matchesFilter;
    });

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'MUST_READ': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'MENU': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'GENERAL': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
            default: return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'MUST_READ': return '필독';
            case 'MENU': return '식단';
            case 'GENERAL': return '일반';
            default: return type;
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

    const handleSaveNotice = () => {
        if (!newNotice.title || !newNotice.content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const notice: Notice = {
            id: `notice-${Date.now()}`,
            title: newNotice.title || '',
            content: newNotice.content || '',
            type: newNotice.type || 'GENERAL',
            date: new Date().toISOString().split('T')[0],
            author: user.name
        };

        onNoticesChange([notice, ...notices]);
        setIsWriteModalOpen(false);
        setNewNotice({ type: 'GENERAL', title: '', content: '' });
    };

    // Open Delete Confirmation Modal
    const confirmDeleteNotice = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click
        setNoticeToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // Execute Delete
    const handleDeleteNotice = () => {
        if (noticeToDelete) {
            onNoticesChange(notices.filter(n => n.id !== noticeToDelete));
            setNoticeToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const handleAddCategory = () => {
        if (!newCategory.trim()) return;
        if (categories.includes(newCategory.trim())) {
            alert('이미 존재하는 카테고리입니다.');
            return;
        }
        setCategories([...categories, newCategory.trim()]);
        setNewCategory('');
    };

    const handleDeleteCategory = (category: string) => {
        if (window.confirm(`'${getTypeLabel(category)}' 카테고리를 삭제하시겠습니까?`)) {
            setCategories(categories.filter(c => c !== category));
            // Reset filter if deleted category was selected
            if (filter === category) setFilter('ALL');
        }
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
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 relative z-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">공지사항 삭제</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                정말 이 공지사항을 삭제하시겠습니까?<br />삭제된 공지사항은 복구할 수 없습니다.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleDeleteNotice}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium text-sm shadow-sm"
                                >
                                    삭제하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Write Modal */}
            {isWriteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsWriteModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative z-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">공지사항 작성</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">구분</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setNewNotice({ ...newNotice, type: type })}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${newNotice.type === type
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {getTypeLabel(type)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">제목</label>
                                <input
                                    type="text"
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="공지 제목을 입력하세요"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">내용</label>
                                <textarea
                                    value={newNotice.content}
                                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-64 resize-none"
                                    placeholder="공지 내용을 입력하세요"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsWriteModalOpen(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveNotice}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                            >
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Management Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative z-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">카테고리 관리</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="새 카테고리 이름 (예: 행사)"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button
                                    onClick={handleAddCategory}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm whitespace-nowrap"
                                >
                                    추가
                                </button>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {categories.map((category) => (
                                    <div key={category} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{getTypeLabel(category)}</span>
                                        <button
                                            onClick={() => handleDeleteCategory(category)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            title="삭제"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
                                >
                                    카테고리 관리
                                </button>
                                <button
                                    onClick={() => setIsWriteModalOpen(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    공지 작성
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filter === 'ALL'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        전체
                    </button>
                    {categories.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filter === f
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {getTypeLabel(f)}
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
                                {isAdmin && <th className="px-6 py-4 w-16 text-center">관리</th>}
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
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => confirmDeleteNotice(e, notice.id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="삭제"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
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
