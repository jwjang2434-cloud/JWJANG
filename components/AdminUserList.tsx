import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, UserAccount } from '../types';
import { getUsers, addUser, updateUser, deleteUser } from '../services/authService';

interface AdminUserListProps {
    user: UserProfile;
}

const AdminUserList: React.FC<AdminUserListProps> = ({ user }) => {
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
    const [formData, setFormData] = useState<Partial<UserAccount>>({
        id: '',
        password: '',
        name: '',
        department: '',
        role: UserRole.USER,
        companyName: '한일후지코리아(주)',
        birthDate: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        try {
            const loadedUsers = getUsers();
            setUsers(loadedUsers);
        } catch (e) {
            console.error('Failed to load users', e);
        }
    };

    const handleOpenModal = (userToEdit?: UserAccount) => {
        if (userToEdit) {
            setEditingUser(userToEdit);
            setFormData({ ...userToEdit, password: '' }); // Don't show password
        } else {
            setEditingUser(null);
            setFormData({
                id: '',
                password: '',
                name: '',
                department: '',
                role: UserRole.USER,
                companyName: '한일후지코리아(주)',
                birthDate: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update
                const updates: Partial<UserAccount> = {
                    name: formData.name,
                    department: formData.department,
                    role: formData.role,
                    birthDate: formData.birthDate
                };
                if (formData.password) {
                    updates.password = formData.password;
                }
                updateUser(editingUser.id, updates);
                alert('사용자 정보가 수정되었습니다.');
            } else {
                // Add
                if (!formData.id || !formData.password || !formData.name) {
                    alert('필수 정보를 모두 입력해주세요.');
                    return;
                }
                addUser(formData as UserAccount);
                alert('새로운 사용자가 추가되었습니다.');
            }
            loadUsers();
            handleCloseModal();
        } catch (err) {
            alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
        }
    };

    const handleDelete = (id: string) => {
        if (id === user.id) {
            alert('자신의 계정은 삭제할 수 없습니다.');
            return;
        }
        if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
            try {
                deleteUser(id);
                loadUsers();
            } catch (err) {
                alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
            }
        }
    };

    // 관리자 권한 확인
    if (user.role !== UserRole.ADMIN) {
        return (
            <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">접근 권한 없음</h3>
                    <p className="text-slate-500 dark:text-slate-400">관리자만 접근할 수 있는 페이지입니다.</p>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">계정 관리</h2>
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-800">
                                관리자 전용
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">시스템 접속 계정을 관리합니다.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        새 계정 추가
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="이름, 아이디, 부서 검색..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">사용자</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">아이디</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">부서</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">권한</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    {u.avatarUrl ? (
                                                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-800 dark:text-white">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{u.id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{u.department}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${u.role === UserRole.ADMIN
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(u)}
                                                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                                    title="수정"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                    title="삭제"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {editingUser ? '계정 수정' : '새 계정 추가'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">아이디</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    disabled={!!editingUser}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                    placeholder="로그인 ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {editingUser ? '비밀번호 (변경 시에만 입력)' : '비밀번호'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="비밀번호"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">이름</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="사용자 이름"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">부서</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="소속 부서"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">권한</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value={UserRole.USER}>일반 사용자 (USER)</option>
                                    <option value={UserRole.ADMIN}>관리자 (ADMIN)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserList;
