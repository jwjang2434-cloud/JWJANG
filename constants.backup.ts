// 통근버스 노선 데이터
// 생성 날짜: 2025. 11. 25. 오후 5:43:16

import { ReferenceDoc, Notice } from './types';

interface Station {
    name: string;
    time: string;
    locationDesc: string;
    stationImage?: string;
}

interface BusRoute {
    id: string;
    name: string;
    driverName: string;
    driverPhone: string;
    stations: Station[];
}

export const COMMUTER_ROUTES: BusRoute[] = [
        {
            id: 'route-1',
            name: '1호차 (문현)',
            driverName: '',
            driverPhone: '',
            stations: [
                { name: '문현동 전철역', time: '07:14', locationDesc: '홍익빌레트 2,3 사이(문현역1번 3번 출구 사이)' },
                { name: '부산진역', time: '07:18', locationDesc: '부산진역7번 출구' },
                { name: '부산역', time: '07:25', locationDesc: '부산역 1번 출구' },
                { name: '동대신 시장', time: '07:28', locationDesc: '마을버스 정류장(미진축산 앞)' },
                { name: '괴정역', time: '07:38', locationDesc: '괴정역1번 출구' },
                { name: '당리', time: '07:43', locationDesc: '파리바게트 건너편' },
                { name: '하단', time: '07:50', locationDesc: '자이언트타이어 하단점 앞' },
                { name: '신평역', time: '07:53', locationDesc: '신평역 4번 출구 횡단보도 앞' },
                { name: '포트빌', time: '08:20', locationDesc: '포트빌 맞은 편 횡단보도 앞' },
                { name: '회사도착', time: '08:30', locationDesc: '' }
            ]
        },
        {
            id: 'route-2',
            name: '2호차 (시청)',
            driverName: '',
            driverPhone: '',
            stations: [
                { name: '시청역', time: '07:05', locationDesc: '7번 출구 횡단보도 건너서 시청 건물 옆 (투썸플레이스 맞은편)' },
                { name: '연산역', time: '07:08', locationDesc: '16번 출구 지나서 LG유플러스 연산동 연산로타리점 앞(연산동sk뷰 2단지 아파트 건물)' },
                { name: '동래역', time: '07:13', locationDesc: '4호선 동래역 5번 출구(세연정 앞)' },
                { name: '덕천역', time: '07:33', locationDesc: '3호선 덕천역 12번 출구' },
                { name: '구포역', time: '07:36', locationDesc: '구포역 1번 출구' },
                { name: '불암역', time: '07:46', locationDesc: '1번 출구 앞 버스 정류장' },
                { name: '회사 도착', time: '08:30', locationDesc: '위치 설명' }
            ]
        },
        {
            id: 'route-3',
            name: '3호차 (창원/신항)',
            driverName: '박창원',
            driverPhone: '010-5555-6666',
            stations: [
                { name: '창원광장', time: '07:00', locationDesc: '롯데마트 앞' },
                { name: '진해구청', time: '07:30', locationDesc: '민원실 앞' },
                { name: '용원', time: '07:50', locationDesc: '하나로마트 건너편' },
                { name: '회사 도착', time: '08:30', locationDesc: '본관 정문' }
            ]
        },
        {
            id: 'route-4',
            name: '4호차 (명지)',
            driverName: '최명지',
            driverPhone: '010-7777-8888',
            stations: [
                { name: '명지 국제신도시', time: '07:40', locationDesc: '맥도날드 앞' },
                { name: '오션시티', time: '07:55', locationDesc: '행복복지센터' },
                { name: '신호동', time: '08:10', locationDesc: '부영아파트 1단지' },
                { name: '회사 도착', time: '08:30', locationDesc: '본관 정문' }
            ]
        }
];