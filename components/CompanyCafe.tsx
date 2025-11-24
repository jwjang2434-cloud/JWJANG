
import React, { useState, useRef } from 'react';
import { UserProfile, UserRole } from '../types';

interface CompanyCafeProps {
  user?: UserProfile;
}

const CompanyCafe: React.FC<CompanyCafeProps> = ({ user }) => {
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = user?.role === UserRole.ADMIN;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate Upload
    setTimeout(() => {
        // Create local preview URL
        const objectUrl = URL.createObjectURL(file);
        setMenuImage(objectUrl);
        setIsUploading(false);
        alert("카페 메뉴판 이미지가 업데이트되었습니다.");
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">사내 카페 (Inno Cafe)</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">향긋한 커피와 함께 잠시 쉬어가세요.</p>
            </div>
            
            {isAdmin && (
                <div>
                     <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                     >
                        {isUploading ? '업로드 중...' : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                메뉴판 이미지 교체
                            </>
                        )}
                     </button>
                </div>
            )}
        </div>

        {/* Operation Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">운영 시간</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm pl-2">
                    평일: 08:00 ~ 17:00<br/>
                    (점심시간: 12:00 ~ 13:00)<br/>
                    <span className="text-xs text-slate-400 dark:text-slate-500">* 주말 및 공휴일 휴무</span>
                </p>
            </div>
             <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">위치 안내</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm pl-2">
                    본관 1층 로비 우측<br/>
                    (구내식당 입구 맞은편)
                </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">할인 혜택</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm pl-2">
                    사원증 태그 시 전 메뉴 <span className="text-red-500 font-bold">50% 할인</span><br/>
                    (텀블러 이용 시 300원 추가 할인)
                </p>
            </div>
        </div>

        {/* Menu Image View */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-2 overflow-hidden">
            {menuImage ? (
                <img src={menuImage} alt="Cafe Menu" className="w-full h-auto rounded-xl" />
            ) : (
                <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                     <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     <p className="text-lg font-medium">등록된 메뉴판 이미지가 없습니다.</p>
                     <p className="text-sm mt-1">관리자가 이미지를 업로드하면 이곳에 표시됩니다.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default CompanyCafe;
