
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface FormsLibraryProps {
  user: UserProfile;
}

const FormsLibrary: React.FC<FormsLibraryProps> = ({ user }) => {
  const initialForms: any[] = [];

  const [forms, setForms] = useState(() => {
    const saved = localStorage.getItem('formsData');
    return saved ? JSON.parse(saved) : initialForms;
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectedForm, setSelectedForm] = useState<any>(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    description: '',
    files: [] as File[]
  });

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    localStorage.setItem('formsData', JSON.stringify(forms));
  }, [forms]);

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete !== null) {
      const updatedForms = forms.filter((f: any) => f.id !== itemToDelete);
      setForms(updatedForms);
      localStorage.setItem('formsData', JSON.stringify(updatedForms));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDownload = (form: any) => {
    alert(`'${form.title}' 파일을 다운로드합니다.`);
  };

  const handleTitleClick = (form: any) => {
    setSelectedForm(form);
    setIsDetailModalOpen(true);
  };

  const handleUpload = () => {
    if (!uploadForm.category.trim()) {
      alert('카테고리를 선택해주세요.');
      return;
    }
    if (uploadForm.files.length === 0) {
      alert('파일을 선택해주세요.');
      return;
    }

    let currentMaxId = forms.length > 0 ? Math.max(...forms.map((f: any) => f.id)) : 0;

    const newForms = uploadForm.files.map((file) => {
      currentMaxId += 1;
      return {
        id: currentMaxId,
        title: file.name,
        category: uploadForm.category,
        description: uploadForm.description,
        date: new Date().toISOString().split('T')[0],
        downloads: 0
      };
    });

    setForms([...forms, ...newForms]);
    setIsUploadModalOpen(false);
    setUploadForm({ title: '', category: '', description: '', files: [] });
    alert(`${newForms.length}개의 서식이 업로드되었습니다.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadForm({ ...uploadForm, files: Array.from(e.target.files) });
    }
  };

  // 파일 확장자 추출 함수
  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ext;
  };

  // 파일 타입 배지 렌더링 함수
  const renderFileBadge = (filename: string) => {
    const ext = getFileExtension(filename);

    if (ext === 'pdf') {
      return <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-200 dark:border-red-800/50">PDF</span>;
    } else if (ext === 'xlsx' || ext === 'xls') {
      return <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-200 dark:border-green-800/50">XLS</span>;
    } else if (ext === 'docx' || ext === 'doc') {
      return <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800/50">DOC</span>;
    } else if (ext === 'hwp') {
      return <span className="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-bold border border-sky-200 dark:border-sky-800/50">HWP</span>;
    }
    return null;
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative z-10 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">서식 업로드</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">카테고리</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">카테고리 선택</option>
                  <option value="인사">인사</option>
                  <option value="재무/회계">재무/회계</option>
                  <option value="총무">총무</option>
                  <option value="보안">보안</option>
                  <option value="외부교육 보고서">외부교육 보고서</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">설명</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                  placeholder="서식에 대한 설명을 입력하세요..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">파일 선택</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.xlsx,.xls,.docx,.doc,.hwp"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                {uploadForm.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-500 font-medium">선택된 파일 ({uploadForm.files.length}개):</p>
                    <ul className="text-xs text-slate-500 max-h-20 overflow-y-auto pl-1">
                      {uploadForm.files.map((file, idx) => (
                        <li key={idx} className="truncate">- {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
              >
                업로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 relative z-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">서식 삭제</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">정말로 이 서식을 삭제하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative z-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {renderFileBadge(selectedForm.title)}
                <span className="text-sm text-slate-500 dark:text-slate-400">{selectedForm.category}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 break-all">{selectedForm.title}</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">서식 설명</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap">
                  {selectedForm.description || "등록된 설명이 없습니다."}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>등록일: {selectedForm.date}</span>
                <span>다운로드 수: {selectedForm.downloads}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => handleDownload(selectedForm)}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">서식 자료실</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">업무에 필요한 표준 서식을 다운로드하세요.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-auto">
              <input type="text" placeholder="서식 검색..." className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48 lg:w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors" />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
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
                {forms.map((form: any, index: number) => (
                  <tr key={form.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                    <td className="px-6 py-4 text-center text-slate-400 dark:text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {renderFileBadge(form.title)}
                        <span
                          onClick={() => handleTitleClick(form)}
                          className="text-slate-700 dark:text-slate-200 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer hover:underline"
                        >
                          {form.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">{form.category}</span></td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">{form.date}</td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell text-slate-500 dark:text-slate-400">{form.downloads}</td>
                    <td className="px-6 py-4 text-center">
                      {isAdmin ? (
                        <button onClick={() => confirmDelete(form.id)} className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors" title="삭제">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      ) : (
                        <button onClick={() => handleDownload(form)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded transition-colors" title="다운로드">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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
