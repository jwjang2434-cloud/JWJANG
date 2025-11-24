
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserRole } from '../types';

interface MeetingRoomProps {
  user: UserProfile;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
}

interface Booking {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD 형식
  time: string;
  userId: string;
  userName: string;
  department: string;
}

// 예약 확인용 모달 상태 인터페이스
interface ReservationModalState {
  isOpen: boolean;
  type: 'BOOK' | 'CANCEL' | 'ADMIN_CANCEL';
  roomId: string;
  roomName: string;
  time: string;
  bookingId?: string; // 취소 시 필요
  targetUserName?: string; // 관리자 취소 시 표시용
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ user }) => {
  // 초기 회의실 데이터
  const initialRooms: Room[] = [
    { id: 'r1', name: '대회의실 (A동 301호)', capacity: 20 },
    { id: 'r2', name: '중회의실 (A동 302호)', capacity: 10 },
    { id: 'r3', name: '소회의실 A (B동 101호)', capacity: 6 },
    { id: 'r4', name: '소회의실 B (B동 102호)', capacity: 6 },
    { id: 'r5', name: '화상회의실 (본관 2층)', capacity: 8 }
  ];
  
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // 날짜 포맷 헬퍼 함수 (YYYY-MM-DD)
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜 표시용 헬퍼 함수 (YYYY. MM. DD (요일))
  const formatDateDisplay = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')} (${days[date.getDay()]})`;
  };

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // [수정] LocalStorage에서 데이터 로드
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('meetingRooms');
    return saved ? JSON.parse(saved) : initialRooms;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('meetingBookings');
    // 초기 실행 시 데이터가 없으면 Mock Data 생성
    if (!saved) {
        const todayStr = new Date().toISOString().split('T')[0];
        return [
            { id: 'b1', roomId: 'r1', date: todayStr, time: '10:00', userId: 'other1', userName: '박팀장', department: '영업팀' },
            { id: 'b2', roomId: 'r2', date: todayStr, time: '14:00', userId: 'other2', userName: '김대리', department: '개발팀' },
            { id: 'b3', roomId: 'r3', date: todayStr, time: '09:00', userId: 'other3', userName: '최사원', department: '인사팀' },
        ];
    }
    return JSON.parse(saved);
  });

  const [isEditing, setIsEditing] = useState(false);
  const [modalState, setModalState] = useState<ReservationModalState | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user.role === UserRole.ADMIN;
  const currentDateKey = formatDateKey(currentDate);
  const todayKey = formatDateKey(new Date());

  // [수정] 데이터 변경 시 LocalStorage 저장
  useEffect(() => {
    localStorage.setItem('meetingRooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('meetingBookings', JSON.stringify(bookings));
  }, [bookings]);

  // --- Time Validation Logic ---
  const isPastTime = (dateKey: string, timeStr: string) => {
      const now = new Date();
      const today = formatDateKey(now);
      
      // 1. 과거 날짜인 경우
      if (dateKey < today) return true;
      
      // 2. 미래 날짜인 경우
      if (dateKey > today) return false;

      // 3. 오늘인 경우 시간 비교
      const currentHour = now.getHours();
      const [slotHour] = timeStr.split(':').map(Number);

      return slotHour <= currentHour;
  };

  // --- Date Handlers ---
  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
        setCurrentDate(new Date(e.target.value));
    }
  };

  // --- Room Handlers ---
  const handleAddRoom = () => {
    const newRoom: Room = {
      id: `r${Date.now()}`,
      name: '신규 회의실',
      capacity: 4
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (id: string) => {
    if (window.confirm('정말 이 회의실을 삭제하시겠습니까?\n해당 회의실의 모든 예약 내역도 함께 삭제됩니다.')) {
      setRooms(rooms.filter(r => r.id !== id));
      setBookings(bookings.filter(b => b.roomId !== id));
    }
  };

  const handleUpdateRoom = (id: string, field: keyof Room, value: string | number) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSaveRoomConfig = () => {
    setIsEditing(false);
  };

  // 슬롯 클릭 시 모달 열기
  const handleSlotClick = (roomId: string, roomName: string, time: string, isPast: boolean) => {
    if (isEditing) {
        alert('편집 모드에서는 예약할 수 없습니다. 설정 저장을 먼저 완료해주세요.');
        return;
    }

    if (isPast) return;

    // 현재 날짜와 시간에 맞는 예약 찾기
    const existingBooking = bookings.find(b => b.roomId === roomId && b.time === time && b.date === currentDateKey);

    if (existingBooking) {
      // 1) 내 예약 -> 취소 모달
      if (existingBooking.userId === user.id) {
        setModalState({
          isOpen: true,
          type: 'CANCEL',
          roomId,
          roomName,
          time,
          bookingId: existingBooking.id
        });
      } 
      // 2) 관리자 -> 강제 취소 모달
      else if (isAdmin) {
        setModalState({
          isOpen: true,
          type: 'ADMIN_CANCEL',
          roomId,
          roomName,
          time,
          bookingId: existingBooking.id,
          targetUserName: existingBooking.userName
        });
      }
    } else {
      // 빈 슬롯 -> 예약 모달
      setModalState({
        isOpen: true,
        type: 'BOOK',
        roomId,
        roomName,
        time
      });
    }
  };

  // 모달에서 '확인' 클릭 시 실제 로직 수행
  const handleConfirmAction = () => {
    if (!modalState) return;

    if (modalState.type === 'BOOK') {
       const newBooking: Booking = {
          id: `b-${Date.now()}`,
          roomId: modalState.roomId,
          date: currentDateKey, // 현재 선택된 날짜로 예약
          time: modalState.time,
          userId: user.id,
          userName: user.name,
          department: user.department
        };
        setBookings([...bookings, newBooking]);
    } else if (modalState.type === 'CANCEL' || modalState.type === 'ADMIN_CANCEL') {
        setBookings(bookings.filter(b => b.id !== modalState.bookingId));
    }

    setModalState(null); // 모달 닫기
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full transition-colors duration-300 relative">
      
      {/* Custom Reservation Modal */}
      {modalState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalState(null)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 relative z-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
               {modalState.type === 'BOOK' ? '회의실 예약' : '예약 취소'}
             </h3>
             <div className="py-4 text-slate-600 dark:text-slate-300">
                <p className="mb-2 text-sm text-slate-500">{formatDateDisplay(currentDate)}</p>
                <p className="mb-2"><span className="font-semibold text-indigo-600 dark:text-indigo-400">{modalState.roomName}</span></p>
                <p className="text-xl font-bold mb-4">{modalState.time}</p>
                
                {modalState.type === 'BOOK' && <p>해당 시간에 회의실을 예약하시겠습니까?</p>}
                {modalState.type === 'CANCEL' && <p>나의 예약을 취소하시겠습니까?</p>}
                {modalState.type === 'ADMIN_CANCEL' && <p className="text-red-500 font-bold">[관리자] {modalState.targetUserName}님의 예약을 강제 취소합니다.</p>}
             </div>
             <div className="flex gap-3 mt-2">
               <button 
                 onClick={() => setModalState(null)}
                 className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               >
                 닫기
               </button>
               <button 
                 onClick={handleConfirmAction}
                 className={`flex-1 py-2 text-white rounded-lg font-bold shadow-md transition-colors ${
                   modalState.type === 'BOOK' 
                     ? 'bg-indigo-600 hover:bg-indigo-700' 
                     : 'bg-red-500 hover:bg-red-600'
                 }`}
               >
                 {modalState.type === 'BOOK' ? '예약 확정' : '취소 확정'}
               </button>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header Section (Responsive) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">회의실 예약</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">효율적인 업무를 위해 회의실을 미리 예약하세요.</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
               <button 
                 onClick={() => isEditing ? handleSaveRoomConfig() : setIsEditing(true)}
                 className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm flex items-center gap-2 ${isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
               >
                 {isEditing ? '설정 저장' : '관리자: 회의실 관리'}
               </button>
            )}
          </div>
        </div>

        {/* Date Navigation Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                <div 
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="relative group flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 px-4 py-2 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white min-w-[180px] text-center">
                        {formatDateDisplay(currentDate)}
                    </h3>
                    <input 
                        ref={dateInputRef}
                        type="date" 
                        value={currentDateKey}
                        onChange={handleDateChange}
                        className="absolute inset-0 opacity-0 w-full h-full pointer-events-none"
                        tabIndex={-1}
                    />
                </div>

                <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <button 
                onClick={handleToday}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                오늘 (Today)
            </button>
        </div>

        {/* Booking Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 sticky left-0 bg-slate-50 dark:bg-slate-800 z-20 min-w-[200px] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">회의실 정보</th>
                  {times.map(time => {
                     const isPast = isPastTime(currentDateKey, time);
                     return (
                       <th key={time} className={`px-4 py-4 text-center min-w-[80px] whitespace-nowrap ${isPast ? 'text-slate-300 dark:text-slate-600' : ''}`}>
                         {time}
                       </th>
                     );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 z-20 border-r border-slate-100 dark:border-slate-800 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                      {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-[180px]">
                           <input 
                             type="text" 
                             value={room.name} 
                             onChange={(e) => handleUpdateRoom(room.id, 'name', e.target.value)}
                             className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white"
                             placeholder="회의실 이름"
                           />
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-slate-500">수용:</span>
                             <input 
                               type="number" 
                               value={room.capacity} 
                               onChange={(e) => handleUpdateRoom(room.id, 'capacity', parseInt(e.target.value))}
                               className="w-16 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white"
                             />
                             <button onClick={() => handleDeleteRoom(room.id)} className="ml-auto text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="삭제">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-bold">{room.name}</div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-1">최대 {room.capacity}명 수용</p>
                        </>
                      )}
                    </td>
                    
                    {times.map((time) => {
                      const booking = bookings.find(b => b.roomId === room.id && b.time === time && b.date === currentDateKey);
                      const isMyBooking = booking?.userId === user.id;
                      const isPast = isPastTime(currentDateKey, time);
                      
                      return (
                        <td key={time} className="px-1 py-2 align-middle h-16">
                          {isEditing ? (
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center opacity-50">
                               <span className="text-xs text-slate-300">-</span>
                            </div>
                          ) : isPast && !booking ? (
                            <div className="w-full h-full min-h-[3.5rem] rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-not-allowed opacity-60">
                                <span className="text-xs text-slate-300 dark:text-slate-600">-</span>
                            </div>
                          ) : booking ? (
                            <div 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSlotClick(room.id, room.name, time, isPast);
                                }}
                                className={`w-full h-full min-h-[3.5rem] rounded-lg border flex flex-col items-center justify-center transition-all shadow-sm relative z-[1] cursor-pointer ${
                                    isMyBooking 
                                    ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700/50 hover:bg-indigo-200 dark:hover:bg-indigo-800/50' 
                                    : isAdmin
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40' 
                                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                } ${isPast ? 'opacity-70 grayscale' : ''}`}
                                title={isAdmin ? "관리자 권한으로 예약 취소 가능" : isMyBooking ? "클릭하여 예약 취소" : `${booking.department} ${booking.userName} 예약됨`}
                            >
                              <span className={`text-[10px] font-bold mb-0.5 ${isMyBooking ? 'text-indigo-700 dark:text-indigo-300' : isAdmin ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {isMyBooking ? '내 예약' : '예약됨'}
                              </span>
                              <span className={`text-[9px] ${isMyBooking ? 'text-indigo-500 dark:text-indigo-400' : isAdmin ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                  {booking.userName}
                              </span>
                            </div>
                          ) : (
                            <div 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSlotClick(room.id, room.name, time, false);
                                }}
                                className="w-full h-full min-h-[3.5rem] rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700/50 cursor-pointer group transition-all relative z-[1]"
                            >
                              <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {isEditing && (
                   <tr>
                     <td colSpan={times.length + 1} className="p-4 text-center bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={handleAddRoom} 
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-bold flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                           새 회의실 추가하기
                        </button>
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

export default MeetingRoom;
