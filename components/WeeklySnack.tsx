import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface WeeklySnackProps {
  user: UserProfile;
}

interface SnackData {
  items: string;
  notice: string;
  imageUrl: string | null;
  updatedAt: string;
}

// [신규] 이력 관리를 위한 인터페이스
export interface SnackHistoryItem extends SnackData {
  id: string;
  archivedDate: string;
}

const WeeklySnack: React.FC<WeeklySnackProps> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기 데이터
  const initialData: SnackData = {
    items: '햄버거 세트 (버거킹 와퍼)',
    notice: '오후 3시부터 구내식당 입구에서 수령 가능합니다.\n부서별로 대표자가 수령해주세요.',
    imageUrl: null,
    updatedAt: new Date().toLocaleDateString()
  };

  const [snackData, setSnackData] = useState<SnackData>(() => {
    const saved = localStorage.getItem('weeklySnackData');
    return saved ? JSON.parse(saved) : initialData;
  });

  // [신규] 이력 데이터 상태 관리
  const [history, setHistory] = useState<SnackHistoryItem[]>(() => {
    const savedHistory = localStorage.getItem('weeklySnackHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // 이력 모달 표시 여부

  // 오늘 날짜 표시
  const today = new Date();
  const dateString = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayString = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  // [수정] 저장 시 현재 데이터를 이력에 추가하고 업데이트
  const handleSave = () => {
    const now = new Date();
    const newUpdatedAt = now.toLocaleDateString();
    
    // 1. 현재 상태를 이력으로 저장 (스냅샷)
    const newHistoryItem: SnackHistoryItem = {
        ...snackData,
        id: `snack-${Date.now()}`,
        archivedDate: now.toLocaleString()
    };
    
    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('weeklySnackHistory', JSON.stringify(updatedHistory));

    // 2. 현재 데이터 업데이트 (날짜 갱신)
    const updatedData = { ...snackData, updatedAt: newUpdatedAt };
    setSnackData(updatedData);
    localStorage.setItem('weeklySnackData', JSON.stringify(updatedData));
    
    setIsEditing(false);
    alert('간식 정보가 저장되고 이력에 기록되었습니다.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // 이미지 미리보기 로직 (실제 업로드 대신 로컬 URL 사용)
    const reader = new FileReader();
    reader.onloadend = () => {
      setSnackData(prev => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // [신규] 이력 불러오기 핸들러
  const handleLoadHistory = (item: SnackHistoryItem) => {
      if (confirm(`${item.archivedDate} 데이터를 불러오시겠습니까?\n현재 작성 중인 내용은 사라집니다.`)) {
          setSnackData({
              items: item.items,
              notice: item.notice,
              imageUrl: item.imageUrl,
              updatedAt: new Date().toLocaleDateString() // 날짜는 오늘로 갱신
          });
          setShowHistory(false);
          setIsEditing(true); // 바로 수정 모드로 진입
      }
  };

  // [신규] 이력 삭제 핸들러
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('정말 이 기록을 삭제하시겠습니까?')) {
          const newHistory = history.filter(h => h.id !== id);
          setHistory(newHistory);
          localStorage.setItem('weeklySnackHistory', JSON.stringify(newHistory));
      }
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300 relative">
      
      {/* [신규] 이력 관리 모달 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800 relative z-10 animate-fade-in-up">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">지난 간식 이력</h3>
                    <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {history.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">저장된 이력이 없습니다.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleLoadHistory(item)}
                                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group relative"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{item.archivedDate}</span>
                                        <button 
                                            onClick={(e) => handleDeleteHistory(item.id, e)}
                                            className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="삭제"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{item.items}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.notice}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-200 dark:border-orange-800">부산신항</span>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">금주의 간식</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              한일후지코리아 & 후지글로벌로지스틱 임직원을 위한 간식 안내입니다.
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              {/* [신규] 이력 버튼 */}
              <button 
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                이력 관리
              </button>

              {isEditing ? (
                <button 
                  onClick={handleSave} 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  저장 완료
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  간식 정보 수정
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Date Header */}
            <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">{dateString} ({dayString})</span>
                </div>
                <span className="text-xs text-slate-400">최종 업데이트: {snackData.updatedAt}</span>
            </div>

            <div className="p-6 lg:p-8 flex flex-col md:flex-row gap-8">
                
                {/* Image Section */}
                <div className="w-full md:w-1/2">
                    <div className="aspect-video bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group">
                        {snackData.imageUrl ? (
                            <img src={snackData.imageUrl} alt="Snack" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-slate-400">
                                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-sm">이미지가 없습니다</p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors"
                                >
                                    {isUploading ? '업로드 중...' : '이미지 변경'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                    
                    {/* Snack Item */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">제공 메뉴</h3>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={snackData.items}
                                onChange={(e) => setSnackData({ ...snackData, items: e.target.value })}
                                className="w-full text-2xl font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        ) : (
                            <p className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
                                {snackData.items}
                            </p>
                        )}
                    </div>

                    {/* Notice */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            안내 사항
                        </div>
                        {isEditing ? (
                            <textarea 
                                value={snackData.notice}
                                onChange={(e) => setSnackData({ ...snackData, notice: e.target.value })}
                                className="w-full text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none h-24"
                            />
                        ) : (
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {snackData.notice}
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default WeeklySnack;