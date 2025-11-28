import { UserProfile, UserRole, UserAccount } from '../types';

// 초기 데이터 (LocalStorage가 비어있을 때 사용)
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'admin',
    password: '1234',
    name: '관리자',
    department: '인사총무팀',
    role: UserRole.ADMIN,
    companyName: '한일후지코리아(주)',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff',
    birthDate: '900101'
  },
  {
    id: 'test1',
    password: '1234',
    name: '장진우 과장',
    department: '인사총무팀',
    role: UserRole.USER,
    companyName: '한일후지코리아(주)',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jang&background=0D8ABC&color=fff',
    birthDate: '850505'
  },
  {
    id: 'test2',
    password: '1234',
    name: '문수민 주임',
    department: '인사총무팀',
    role: UserRole.USER,
    companyName: '한일후지코리아(주)',
    avatarUrl: 'https://ui-avatars.com/api/?name=Moon&background=0D8ABC&color=fff',
    birthDate: '921225'
  },
  {
    id: 'test3',
    password: '1234',
    name: '신동욱 주임',
    department: '인사총무팀',
    role: UserRole.USER,
    companyName: '한일후지코리아(주)',
    avatarUrl: 'https://ui-avatars.com/api/?name=Shin&background=0D8ABC&color=fff',
    birthDate: '950815'
  }
];

const STORAGE_KEY = 'portal_users';

// Initialize LocalStorage if empty
const initializeUsers = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(stored) as UserAccount[];
};

// Get all users
export const getUsers = (): UserAccount[] => {
  return initializeUsers();
};

// Add new user
export const addUser = (user: UserAccount): void => {
  const users = getUsers();
  if (users.find(u => u.id === user.id)) {
    throw new Error('이미 존재하는 아이디입니다.');
  }
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Update user
export const updateUser = (id: string, updates: Partial<UserAccount>): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  // ID 변경은 불가 (필요시 삭제 후 재생성)
  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Delete user
export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (users.length === filtered.length) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const login = async (id: string, password: string): Promise<UserProfile> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const users = getUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    throw new Error('존재하지 않는 아이디입니다.');
  }

  if (user.password !== password) {
    throw new Error('비밀번호가 올바르지 않습니다.');
  }

  // Return UserProfile (subset of UserAccount)
  return {
    id: user.id,
    name: user.name,
    department: user.department,
    role: user.role,
    companyName: user.companyName,
    avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`,
    birthDate: user.birthDate,
    // custom fields are stored separately in userProfile key in App.tsx logic usually, 
    // but here we return base profile. App.tsx handles merging custom profile data.
  };
};
