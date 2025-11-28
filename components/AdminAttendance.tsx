import React, { useState, useEffect } from 'react';

import { UserProfile, AttendanceRecord, UserRole, Employee } from '../types';

interface AdminAttendanceProps {
    user: UserProfile;
}

const AdminAttendance: React.FC<AdminAttendanceProps> = ({ user }) => {
    const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
    const [viewMode, setViewMode] = useState<'MONTHLY' | 'DAILY'>('MONTHLY');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);

    // 직원 목록 로드
    useEffect(() => {
        const savedEmployees = localStorage.getItem('orgChartData_v5');
        if (savedEmployees) {
            try {
                setEmployees(JSON.parse(savedEmployees));
            } catch (e) {
                console.error('Failed to load employees', e);
            }
        }
    }, []);

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
    }, [selectedMonth, selectedDate, viewMode, searchTerm, employees]);

    const loadAllRecords = () => {
        const stored = localStorage.getItem('attendance_records');
        if (stored) {
            try {
                const records: AttendanceRecord[] = JSON.parse(stored);
                let targetRecords: AttendanceRecord[] = [];
                let absentRecords: AttendanceRecord[] = [];

                if (viewMode === 'MONTHLY') {
                    // 선택된 월의 기록
                    const year = selectedMonth.getFullYear();
                    const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
                    const monthStr = `${year}-${month}`;
                    targetRecords = records.filter(r => r.date.startsWith(monthStr));

                    // 오늘 날짜 확인 (오늘이 선택된 월에 포함되는지)
                    const today = new Date();
                    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === parseInt(month);
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                    // 미출근자 처리 (오늘 날짜 기준, 현재 월이 이번 달일 때만)
                    if (isCurrentMonth && employees.length > 0) {
                        const todayCheckIns = new Set(records.filter(r => r.date === todayStr).map(r => r.userId));
                        employees.forEach(emp => {
                            if (emp.status === 'ACTIVE' && !todayCheckIns.has(emp.id)) {
                                absentRecords.push({
                                    id: `absent-${emp.id}`,
                                    userId: emp.id,
                                    userName: emp.name,
                                    userDepartment: emp.department,
                                    checkInTime: '',
                                    date: todayStr
                                });
                            }
                        });
                    }
                } else {
                    // 일별 보기
                    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                    targetRecords = records.filter(r => r.date === dateStr);

                    // 미출근자 처리
                    if (employees.length > 0) {
                        const dayCheckIns = new Set(targetRecords.map(r => r.userId));
                        employees.forEach(emp => {
                            if (emp.status === 'ACTIVE' && !dayCheckIns.has(emp.id)) {
                                absentRecords.push({
                                    id: `absent-${emp.id}`,
                                    userId: emp.id,
                                    userName: emp.name,
                                    userDepartment: emp.department,
                                    checkInTime: '',
                                    date: dateStr
                                });
                            }
                        });
                    }
                }

                // 검색어 필터링
                let finalRecords = [...targetRecords, ...absentRecords];
                if (searchTerm) {
                    finalRecords = finalRecords.filter(r =>
                        r.userName.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                setAllRecords(records);

                // 정렬 로직
                setFilteredRecords(finalRecords.sort((a, b) => {
                    const isAbsentA = !a.checkInTime;
                    const isAbsentB = !b.checkInTime;

                    if (isAbsentA && !isAbsentB) return -1;
                    if (!isAbsentA && isAbsentB) return 1;
                    if (isAbsentA && isAbsentB) return a.userName.localeCompare(b.userName);

                    // 둘 다 출근한 경우
                    const timeA = new Date(a.checkInTime);
                    const timeB = new Date(b.checkInTime);

                    // 9시 정각 기준 지각 판단
                    const limitA = new Date(timeA); limitA.setHours(9, 0, 0, 0);
                    const isLateA = timeA > limitA;

                    const limitB = new Date(timeB); limitB.setHours(9, 0, 0, 0);
                    const isLateB = timeB > limitB;

                    if (isLateA && !isLateB) return -1; // 지각자가 위로? 아니면 아래로? 보통 지각자를 눈에 띄게 하려면 위로. 여기선 지각자가 -1 (먼저 나옴)
                    if (!isLateA && isLateB) return 1;

                    return a.checkInTime.localeCompare(b.checkInTime); // 일찍 온 순서대로
                }));
            } catch (e) {
                console.error('Failed to parse records', e);
            }
        }
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedMonth(newDate);
    };

    const changeDate = (delta: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + delta);
        setSelectedDate(newDate);
    };

    const currentMonthYear = `${selectedMonth.getFullYear()}년 ${selectedMonth.getMonth() + 1}월`;

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '-';
        const date = new Date(timeStr);
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* 헤더 섹션 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">전사 출근 현황</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            전체 직원의 출근 기록을 조회하고 관리합니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('MONTHLY')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'MONTHLY'
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            월별 보기
                        </button>
                        <button
                            onClick={() => setViewMode('DAILY')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'DAILY'
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            일별 보기
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-3">
                        {viewMode === 'MONTHLY' ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => changeDate(-1)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <input
                                    type="date"
                                    className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 text-center focus:outline-none"
                                    value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                />
                                <button
                                    onClick={() => changeDate(1)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                    <div className="relative flex-grow w-full">
                        <input
                            type="text"
                            placeholder="직원 이름 검색..."
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
                                                {record.checkInTime ? (
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${(() => {
                                                            const time = new Date(record.checkInTime);
                                                            const limit = new Date(time);
                                                            limit.setHours(9, 0, 0, 0);
                                                            return time > limit
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
                                                        })()
                                                        }`}>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(record.checkInTime)}
                                                        {(() => {
                                                            const time = new Date(record.checkInTime);
                                                            const limit = new Date(time);
                                                            limit.setHours(9, 0, 0, 0);
                                                            return time > limit ? ' (지각)' : '';
                                                        })()}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-sm font-medium">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                        미출근
                                                    </span>
                                                )}
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
