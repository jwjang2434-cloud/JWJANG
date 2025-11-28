import React, { useState } from 'react';
import { MenuCategory, MenuItem, ViewPage } from '../types';

interface MenuManagementProps {
    menuItems: MenuCategory[];
    onUpdateMenuItems: (newItems: MenuCategory[]) => void;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ menuItems, onUpdateMenuItems }) => {
    const [newItemLabel, setNewItemLabel] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(menuItems[0]?.id || '');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedIconId, setSelectedIconId] = useState<string>('document');

    // Predefined Icon Options
    const ICON_OPTIONS = [
        {
            id: 'document',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        },
        {
            id: 'calendar',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        },
        {
            id: 'chat',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        },
        {
            id: 'star',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
        },
        {
            id: 'user',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        },
        {
            id: 'link',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        },
        {
            id: 'archive',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        },
        {
            id: 'bell',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        }
    ];

    const handleAddItem = () => {
        if (!newItemLabel.trim() || !selectedCategory) return;

        // Generate a unique ID for custom items
        const newId = `CUSTOM_${Date.now()}` as ViewPage;
        const selectedIconObj = ICON_OPTIONS.find(opt => opt.id === selectedIconId) || ICON_OPTIONS[0];

        const newItem: MenuItem = {
            id: newId,
            label: newItemLabel,
            icon: selectedIconObj.icon,
            isCustom: true
        };

        const updatedCategories = menuItems.map(cat => {
            if (cat.id === selectedCategory) {
                return { ...cat, items: [...cat.items, newItem] };
            }
            return cat;
        });

        onUpdateMenuItems(updatedCategories);
        setNewItemLabel('');
    };

    const handleDeleteItem = (categoryId: string, itemId: ViewPage) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            const updatedCategories = menuItems.map(cat => {
                if (cat.id === categoryId) {
                    return { ...cat, items: cat.items.filter(item => item.id !== itemId) };
                }
                return cat;
            });
            onUpdateMenuItems(updatedCategories);
        }
    };

    const startEditing = (item: MenuItem) => {
        setEditingId(item.id);
        setEditLabel(item.label);
    };

    const saveEditing = (categoryId: string) => {
        if (!editLabel.trim()) return;

        const updatedCategories = menuItems.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    items: cat.items.map(item =>
                        item.id === editingId ? { ...item, label: editLabel } : item
                    )
                };
            }
            return cat;
        });

        onUpdateMenuItems(updatedCategories);
        setEditingId(null);
        setEditLabel('');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditLabel('');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">메뉴 관리</h1>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">새 메뉴 추가</h2>

                {/* Icon Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">아이콘 선택</label>
                    <div className="flex flex-wrap gap-2">
                        {ICON_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedIconId(opt.id)}
                                className={`p-2 rounded-lg border transition-all ${selectedIconId === opt.id
                                        ? 'bg-indigo-100 border-indigo-500 text-indigo-600 dark:bg-indigo-900/50 dark:border-indigo-400 dark:text-indigo-400 ring-2 ring-indigo-500/30'
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
                                    }`}
                                title={opt.id}
                            >
                                {opt.icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 mb-3">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {menuItems.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={newItemLabel}
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        placeholder="메뉴 이름 입력"
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <button
                        onClick={handleAddItem}
                        disabled={!newItemLabel.trim()}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        추가
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {menuItems.map((category) => (
                    <div key={category.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            {category.label}
                        </h2>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {category.items.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="text-slate-400 dark:text-slate-500">
                                            {item.icon}
                                        </div>
                                        {editingId === item.id ? (
                                            <input
                                                type="text"
                                                value={editLabel}
                                                onChange={(e) => setEditLabel(e.target.value)}
                                                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEditing(category.id);
                                                    if (e.key === 'Escape') cancelEditing();
                                                }}
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {editingId === item.id ? (
                                            <>
                                                <button
                                                    onClick={() => saveEditing(category.id)}
                                                    className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 rounded hover:bg-green-100 dark:hover:bg-green-900/50"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                                >
                                                    취소
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEditing(item)}
                                                    className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(category.id, item.id)}
                                                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 rounded hover:bg-red-100 dark:hover:bg-red-900/50"
                                                >
                                                    삭제
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuManagement;
