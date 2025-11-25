import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface Station {
    name: string;
    time: string;
    locationDesc: string;
    stationImage?: string; // Base64 image string
}

interface BusRoute {
    id: string;
    name: string;
    driverName: string;
    driverPhone: string;
    stations: Station[];
}

interface CommuterBusProps {
    user?: UserProfile;
}

const CommuterBus: React.FC<CommuterBusProps> = ({ user }) => {
    const initialRoutes: BusRoute[] = [
        {
            id: 'route-1',
            name: '1호차 (문현)',
            driverName: '김문현',
            driverPhone: '010-1111-2222',
            stations: [
                { name: '문현역 3번출구', time: '07:10', locationDesc: '3번출구 앞 편의점' },
                { name: '서면역 12번출구', time: '07:25', locationDesc: '신한은행 앞' },
                { name: '가야 홈플러스', time: '07:40', locationDesc: '육교 아래' },
                { name: '회사 도착', time: '08:30', locationDesc: '본관 정문' },
            ]
        },
        {
            id: 'route-2',
            name: '2호차 (시청)',
            driverName: '이시청',
            driverPhone: '010-3333-4444',
            stations: [
                { name: '부산시청역', time: '07:15', locationDesc: '시청 공영주차장 입구' },
                { name: '연산역', time: '07:25', locationDesc: '5번 출구' },
                { name: '동래역', time: '07:40', locationDesc: '내성교차로' },
                { name: '회사 도착', time: '08:30', locationDesc: '본관 정문' },
            ]
        },
        {
            id: 'route-3',
            name: '3호차 (창원/신항)',
            driverName: '박창원',
            driverPhone: '010-5555-6666',
            stations: [
                { name: '창원광장', time: '07:00', locationDesc: '롯데마트 앞' },
                { name: '진해구청', time: '07:30', locationDesc: '민원실 앞' },
                { name: '용원', time: '07:50', locationDesc: '하나로마트 건너편' },
                { name: '회사 도착', time: '08:30', locationDesc: '본관 정문' },
            ]
        },
        {
            id: 'route-4',
            name: '4호차 (명지)',
            driverName: '최명지',
            driverPhone: '010-7777-8888',
            stations: [
                { name: '명지 국제신도시', time: '07:40', locationDesc: '맥도날드 앞' },
                { name: '오션시티', time: '07:55', locationDesc: '행복복지센터' },
                { name: '신호동', time: '08:10', locationDesc: '부영아파트 1단지' },
                { name: '회사 도착', time: '08:30', locationDesc: '본관 정문' },
            ]
        }
    ];

    // LocalStorage에서 데이터 불러오기 (저장된 값이 없으면 초기값 사용)
    const [routes, setRoutes] = useState<BusRoute[]>(() => {
        const saved = localStorage.getItem('commuterRoutes');
        return saved ? JSON.parse(saved) : initialRoutes;
    });

    const [activeTabId, setActiveTabId] = useState<string>(routes[0]?.id || '');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null);

    const isAdmin = user?.role === UserRole.ADMIN;

    useEffect(() => {
        if (routes.length > 0 && !routes.find(r => r.id === activeTabId)) {
            setActiveTabId(routes[0].id);
        }
        setOpenTooltipIndex(null); // 노선 변경 시 툴팁 닫기
    }, [routes, activeTabId]);

    const activeRoute = routes.find(r => r.id === activeTabId);

    const handleSave = () => {
        // 저장 시 LocalStorage에 업데이트
        localStorage.setItem('commuterRoutes', JSON.stringify(routes));
        setIsEditing(false);
        setOpenTooltipIndex(null);
        alert('노선 정보가 저장되었습니다.');
    };

    // 노선 추가/삭제/수정 핸들러들
    const handleAddRoute = () => {
        const newId = `route-${Date.now()}`;
        const newRoute: BusRoute = {
            id: newId,
            name: '신규 노선',
            driverName: '기사님 성함',
            driverPhone: '010-0000-0000',
            stations: []
        };
        setRoutes([...routes, newRoute]);
        setActiveTabId(newId);
    };

    const handleDeleteRoute = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('정말 이 노선을 삭제하시겠습니까?')) {
            const newRoutes = routes.filter(r => r.id !== id);
            setRoutes(newRoutes);
            localStorage.setItem('commuterRoutes', JSON.stringify(newRoutes));
        }
    };

    const handleUpdateRouteName = (id: string, newName: string) => {
        setRoutes(routes.map(r => r.id === id ? { ...r, name: newName } : r));
    };

    const handleUpdateDriver = (field: 'driverName' | 'driverPhone', value: string) => {
        if (!activeRoute) return;
        setRoutes(routes.map(r => r.id === activeRoute.id ? { ...r, [field]: value } : r));
    };

    const handleUpdateStation = (idx: number, field: keyof Station, value: string) => {
        if (!activeRoute) return;
        const newStations = [...activeRoute.stations];
        newStations[idx] = { ...newStations[idx], [field]: value };
        setRoutes(routes.map(r => r.id === activeRoute.id ? { ...r, stations: newStations } : r));
    };

    const handleAddStation = () => {
        if (!activeRoute) return;
        const newStation: Station = { name: '정류장명', time: '00:00', locationDesc: '위치 설명' };
        setRoutes(routes.map(r => r.id === activeRoute.id ? { ...r, stations: [...r.stations, newStation] } : r));
    };

    const handleDeleteStation = (idx: number) => {
        if (!activeRoute) return;
        const newStations = activeRoute.stations.filter((_, i) => i !== idx);
        setRoutes(routes.map(r => r.id === activeRoute.id ? { ...r, stations: newStations } : r));
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = (idx: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) { // 500KB 제한
                alert('이미지 크기는 500KB 이하여야 합니다.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                handleUpdateStation(idx, 'stationImage', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // 이미지 삭제 핸들러
    const handleDeleteImage = (idx: number) => {
        if (confirm('등록된 사진을 삭제하시겠습니까?')) {
            handleUpdateStation(idx, 'stationImage', '');
        }
    };

    const handleToggleTooltip = (idx: number) => {
        setOpenTooltipIndex(prev => prev === idx ? null : idx);
    };

    return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Enlarged Station"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                {/* Responsive Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">통근버스 정보</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">임직원 여러분을 위한 통근버스 노선 및 탑승 위치 안내입니다.</p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            {isEditing ? (
                                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md">
                                    저장 완료
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md">
                                    노선 편집
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    {routes.map(route => (
                        <div key={route.id} className="relative group flex-shrink-0">
                            <button
                                onClick={() => setActiveTabId(route.id)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeTabId === route.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={route.name}
                                        onChange={(e) => handleUpdateRouteName(route.id, e.target.value)}
                                        className="bg-transparent border-b border-white/50 text-center w-24 outline-none text-white"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    route.name
                                )}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={(e) => handleDeleteRoute(e, route.id)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                    {isEditing && (
                        <button onClick={handleAddRoute} className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-bold text-lg flex-shrink-0">
                            +
                        </button>
                    )}
                </div>

                {/* Content */}
                {activeRoute ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                        {/* Driver Info */}
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-6 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">운행중</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{activeRoute.name}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-400">기사님:</span>
                                    {isEditing ? (
                                        <input
                                            value={activeRoute.driverName}
                                            onChange={(e) => handleUpdateDriver('driverName', e.target.value)}
                                            className="w-20 bg-transparent border-b border-slate-300 outline-none"
                                        />
                                    ) : (
                                        <span className="font-bold">{activeRoute.driverName}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-400">연락처:</span>
                                    {isEditing ? (
                                        <input
                                            value={activeRoute.driverPhone}
                                            onChange={(e) => handleUpdateDriver('driverPhone', e.target.value)}
                                            className="w-28 bg-transparent border-b border-slate-300 outline-none"
                                        />
                                    ) : (
                                        <span className="font-bold">{activeRoute.driverPhone}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-6 lg:p-10">
                            <div className="relative pl-4 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-700 space-y-8">
                                {activeRoute.stations.map((station, idx) => (
                                    <div key={idx} className="relative group">
                                        {/* Dot */}
                                        <div className="absolute -left-[25px] sm:-left-[41px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-slate-300 dark:bg-slate-600 group-last:bg-indigo-500 group-hover:scale-125 transition-all"></div>

                                        {/* Card */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all">
                                            <div className="flex-1">
                                                {isEditing ? (
                                                    <input
                                                        value={station.name}
                                                        onChange={(e) => handleUpdateStation(idx, 'name', e.target.value)}
                                                        className="font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-700 border rounded px-1 mb-1 w-full"
                                                        placeholder="정류장명"
                                                    />
                                                ) : (
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{station.name}</h4>
                                                )}

                                                {isEditing ? (
                                                    <input
                                                        value={station.locationDesc}
                                                        onChange={(e) => handleUpdateStation(idx, 'locationDesc', e.target.value)}
                                                        className="text-sm text-slate-500 bg-white dark:bg-slate-700 border rounded px-1 w-full"
                                                        placeholder="위치 설명"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{station.locationDesc}</p>
                                                )}

                                                {/* Photo Upload Section (Editing Mode) */}
                                                {isEditing && (
                                                    <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">정류장 사진 설정</p>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <label className="cursor-pointer px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded transition-colors flex items-center gap-1 shadow-sm">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                사진 선택
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => handleImageUpload(idx, e)}
                                                                />
                                                            </label>
                                                            {station.stationImage ? (
                                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                                                                    <span className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                        등록됨
                                                                    </span>
                                                                    <div className="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
                                                                    <button
                                                                        onClick={() => handleDeleteImage(idx)}
                                                                        className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline"
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400">등록된 사진 없음</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {isEditing ? (
                                                    <input
                                                        type="time"
                                                        value={station.time}
                                                        onChange={(e) => handleUpdateStation(idx, 'time', e.target.value)}
                                                        className="text-xl font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-700 border rounded px-1"
                                                    />
                                                ) : (
                                                    <div className="text-xl font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 tabular-nums">
                                                        {station.time}
                                                    </div>
                                                )}

                                                {!isEditing && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => handleToggleTooltip(idx)}
                                                            className={`p-2 transition-colors ${station.stationImage ? 'text-indigo-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-500'} ${openTooltipIndex === idx ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg' : ''}`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        </button>
                                                        {openTooltipIndex === idx && (
                                                            <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-10 animate-fade-in-up">
                                                                {station.stationImage ? (
                                                                    <div
                                                                        className="w-full rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                                                                        onClick={() => setSelectedImage(station.stationImage!)}
                                                                    >
                                                                        <img src={station.stationImage} alt={station.name} className="w-full h-auto object-cover" />
                                                                        <p className="text-[10px] text-center text-indigo-500 font-bold mt-1 bg-indigo-50 dark:bg-indigo-900/30 py-0.5 rounded">클릭하여 확대</p>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500 mb-1">
                                                                            <span className="text-center">현장 사진<br />(준비중)</span>
                                                                        </div>
                                                                        <p className="text-[10px] text-center text-slate-500">등록된 사진이 없습니다.</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {isEditing && (
                                                    <button
                                                        onClick={() => handleDeleteStation(idx)}
                                                        className="text-xs text-red-500 hover:underline ml-2"
                                                    >
                                                        정류장 삭제
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isEditing && (
                                    <div className="pl-8">
                                        <button
                                            onClick={handleAddStation}
                                            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors font-medium"
                                        >
                                            + 정류장 추가하기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                        선택된 노선 정보가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommuterBus;
