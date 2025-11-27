
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface CompanyCafeProps {
    user?: UserProfile;
}

interface CafeInfo {
    operatingHoursLabel: string;
    operatingHours: string;
    lunchBreakLabel: string;
    lunchBreak: string;
    closedDaysLabel: string;
    closedDays: string;
    locationLabel: string;
    location: string;
    locationDetailLabel: string;
    locationDetail: string;
    discountRateLabel: string;
    discountRate: string;
    discountNoteLabel: string;
    discountNote: string;
}

const MENU_IMAGE_KEY = 'companyCafe_menuImage';
const CAFE_INFO_KEY = 'companyCafe_info';

const DEFAULT_CAFE_INFO: CafeInfo = {
    operatingHoursLabel: '운영시간',
    operatingHours: '평일: 08:00 ~ 17:00',
    lunchBreakLabel: '점심시간',
    lunchBreak: '(점심시간: 12:00 ~ 13:00)',
    closedDaysLabel: '휴무일 안내',
    closedDays: '* 주말 및 공휴일 휴무',
    locationLabel: '위치',
    location: '본관 1층 로비 우측',
    locationDetailLabel: '위치 상세',
    locationDetail: '(구내식당 입구 맞은편)',
    discountRateLabel: '할인율',
    discountRate: '50% 할인',
    discountNoteLabel: '할인 안내',
    discountNote: '(텀블러 이용 시 300원 추가 할인)',
};

const CompanyCafe: React.FC<CompanyCafeProps> = ({ user }) => {
    const [menuImage, setMenuImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [cafeInfo, setCafeInfo] = useState<CafeInfo>(DEFAULT_CAFE_INFO);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<CafeInfo>(DEFAULT_CAFE_INFO);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = user?.role === UserRole.ADMIN;

    // Load saved menu image from localStorage on component mount
    useEffect(() => {
        const savedImage = localStorage.getItem(MENU_IMAGE_KEY);
        if (savedImage) {
            setMenuImage(savedImage);
        }

        const savedInfo = localStorage.getItem(CAFE_INFO_KEY);
        if (savedInfo) {
            try {
                const parsedInfo = JSON.parse(savedInfo);
                // Merge with default info to ensure new label fields exist for old data
                const mergedInfo = { ...DEFAULT_CAFE_INFO, ...parsedInfo };
                setCafeInfo(mergedInfo);
                setEditFormData(mergedInfo);
            } catch (error) {
                console.error('Failed to parse cafe info:', error);
            }
        }
    }, []);

    // Compress image before converting to Base64
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if image is too large (max width: 1200px)
                    const maxWidth = 1200;
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to JPEG with 0.7 quality to reduce size
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedBase64);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Convert file to Base64 string
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            console.log('Starting image upload...', { fileName: file.name, fileSize: file.size, fileType: file.type });

            // Compress and convert file to Base64
            const base64Image = await compressImage(file);
            console.log('Image compressed and converted to Base64, length:', base64Image.length);

            // Try to save to localStorage
            try {
                localStorage.setItem(MENU_IMAGE_KEY, base64Image);
                console.log('Image saved to localStorage successfully');
            } catch (storageError) {
                console.error('localStorage error:', storageError);
                if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
                    throw new Error('QUOTA_EXCEEDED');
                }
                throw storageError;
            }

            // Update state to display the image
            setMenuImage(base64Image);

            setTimeout(() => {
                setIsUploading(false);
                alert("카페 메뉴판 이미지가 업데이트되었습니다.");
            }, 500);
        } catch (error) {
            console.error('Failed to upload image:', error);
            setIsUploading(false);

            if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
                alert("저장 공간이 부족합니다. 브라우저의 localStorage를 정리하거나 더 작은 이미지를 사용해주세요.");
            } else {
                alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.\n에러 내용을 콘솔(F12)에서 확인하세요.");
            }
        }
    };

    // Open edit modal
    const handleOpenEditModal = () => {
        setEditFormData(cafeInfo);
        setIsEditModalOpen(true);
    };

    // Close edit modal
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditFormData(cafeInfo); // Reset form data
    };

    // Save cafe info
    const handleSaveCafeInfo = () => {
        try {
            localStorage.setItem(CAFE_INFO_KEY, JSON.stringify(editFormData));
            setCafeInfo(editFormData);
            setIsEditModalOpen(false);
            alert("카페 정보가 업데이트되었습니다.");
        } catch (error) {
            console.error('Failed to save cafe info:', error);
            alert("카페 정보 저장에 실패했습니다.");
        }
    };

    // Update form field
    const handleFormChange = (field: keyof CafeInfo, value: string) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
                        <div className="flex gap-2 flex-wrap">
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
                            <button
                                onClick={handleOpenEditModal}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                카페 정보 수정
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
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300 pl-2">
                            <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{cafeInfo.operatingHoursLabel}</div>
                            <div>{cafeInfo.operatingHours}</div>
                            <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{cafeInfo.lunchBreakLabel}</div>
                            <div>{cafeInfo.lunchBreak}</div>
                            <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{cafeInfo.closedDaysLabel}</div>
                            <div>{cafeInfo.closedDays}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">위치 안내</h3>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300 pl-2">
                            <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{cafeInfo.locationLabel}</div>
                            <div>{cafeInfo.location}</div>
                            <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{cafeInfo.locationDetailLabel}</div>
                            <div>{cafeInfo.locationDetail}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">할인 혜택</h3>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300 pl-2">
                            <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{cafeInfo.discountRateLabel}</div>
                            <div><span className="text-red-500 font-bold">{cafeInfo.discountRate}</span></div>
                            <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{cafeInfo.discountNoteLabel}</div>
                            <div>{cafeInfo.discountNote}</div>
                        </div>
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

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">카페 정보 수정</h3>
                            <button
                                onClick={handleCloseEditModal}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Operating Hours Section */}
                            <div>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    운영 시간
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">항목 제목</label>
                                            <input
                                                type="text"
                                                value={editFormData.operatingHoursLabel}
                                                onChange={(e) => handleFormChange('operatingHoursLabel', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">내용</label>
                                            <input
                                                type="text"
                                                value={editFormData.operatingHours}
                                                onChange={(e) => handleFormChange('operatingHours', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">항목 제목</label>
                                            <input
                                                type="text"
                                                value={editFormData.lunchBreakLabel}
                                                onChange={(e) => handleFormChange('lunchBreakLabel', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">내용</label>
                                            <input
                                                type="text"
                                                value={editFormData.lunchBreak}
                                                onChange={(e) => handleFormChange('lunchBreak', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">항목 제목</label>
                                            <input
                                                type="text"
                                                value={editFormData.closedDaysLabel}
                                                onChange={(e) => handleFormChange('closedDaysLabel', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">내용</label>
                                            <input
                                                type="text"
                                                value={editFormData.closedDays}
                                                onChange={(e) => handleFormChange('closedDays', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    위치 안내
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">항목 제목</label>
                                            <input
                                                type="text"
                                                value={editFormData.locationLabel}
                                                onChange={(e) => handleFormChange('locationLabel', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">내용</label>
                                            <input
                                                type="text"
                                                value={editFormData.location}
                                                onChange={(e) => handleFormChange('location', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">항목 제목</label>
                                            <input
                                                type="text"
                                                value={editFormData.locationDetailLabel}
                                                onChange={(e) => handleFormChange('locationDetailLabel', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">내용</label>
                                            <input
                                                type="text"
                                                value={editFormData.locationDetail}
                                                onChange={(e) => handleFormChange('locationDetail', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Discount Section */}
                            <div>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                    </div>
                                    할인 혜택
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">항목 제목</label>
                                            <input
                                                type="text"
                                                value={editFormData.discountRateLabel}
                                                onChange={(e) => handleFormChange('discountRateLabel', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">내용</label>
                                            <input
                                                type="text"
                                                value={editFormData.discountRate}
                                                onChange={(e) => handleFormChange('discountRate', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">항목 제목</label>
                                            <input
                                                type="text"
                                                value={editFormData.discountNoteLabel}
                                                onChange={(e) => handleFormChange('discountNoteLabel', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">내용</label>
                                            <input
                                                type="text"
                                                value={editFormData.discountNote}
                                                onChange={(e) => handleFormChange('discountNote', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 flex gap-3 justify-end">
                            <button
                                onClick={handleCloseEditModal}
                                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveCafeInfo}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CompanyCafe;
