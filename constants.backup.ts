
import { ReferenceDoc, Notice } from './types';

// [개발 연동 주석]: 시스템 페르소나 정의
// 지식 데이터는 제외하고, 봇의 성격과 답변 태도만 정의합니다.
export const SYSTEM_PERSONA = `
당신은 '한일후지코리아(주)'의 HR 지원 챗봇 'InnoBot'입니다.
사용자의 소속 사업장에 따라 회사명이 달라질 수 있음을 인지하세요.

답변 원칙:
1. 사용자의 질문과 함께 제공된 [참고 문서]의 내용을 바탕으로 정확하게 답변하세요.
2. [참고 문서]에 없는 내용은 추측해서 답변하지 말고, "해당 내용은 현재 연동된 사내 규정 문서에서 찾을 수 없습니다. 인사총무팀(내선 317)으로 문의 부탁드립니다."라고 정중히 답변하세요.
3. "한일후지코리아 임직원 여러분, 안녕하세요."와 같이 소속감을 주는 인사를 종종 사용하세요.
4. 답변은 보기 좋게 Markdown 형식으로 작성하고, 핵심 내용을 요약하세요.
`;

// [개발 연동 주석]: 연동된 문서 목록 및 내용 (Mock RAG Data)
// 실제 환경에서는 Vector DB (Pinecone 등)에 저장된 Embedding 데이터를 검색해야 합니다.
export const REFERENCE_DOCS: ReferenceDoc[] = [
   {
      id: '1',
      title: '2025년도 취업규칙_한일후지코리아.pdf',
      type: 'PDF',
      lastUpdated: '2025-01-02',
      keywords: ['근무', '시간', '유연', '재택', '휴가', '연차', '반차', '출근', '퇴근', '지각', '조퇴'],
      content: `
[문서: 2025년도 취업규칙]
제1장 근무 시간 및 유연 근무제
1. 코어 타임: 오전 10시 30분 ~ 오후 3시 30분 (협업 집중 시간)
2. 선택적 근로시간제: 월 단위 정산, 1일 최소 4시간 이상 근무.
3. 재택 근무(Remote Work): 부서장 전결 사항. 주 2회 한도 내 사용 가능. (단, 신입사원 OJT 기간 3개월은 재택 불가)

제2장 휴가 제도
1. 연차 휴가: 근로기준법에 의거하여 부여. 전자결재 시스템을 통해 3일 전 기안 원칙.
2. 반차/반반차 사용: 반차(4H), 반반차(2H) 단위로 쪼개서 사용 가능.
3. 장기근속 포상 휴가: 
   - 5년 근속: 순금 5돈
   - 10년 근속: 유급휴가 3일 + 여행비 200만원
   - 20년 근속: 유급휴가 10일 + 여행비 500만원
4. 경조사 휴가: 본인 결혼(5일), 형제자매 결혼(1일), 부모상(5일), 조부모상(3일).
    `
   },
   {
      id: '2',
      title: '복리후생 가이드북 v3.0',
      type: 'DOC',
      lastUpdated: '2024-12-15',
      keywords: ['식대', '밥', '점심', '버스', '통근', '셔틀', '학자금', '의료비', '보험', '복지', '돈'],
      content: `
[문서: 복리후생 가이드북 v3.0]
1. 식대 지원
   - 구내식당 무료 이용 가능 (사원증 태그).
   - 외부 식사 시 월 20만원 한도 내 식대 급여 포함 지급.

2. 통근버스 운행
   - 운행 노선: 서울역, 강남역, 수원역, 판교역 주요 거점 운행.
   - 탑승 위치 및 시간은 포털 내 '통근버스 정보' 메뉴를 참고하세요.

3. 자녀 학자금 지원
   - 대상: 근속 3년 이상 임직원.
   - 지원 범위: 고등학교 및 대학교 학자금 실비 지원 (학기당 최대 500만원).

4. 의료비 지원
   - 본인 및 배우자, 자녀 포함 실손보험 단체 가입 전액 지원.
   - 연 1회 종합 건강검진 무료 제공 (배우자 포함).
    `
   },
   {
      id: '3',
      title: '인사평가 매뉴얼 (관리자용)',
      type: 'NOTION',
      lastUpdated: '2024-11-30',
      keywords: ['평가', '승진', '진급', '연봉', '협상', '고가', '성과'],
      content: `
[문서: 인사평가 매뉴얼]
1. 평가 기준
   - 업적 평가(70%): KPI 달성도.
   - 역량 평가(30%): 핵심 가치 부합도 및 리더십/협업 능력.

2. 연봉 협상
   - 시기: 매년 3월 진행.
   - 등급별 인상률 가이드: S등급(10% 이상), A등급(7%), B등급(4%), C등급(동결).
    `
   },
   {
      id: '4',
      title: '정보보안 서약서',
      type: 'PDF',
      lastUpdated: '2024-08-10',
      keywords: ['보안', '사진', '촬영', '카메라', '외부', '유출', '메일', '반출', 'usb'],
      content: `
[문서: 정보보안 서약서]
1. 사내 보안 규정
   - 사내 전 구역(휴게실 포함)에서 사진 및 동영상 촬영이 엄격히 금지됩니다. (보안스티커 부착 필수)
   - 업무용 PC 및 노트북 외부 반출 시 '자산 반출 신청서' 승인 필요.

2. 문서 보안
   - 회사 내부 문서를 외부 이메일이나 메신저(카카오톡 등)로 전송 금지.
   - 출력물은 반드시 파쇄기를 이용하여 폐기.
    `
   },
   {
      id: '5',
      title: '신입사원 OJT 교육자료',
      type: 'PDF',
      lastUpdated: '2025-02-01',
      keywords: ['신입', '교육', 'ojt', '멘토', '수습'],
      content: `
[문서: 신입사원 OJT 교육자료]
1. 교육 일정
   - 입사 1주차: 공통 입문 교육 (회사 소개, 비전 공유)
   - 입사 2주차 ~ 4주차: 현업 배치 및 멘토링 진행.

2. 멘토링 제도
   - 신입사원 1인당 전담 멘토 1명 배정.
   - 멘토링 활동비: 월 10만원 지원 (식사 및 티타임 용도).
   - 수습 기간: 3개월 (급여 100% 지급).
    `
   },
];

// [개발 연동 주석]: 최신 공지사항 Mock Data (필독 공지용)
export const LATEST_NOTICE: Notice | null = null;

// [개발 연동 주석]: 전체 공지사항 목록 Mock Data
export const NOTICE_LIST: Notice[] = [];

// 통근버스 노선 데이터
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
