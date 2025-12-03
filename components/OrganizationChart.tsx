
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Employee, UserProfile, UserRole, OrgNode } from '../types';
import * as XLSX from 'xlsx';

import { SAMPLE_ORG_DATA } from '../orgdata-sample';

// 계열사 목록
const COMPANY_LIST = [
    '한일후지코리아(주)',
    '(주)후지글로벌로지스틱',
    '(주)아이멕스글로벌',
    '(주)케이텍코퍼레이션',
    '(주)키토스',
    '케이트랜스(주)'
];

// 기본 부서 -> 본부 매핑 (초기값)
const DEFAULT_DEPT_TO_DIVISION_MAP: Record<string, string> = {
    '경영진': '경영진',
    '임원실': '경영진',
    'F&B사업부': 'F&B사업본부',
    '케터링사업부': 'F&B사업본부',
    '국내사업부': '해운영업본부',
    '해외사업부': '해운영업본부',
    '미래전략부': '전략기획실',
    '전산기획부': '전략기획실',
    '부품사업부': '해양기술사업본부',
    '선박서비스사업부': '선박서비스사업본부',
    '선용사업부': '마린서비스사업본부',
    '프로젝트사업부': '마린서비스사업본부',
    '엔진부품사업부': '엔진기술사업본부',
    '재무관리사업부': '운영관리사업본부',
    '경영지원부': '운영관리사업본부',
    '인사총무팀': '운영관리사업본부'
};

// 직책(Duty) 정렬 우선순위
const DUTY_PRIORITY: Record<string, number> = {
    '대표이사': 1,
    'CEO': 1,
    '사장': 1,
    '부사장': 2,
    '전무': 3,
    '상무': 4,
    '이사': 5,
    '본부장': 10,
    '부서장': 20,
    '소장': 25,
    '팀장': 30,
    '파트장': 35,
    '팀원': 99,
    '사원': 99,
    '대리': 99,
    '과장': 99,
    '차장': 99,
    '부장': 99,
    '': 99
};

interface OrganizationChartProps {
    user: UserProfile;
}

interface LeaderAssignments {
    [nodeKey: string]: string;
}

export const OrganizationChart: React.FC<OrganizationChartProps> = ({ user }) => {
    const [allEmployees, setAllEmployees] = useState<Employee[]>(() => {
        const savedData = localStorage.getItem('orgChartData_v5');
        return savedData ? JSON.parse(savedData) : [];
    });

    const [leaderAssignments, setLeaderAssignments] = useState<LeaderAssignments>(() => {
        const saved = localStorage.getItem('leaderAssignments');
        return saved ? JSON.parse(saved) : {};
    });

    const [deptToDivMap, setDeptToDivMap] = useState<Record<string, string>>(() => {
        const saved = localStorage.getItem('deptToDivMap');
        return saved ? JSON.parse(saved) : DEFAULT_DEPT_TO_DIVISION_MAP;
    });

    const [activeCompany, setActiveCompany] = useState<string>(() => {
        return COMPANY_LIST.includes(user.companyName) ? user.companyName : COMPANY_LIST[0];
    });

    const [treeData, setTreeData] = useState<OrgNode | null>(null);
    const [viewMode, setViewMode] = useState<'LIST' | 'TREE' | 'CARD'>('CARD');
    const [searchTerm, setSearchTerm] = useState('');

    const [isUploading, setIsUploading] = useState(false);

    // Modes
    const [isLeaderMgmtMode, setIsLeaderMgmtMode] = useState(false);
    const [showLeaderPicker, setShowLeaderPicker] = useState<string | null>(null);

    const [isDivMgmtMode, setIsDivMgmtMode] = useState(false); // 본부 설정 모드

    const [leaderSearchTerm, setLeaderSearchTerm] = useState('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

    // Member Management State
    const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Employee | null>(null);

    const handleDeleteMember = (memberId: string) => {
        setAllEmployees(prev => prev.filter(e => e.id !== memberId));
    };

    const handleSaveMember = (updatedMember: Employee) => {
        setAllEmployees(prev => {
            const exists = prev.find(e => e.id === updatedMember.id);
            if (exists) {
                return prev.map(e => e.id === updatedMember.id ? updatedMember : e);
            } else {
                // New member - generate ID if not present
                const newMember = { ...updatedMember, id: updatedMember.id || `new_${Date.now()}` };
                return [...prev, newMember];
            }
        });
        setIsEditMemberModalOpen(false);
        setEditingMember(null);
    };

    // New States for Enhancements
    const [memberStatuses, setMemberStatuses] = useState<Record<string, string>>(() => {
        const saved = localStorage.getItem('memberStatuses');
        return saved ? JSON.parse(saved) : {};
    });

    const [externalMembers, setExternalMembers] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem('externalMembers');
        return saved ? JSON.parse(saved) : {};
    });

    const [orgSortOrder, setOrgSortOrder] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('orgSortOrder');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('memberStatuses', JSON.stringify(memberStatuses));
    }, [memberStatuses]);

    useEffect(() => {
        localStorage.setItem('externalMembers', JSON.stringify(externalMembers));
    }, [externalMembers]);

    useEffect(() => {
        localStorage.setItem('orgSortOrder', JSON.stringify(orgSortOrder));
    }, [orgSortOrder]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isAdmin = user.role === UserRole.ADMIN;

    useEffect(() => {
        localStorage.setItem('orgChartData_v5', JSON.stringify(allEmployees));
    }, [allEmployees]);

    useEffect(() => {
        localStorage.setItem('leaderAssignments', JSON.stringify(leaderAssignments));
    }, [leaderAssignments]);

    useEffect(() => {
        localStorage.setItem('deptToDivMap', JSON.stringify(deptToDivMap));
    }, [deptToDivMap]);

    // 데이터 변경 시 Division 정보 재적용
    const employeesWithDivision = useMemo(() => {
        return allEmployees.map(emp => {
            // 본부 정보가 없거나, 매핑에 의해 덮어씌워야 할 경우
            const mappedDiv = deptToDivMap[emp.department] || deptToDivMap[emp.team || ''];

            let division = emp.division || '기타(미분류)';
            if (mappedDiv) {
                division = mappedDiv;
            } else if (emp.duty === '대표이사' || emp.duty === 'CEO' || emp.department === '경영진') {
                division = '경영진';
            }

            return { ...emp, division };
        });
    }, [allEmployees, deptToDivMap]);

    const filteredEmployees = useMemo(() => {
        let result = employeesWithDivision.filter(emp => emp.primaryCompany === activeCompany);

        if (searchTerm.trim()) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(emp =>
                emp.name.toLowerCase().includes(lowerTerm) ||
                (emp.department || '').toLowerCase().includes(lowerTerm) ||
                (emp.team || '').toLowerCase().includes(lowerTerm) ||
                (emp.position || '').toLowerCase().includes(lowerTerm) ||
                (emp.duty || '').toLowerCase().includes(lowerTerm) ||
                (emp.email || '').toLowerCase().includes(lowerTerm) ||
                (emp.extensionNumber || '').includes(lowerTerm)
            );
        }

        return result.sort((a, b) => {
            // 1. 직책 우선순위 (낮은 숫자가 높음)
            const dutyA = a.duty ? (DUTY_PRIORITY[a.duty] || 99) : 99;
            const dutyB = b.duty ? (DUTY_PRIORITY[b.duty] || 99) : 99;

            if (dutyA !== dutyB) return dutyA - dutyB;

            // 2. 입사일 순 (빠른 날짜가 먼저 = 선임)
            if (a.joinedDate && b.joinedDate) {
                return a.joinedDate.localeCompare(b.joinedDate);
            }
            return 0;
        });
    }, [employeesWithDivision, activeCompany, searchTerm]);

    const groupedEmployees = useMemo(() => {
        if (searchTerm.trim()) return null;

        const groups: Record<string, Record<string, Record<string, Employee[]>>> = {};

        filteredEmployees.forEach(emp => {
            if (emp.duty === 'CEO' || emp.duty === '대표이사' || emp.department === '경영진' || emp.division === '경영진') {
                if (!groups['경영진']) groups['경영진'] = { '임원': { 'Direct': [] } };
                groups['경영진']['임원']['Direct'].push(emp);
                return;
            }

            const div = emp.division || '기타(미분류)';
            const dept = emp.department || '직속';
            const team = emp.team || 'Department_Direct';

            if (!groups[div]) groups[div] = {};
            if (!groups[div][dept]) groups[div][dept] = {};
            if (!groups[div][dept][team]) groups[div][dept][team] = [];

            groups[div][dept][team].push(emp);
        });

        return groups;
    }, [filteredEmployees, searchTerm]);

    useEffect(() => {
        if (viewMode === 'TREE') {
            const newTree = buildOrgTree(filteredEmployees, activeCompany);
            setTreeData(newTree);

            // Default Expansion: Expand Root, Divisions, and Departments (Hide Teams)
            // Only apply if we are in a "reset" state (e.g. just switched to TREE or loaded data)
            // We use a heuristic: if expandedNodes only has 'root' or is empty.
            if (expandedNodes.size <= 1) {
                const defaults = new Set<string>();
                defaults.add(newTree.id); // Root
                newTree.children?.forEach(div => {
                    defaults.add(div.id); // Division
                    div.children?.forEach(dept => {
                        defaults.add(dept.id); // Department
                    });
                });
                setExpandedNodes(defaults);
            }
        }
    }, [activeCompany, filteredEmployees, leaderAssignments, viewMode]);

    const buildOrgTree = (employees: Employee[], companyName: string): OrgNode => {
        const rootKey = `CEO:${companyName}`;

        // Check for manual assignment first
        const assignedCeoId = leaderAssignments[rootKey];
        let ceo: Employee | undefined;

        if (assignedCeoId) {
            ceo = employees.find(e => e.id === assignedCeoId);
        }

        // If no manual assignment, try to find by duty
        if (!ceo) {
            ceo = employees.find(e => e.duty === '대표이사' || e.duty === 'CEO');
        }

        const root: OrgNode = {
            id: rootKey,
            name: '대표이사',
            type: 'CEO',
            manager: ceo ? ceo.name : '(공석)',
            managerId: ceo?.id,
            children: []
        };

        const divisions: Record<string, Employee[]> = {};
        employees.forEach(emp => {
            if (emp.id === ceo?.id || emp.department === '경영진' || emp.division === '경영진') return;
            const divName = emp.division || '기타(미분류)';
            if (!divisions[divName]) divisions[divName] = [];
            divisions[divName].push(emp);
        });

        const getSortOrder = (key: string) => orgSortOrder[key] ?? 999;

        Object.keys(divisions).sort((a, b) => {
            const orderA = getSortOrder(`DIV:${a}`);
            const orderB = getSortOrder(`DIV:${b}`);
            if (orderA !== orderB) return orderA - orderB;
            return a.localeCompare(b);
        }).forEach((divName) => {
            const divEmployees = divisions[divName];
            const divKey = `DIV:${divName}`;

            const assignedLeaderId = leaderAssignments[divKey];
            let divHeadName = undefined;
            let divHeadId = undefined;

            if (assignedLeaderId) {
                const leader = allEmployees.find(e => e.id === assignedLeaderId);
                if (leader) { divHeadName = leader.name; divHeadId = leader.id; }
            } else {
                const autoHead = divEmployees.find(e => e.duty?.includes('본부장'));
                if (autoHead) { divHeadName = autoHead.name; divHeadId = autoHead.id; }
            }

            const divNode: OrgNode = {
                id: divKey,
                name: divName,
                type: 'DIVISION',
                manager: divHeadName,
                managerId: divHeadId,
                children: []
            };

            // Inject External Members for Division
            const extDivMembers = externalMembers[divKey] || [];
            extDivMembers.forEach(empId => {
                const emp = allEmployees.find(e => e.id === empId);
                if (emp) {
                    if (!divEmployees.find(e => e.id === emp.id)) {
                        divEmployees.push(emp);
                    }
                }
            });

            const depts: Record<string, Employee[]> = {};
            divEmployees.forEach(emp => {
                if (emp.department) {
                    if (!depts[emp.department]) depts[emp.department] = [];
                    depts[emp.department].push(emp);
                }
            });

            Object.keys(depts).sort((a, b) => {
                const orderA = getSortOrder(`DEPT:${a}`);
                const orderB = getSortOrder(`DEPT:${b}`);
                if (orderA !== orderB) return orderA - orderB;
                return a.localeCompare(b);
            }).forEach(deptName => {
                const deptEmployees = depts[deptName];
                const deptKey = `DEPT:${deptName}`;

                const assignedDeptLeaderId = leaderAssignments[deptKey];
                let deptHeadName = undefined;
                let deptHeadId = undefined;

                if (assignedDeptLeaderId) {
                    const leader = allEmployees.find(e => e.id === assignedDeptLeaderId);
                    if (leader) { deptHeadName = leader.name; deptHeadId = leader.id; }
                } else {
                    const autoHead = deptEmployees.find(e => e.duty?.includes('부서장') || e.duty?.includes('소장'));
                    if (autoHead) { deptHeadName = autoHead.name; deptHeadId = autoHead.id; }
                }

                const deptNode: OrgNode = {
                    id: deptKey,
                    name: deptName,
                    type: 'DEPARTMENT',
                    manager: deptHeadName,
                    managerId: deptHeadId,
                    children: []
                };

                // Inject External Members for Department
                const extDeptMembers = externalMembers[deptKey] || [];
                extDeptMembers.forEach(empId => {
                    const emp = allEmployees.find(e => e.id === empId);
                    if (emp) {
                        if (!deptEmployees.find(e => e.id === emp.id)) {
                            deptEmployees.push(emp);
                        }
                    }
                });

                const teams: Record<string, Employee[]> = {};
                const deptDirectMembers: Employee[] = [];

                deptEmployees.forEach(emp => {
                    if (emp.team) {
                        if (!teams[emp.team]) teams[emp.team] = [];
                        teams[emp.team].push(emp);
                    } else {
                        // Members without a team go directly under department
                        deptDirectMembers.push(emp);
                    }
                });

                // Add teams with members
                Object.keys(teams).sort((a, b) => {
                    const orderA = getSortOrder(`TEAM:${a}`);
                    const orderB = getSortOrder(`TEAM:${b}`);
                    if (orderA !== orderB) return orderA - orderB;
                    return a.localeCompare(b);
                }).forEach(teamName => {
                    const teamKey = `TEAM:${teamName}`;

                    const assignedTeamLeaderId = leaderAssignments[teamKey];
                    let teamHeadName = undefined;
                    let teamHeadId = undefined;

                    if (assignedTeamLeaderId) {
                        const leader = allEmployees.find(e => e.id === assignedTeamLeaderId);
                        if (leader) { teamHeadName = leader.name; teamHeadId = leader.id; }
                    } else {
                        const autoHead = teams[teamName].find(e => e.duty?.includes('팀장') || e.duty?.includes('파트장'));
                        if (autoHead) { teamHeadName = autoHead.name; teamHeadId = autoHead.id; }
                    }

                    const teamNode: OrgNode = {
                        id: teamKey,
                        name: teamName,
                        type: 'TEAM',
                        manager: teamHeadName,
                        managerId: teamHeadId,
                        children: []
                    };

                    // Inject External Members for Team
                    const extTeamMembers = externalMembers[teamKey] || [];
                    extTeamMembers.forEach(empId => {
                        const emp = allEmployees.find(e => e.id === empId);
                        if (emp) {
                            if (!teams[teamName].find(e => e.id === emp.id)) {
                                teams[teamName].push(emp);
                            }
                        }
                    });

                    // Add team members as children
                    teams[teamName].forEach(member => {
                        // Skip if member is the team leader
                        if (member.id === teamHeadId) return;

                        teamNode.children!.push({
                            id: `MEMBER:${member.id}`,
                            name: member.name,
                            type: 'MEMBER',
                            employee: member,
                            children: []
                        });
                    });

                    deptNode.children!.push(teamNode);
                });

                // Add department direct members (no team)
                deptDirectMembers.forEach(member => {
                    // Skip if member is the department leader
                    if (member.id === deptHeadId) return;

                    deptNode.children!.push({
                        id: `MEMBER:${member.id}`,
                        name: member.name,
                        type: 'MEMBER',
                        employee: member,
                        children: []
                    });
                });

                divNode.children!.push(deptNode);
            });

            root.children!.push(divNode);
        });

        return root;
    };

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const handleExpandAll = () => {
        if (!treeData) return;
        const allIds = new Set<string>();
        const traverse = (node: OrgNode) => {
            allIds.add(node.id);
            if (node.children) {
                node.children.forEach(traverse);
            }
        };
        traverse(treeData);
        setExpandedNodes(allIds);
    };

    const handleCollapseAll = () => {
        setExpandedNodes(new Set(['root']));
    };

    const handleAssignLeader = (nodeId: string, employeeId: string | null) => {
        const newAssignments = { ...leaderAssignments };
        if (employeeId) {
            newAssignments[nodeId] = employeeId;
        } else {
            delete newAssignments[nodeId];
        }
        setLeaderAssignments(newAssignments);
        setShowLeaderPicker(null);
    };

    const findColumnIndex = (headerRow: any[], keywords: string[]): number => {
        if (!headerRow) return -1;
        return headerRow.findIndex((cell: any) => {
            const str = String(cell || '').replace(/\s/g, '').toLowerCase();
            return keywords.some(k => str.includes(k));
        });
    };

    const processExcelData = (jsonData: any[]) => {
        try {
            if (!jsonData || jsonData.length < 2) {
                alert('데이터가 없는 엑셀 파일입니다.');
                return;
            }

            let headerRowIndex = -1;
            // 헤더 찾기 (사번, 성명 필수)
            for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
                const row = jsonData[i] as any[];
                // console.log(`Row ${i}:`, row); // Debugging
                if (row && row.some((cell: any) => {
                    const s = String(cell || '').replace(/\s/g, '');
                    return s.includes('사번') || s.includes('성명'); // OR condition for better detection
                })) {
                    // Check if both exist in the row to be sure
                    const rowStr = row.map(c => String(c || '').replace(/\s/g, '')).join(',');
                    if (rowStr.includes('사번') && rowStr.includes('성명')) {
                        headerRowIndex = i;
                        break;
                    }
                }
            }

            if (headerRowIndex === -1) {
                alert('엑셀 헤더를 찾을 수 없습니다. (필수 컬럼: 사번, 성명)');
                return;
            }

            const headerRow = jsonData[headerRowIndex] as any[];

            const idxMap = {
                company: findColumnIndex(headerRow, ['회사']),
                id: findColumnIndex(headerRow, ['사번']),
                dept: findColumnIndex(headerRow, ['부서명', '부서']),
                team: findColumnIndex(headerRow, ['팀명', '팀']),
                position: findColumnIndex(headerRow, ['직위']),
                name: findColumnIndex(headerRow, ['성명', '이름']),
                englishName: findColumnIndex(headerRow, ['영문성명', '영문이름', 'englishname']),
                rrid: findColumnIndex(headerRow, ['주민번호', '주민등록번호']),
                phone: findColumnIndex(headerRow, ['핸드폰', '휴대폰']),
                duty: findColumnIndex(headerRow, ['직책']),
                joined: findColumnIndex(headerRow, ['입사일', '최초입사일']),
                email: findColumnIndex(headerRow, ['메일', '이메일']),
                ext: findColumnIndex(headerRow, ['내선']),
                division: findColumnIndex(headerRow, ['t_division', '본부']) // Optional
            };

            if (idxMap.id === -1 || idxMap.name === -1) {
                alert('필수 컬럼(사번, 성명)을 인식할 수 없습니다.');
                return;
            }

            const newEmployees: Employee[] = [];
            let successCount = 0;
            let lastCompany = '';

            for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                if (!row || row.length === 0) continue;

                const id = row[idxMap.id] ? String(row[idxMap.id]).trim() : '';
                const name = row[idxMap.name] ? String(row[idxMap.name]).trim() : '';
                if (!id || !name) continue;

                const company = idxMap.company > -1 ? String(row[idxMap.company] || '').trim() : '한일후지코리아(주)';
                const dept = idxMap.dept > -1 ? String(row[idxMap.dept] || '').trim() : '';
                const team = idxMap.team > -1 ? String(row[idxMap.team] || '').trim() : '';
                const position = idxMap.position > -1 ? String(row[idxMap.position] || '').trim() : '';
                const englishName = idxMap.englishName > -1 ? String(row[idxMap.englishName] || '').trim() : '';
                const rrid = idxMap.rrid > -1 ? String(row[idxMap.rrid] || '').trim() : '';
                const phone = idxMap.phone > -1 ? String(row[idxMap.phone] || '').trim() : '';
                const duty = idxMap.duty > -1 ? String(row[idxMap.duty] || '').trim() : '';
                const joinedRaw = idxMap.joined > -1 ? row[idxMap.joined] : '';
                const email = idxMap.email > -1 ? String(row[idxMap.email] || '').trim() : '';
                const ext = idxMap.ext > -1 ? String(row[idxMap.ext] || '').trim() : '';

                // 엑셀에 본부 컬럼이 있으면 우선 사용
                let division = idxMap.division > -1 ? String(row[idxMap.division] || '').trim() : '';

                if (company) lastCompany = company;

                // Date Formatting
                let joinedDate = '';
                if (typeof joinedRaw === 'number') {
                    const date = new Date((joinedRaw - 25569) * 86400 * 1000);
                    joinedDate = date.toISOString().split('T')[0];
                } else if (typeof joinedRaw === 'string') {
                    joinedDate = joinedRaw.trim();
                }

                // 주민번호 -> 생일
                let birthDate = undefined;
                if (rrid) {
                    const cleanRRID = rrid.replace(/[^0-9]/g, '');
                    if (cleanRRID.length >= 6) {
                        birthDate = cleanRRID.substring(0, 6);
                    }
                }

                const isHead = (duty && (duty.includes('장') || duty === 'CEO' || duty === '이사' || duty === '상무' || duty === '전무')) ? true : false;

                newEmployees.push({
                    id,
                    primaryCompany: company || '한일후지코리아(주)',
                    division, // 나중에 deptToDivMap으로 덮어씌워짐 (employeesWithDivision)
                    department: dept,
                    team,
                    position,
                    name,
                    englishName,
                    duty,
                    email,
                    phone,
                    extensionNumber: ext,
                    status: 'ACTIVE',
                    joinedDate,
                    isHead,
                    birthDate,
                });
                successCount++;
            }

            if (successCount > 0) {
                if (confirm(`총 ${successCount}명의 데이터를 불러왔습니다.\n적용하시겠습니까?`)) {
                    setAllEmployees(newEmployees);
                    if (lastCompany) {
                        setActiveCompany(lastCompany);
                    }
                    alert('조직도가 업데이트되었습니다.');
                }
            } else {
                alert('유효한 데이터 행을 찾지 못했습니다.');
            }

        } catch (e) {
            console.error("Data Processing Error", e);
            alert('데이터 처리 중 오류가 발생했습니다.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
                processExcelData(jsonData as any[]);
            } catch (error) {
                console.error("Excel Read Error", error);
                alert("파일을 읽는 중 오류가 발생했습니다.");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const [activeModalTab, setActiveModalTab] = useState<'MAPPING' | 'SORT'>('MAPPING');

    // For Sort Tab: Build a hierarchy to display
    const hierarchy = useMemo(() => {
        const divs: Record<string, Record<string, string[]>> = {};
        employeesWithDivision.forEach(emp => {
            if (emp.primaryCompany !== activeCompany) return;
            const d = emp.division || '기타(미분류)';
            const dept = emp.department || '직속';
            const team = emp.team || '직속';

            if (!divs[d]) divs[d] = {};
            if (!divs[d][dept]) divs[d][dept] = [];
            if (team !== '직속' && !divs[d][dept].includes(team)) divs[d][dept].push(team);
        });
        return divs;
    }, [employeesWithDivision, activeCompany]);

    const renderDivMgmtModal = () => {
        if (!isDivMgmtMode) return null;

        // 현재 데이터에 존재하는 모든 부서 목록 추출
        const allDepts = Array.from(new Set(allEmployees.map(e => e.department).filter(d => d)));

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDivMgmtMode(false)}></div>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 animate-fade-in-up relative z-10">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">조직 관리 설정</h3>
                            <p className="text-xs text-slate-500">부서 매핑 및 조직도 표시 순서를 설정합니다.</p>
                        </div>
                        <button onClick={() => setIsDivMgmtMode(false)} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex border-b border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setActiveModalTab('MAPPING')}
                            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeModalTab === 'MAPPING' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            본부 매핑
                        </button>
                        <button
                            onClick={() => setActiveModalTab('SORT')}
                            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeModalTab === 'SORT' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            순서 설정
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
                        {activeModalTab === 'MAPPING' ? (
                            <div className="grid grid-cols-1 gap-4">
                                {allDepts.map(dept => {
                                    const currentDiv = deptToDivMap[dept] || '';
                                    return (
                                        <div key={dept} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="w-1/3 font-bold text-slate-700 dark:text-slate-200 truncate" title={dept}>
                                                {dept}
                                            </div>
                                            <div className="text-slate-400">→</div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="본부명을 입력하세요 (예: 경영지원본부)"
                                                    value={currentDiv}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setDeptToDivMap(prev => ({ ...prev, [dept]: val }));
                                                    }}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {allDepts.length === 0 && <p className="text-center text-slate-400">데이터에 부서 정보가 없습니다.</p>}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-xs text-blue-600 dark:text-blue-400 mb-4">
                                    * 숫자가 작을수록 왼쪽(또는 상단)에 먼저 표시됩니다. (기본값: 999)
                                </div>
                                {Object.keys(hierarchy).sort((a, b) => (orgSortOrder[`DIV:${a}`] ?? 999) - (orgSortOrder[`DIV:${b}`] ?? 999) || a.localeCompare(b)).map(divName => (
                                    <div key={divName} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 flex items-center justify-between">
                                            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs">본부</span>
                                                {divName}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">순서:</span>
                                                <input
                                                    type="number"
                                                    className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                                                    value={orgSortOrder[`DIV:${divName}`] ?? ''}
                                                    placeholder="999"
                                                    onChange={(e) => setOrgSortOrder(prev => ({ ...prev, [`DIV:${divName}`]: parseInt(e.target.value) || 0 }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            {Object.keys(hierarchy[divName]).sort((a, b) => (orgSortOrder[`DEPT:${a}`] ?? 999) - (orgSortOrder[`DEPT:${b}`] ?? 999) || a.localeCompare(b)).map(deptName => (
                                                <div key={deptName} className="pl-4 border-l-2 border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center justify-between py-1">
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px]">부서</span>
                                                            {deptName}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            className="w-14 px-2 py-0.5 text-xs border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900"
                                                            value={orgSortOrder[`DEPT:${deptName}`] ?? ''}
                                                            placeholder="999"
                                                            onChange={(e) => setOrgSortOrder(prev => ({ ...prev, [`DEPT:${deptName}`]: parseInt(e.target.value) || 0 }))}
                                                        />
                                                    </div>
                                                    {hierarchy[divName][deptName].length > 0 && (
                                                        <div className="pl-4 mt-1 space-y-1">
                                                            {hierarchy[divName][deptName].sort((a, b) => (orgSortOrder[`TEAM:${a}`] ?? 999) - (orgSortOrder[`TEAM:${b}`] ?? 999) || a.localeCompare(b)).map(teamName => (
                                                                <div key={teamName} className="flex items-center justify-between">
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                                        <span className="text-[10px] opacity-50">ㄴ 팀</span>
                                                                        {teamName}
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        className="w-12 px-1 py-0.5 text-[10px] border border-slate-100 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900"
                                                                        value={orgSortOrder[`TEAM:${teamName}`] ?? ''}
                                                                        placeholder="999"
                                                                        onChange={(e) => setOrgSortOrder(prev => ({ ...prev, [`TEAM:${teamName}`]: parseInt(e.target.value) || 0 }))}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={() => setIsDivMgmtMode(false)}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            설정 완료
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderLeaderPicker = () => {
        if (!showLeaderPicker) return null;

        // Search across ALL employees, not just current company
        const filtered = allEmployees.filter(emp =>
            emp.name.includes(leaderSearchTerm) ||
            emp.department.includes(leaderSearchTerm) ||
            emp.primaryCompany.includes(leaderSearchTerm)
        );

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLeaderPicker(null)}></div>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800 animate-fade-in-up relative z-10">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">조직장(리더) 지정 / 멤버 추가</h3>
                        <button onClick={() => setShowLeaderPicker(null)} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <input
                            type="text"
                            placeholder="이름, 부서, 회사명 검색..."
                            value={leaderSearchTerm}
                            onChange={(e) => setLeaderSearchTerm(e.target.value)}
                            autoFocus
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <button
                            onClick={() => handleAssignLeader(showLeaderPicker, null)}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 font-bold mb-2 border border-dashed border-red-200 dark:border-red-800"
                        >
                            🚫 지정 해제 (공석 처리)
                        </button>
                        {filtered.map(emp => (
                            <button
                                key={emp.id}
                                onClick={() => {
                                    // If employee is from another company, ask if they want to add as external member or assign as leader
                                    if (emp.primaryCompany !== activeCompany) {
                                        if (confirm(`${emp.name}님은 ${emp.primaryCompany} 소속입니다.\n\n[확인]을 누르면 이 조직의 리더로 지정합니다.\n[취소]를 누르면 이 조직의 멤버로 추가합니다.`)) {
                                            handleAssignLeader(showLeaderPicker, emp.id);
                                        } else {
                                            // Add as external member
                                            const currentExt = externalMembers[showLeaderPicker] || [];
                                            if (!currentExt.includes(emp.id)) {
                                                setExternalMembers({
                                                    ...externalMembers,
                                                    [showLeaderPicker]: [...currentExt, emp.id]
                                                });
                                                alert('멤버로 추가되었습니다.');
                                            } else {
                                                alert('이미 추가된 멤버입니다.');
                                            }
                                            setShowLeaderPicker(null);
                                        }
                                    } else {
                                        handleAssignLeader(showLeaderPicker, emp.id);
                                    }
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {emp.avatarUrl ? <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{emp.name[0]}</span>}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-slate-800 dark:text-white">{emp.name}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{emp.position}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500">
                                        {emp.primaryCompany} | {emp.department}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderTreeNode = (node: OrgNode, parentManagerId?: string) => {
        // Handle MEMBER type nodes differently
        if (node.type === 'MEMBER' && node.employee) {
            const member = node.employee;
            const manualStatus = memberStatuses[member.id];
            const isConcurrent = manualStatus === 'CONCURRENT';
            const isDispatch = manualStatus === 'DISPATCH';
            const isSupport = manualStatus === 'SUPPORT';
            const isExternal = member.primaryCompany !== activeCompany;

            return (
                <div className="flex flex-col items-start">
                    <div className={`bg-white dark:bg-slate-800 rounded-lg border-2 shadow-sm p-3 w-[200px] hover:shadow-md transition-all ${isExternal
                        ? 'border-orange-400 dark:border-orange-500 bg-orange-50/30 dark:bg-orange-900/10'
                        : 'border-slate-200 dark:border-slate-700'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 flex-shrink-0 relative ${isExternal ? 'border-orange-400 dark:border-orange-500' : 'border-slate-200 dark:border-slate-600'
                                }`}>
                                {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{member.name[0]}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{member.name}</div>
                                {member.englishName && (
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate italic">{member.englishName}</div>
                                )}
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.position}</div>
                            </div>
                        </div>

                        {/* External company indicator */}
                        {isExternal && (
                            <div className="mb-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300">타사 소속: {member.primaryCompany}</span>
                                </div>
                            </div>
                        )}

                        {/* Contact info */}
                        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                            {member.extensionNumber && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">내선 {member.extensionNumber}</span>
                                </div>
                            )}
                            {member.phone && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                    <span className="font-mono">{member.phone}</span>
                                </div>
                            )}
                        </div>

                        {/* Status badges and admin control */}
                        <div className="flex gap-1 mt-2 flex-wrap items-center">
                            {isConcurrent && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800">겸직</span>}
                            {isDispatch && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">파견</span>}
                            {isSupport && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold border border-green-200 dark:border-green-800">지원</span>}

                            {/* Admin status control */}
                            {isAdmin && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const current = memberStatuses[member.id];
                                        const next = current === 'CONCURRENT' ? 'DISPATCH' : current === 'DISPATCH' ? 'SUPPORT' : current === 'SUPPORT' ? null : 'CONCURRENT';
                                        const newStatuses = { ...memberStatuses };
                                        if (next) newStatuses[member.id] = next;
                                        else delete newStatuses[member.id];
                                        setMemberStatuses(newStatuses);
                                    }}
                                    className="text-[9px] px-1.5 py-0.5 rounded font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                    title="상태 변경: 없음 → 겸직 → 파견 → 지원 → 없음"
                                >
                                    🏷️
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Original rendering for CEO, DIVISION, DEPARTMENT, TEAM
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const leader = node.managerId ? allEmployees.find(e => e.id === node.managerId) : null;

        // Status Checks
        const manualStatus = leader ? memberStatuses[leader.id] : null;
        const isConcurrent = manualStatus === 'CONCURRENT' || (leader && parentManagerId && leader.id === parentManagerId);
        const isDispatch = manualStatus === 'DISPATCH';
        const isSupport = manualStatus === 'SUPPORT';
        const isExternal = leader && leader.primaryCompany !== activeCompany;

        return (
            <div className="flex flex-col items-center relative">
                <div
                    className={`
              relative z-10 p-0 rounded-xl shadow-sm border transition-all duration-300 flex flex-col items-center justify-center min-w-[180px] text-center bg-white dark:bg-slate-800 overflow-hidden group
              ${node.type === 'CEO' ? 'border-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-700'}
              ${hasChildren ? 'hover:shadow-md' : ''}
              ${isLeaderMgmtMode ? 'ring-2 ring-dashed ring-slate-300 dark:ring-slate-600' : ''}
            `}
                >
                    <div
                        className={`w-full py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center cursor-pointer
                ${node.type === 'DIVISION' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' :
                                node.type === 'DEPARTMENT' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                                    node.type === 'TEAM' ? 'bg-white dark:bg-slate-800 text-slate-500 border-b border-slate-100 dark:border-slate-700' :
                                        'bg-slate-900 text-white'}
                `}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasChildren) toggleNode(node.id);
                        }}
                    >
                        <span>{node.type === 'DIVISION' ? '본부' : node.type === 'DEPARTMENT' ? '부서' : node.type === 'TEAM' ? '팀' : '대표이사'}</span>
                        {hasChildren && <span className="ml-2 text-xs opacity-70">{isExpanded ? '−' : '+'}</span>}
                    </div>

                    <div className="p-3 w-full flex flex-col items-center">
                        <span className="font-bold text-sm mb-2 text-slate-800 dark:text-white break-keep min-h-[20px] flex items-center justify-center">{node.name}</span>
                        {leader ? (
                            <div className={`flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 w-full text-left relative min-h-[72px] ${isExternal ? 'border-2 border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-500 flex-shrink-0 relative">
                                    {leader.avatarUrl ? <img src={leader.avatarUrl} alt={leader.name} className="w-full h-full object-cover" /> : <span className="text-xs">{leader.name[0]}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{leader.name}</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{leader.position}</span>
                                    </div>
                                    {leader.englishName && (
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 italic truncate">{leader.englishName}</div>
                                    )}
                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                        {leader.extensionNumber && <span className="text-[10px] text-slate-500 dark:text-slate-400">내선: {leader.extensionNumber}</span>}
                                        {leader.phone && <span className="text-[10px] text-slate-400 dark:text-slate-500">{leader.phone}</span>}
                                    </div>
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        {isConcurrent && <span className="text-[9px] px-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 font-bold">겸직</span>}
                                        {isDispatch && <span className="text-[9px] px-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold">파견</span>}
                                        {isSupport && <span className="text-[9px] px-1 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 font-bold">지원</span>}
                                        {isExternal && <span className="text-[9px] px-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-bold">{leader.primaryCompany} 소속</span>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full min-h-[72px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                                (공석)
                            </div>
                        )}
                        {isLeaderMgmtMode && (
                            <div className="mt-2 w-full flex flex-col gap-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setLeaderSearchTerm(''); setShowLeaderPicker(node.id); }}
                                    className="w-full py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm flex items-center justify-center gap-1"
                                >
                                    리더 변경
                                </button>
                                {leader && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const current = memberStatuses[leader.id];
                                                const next = current === 'CONCURRENT' ? 'DISPATCH' : current === 'DISPATCH' ? 'SUPPORT' : current === 'SUPPORT' ? null : 'CONCURRENT';
                                                const newStatuses = { ...memberStatuses };
                                                if (next) newStatuses[leader.id] = next;
                                                else delete newStatuses[leader.id];
                                                setMemberStatuses(newStatuses);
                                            }}
                                            className="flex-1 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600"
                                        >
                                            상태 변경
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <>
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
                        {/* Check if all children are MEMBER type - if so, display vertically */}
                        {node.children!.every(child => child.type === 'MEMBER') ? (
                            <div className="relative pl-8">
                                {/* Main vertical line */}
                                <div className="absolute left-0 top-0 w-px bg-slate-300 dark:bg-slate-600" style={{ height: '100%' }}></div>

                                <div className="flex flex-col gap-4">
                                    {node.children!.map((child, index) => (
                                        <div key={child.id} className="relative">
                                            {/* Horizontal connector line - positioned at card center */}
                                            <div className="absolute left-[-32px] top-[28px] w-8 h-px bg-slate-300 dark:bg-slate-600"></div>
                                            {renderTreeNode(child as any, node.managerId)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Original horizontal layout for non-member nodes */
                            <div className="flex gap-6 relative pt-4">
                                {node.children!.length > 1 && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] h-px bg-slate-300 dark:bg-slate-600"></div>}
                                {node.children!.map((child) => (
                                    <div key={child.id} className="relative flex flex-col items-center">
                                        <div className="absolute -top-4 w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                                        {renderTreeNode(child as any, node.managerId)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    const getLeaderRole = (empId: string) => {
        // Check assignments
        const assignedNodeKey = Object.keys(leaderAssignments).find(key => leaderAssignments[key] === empId);
        if (assignedNodeKey) {
            if (assignedNodeKey.startsWith('CEO:')) return { role: 'CEO', label: '대표이사', badgeColor: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50' };
            if (assignedNodeKey.startsWith('DIV:')) return { role: 'DIVISION', label: '본부장', badgeColor: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50' };
            if (assignedNodeKey.startsWith('DEPT:')) return { role: 'DEPARTMENT', label: '부서장', badgeColor: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' };
            if (assignedNodeKey.startsWith('TEAM:')) return { role: 'TEAM', label: '팀장', badgeColor: 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700' };
        }
        // Fallback to duty
        const emp = allEmployees.find(e => e.id === empId);
        if (emp?.duty === '대표이사' || emp?.duty === 'CEO') return { role: 'CEO', label: '대표이사', badgeColor: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50' };
        if (emp?.duty?.includes('본부장')) return { role: 'DIVISION', label: '본부장', badgeColor: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50' };
        if (emp?.duty?.includes('부서장') || emp?.duty?.includes('소장')) return { role: 'DEPARTMENT', label: '부서장', badgeColor: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' };
        if (emp?.duty?.includes('팀장') || emp?.duty?.includes('파트장')) return { role: 'TEAM', label: '팀장', badgeColor: 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700' };

        return null;
    };

    const EmployeeCard: React.FC<{ emp: Employee }> = ({ emp }) => {
        const leaderRole = getLeaderRole(emp.id);
        const displayRole = leaderRole ? leaderRole.label : emp.duty;
        const badgeColor = leaderRole ? leaderRole.badgeColor : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700';

        // Extract birthDate from ID for Biorhythm
        // Assuming ID format is not strictly RRID, but we try to extract if possible or use stored birthDate if we had it.
        // Since we don't have birthDate in Employee type explicitly (only joinedDate), we rely on ID if it looks like RRID.
        // Or we can use a hash of ID for demo if real date is missing, but user asked for "based on birth date".
        // In processExcelData, we tried to extract birthDate from RRID column.
        // We need to check if `emp` object has `birthDate` property? 
        // The Employee interface (lines 3-3) might not have it. I should check types.ts or just add it to the object in processExcelData.
        // Wait, processExcelData (Step 366) didn't add birthDate to the object pushed to newEmployees!
        // It calculated it but didn't use it?
        // 546:             newEmployees.push({
        // 547:                 id,
        // ...
        // It didn't include birthDate! I need to fix processExcelData first or assume I can get it.
        // I'll assume I'll fix processExcelData to include `birthDate`.

        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-visible group h-full flex flex-col relative">
                <div className={`h-1.5 w-full bg-gradient-to-r rounded-t-lg ${leaderRole ? 'from-indigo-500 to-purple-500' : 'from-slate-300 to-slate-400'}`}></div>

                {/* Biorhythm Badge */}


                <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm">
                                {emp.avatarUrl ? (
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-slate-400">{emp.name[0]}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{emp.name}</h3>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{emp.position}</span>
                                </div>
                                {emp.englishName && (
                                    <div className="text-xs text-slate-400 dark:text-slate-500 italic mb-1">{emp.englishName}</div>
                                )}
                                {/* Organization Hierarchy Display */}
                                <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                    {emp.division && emp.division !== '경영진' && (
                                        <>
                                            <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded font-medium">{emp.division}</span>
                                            <span className="text-slate-300 dark:text-slate-600">›</span>
                                        </>
                                    )}
                                    {emp.department && emp.department !== '경영진' && (
                                        <>
                                            <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-medium">{emp.department}</span>
                                            {emp.team && <span className="text-slate-300 dark:text-slate-600">›</span>}
                                        </>
                                    )}
                                    {emp.team && (
                                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium">{emp.team}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                        {(displayRole || emp.isHead) && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                                {displayRole || '조직장'}
                            </span>
                        )}

                        {/* Status badges */}
                        {memberStatuses[emp.id] === 'CONCURRENT' && <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800">겸직</span>}
                        {memberStatuses[emp.id] === 'DISPATCH' && <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">파견</span>}
                        {memberStatuses[emp.id] === 'SUPPORT' && <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">지원</span>}

                        {/* Admin status control */}
                        {isAdmin && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const current = memberStatuses[emp.id];
                                    const next = current === 'CONCURRENT' ? 'DISPATCH' : current === 'DISPATCH' ? 'SUPPORT' : current === 'SUPPORT' ? null : 'CONCURRENT';
                                    const newStatuses = { ...memberStatuses };
                                    if (next) newStatuses[emp.id] = next;
                                    else delete newStatuses[emp.id];
                                    setMemberStatuses(newStatuses);
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                title="상태 변경: 없음 → 겸직 → 파견 → 지원 → 없음"
                            >
                                🏷️ 상태
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/30 px-4 py-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5 -mx-4 -mb-4 mt-auto">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span className="font-mono">{emp.phone}</span>
                            {emp.extensionNumber && <span className="text-slate-400">|</span>}
                            {emp.extensionNumber && <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-sm">내선 {emp.extensionNumber}</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [zoomScale, setZoomScale] = useState(1.0);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.001;
            setZoomScale(prev => Math.min(Math.max(0.5, prev + delta), 2.0));
        }
    };

    const handleZoomIn = () => setZoomScale(prev => Math.min(2.0, prev + 0.1));
    const handleZoomOut = () => setZoomScale(prev => Math.max(0.5, prev - 0.1));
    const handleZoomReset = () => setZoomScale(1.0);

    return (
        <div className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col' : 'p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 h-full flex flex-col overflow-hidden'}`}>
            {renderLeaderPicker()}
            {renderDivMgmtModal()}

            <div className={`mx-auto flex flex-col ${isFullScreen ? 'w-full h-full p-6' : 'max-w-7xl w-full h-full'}`}>
                {/* Top Layout */}
                <div className="flex flex-col gap-6 mb-8 shrink-0">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div className="min-w-[200px]">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">조직도</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeCompany}</span> 조직 구성원
                            </p>
                        </div>

                        <div className="w-full lg:w-96 relative z-20">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="이름, 부서, 직위, 내선번호 검색"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm group-hover:shadow-md"
                                />
                                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 transition-colors group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex gap-2">
                                {COMPANY_LIST.map(company => (
                                    <button
                                        key={company}
                                        onClick={() => setActiveCompany(company)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${activeCompany === company ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                    >
                                        {company}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 justify-end w-full">
                            {/* Zoom Controls (Visible in Tree Mode) */}
                            {viewMode === 'TREE' && (
                                <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-bold shadow-inner flex-shrink-0 mr-2">
                                    <button onClick={handleZoomOut} className="px-2 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" title="축소">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                    </button>
                                    <span className="px-2 py-1.5 text-slate-600 dark:text-slate-400 min-w-[3rem] text-center">{Math.round(zoomScale * 100)}%</span>
                                    <button onClick={handleZoomIn} className="px-2 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" title="확대">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                    <button onClick={handleZoomReset} className="px-2 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-l border-slate-300 dark:border-slate-700 ml-1" title="초기화">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </button>
                                </div>
                            )}

                            {viewMode === 'TREE' && (
                                <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-bold shadow-inner flex-shrink-0 mr-2">
                                    <button onClick={handleExpandAll} className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1" title="모두 펼치기">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                                        <span>모두 펼치기</span>
                                    </button>
                                    <button onClick={handleCollapseAll} className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-l border-slate-300 dark:border-slate-700 flex items-center gap-1" title="모두 접기">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>
                                        <span>모두 접기</span>
                                    </button>
                                </div>
                            )}

                            <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-bold shadow-inner flex-shrink-0">
                                <button onClick={() => setViewMode('CARD')} className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${viewMode === 'CARD' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    카드
                                </button>
                                <button onClick={() => setViewMode('LIST')} className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    리스트
                                </button>
                                <button onClick={() => setViewMode('TREE')} className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${viewMode === 'TREE' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    구조도
                                </button>
                            </div>

                            {/* Full Screen Toggle Button */}
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className={`p-2 rounded-lg transition-colors ${isFullScreen ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                title={isFullScreen ? "전체화면 종료" : "전체화면"}
                            >
                                {isFullScreen ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                )}
                            </button>

                            {isAdmin && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => setIsDivMgmtMode(true)}
                                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        본부 설정
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (viewMode !== 'TREE') setViewMode('TREE');
                                            setIsLeaderMgmtMode(!isLeaderMgmtMode);
                                        }}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border whitespace-nowrap ${isLeaderMgmtMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'}`}
                                    >
                                        {isLeaderMgmtMode ? '관리 종료' : '조직장 관리'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (confirm(`샘플 조직도 데이터를 불러오시겠습니까?\n(${SAMPLE_ORG_DATA.length}명의 예시 데이터)\n\n기존 데이터는 덮어씌워집니다.`)) {
                                                setAllEmployees(SAMPLE_ORG_DATA);
                                                alert('샘플 데이터가 로드되었습니다!');
                                            }
                                        }}
                                        className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
                                        title="샘플 조직도 데이터 로드"
                                    >
                                        📊 샘플 데이터
                                    </button>

                                    <button
                                        onClick={() => setIsEditMemberModalOpen(true)}
                                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        ➕ 구성원 추가
                                    </button>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isUploading ? '업로드 중...' : '📂 엑셀 업로드'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`animate-fade-in-up flex-1 flex flex-col min-h-0 ${isFullScreen ? 'overflow-hidden' : ''}`}>
                    {viewMode === 'CARD' ? (
                        <div className="overflow-y-auto h-full pr-2">
                            {searchTerm ? (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            '<span className="font-bold text-indigo-600 dark:text-indigo-400">{searchTerm}</span>' 검색 결과: <span className="font-bold">{filteredEmployees.length}</span>명
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                        {filteredEmployees.map(emp => (
                                            <EmployeeCard key={emp.id} emp={emp} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                groupedEmployees && Object.entries(groupedEmployees).map(([divName, depts]) => (
                                    <div key={divName} className="mb-12 last:mb-0">
                                        <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-indigo-600 dark:border-indigo-400">
                                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                                                {divName}
                                            </h3>
                                        </div>
                                        <div className="space-y-8">
                                            {Object.entries(depts).map(([deptName, teams]) => (
                                                <div key={deptName} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="px-4 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                                            <h4 className="font-bold text-lg text-indigo-700 dark:text-indigo-300">{deptName}</h4>
                                                        </div>
                                                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                                                    </div>
                                                    <div className="space-y-8">
                                                        {Object.entries(teams).map(([teamName, emps]) => {
                                                            const isDirect = teamName === 'Department_Direct';
                                                            return (
                                                                <div key={teamName}>
                                                                    {!isDirect && (
                                                                        <div className="flex items-center gap-2 mb-4 pl-1 border-l-4 border-slate-300 dark:border-slate-600 pl-3">
                                                                            <h5 className="font-bold text-slate-700 dark:text-slate-200 text-base">{teamName}</h5>
                                                                            <span className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">{emps.length}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                                                        {emps.map(emp => (
                                                                            <EmployeeCard key={emp.id} emp={emp} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : viewMode === 'LIST' ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="overflow-y-auto flex-1">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-medium sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4">이름 / 직위</th>
                                            <th className="px-6 py-4">소속</th>
                                            <th className="px-6 py-4">연락처</th>
                                            <th className="px-6 py-4">영문성명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map(emp => (
                                                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-6 py-3 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                            {emp.avatarUrl ? <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{emp.name[0]}</span>}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                                                                {emp.name}
                                                                {emp.isHead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                                                            </div>
                                                            <div className="text-xs text-slate-500">{emp.position} {emp.duty && `(${emp.duty})`}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                                                        {emp.division ? `${emp.division} > ` : ''}{emp.department} {emp.team && ` > ${emp.team}`}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                                                        {emp.extensionNumber && <span className="block text-xs text-slate-400">내선: {emp.extensionNumber}</span>}
                                                        {emp.phone}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{emp.englishName || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                    {searchTerm ? '검색 결과가 없습니다.' : '등록된 사원 정보가 없습니다.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {searchTerm && (
                                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded border border-yellow-200 dark:border-yellow-800 text-sm text-center shrink-0">
                                    구조도 모드에서는 검색 결과가 하이라이트되지 않습니다.
                                </div>
                            )}
                            <div
                                className={`bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-auto flex items-start flex-1 h-full`}
                                onWheel={handleWheel}
                            >
                                <div className="min-w-fit m-auto transition-transform duration-200 origin-top-left" style={{ transform: `scale(${zoomScale})` }}>
                                    {treeData ? renderTreeNode(treeData) : <p className="text-slate-400">데이터를 불러오는 중...</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
