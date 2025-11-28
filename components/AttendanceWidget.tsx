import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord } from '../types';

interface AttendanceWidgetProps {
    user: UserProfile;
}

const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ user }) => {
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
    const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [showRecords, setShowRecords] = useState(false);

    useEffect(() => {
        loadAttendanceRecords();
    }, [user.id, selectedMonth]);

    const loadAttendanceRecords = () => {
        const stored = localStorage.getItem('attendance_records');
        if (stored) {
            try {
                const allRecords: AttendanceRecord[] = JSON.parse(stored);
                const userRecords = allRecords.filter(r => r.userId === user.id);

                // 오늘 출근 기록 확인
                const today = new Date().toISOString().split('T')[0];
                const todayRec = userRecords.find(r => r.date === today);
                setTodayRecord(todayRec || null);

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

    const handleCheckIn = () => {
        if (todayRecord) {
            alert('오늘은 이미 출근하셨습니다.');
            return;
        }

        console.log('handleCheckIn called');
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        console.log('Generated date string:', dateStr);

        const record: AttendanceRecord = {
            id: `${user.id}_${now.getTime()}`,
            userId: user.id,
            userName: user.customNickname || user.name,
            checkInTime: now.toISOString(),
            date: dateStr
        };
        console.log('New record object:', record);

        const stored = localStorage.getItem('attendance_records');
        console.log('Current stored records (raw):', stored);
        const allRecords: AttendanceRecord[] = stored ? JSON.parse(stored) : [];
        allRecords.push(record);

        const newStored = JSON.stringify(allRecords);
        localStorage.setItem('attendance_records', newStored);
        console.log('Saved records to localStorage:', newStored);

        setTodayRecord(record);
        loadAttendanceRecords();
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
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

    return (
        <div className="mb-6">
            {/* 출근 카드 */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl border border-indigo-400/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">출근 체크</h3>
                            <p className="text-indigo-100 text-sm">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                        </div>
                    </div>

                    {todayRecord ? (
                        <div className="bg-green-500/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-300/30">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-green-100 text-xs font-medium">출근 완료</p>
                                    <p className="text-white font-bold text-sm">{formatTime(todayRecord.checkInTime)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-500/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-300/30">
                            <p className="text-amber-100 text-sm font-medium">미출근</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleCheckIn}
                        disabled={!!todayRecord}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${todayRecord
                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                            : 'bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-105 shadow-lg'
                            }`}
                    >
                        {todayRecord ? '출근 완료' : '출근하기'}
                    </button>

                    <button
                        onClick={() => setShowRecords(!showRecords)}
                        className="px-6 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all backdrop-blur-sm border border-white/20"
                    >
                        {showRecords ? '기록 닫기' : '기록 보기'}
                    </button>
                </div>
            </div>

            {/* 월별 출근 기록 */}
            {showRecords && (
                <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
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

                    <div className="max-h-96 overflow-y-auto">
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
            )}
        </div>
    );
};

export default AttendanceWidget;
