
import React, { useState } from 'react';
import { Notice } from '../types';

interface NoticePopupProps {
  notice: Notice;
  onClose: () => void;
  userId: string;
  onGoToPost: (notice: Notice) => void; // 게시물로 이동 핸들러
}

const NoticePopup: React.FC<NoticePopupProps> = ({ notice, onClose, userId, onGoToPost }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      const storageKey = `hide_notice_${userId}_${notice.id}`;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7일 후 만료

      const data = {
        noticeId: notice.id,
        expires: expirationDate.getTime()
      };

      localStorage.setItem(storageKey, JSON.stringify(data));
    }

    setIsClosing(true);
    setTimeout(onClose, 300); // 애니메이션 시간 대기
  };

  const handleGoToPost = () => {
    setIsClosing(true);
    setTimeout(() => onGoToPost(notice), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Popup Content */}
      <div className={`relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h3 className="font-bold text-lg">필독 공지사항</h3>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-1">
            <span className="inline-block px-2 py-0.5 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded mb-2">
              {notice.type === 'MENU' ? '식단 안내' : '공지사항'}
            </span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-snug">
              {notice.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">{notice.date}</p>
          </div>

          <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto">
            {notice.content}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                {dontShowAgain && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">일주일간 보지 않기</span>
            </label>

            <button
              onClick={handleGoToPost}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              게시물 바로가기
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>

          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;
