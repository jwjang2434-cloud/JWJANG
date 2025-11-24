
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface FormsLibraryProps {
  user: UserProfile;
}

const FormsLibrary: React.FC<FormsLibraryProps> = ({ user }) => {
  const initialForms = [
    { id: 1, title: '지출결의서 양식 (2025).xlsx', category: '재무/회계', date: '2025-01-05', downloads: 124 },
    { id: 2, title: '휴가신청서_표준.docx', category: '인사', date: '2024-12-20', downloads: 856 },
    { id: 3, title: '법인카드 사용내역서.hwp', category: '재무/회계', date: '2024-11-15', downloads: 432 },
    { id: 4, title: '신규 입사자 보안 서약서.pdf', category: '보안', date: '2024-10-01', downloads: 120 },
    { id: 5, title: '명함 신청서.xlsx', category: '총무', date: '2024-09-22', downloads: 89 },
    { id: 6, title: '사직원 양식.docx', category: '인사', date: '2024-08-14', downloads: 45 },
  ];

  // [수정] LocalStorage 연동
  const [forms, setForms] = useState(() => {
    const saved = localStorage.getItem('formsData');
    return saved ? JSON.parse(saved) : initialForms;
  });

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    localStorage.setItem('formsData', JSON.stringify(forms));
  }, [forms]);

  const handleDelete = (id: number) => {
    if (confirm('해당 서식을 삭제하시겠습니까?')) {
      setForms(forms.filter((f: any) => f.id !== id));
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">서식 자료실</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">업무에 필요한 표준 서식을 다운로드하세요.</p>
          </div>
          <div className="flex flex-wrap gap-2">
             <div className="relative w-full sm:w-auto">
               <input type="text" placeholder="서식 검색..." className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48 lg:w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors" />
               <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </div>
             {isAdmin && (
                <button className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    업로드
                </button>
             )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700 transition-colors">
                      <tr>
                          <th className="px-6 py-4 w-16 text-center">No</th>
                          <th className="px-6 py-4">제목</th>
                          <th className="px-6 py-4 w-32 hidden sm:table-cell">카테고리</th>
                          <th className="px-6 py-4 w-32 hidden md:table-cell">등록일</th>
                          <th className="px-6 py-4 w-24 text-center hidden sm:table-cell">다운로드</th>
                          <th className="px-6 py-4 w-24 text-center">관리</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {forms.map((form: any) => (
                          <tr key={form.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                              <td className="px-6 py-4 text-center text-slate-400 dark:text-slate-500">{form.id}</td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      {form.title.endsWith('.pdf') && <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-200 dark:border-red-800/50">PDF</span>}
                                      {form.title.endsWith('.xlsx') && <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-200 dark:border-green-800/50">XLS</span>}
                                      {form.title.endsWith('.docx') && <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800/50">DOC</span>}
                                      {form.title.endsWith('.hwp') && <span className="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-bold border border-sky-200 dark:border-sky-800/50">HWP</span>}
                                      <span className="text-slate-700 dark:text-slate-200 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer">{form.title}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">{form.category}</span></td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">{form.date}</td>
                              <td className="px-6 py-4 text-center hidden sm:table-cell text-slate-500 dark:text-slate-400">{form.downloads}</td>
                              <td className="px-6 py-4 text-center">
                                  {isAdmin ? (
                                      <button onClick={() => handleDelete(form.id)} className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors" title="삭제">
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                  ) : (
                                      <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded transition-colors" title="다운로드">
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                      </button>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FormsLibrary;
