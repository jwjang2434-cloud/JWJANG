import { UserProfile, UserRole, UserAccount } from '../types';
import { supabase } from '../utils/supabaseClient';

// 초기 데이터 (LocalStorage가 비어있을 때 사용) - Supabase 마이그레이션용
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'admin',
    password: '1234',
    name: '관리자',
    department: '인사총무팀',
    role: UserRole.ADMIN,
    companyName: '한일후지코리아(주)',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff',
    birthDate: '900101',
    team: '인사총무팀' // Default team for admin
  },
  {
    id: 'test1',
    password: '1234',
    name: '장진우 과장',
    department: '인사총무팀',
    role: UserRole.USER,
    companyName: '(주)후지글로벌로지스틱',
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

// Get all users
export const getUsers = async (): Promise<UserAccount[]> => {
  const { data, error } = await supabase
    .from('portal_users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  // Map snake_case to camelCase if needed, but we'll try to keep schema consistent
  // For now assuming Supabase columns match our types or we map them
  return data.map(u => ({
    id: u.id,
    password: u.password,
    name: u.name,
    department: u.department,
    role: u.role as UserRole,
    companyName: u.company_name, // DB column: company_name
    avatarUrl: u.avatar_url,     // DB column: avatar_url
    birthDate: u.birth_date,      // DB column: birth_date
    team: u.team                 // DB column: team
  }));
};

// Add new user
export const addUser = async (user: UserAccount): Promise<void> => {
  const { error } = await supabase
    .from('portal_users')
    .insert([{
      id: user.id,
      password: user.password,
      name: user.name,
      department: user.department,
      role: user.role,
      company_name: user.companyName,
      avatar_url: user.avatarUrl,
      avatar_url: user.avatarUrl,
      birth_date: user.birthDate,
      team: user.team
    }]);

  if (error) {
    throw new Error(error.message);
  }
};

// Update user
export const updateUser = async (id: string, updates: Partial<UserAccount>): Promise<void> => {
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.password) dbUpdates.password = updates.password;
  if (updates.department) dbUpdates.department = updates.department;
  if (updates.role) dbUpdates.role = updates.role;
  if (updates.companyName) dbUpdates.company_name = updates.companyName;
  if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.birthDate) dbUpdates.birth_date = updates.birthDate;
  if (updates.team) dbUpdates.team = updates.team;

  const { error } = await supabase
    .from('portal_users')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('portal_users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const login = async (id: string, password: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('portal_users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('존재하지 않는 아이디입니다.');
  }

  if (data.password !== password) {
    throw new Error('비밀번호가 올바르지 않습니다.');
  }

  return {
    id: data.id,
    name: data.name,
    department: data.department,
    role: data.role as UserRole,
    companyName: data.company_name,
    avatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${data.name}&background=random`,
    birthDate: data.birth_date,
    team: data.team,
  };
};

// Initialize Default Data (One-time utility)
export const initializeDefaultUsers = async () => {
  const { count } = await supabase.from('portal_users').select('*', { count: 'exact', head: true });
  if (count === 0) {
    console.log('Initializing default users...');
    for (const user of INITIAL_USERS) {
      await addUser(user);
    }
  }
};
