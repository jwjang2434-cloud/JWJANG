
import { UserProfile, UserRole } from '../types';

// [개발 연동 주석]: DB 스키마 설계 가이드 (MySQL 예시)
/*
  -- 사용자 테이블 생성 쿼리
  CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY COMMENT '사용자 로그인 ID',
    password_hash VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호 (bcrypt 등 사용)',
    name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    department VARCHAR(100) COMMENT '소속 부서',
    role ENUM('ADMIN', 'USER') DEFAULT 'USER' COMMENT '권한 레벨',
    company_name VARCHAR(100) DEFAULT '한일후지코리아(주)',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- 초기 데이터 삽입 예시
  INSERT INTO users (id, password_hash, name, department, role) VALUES 
  ('admin', '$2b$10$X...', '관리자', '인사총무팀', 'ADMIN');
*/

// Mock Data for Demo (실제 환경에서는 DB에서 조회)
const MOCK_USERS: Record<string, any> = {
  'admin': {
    password: '1234', // [보안 주의]: 실제로는 해시된 비밀번호와 비교해야 합니다.
    profile: {
      id: 'admin',
      name: '관리자',
      department: '인사총무팀',
      avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff',
      companyName: '한일후지코리아(주)',
      role: UserRole.ADMIN,
      birthDate: '900101' // Mock Birthdate for Biorhythm
    }
  },
  'test1': {
    password: '1234',
    profile: {
      id: 'test1',
      name: '장진우 과장',
      department: '인사총무팀',
      avatarUrl: 'https://ui-avatars.com/api/?name=Jang&background=0D8ABC&color=fff',
      companyName: '한일후지코리아(주)',
      role: UserRole.USER,
      birthDate: '850505' // Mock Birthdate
    }
  },
  'test2': {
    password: '1234',
    profile: {
      id: 'test2',
      name: '문수민 주임',
      department: '인사총무팀',
      avatarUrl: 'https://ui-avatars.com/api/?name=Moon&background=0D8ABC&color=fff',
      companyName: '한일후지코리아(주)',
      role: UserRole.USER,
      birthDate: '921225' // Mock Birthdate
    }
  },
  'test3': {
    password: '1234',
    profile: {
      id: 'test3',
      name: '신동욱 주임',
      department: '인사총무팀',
      avatarUrl: 'https://ui-avatars.com/api/?name=Shin&background=0D8ABC&color=fff',
      companyName: '한일후지코리아(주)',
      role: UserRole.USER,
      birthDate: '950815' // Mock Birthdate
    }
  }
};

export const login = async (id: string, password: string): Promise<UserProfile> => {
  // [개발 연동 주석]: 실제 API 호출 부분
  // const response = await axios.post('/api/auth/login', { id, password });
  // return response.data;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const user = MOCK_USERS[id];

  if (!user) {
    throw new Error('존재하지 않는 아이디입니다.');
  }

  if (user.password !== password) {
    throw new Error('비밀번호가 올바르지 않습니다.');
  }

  return user.profile;
};
