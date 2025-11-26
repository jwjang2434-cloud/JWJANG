import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord } from '../types';

interface AttendanceRecordsProps {
    user: UserProfile;
}

const AttendanceRecords: React.FC<AttendanceRecordsProps> = ({ user }) => {
    const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    useEffect(() => {
        loadAttendanceRecords();
    }, [user.id, selectedMonth]);

    const loadAttendanceRecords = () => {
        const stored = localStorage.getItem('attendance_records');
        if (stored) {
            try {
                const allRecords: AttendanceRecord[] = JSON.parse(stored);
                const userRecords = allRecords.filter(r => r.userId === user.id);

                // 선택된 월의 기록
                const year = selectedMonth.getFullYear();
                const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
                const monthRecords = userRecords.filter(r => r.date.startsWith(`${year}-${month}`));
                setMonthlyRecords(monthRecords.sort((a, b) => b.date.localeCompare(a.date)));
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
    const totalDays = monthlyRecords.length;
    const avgTime = monthlyRecords.length > 0
        ? monthlyRecords.reduce((sum, r) => {
            const time = new Date(r.checkInTime);
            return sum + time.getHours() * 60 + time.getMinutes();
        }, 0) / monthlyRecords.length
        : 0;
    const avgHours = Math.floor(avgTime / 60);
    const avgMinutes = Math.floor(avgTime % 60);

    return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">출근 기록</h2>
                    <p className="text-slate-500 dark:text-slate-400">월별 출근 기록을 확인하세요.</p>
                </div>

                {/* 통계 카드 - 출근율 제거 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">출근 일수</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalDays}일</p>
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
                                    {totalDays > 0 ? `${String(avgHours).padStart(2, '0')}:${String(avgMinutes).padStart(2, '0')}` : '--:--'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 월별 출근 기록 */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 dark:text-white">출근 기록</h4>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[100px] text-center">
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
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                        {monthlyRecords.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">날짜</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">출근 시간</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {monthlyRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-slate-500 dark:text-slate-400">이번 달 출근 기록이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceRecords;
