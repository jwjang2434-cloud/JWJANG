
export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isStreaming?: boolean;
  sources?: string[];
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface UserProfile {
  id: string;
  name: string;
  department: string;
  avatarUrl: string;
  companyName: string;
  role: UserRole;
  birthDate?: string; // YYMMDD (바이오리듬용)
  customNickname?: string; // 사용자 지정 닉네임
  customAvatarUrl?: string; // 사용자 지정 아바타
}

export interface ReferenceDoc {
  id: string;
  title: string;
  type: 'PDF' | 'DOC' | 'NOTION';
  lastUpdated: string;
  content: string; // 문서의 실제 텍스트 내용 (Mock RAG용)
  keywords: string[]; // 검색을 위한 키워드 태그
  fileUrl?: string; // 실제 파일 URL (PDF 뷰어용)
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
  author?: string; // 작성자 필드 추가
}

export interface LLMConfig {
  provider: 'gemini' | 'openai';
  apiKey: string;
  modelName: string;
}

export interface Employee {
  id: string;
  primaryCompany: string; // 소속 사업장 (원소속)
  division?: string; // 본부 (자동 분류됨)
  department: string; // 부서
  team?: string; // 팀
  position: string; // 직위 (사원, 대리...)
  name: string; // 성명
  duty?: string; // 직책 (본부장, 팀장...)
  email: string;
  phone: string;
  extensionNumber?: string; // 내선번호
  status: 'ACTIVE' | 'LEAVE'; // 재직, 휴직
  joinedDate: string;
  avatarUrl?: string;
  isHead?: boolean; // 조직장 여부
  displayOrder?: number; // 정렬 순서
  birthDate?: string; // 주민번호 앞 6자리 (보안 저장)
}

// Organization Chart Tree Node
export interface OrgNode {
  id: string;
  name: string; // 부서명 or 직책
  type: 'CEO' | 'DIVISION' | 'DEPARTMENT' | 'TEAM';
  manager?: string; // 부서장/담당자 이름
  managerId?: string; // Added managerId
  children?: OrgNode[];
}

// Navigation State
export type ViewPage = 'CHAT' | 'MEETING' | 'FORMS' | 'MENU' | 'CAFE' | 'BUS' | 'SNACK' | 'SUGGESTION' | 'NEWSLETTER' | 'BROCHURE' | 'ORG_CHART' | 'REGULATIONS' | 'ADMIN_QUERIES' | 'NOTICE_BOARD' | 'MENU_MANAGEMENT' | 'ATTENDANCE' | 'ADMIN_ATTENDANCE';

export interface MenuItem {
  id: ViewPage;
  label: string;
  icon?: React.ReactNode; // Icon is optional for custom added items
  isCustom?: boolean; // Flag to identify custom added items
}

// Attendance Record
export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userDepartment?: string; // 직원 부서/팀
  checkInTime: string; // ISO string
  date: string; // YYYY-MM-DD
}
