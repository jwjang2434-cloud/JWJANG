
import React, { useState, useRef } from 'react';
import PDFViewer from './PDFViewer';
import { UserProfile, UserRole, LLMConfig } from '../types';
import { parseMenuImage } from '../services/geminiService';

interface WeeklyMenuProps {
    user: UserProfile;
    llmConfig: LLMConfig;
}

interface Meal {
    main: string;
    main_en?: string; // English name for image generation
    soup: string;
    side: string[];
    plus_menu?: string[]; // Additional items like beverages or self-bar
    kcal: number;
}

interface MenuItem {
    day: string;
    date: string;
    lunch: Meal;
    dinner: Meal;
    image?: string; // Representative image for the day
    category?: string; // e.g., '한식', '중식데이', '분식데이'
}

const WeeklyMenu: React.FC<WeeklyMenuProps> = ({ user, llmConfig }) => {
    const initialMenu: MenuItem[] = [
        {
            day: '월', date: '02/10',
            lunch: { main: '소불고기 덮밥', main_en: 'Beef Bulgogi Rice Bowl', soup: '콩나물국', side: ['계란말이', '배추김치', '과일샐러드'], plus_menu: ['복숭아아이스티', '셀프라면', '셀프계란후라이'], kcal: 850 },
            dinner: { main: '김치볶음밥', main_en: 'Kimchi Fried Rice', soup: '유부장국', side: ['단무지', '깍두기', '쥬시쿨'], kcal: 750 },
            category: '한식'
        },
        {
            day: '화', date: '02/11',
            lunch: { main: '치즈 돈까스', main_en: 'Cheese Pork Cutlet', soup: '크림스프', side: ['마카로니', '깍두기', '피클'], plus_menu: ['옥수수수염차', '셀프라면', '셀프계란후라이'], kcal: 920 },
            dinner: { main: '제육볶음', main_en: 'Spicy Stir-fried Pork', soup: '미역국', side: ['쌈무', '콩나물무침', '김치'], kcal: 880 },
            category: '분식데이'
        },
        {
            day: '수', date: '02/12',
            lunch: { main: '해물 된장찌개', main_en: 'Seafood Soybean Paste Stew', soup: '잡곡밥', side: ['고등어구이', '시금치나물', '열무김치'], plus_menu: ['살구주스', '셀프라면', '셀프계란후라이'], kcal: 780 },
            dinner: { main: '닭갈비', main_en: 'Spicy Stir-fried Chicken', soup: '콩나물국', side: ['무쌈', '배추김치', '요구르트'], kcal: 820 },
            category: '한식'
        },
        {
            day: '목', date: '02/13',
            lunch: { main: '짜장면 & 탕수육', main_en: 'Jajangmyeon and Tangsuyuk', soup: '짬뽕국물', side: ['단무지', '군만두', '짜사이'], plus_menu: ['누룽지', '셀프라면', '셀프계란후라이'], kcal: 1100 },
            dinner: { main: '순두부찌개', main_en: 'Soft Tofu Stew', soup: '흑미밥', side: ['계란찜', '오징어젓갈', '김치'], kcal: 700 },
            category: '중식데이'
        },
        {
            day: '금', date: '02/14',
            lunch: { main: '비빔밥', main_en: 'Bibimbap', soup: '미소장국', side: ['약고추장', '백김치', '요구르트'], plus_menu: ['유자차', '셀프라면', '셀프계란후라이'], kcal: 650 },
            dinner: { main: '잔치국수', main_en: 'Banquet Noodles', soup: '주먹밥', side: ['배추김치', '단무지', '식혜'], kcal: 600 },
            category: '한식'
        },
    ];

    // Initialize menu from localStorage or default
    const [menu, setMenu] = useState<MenuItem[]>(() => {
        if (typeof window !== 'undefined') {
            const savedMenu = localStorage.getItem('weekly_menu_data');
            if (savedMenu) {
                try {
                    const parsed = JSON.parse(savedMenu);
                    // Migration: Ensure plus_menu exists
                    return parsed.map((item: any) => ({
                        ...item,
                        lunch: {
                            ...item.lunch,
                            plus_menu: item.lunch.plus_menu || []
                        }
                    }));
                } catch (e) {
                    console.error("Failed to parse saved menu", e);
                }
            }
        }
        return initialMenu;
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showPDF, setShowPDF] = useState(false);

    // Initialize image from localStorage
    const [menuImage, setMenuImage] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('weekly_menu_image');
        }
        return null;
    });

    // Save menu to localStorage whenever it changes
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('weekly_menu_data', JSON.stringify(menu));
        }
    }, [menu]);

    // Save menuImage to localStorage whenever it changes
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            if (menuImage) {
                localStorage.setItem('weekly_menu_image', menuImage);
            } else {
                localStorage.removeItem('weekly_menu_image');
            }
        }
    }, [menuImage]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dayImageInputRef = useRef<HTMLInputElement>(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

    const isAdmin = user.role === UserRole.ADMIN;

    const getGeneratedImageUrl = (keyword: string) => {
        // Use Pollinations.ai for on-the-fly image generation
        // Add 'delicious food' to ensure food context
        const prompt = encodeURIComponent(`delicious food ${keyword}, photorealistic, high quality, 4k`);
        return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=300&nologo=true`;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setIsAnalyzing(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            if (event.target?.result) {
                const imageBase64 = event.target.result as string;
                setMenuImage(imageBase64);

                try {
                    if (llmConfig.apiKey) {
                        const parsedMenu = await parseMenuImage(llmConfig.apiKey, llmConfig.modelName, imageBase64);
                        if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
                            setMenu(parsedMenu);
                            alert("이미지에서 식단 정보를 성공적으로 추출했습니다!");
                        } else {
                            alert("식단 정보를 추출했지만 형식이 올바르지 않습니다.");
                        }
                    } else {
                        alert("API Key가 설정되지 않아 이미지 분석을 건너뜁니다. (이미지만 표시됨)");
                    }
                } catch (error) {
                    console.error("Menu parsing error:", error);
                    alert("식단 이미지 분석 중 오류가 발생했습니다. 이미지만 표시됩니다.");
                } finally {
                    setIsUploading(false);
                    setIsAnalyzing(false);
                    setShowPDF(true);
                }
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || selectedDayIndex === null) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const newMenu = [...menu];
                newMenu[selectedDayIndex].image = event.target.result as string;
                setMenu(newMenu);
            }
        };
        reader.readAsDataURL(file);
    };

    const triggerDayImageUpload = (index: number) => {
        setSelectedDayIndex(index);
        dayImageInputRef.current?.click();
    };

    const handleUpdateMenu = (index: number, type: 'lunch' | 'dinner', field: keyof Meal, value: any) => {
        const newMenu = [...menu];
        newMenu[index] = {
            ...newMenu[index],
            [type]: {
                ...newMenu[index][type],
                [field]: value
            }
        };
        setMenu(newMenu);
    };

    const handleUpdateCategory = (index: number, value: string) => {
        const newMenu = [...menu];
        newMenu[index].category = value;
        setMenu(newMenu);
    };

    const handleUpdateSide = (menuIndex: number, type: 'lunch' | 'dinner', sideIndex: number, value: string) => {
        const newMenu = [...menu];
        const newSides = [...newMenu[menuIndex][type].side];
        newSides[sideIndex] = value;
        newMenu[menuIndex] = {
            ...newMenu[menuIndex],
            [type]: {
                ...newMenu[menuIndex][type],
                side: newSides
            }
        };
        setMenu(newMenu);
    };

    const handleUpdatePlusMenu = (menuIndex: number, type: 'lunch' | 'dinner', plusIndex: number, value: string) => {
        const newMenu = [...menu];
        const meal = newMenu[menuIndex][type];
        if (!meal.plus_menu) meal.plus_menu = [];

        const newPlusMenu = [...meal.plus_menu];
        // Ensure array is large enough if we are setting a high index
        while (newPlusMenu.length <= plusIndex) {
            newPlusMenu.push('');
        }
        newPlusMenu[plusIndex] = value;

        newMenu[menuIndex] = {
            ...newMenu[menuIndex],
            [type]: {
                ...meal,
                plus_menu: newPlusMenu
            }
        };
        setMenu(newMenu);
    };

    const handleSave = () => {
        setIsEditing(false);
        alert('식단 정보가 저장되었습니다.');
    };

    const getCategoryColor = (category?: string) => {
        if (category?.includes('중식')) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        if (category?.includes('분식')) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        if (category?.includes('특식')) return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    };

    const renderMealSection = (item: MenuItem, type: 'lunch' | 'dinner', idx: number) => {
        const meal = item[type];
        const title = type === 'lunch' ? '중식' : '석식';
        const titleColor = type === 'lunch' ? 'text-orange-600 dark:text-orange-400' : 'text-indigo-600 dark:text-indigo-400';
        const bgColor = type === 'lunch' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-indigo-50 dark:bg-indigo-900/20';

        // Helper to get plus menu items for editing (ensure at least 3 slots)
        const getPlusMenuForEdit = () => {
            const current = meal.plus_menu || [];
            const result = [...current];
            while (result.length < 3) {
                result.push('');
            }
            return result;
        };

        return (
            <div className={`p-3 rounded-lg ${bgColor} mb-2 last:mb-0`}>
                <h4 className={`font-bold text-sm mb-2 ${titleColor} flex items-center gap-1`}>
                    {type === 'lunch' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                    {title}
                </h4>

                {isEditing ? (
                    <div className="space-y-2">
                        <input
                            className="w-full p-1 text-sm font-bold border rounded bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600"
                            value={meal.main}
                            onChange={(e) => handleUpdateMenu(idx, type, 'main', e.target.value)}
                            placeholder="메인 메뉴"
                        />
                        <input
                            className="w-full p-1 text-sm text-slate-500 border rounded bg-white dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
                            value={meal.soup}
                            onChange={(e) => handleUpdateMenu(idx, type, 'soup', e.target.value)}
                            placeholder="국/스프"
                        />
                        <div className="space-y-1">
                            {meal.side.map((s, sIdx) => (
                                <input
                                    key={sIdx}
                                    className="w-full p-1 text-xs text-slate-600 border rounded bg-white dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
                                    value={s}
                                    onChange={(e) => handleUpdateSide(idx, type, sIdx, e.target.value)}
                                    placeholder="반찬"
                                />
                            ))}
                        </div>
                        {/* Plus Menu Editing */}
                        {type === 'lunch' && (
                            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                <p className="text-[10px] text-slate-400 font-medium">Plus Menu</p>
                                {getPlusMenuForEdit().map((p, pIdx) => (
                                    <input
                                        key={`plus-${pIdx}`}
                                        className="w-full p-1 text-xs text-slate-500 border rounded bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600"
                                        value={p}
                                        onChange={(e) => handleUpdatePlusMenu(idx, type, pIdx, e.target.value)}
                                        placeholder="추가 메뉴 (음료 등)"
                                    />
                                ))}
                            </div>
                        )}
                        <input
                            type="number"
                            className="w-full p-1 text-xs text-right border rounded bg-white dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600"
                            value={meal.kcal}
                            onChange={(e) => handleUpdateMenu(idx, type, 'kcal', e.target.value)}
                            placeholder="Kcal"
                        />
                    </div>
                ) : (
                    <>
                        <h3 className="font-bold text-base text-slate-800 dark:text-white mb-1">{meal.main}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{meal.soup}</p>

                        <div className="space-y-1 mb-2">
                            {meal.side.map((s, i) => (
                                <p key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                    <span className={`w-1 h-1 rounded-full ${type === 'lunch' ? 'bg-orange-400' : 'bg-indigo-400'}`}></span>
                                    {s}
                                </p>
                            ))}
                        </div>

                        {/* Plus Menu Display */}
                        {type === 'lunch' && meal.plus_menu && meal.plus_menu.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                                {meal.plus_menu.map((p, i) => (
                                    <p key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                        {p}
                                    </p>
                                ))}
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-right">
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{meal.kcal} Kcal</span>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">

            {showPDF && (
                <PDFViewer
                    title="주간 식단표 이미지"
                    onClose={() => setShowPDF(false)}
                    user={user}
                    type="IMAGE"
                    customImage={menuImage || undefined}
                />
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">금주의 식단</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">한일후지코리아 사내 식당 주간 메뉴입니다.</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPDF(true)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            식단표 이미지 보기
                        </button>

                        {isAdmin && (
                            <>
                                <input type="file" accept=".jpg,.png,.jpeg" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                <input type="file" accept=".jpg,.png,.jpeg" ref={dayImageInputRef} onChange={handleDayImageUpload} className="hidden" />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isAnalyzing}
                                    className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    {isAnalyzing ? 'AI 분석 중...' : (isUploading ? '업로드...' : '식단표 이미지 업로드')}
                                </button>
                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800 hover:bg-slate-700'}`}
                                >
                                    {isEditing ? '저장 완료' : '식단 편집'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {menu.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{item.day}요일 ({item.date})</span>

                                {isEditing ? (
                                    <input
                                        className="text-xs px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 w-20 text-center"
                                        value={item.category || '한식'}
                                        onChange={(e) => handleUpdateCategory(idx, e.target.value)}
                                        placeholder="카테고리"
                                    />
                                ) : (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getCategoryColor(item.category)}`}>
                                        {item.category || '한식'}
                                    </span>
                                )}
                            </div>

                            {/* Representative Image for the Day */}
                            <div className="relative h-40 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 overflow-hidden group-hover:opacity-100 transition-opacity">
                                <img
                                    src={item.image || getGeneratedImageUrl(item.lunch.main_en || item.lunch.main)}
                                    alt={`${item.day}요일 메뉴`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        // Fallback if generation fails
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                />

                                {isEditing && (
                                    <button
                                        onClick={() => triggerDayImageUpload(idx)}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm"
                                    >
                                        이미지 변경
                                    </button>
                                )}
                            </div>

                            <div className="p-4 flex-1 flex flex-col gap-2">
                                {renderMealSection(item, 'lunch', idx)}
                                {renderMealSection(item, 'dinner', idx)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-200 flex gap-3 items-start transition-colors">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <p className="font-bold mb-1">알레르기 정보 안내</p>
                        <p>식단 내 알레르기 유발 물질(난류, 우유, 메밀, 땅콩, 대두, 밀, 고등어, 게, 새우, 돼지고기, 복숭아, 토마토 등)이 포함될 수 있으니 특이체질인 경우 반드시 섭취 전 확인 바랍니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyMenu;
