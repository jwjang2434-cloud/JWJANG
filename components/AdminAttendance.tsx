import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord, UserRole } from '../types';

interface AdminAttendanceProps {
    user: UserProfile;
}

const AdminAttendance: React.FC<AdminAttendanceProps> = ({ user }) => {
    const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');

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

    useEffect(() => {
        loadAllRecords();
    }, [selectedMonth, searchTerm]);

    const loadAllRecords = () => {
        const stored = localStorage.getItem('attendance_records');
        if (stored) {
            try {
                const records: AttendanceRecord[] = JSON.parse(stored);

                // 선택된 월의 기록
                const year = selectedMonth.getFullYear();
                const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
                let monthRecords = records.filter(r => r.date.startsWith(`${year}-${month}`));

                // 검색어 필터링
                if (searchTerm) {
                    monthRecords = monthRecords.filter(r =>
                        r.userName.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                setAllRecords(records);
                setFilteredRecords(monthRecords.sort((a, b) => b.date.localeCompare(a.date) || b.checkInTime.localeCompare(a.checkInTime)));
            } catch (e) {
                console.error('Failed to load attendance records', e);
            }
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[date.getDay()];
        return `${month}월 ${day}일 (${dayOfWeek})`;
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedMonth(newDate);
    };

    const currentMonthYear = `${selectedMonth.getFullYear()}년 ${selectedMonth.getMonth() + 1}월`;

    // 통계 계산
    const totalRecords = filteredRecords.length;
    const uniqueEmployees = new Set(filteredRecords.map(r => r.userId)).size;
    const avgTime = filteredRecords.length > 0
        ? filteredRecords.reduce((sum, r) => {
            const time = new Date(r.checkInTime);
            return sum + time.getHours() * 60 + time.getMinutes();
        }, 0) / filteredRecords.length
        : 0;
    const avgHours = Math.floor(avgTime / 60);
    const avgMinutes = Math.floor(avgTime % 60);

    // Excel 다운로드 함수
    const handleExportToExcel = () => {
        if (filteredRecords.length === 0) {
            alert('다운로드할 출근 기록이 없습니다.');
            return;
        }

        // CSV 형식으로 데이터 생성
        const headers = ['날짜', '직원명', '부서/팀', '출근 시간'];
        const csvContent = [
            headers.join(','),
            ...filteredRecords.map(record => {
                const date = formatDate(record.date);
                const name = record.userName;
                const department = record.userDepartment || '-';
                const time = formatTime(record.checkInTime);
                return `${date},${name},${department},${time}`;
            })
        ].join('\n');

        // BOM 추가 (한글 깨짐 방지)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `출근기록_${currentMonthYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">전체 출근 관리</h2>
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-800">
                                관리자 전용
                            </span>
                        </div>
                        <button
                            onClick={handleExportToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Excel 다운로드
                        </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">모든 직원의 출근 기록을 확인하고 관리하세요.</p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">출근 직원 수</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{uniqueEmployees}명</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">총 출근 기록</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalRecords}건</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">평균 출근 시간</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {totalRecords > 0 ? `${String(avgHours).padStart(2, '0')}:${String(avgMinutes).padStart(2, '0')}` : '--:--'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 필터 및 검색 */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[120px] text-center">
                                {currentMonthYear}
                            </span>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="직원 이름 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                />
                                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 출근 기록 테이블 */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">직원명</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">부서/팀</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">날짜</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">출근 시간</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                            {record.userName.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        {record.userName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {record.userDepartment || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
                                                {formatDate(record.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formatTime(record.checkInTime)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                {searchTerm ? '검색 결과가 없습니다.' : '이번 달 출근 기록이 없습니다.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAttendance;
