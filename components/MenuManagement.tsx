import React, { useState } from 'react';
import { MenuItem, ViewPage } from '../types';

interface MenuManagementProps {
    menuItems: MenuItem[];
    onUpdateMenuItems: (newItems: MenuItem[]) => void;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ menuItems, onUpdateMenuItems }) => {
    const [newItemLabel, setNewItemLabel] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');

    // Default icons for custom items (simple placeholder)
    const defaultIcon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );

    const handleAddItem = () => {
        if (!newItemLabel.trim()) return;

        // Generate a unique ID for custom items
        const newId = `CUSTOM_${Date.now()}` as ViewPage;

        const newItem: MenuItem = {
            id: newId,
            label: newItemLabel,
            icon: defaultIcon,
            isCustom: true
        };

        onUpdateMenuItems([...menuItems, newItem]);
        setNewItemLabel('');
    };

    const handleDeleteItem = (id: ViewPage) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            onUpdateMenuItems(menuItems.filter(item => item.id !== id));
        }
    };

    const startEditing = (item: MenuItem) => {
        setEditingId(item.id);
        setEditLabel(item.label);
    };

    const saveEditing = () => {
        if (!editLabel.trim()) return;

        const updatedItems = menuItems.map(item =>
            item.id === editingId ? { ...item, label: editLabel } : item
        );

        onUpdateMenuItems(updatedItems);
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
                <div className="flex gap-3">
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

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white p-6 border-b border-slate-200 dark:border-slate-800">
                    현재 메뉴 목록
                </h2>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {menuItems.map((item) => (
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
                                            if (e.key === 'Enter') saveEditing();
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
                                            onClick={saveEditing}
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
                                            onClick={() => handleDeleteItem(item.id)}
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
        </div>
    );
};

export default MenuManagement;
