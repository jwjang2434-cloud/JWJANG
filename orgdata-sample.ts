import { Employee } from './types';

/**
 * 샘플 조직도 데이터
 * 업로드된 이미지를 참고하여 작성된 상세 조직도 데이터
 * 
 * 사용 방법:
 * 1. OrganizationChart 컴포넌트에서 엑셀 업로드 버튼 클릭
 * 2. 또는 이 데이터를 직접 allEmployees state에 설정
 */

export const SAMPLE_ORG_DATA: Employee[] = [
    // ============ 경영진 ============
    {
        id: 'EMP001',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '경영진',
        department: '경영진',
        team: '',
        position: '대표이사',
        duty: '대표이사',
        name: '(대표이사명)',
        email: 'ceo@fuji.com',
        phone: '010-0000-0000',
        extensionNumber: '100',
        status: 'ACTIVE',
        joinedDate: '2015-01-01',
        isHead: true,
        birthDate: '700101'
    },
    {
        id: 'EMP002',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '경영진',
        department: '임원실',
        team: '',
        position: '전무',
        duty: '전무',
        name: '(전무명)',
        email: 'jeonmu@fuji.com',
        phone: '010-0000-0001',
        extensionNumber: '101',
        status: 'ACTIVE',
        joinedDate: '2016-03-01',
        isHead: true,
        birthDate: '720315'
    },

    // ============ F&B 사업본부 ============
    // F&B 사업부
    {
        id: 'EMP010',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: 'F&B사업본부',
        department: 'F&B사업부',
        team: '',
        position: '본부장',
        duty: '본부장',
        name: '김본부',
        englishName: 'Kim, Bonbu',
        email: 'kim.fnb@fuji.com',
        phone: '010-1000-0001',
        extensionNumber: '201',
        status: 'ACTIVE',
        joinedDate: '2017-01-15',
        isHead: true,
        birthDate: '750520'
    },
    {
        id: 'EMP011',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: 'F&B사업본부',
        department: 'F&B사업부',
        team: '',
        position: '차장',
        duty: '팀원',
        name: '이차장',
        email: 'lee.fnb@fuji.com',
        phone: '010-1000-0002',
        extensionNumber: '202',
        status: 'ACTIVE',
        joinedDate: '2018-03-10',
        isHead: false,
        birthDate: '820815'
    },
    {
        id: 'EMP012',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: 'F&B사업본부',
        department: 'F&B사업부',
        team: '',
        position: '과장',
        duty: '팀원',
        name: '박과장',
        email: 'park.fnb@fuji.com',
        phone: '010-1000-0003',
        extensionNumber: '203',
        status: 'ACTIVE',
        joinedDate: '2019-06-01',
        isHead: false,
        birthDate: '850922'
    },

    // 케터링사업부
    {
        id: 'EMP020',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: 'F&B사업본부',
        department: '케터링사업부',
        team: '',
        position: '부장',
        duty: '부서장',
        name: '최부장',
        email: 'choi.catering@fuji.com',
        phone: '010-2000-0001',
        extensionNumber: '210',
        status: 'ACTIVE',
        joinedDate: '2016-09-01',
        isHead: true,
        birthDate: '780412'
    },
    {
        id: 'EMP021',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: 'F&B사업본부',
        department: '케터링사업부',
        team: '',
        position: '대리',
        duty: '팀원',
        name: '정대리',
        email: 'jung.catering@fuji.com',
        phone: '010-2000-0002',
        extensionNumber: '211',
        status: 'ACTIVE',
        joinedDate: '2020-02-15',
        isHead: false,
        birthDate: '880705'
    },

    // ============ 해운영업본부 ============
    // 국내사업부
    {
        id: 'EMP030',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해운영업본부',
        department: '국내사업부',
        team: '',
        position: '본부장',
        duty: '본부장',
        name: '강본부',
        email: 'kang.domestic@fuji.com',
        phone: '010-3000-0001',
        extensionNumber: '301',
        status: 'ACTIVE',
        joinedDate: '2015-05-01',
        isHead: true,
        birthDate: '730825'
    },
    {
        id: 'EMP031',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해운영업본부',
        department: '국내사업부',
        team: '',
        position: '부장',
        duty: '팀원',
        name: '윤부장',
        email: 'yoon.domestic@fuji.com',
        phone: '010-3000-0002',
        extensionNumber: '302',
        status: 'ACTIVE',
        joinedDate: '2017-08-15',
        isHead: false,
        birthDate: '790315'
    },
    {
        id: 'EMP032',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해운영업본부',
        department: '국내사업부',
        team: '',
        position: '차장',
        duty: '팀원',
        name: '임차장',
        email: 'lim.domestic@fuji.com',
        phone: '010-3000-0003',
        extensionNumber: '303',
        status: 'ACTIVE',
        joinedDate: '2018-11-20',
        isHead: false,
        birthDate: '821107'
    },

    // 해외사업부
    {
        id: 'EMP040',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해운영업본부',
        department: '해외사업부',
        team: '',
        position: '부장',
        duty: '부서장',
        name: '한부장',
        email: 'han.overseas@fuji.com',
        phone: '010-4000-0001',
        extensionNumber: '310',
        status: 'ACTIVE',
        joinedDate: '2016-04-01',
        isHead: true,
        birthDate: '760920'
    },
    {
        id: 'EMP041',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해운영업본부',
        department: '해외사업부',
        team: '',
        position: '과장',
        duty: '팀원',
        name: '오과장',
        email: 'oh.overseas@fuji.com',
        phone: '010-4000-0002',
        extensionNumber: '311',
        status: 'ACTIVE',
        joinedDate: '2019-09-10',
        isHead: false,
        birthDate: '860218'
    },

    // ============ 전략기획실 ============
    // 미래전략부
    {
        id: 'EMP050',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '전략기획실',
        department: '미래전략부',
        team: '',
        position: '이사',
        duty: '부서장',
        name: '서이사',
        email: 'seo.strategy@fuji.com',
        phone: '010-5000-0001',
        extensionNumber: '401',
        status: 'ACTIVE',
        joinedDate: '2014-02-01',
        isHead: true,
        birthDate: '710615'
    },
    {
        id: 'EMP051',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '전략기획실',
        department: '미래전략부',
        team: '',
        position: '차장',
        duty: '팀원',
        name: '신차장',
        email: 'shin.strategy@fuji.com',
        phone: '010-5000-0002',
        extensionNumber: '402',
        status: 'ACTIVE',
        joinedDate: '2018-07-15',
        isHead: false,
        birthDate: '831022'
    },

    // 전산기획부
    {
        id: 'EMP060',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '전략기획실',
        department: '전산기획부',
        team: 'IT팀',
        position: '차장',
        duty: '팀장',
        name: '유차장',
        englishName: 'Yoo, Charlie',
        email: 'yoo.it@fuji.com',
        phone: '010-6000-0001',
        extensionNumber: '410',
        status: 'ACTIVE',
        joinedDate: '2017-03-20',
        isHead: true,
        birthDate: '801205'
    },
    {
        id: 'EMP061',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '전략기획실',
        department: '전산기획부',
        team: 'IT팀',
        position: '대리',
        duty: '팀원',
        name: '안대리',
        englishName: 'Ahn, David',
        email: 'ahn.it@fuji.com',
        phone: '010-6000-0002',
        extensionNumber: '411',
        status: 'ACTIVE',
        joinedDate: '2020-05-11',
        isHead: false,
        birthDate: '890312'
    },
    {
        id: 'EMP062',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '전략기획실',
        department: '전산기획부',
        team: 'IT팀',
        position: '사원',
        duty: '팀원',
        name: '문사원',
        englishName: 'Moon, Emily',
        email: 'moon.it@fuji.com',
        phone: '010-6000-0003',
        extensionNumber: '412',
        status: 'ACTIVE',
        joinedDate: '2022-01-03',
        isHead: false,
        birthDate: '920825'
    },

    // ============ 운영관리사업본부 ============
    // 재무관리사업부
    {
        id: 'EMP070',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '운영관리사업본부',
        department: '재무관리사업부',
        team: '회계팀',
        position: '부장',
        duty: '부서장',
        name: '양부장',
        email: 'yang.finance@fuji.com',
        phone: '010-7000-0001',
        extensionNumber: '501',
        status: 'ACTIVE',
        joinedDate: '2015-11-01',
        isHead: true,
        birthDate: '741118'
    },
    {
        id: 'EMP071',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '운영관리사업본부',
        department: '재무관리사업부',
        team: '회계팀',
        position: '차장',
        duty: '팀장',
        name: '조차장',
        englishName: 'Jo, Frank',
        email: 'jo.accounting@fuji.com',
        phone: '010-7000-0002',
        extensionNumber: '502',
        status: 'ACTIVE',
        joinedDate: '2017-06-10',
        isHead: false,
        birthDate: '800420'
    },
    {
        id: 'EMP072',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '운영관리사업본부',
        department: '재무관리사업부',
        team: '회계팀',
        position: '과장',
        duty: '팀원',
        name: '배과장',
        email: 'bae.accounting@fuji.com',
        phone: '010-7000-0003',
        extensionNumber: '503',
        status: 'ACTIVE',
        joinedDate: '2019-04-15',
        isHead: false,
        birthDate: '850707'
    },

    // 경영지원부
    {
        id: 'EMP080',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '운영관리사업본부',
        department: '경영지원부',
        team: '총무팀',
        position: '차장',
        duty: '부서장',
        name: '남차장',
        email: 'nam.support@fuji.com',
        phone: '010-8000-0001',
        extensionNumber: '510',
        status: 'ACTIVE',
        joinedDate: '2016-12-01',
        isHead: true,
        birthDate: '781015'
    },
    {
        id: 'EMP081',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '운영관리사업본부',
        department: '경영지원부',
        team: '총무팀',
        position: '대리',
        duty: '팀원',
        name: '권대리',
        email: 'kwon.support@fuji.com',
        phone: '010-8000-0002',
        extensionNumber: '511',
        status: 'ACTIVE',
        joinedDate: '2020-08-20',
        isHead: false,
        birthDate: '880925'
    },

    // 인사총무팀
    {
        id: 'EMP090',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '운영관리사업본부',
        department: '인사총무팀',
        team: '',
        position: '부장',
        duty: '부서장',
        name: '홍부장',
        email: 'hong.hr@fuji.com',
        phone: '010-9000-0001',
        extensionNumber: '317',
        status: 'ACTIVE',
        joinedDate: '2014-08-01',
        isHead: true,
        birthDate: '720530'
    },
    {
        id: 'EMP091',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '운영관리사업본부',
        department: '인사총무팀',
        team: '',
        position: '차장',
        duty: '팀원',
        name: '황차장',
        email: 'hwang.hr@fuji.com',
        phone: '010-9000-0002',
        extensionNumber: '318',
        status: 'ACTIVE',
        joinedDate: '2018-02-15',
        isHead: false,
        birthDate: '820808'
    },
    {
        id: 'EMP092',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '운영관리사업본부',
        department: '인사총무팀',
        team: '',
        position: '과장',
        duty: '팀원',
        name: '민과장',
        email: 'min.hr@fuji.com',
        phone: '010-9000-0003',
        extensionNumber: '319',
        status: 'ACTIVE',
        joinedDate: '2019-10-01',
        isHead: false,
        birthDate: '861212'
    },

    // ============ 해양기술사업본부 ============
    // 부품사업부
    {
        id: 'EMP100',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해양기술사업본부',
        department: '부품사업부',
        team: '기술팀',
        position: '부장',
        duty: '부서장',
        name: '송부장',
        email: 'song.parts@fuji.com',
        phone: '010-1100-0001',
        extensionNumber: '601',
        status: 'ACTIVE',
        joinedDate: '2016-01-15',
        isHead: true,
        birthDate: '760322'
    },
    {
        id: 'EMP101',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해양기술사업본부',
        department: '부품사업부',
        team: '기술팀',
        position: '차장',
        duty: '팀장',
        name: '전차장',
        email: 'jeon.tech@fuji.com',
        phone: '010-1100-0002',
        extensionNumber: '602',
        status: 'ACTIVE',
        joinedDate: '2018-05-20',
        isHead: false,
        birthDate: '811115'
    },
    {
        id: 'EMP102',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해양기술사업본부',
        department: '부품사업부',
        team: '기술팀',
        position: '과장',
        duty: '팀원',
        name: '곽과장',
        email: 'kwak.tech@fuji.com',
        phone: '010-1100-0003',
        extensionNumber: '603',
        status: 'ACTIVE',
        joinedDate: '2020-03-10',
        isHead: false,
        birthDate: '870605'
    },
    {
        id: 'EMP103',
        primaryCompany: '(주)후지글로벌로지스틱',
        division: '해양기술사업본부',
        department: '부품사업부',
        team: '영업팀',
        position: '대리',
        duty: '팀장',
        name: '차대리',
        email: 'cha.sales@fuji.com',
        phone: '010-1100-0004',
        extensionNumber: '604',
        status: 'ACTIVE',
        joinedDate: '2019-07-01',
        isHead: false,
        birthDate: '880920'
    },
];

/**
 * 이 데이터를 적용하는 방법:
 * 
 * 1. 개발자 콘솔에서 직접 적용:
 *    localStorage.setItem('orgChartData_v5', JSON.stringify(SAMPLE_ORG_DATA));
 *    그 다음 페이지 새로고침
 * 
 * 2. OrganizationChart.tsx에서 초기값으로 사용:
 *    useState<Employee[]>(() => {
 *      const savedData = localStorage.getItem('orgChartData_v5');
 *      return savedData ? JSON.parse(savedData) : SAMPLE_ORG_DATA;
 *    });
 */
