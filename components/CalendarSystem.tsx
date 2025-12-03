import React, { useState, useEffect } from 'react';
import { UserProfile, ScheduleEvent, CalendarPermission } from '../types';
import { supabase } from '../utils/supabaseClient';

interface ExtendedCalendarPermission extends CalendarPermission {
    granteeName?: string;
}

interface CalendarSystemProps {
    user: UserProfile;
}

const CalendarSystem: React.FC<CalendarSystemProps> = ({ user }) => {
    const [viewMode, setViewMode] = useState<'PERSONAL' | 'TEAM'>('PERSONAL');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
        title: '',
        description: '',
        type: 'PERSONAL',
        startDate: '',
        endDate: ''
    });
    const [inviteTargetName, setInviteTargetName] = useState('');
    const [permissions, setPermissions] = useState<ExtendedCalendarPermission[]>([]);
    const [accessibleTeams, setAccessibleTeams] = useState<string[]>([]);
    const [selectedTeamView, setSelectedTeamView] = useState<string>(''); // Which team's calendar to view

    // Helper to get user's team (assuming it's in department for now if team field is empty, or we need to fetch it)
    // For this implementation, we'll try to use the 'team' field from user profile if available, else fallback or empty.
    // Since UserProfile interface update might not be fully propagated to the user object passed here without a refresh/fetch,
    // we might need to fetch the current user's details again or rely on what's passed.
    // Let's assume user.team is available if we updated the type.
    const userTeam = (user as any).team || '';

    useEffect(() => {
        fetchEvents();
        if (viewMode === 'TEAM') {
            fetchPermissions();
        }
    }, [viewMode, currentDate, selectedTeamView]);

    useEffect(() => {
        // Set initial team view to own team
        if (userTeam) {
            setSelectedTeamView(userTeam);
        }
    }, [userTeam]);

    const fetchEvents = async () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        let query = supabase
            .from('schedules')
            .select('*')
            .gte('start_date', startOfMonth)
            .lte('end_date', endOfMonth);

        if (viewMode === 'PERSONAL') {
            query = query.eq('type', 'PERSONAL').eq('user_id', user.id);
        } else {
            // Team View: Show events for the selected team
            // If selectedTeamView is empty, show nothing or own team
            const teamToView = selectedTeamView || userTeam;
            if (!teamToView) return;

            query = query.eq('type', 'TEAM').eq('team_id', teamToView);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching events:', error);
        } else {
            setEvents(data.map(e => ({
                id: e.id,
                userId: e.user_id,
                title: e.title,
                description: e.description,
                startDate: e.start_date,
                endDate: e.end_date,
                type: e.type,
                teamId: e.team_id,
                createdAt: e.created_at
            })));
        }
    };

    const fetchPermissions = async () => {
        // 1. Get teams I can view (Granted to me)
        const { data: grantedData } = await supabase
            .from('calendar_permissions')
            .select('target_team')
            .eq('grantee_id', user.id);

        const teams = grantedData ? grantedData.map(p => p.target_team) : [];
        if (userTeam && !teams.includes(userTeam)) {
            teams.unshift(userTeam); // Always include own team
        }
        setAccessibleTeams(teams);

        // 2. Get permissions I granted (If I am a team leader - logic to check leader needed, for now just fetch by granted_by)
        const { data: myGrants } = await supabase
            .from('calendar_permissions')
            .select('*')
            .eq('granted_by', user.id);

        if (myGrants) {
            // Fetch names for grantees
            const granteeIds = myGrants.map(p => p.grantee_id);
            const { data: users } = await supabase
                .from('portal_users')
                .select('id, name')
                .in('id', granteeIds);

            const userMap = new Map(users?.map(u => [u.id, u.name]));

            setPermissions(myGrants.map(p => ({
                id: p.id,
                granteeId: p.grantee_id,
                granteeName: userMap.get(p.grantee_id) || p.grantee_id, // Fallback to ID if name not found
                targetTeam: p.target_team,
                grantedBy: p.granted_by,
                createdAt: p.created_at
            })));
        }
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setNewEvent({
            ...newEvent,
            startDate: date.toISOString().split('T')[0], // Default to full day for simplicity
            endDate: date.toISOString().split('T')[0],
            type: viewMode
        });
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = async () => {
        if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) {
            alert('제목과 날짜를 입력해주세요.');
            return;
        }

        const eventData = {
            user_id: user.id,
            title: newEvent.title,
            description: newEvent.description,
            start_date: new Date(newEvent.startDate!).toISOString(),
            end_date: new Date(newEvent.endDate!).toISOString(), // Ideally set to end of day if same date
            type: newEvent.type,
            team_id: newEvent.type === 'TEAM' ? (selectedTeamView || userTeam) : null
        };

        const { error } = await supabase.from('schedules').insert([eventData]);

        if (error) {
            alert('일정 저장 실패: ' + error.message);
        } else {
            setIsEventModalOpen(false);
            fetchEvents();
        }
    };

    const handleInvite = async () => {
        if (!inviteTargetName) return;
        if (!userTeam) {
            alert('소속 팀이 없어 초대할 수 없습니다.');
            return;
        }

        // 1. Find user by name
        const { data: users, error: searchError } = await supabase
            .from('portal_users')
            .select('id, name')
            .eq('name', inviteTargetName);

        if (searchError || !users || users.length === 0) {
            alert('해당 이름의 직원을 찾을 수 없습니다.');
            return;
        }

        if (users.length > 1) {
            alert('동명이인이 존재합니다. (현재 버전에서는 첫 번째 검색된 사용자를 초대합니다.)');
        }

        const targetUserId = users[0].id;

        // 2. Insert permission
        const { error } = await supabase.from('calendar_permissions').insert([{
            grantee_id: targetUserId,
            target_team: userTeam,
            granted_by: user.id
        }]);

        if (error) {
            alert('초대 실패 (이미 초대되었거나 오류 발생): ' + error.message);
        } else {
            alert(`${users[0].name}님을 초대했습니다.`);
            setInviteTargetName('');
            setIsInviteModalOpen(false);
            fetchPermissions();
        }
    };

    const handleRevokePermission = async (id: string) => {
        if (confirm('권한을 해제하시겠습니까?')) {
            const { error } = await supabase.from('calendar_permissions').delete().eq('id', id);
            if (!error) fetchPermissions();
        }
    };

    // Calendar Rendering Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">일정 관리</h2>
                    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('PERSONAL')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'PERSONAL' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            개인 일정
                        </button>
                        <button
                            onClick={() => setViewMode('TEAM')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'TEAM' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            팀 일정
                        </button>
                    </div>
                </div>

                {viewMode === 'TEAM' && (
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedTeamView}
                            onChange={(e) => setSelectedTeamView(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-white"
                        >
                            {accessibleTeams.map(team => (
                                <option key={team} value={team}>{team}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold"
                        >
                            팀원 초대
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                {/* Calendar Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] overflow-hidden">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="py-2 text-center text-sm font-bold text-slate-500 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                            {day}
                        </div>
                    ))}

                    <div className="col-span-7 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                        {blanksArray.map(i => (
                            <div key={`blank-${i}`} className="border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"></div>
                        ))}
                        {daysArray.map(day => {
                            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                            const dayEvents = events.filter(e => e.startDate.startsWith(dateStr)); // Simple date match

                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                    className="min-h-[100px] border-b border-r border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                >
                                    <span className={`text-sm font-bold ${new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {day}
                                    </span>
                                    <div className="mt-1 space-y-1">
                                        {dayEvents.map(event => (
                                            <div key={event.id} className={`text-xs px-1.5 py-0.5 rounded truncate ${event.type === 'PERSONAL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">일정 추가</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">제목</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">설명</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">시작일</label>
                                    <input
                                        type="date"
                                        value={newEvent.startDate}
                                        onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">종료일</label>
                                    <input
                                        type="date"
                                        value={newEvent.endDate}
                                        onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">구분</label>
                                <select
                                    value={newEvent.type}
                                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value as 'PERSONAL' | 'TEAM' })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    disabled={viewMode === 'PERSONAL'} // Lock to current view mode for simplicity
                                >
                                    <option value="PERSONAL">개인 일정</option>
                                    <option value="TEAM">팀 일정</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">취소</button>
                            <button onClick={handleSaveEvent} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">팀 일정 공유 초대</h3>
                        <p className="text-sm text-slate-500 mb-4">다른 팀의 직원을 초대하여 <strong>{userTeam}</strong>의 일정을 볼 수 있게 합니다.</p>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">초대할 직원 이름</label>
                            <input
                                type="text"
                                value={inviteTargetName}
                                onChange={e => setInviteTargetName(e.target.value)}
                                placeholder="이름 입력 (예: 홍길동)"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            />
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">현재 초대된 목록</h4>
                            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 dark:border-slate-700">
                                {permissions.length === 0 ? (
                                    <p className="text-xs text-slate-400">초대된 직원이 없습니다.</p>
                                ) : (
                                    permissions.map(p => (
                                        <div key={p.id} className="flex justify-between items-center py-1 border-b last:border-0 border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{p.granteeName} ({p.granteeId})</span>
                                            <button onClick={() => handleRevokePermission(p.id)} className="text-xs text-red-500 hover:underline">해제</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">닫기</button>
                            <button onClick={handleInvite} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">초대하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarSystem;
