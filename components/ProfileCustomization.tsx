import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileCustomizationProps {
    user: UserProfile;
    onClose: () => void;
    onSave: (customNickname: string, customAvatarUrl: string) => void;
}

// 기본 제공 아바타 옵션 (Base64 인코딩된 이미지 - 실제로는 생성된 이미지 사용)
const DEFAULT_AVATARS = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI0ZGQjZDMSIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDAiIHI9IjUiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSI2NSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTMwIDYwIFE1MCA3MCA3MCA2MCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI0FERDhFNiIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDAiIHI9IjUiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSI2NSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTMwIDYwIFE1MCA3MCA3MCA2MCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI0ZGRjlDNCIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDAiIHI9IjUiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSI2NSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTMwIDYwIFE1MCA3MCA3MCA2MCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI0M3RUFERCI7Lz48Y2lyY2xlIGN4PSIzNSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjMzMzIi8+PGNpcmNsZSBjeD0iNjUiIGN5PSI0MCIgcj0iNSIgZmlsbD0iIzMzMyIvPjxwYXRoIGQ9Ik0zMCA2MCBRNTAgNzAgNzAgNjAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI0U0QzFFNSIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDAiIHI9IjUiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSI2NSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTMwIDYwIFE1MCA3MCA3MCA2MCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
];

const ProfileCustomization: React.FC<ProfileCustomizationProps> = ({ user, onClose, onSave }) => {
    const [nickname, setNickname] = useState(user.customNickname || user.name);
    const [selectedAvatar, setSelectedAvatar] = useState(user.customAvatarUrl || user.avatarUrl);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB 제한
                alert('이미지 크기는 1MB 이하여야 합니다.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setUploadedImage(base64String);
                setSelectedAvatar(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave(nickname, selectedAvatar);
        onClose();
    };

    const handleReset = () => {
        setNickname(user.name);
        setSelectedAvatar(user.avatarUrl);
        setUploadedImage(null);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">프로필 커스터마이징</h2>
                            <p className="text-sm text-indigo-100 mt-1">나만의 프로필을 만들어보세요</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Current Preview */}
                    <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <img
                            src={selectedAvatar}
                            alt="Preview"
                            className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-lg"
                        />
                        <div className="text-center">
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{nickname}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.department}</p>
                        </div>
                    </div>

                    {/* Nickname Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            닉네임
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="원하는 닉네임을 입력하세요"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800 dark:text-white"
                            maxLength={20}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {nickname.length}/20자
                        </p>
                    </div>

                    {/* Avatar Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                            프로필 사진 선택
                        </label>

                        {/* Default Avatars */}
                        <div className="grid grid-cols-5 gap-3 mb-4">
                            {DEFAULT_AVATARS.map((avatar, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedAvatar(avatar);
                                        setUploadedImage(null);
                                    }}
                                    className={`relative w-full aspect-square rounded-full overflow-hidden border-4 transition-all hover:scale-110 ${selectedAvatar === avatar && !uploadedImage
                                            ? 'border-indigo-500 ring-4 ring-indigo-500/30'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Custom Upload */}
                        <div className="relative">
                            <label className="cursor-pointer block">
                                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                                    <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                        {uploadedImage ? '다른 이미지 선택' : '내 사진 업로드 (JPG, PNG)'}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                            {uploadedImage && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    사용자 이미지가 업로드되었습니다
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        초기화
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
                    >
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCustomization;
