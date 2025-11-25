
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole, ReferenceDoc } from '../types';
import { REFERENCE_DOCS } from '../constants';
import PDFViewer from './PDFViewer';

interface CompanyRegulationsProps {
  user: UserProfile;
}

const CompanyRegulations: React.FC<CompanyRegulationsProps> = ({ user }) => {
  // [수정] LocalStorage 연동
  const [docs, setDocs] = useState<ReferenceDoc[]>(() => {
    const saved = localStorage.getItem('regulationDocs');
    return saved ? JSON.parse(saved) : REFERENCE_DOCS;
  });

  const [activeDoc, setActiveDoc] = useState<ReferenceDoc | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    localStorage.setItem('regulationDocs', JSON.stringify(docs));
  }, [docs]);

  const handleViewDocument = (doc: ReferenceDoc) => {
    setActiveDoc(doc);
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      const updatedDocs = docs.filter(doc => doc.id !== itemToDelete);
      setDocs(updatedDocs);
      localStorage.setItem('regulationDocs', JSON.stringify(updatedDocs));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: ReferenceDoc = {
        id: `doc-${Date.now()}`,
        title: file.name,
        type: 'PDF',
        lastUpdated: new Date().toISOString().split('T')[0],
        content: '새로 업로드된 규정입니다.',
        keywords: ['신규'],
        fileUrl: URL.createObjectURL(file)
      };
      setDocs([newDoc, ...docs]);
      setIsUploading(false);
      alert("규정 문서가 업로드되었습니다.");
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
      {activeDoc && (
        <PDFViewer
          title={activeDoc.title}
          fileUrl={activeDoc.fileUrl}
          onClose={() => setActiveDoc(null)}
          user={user}
          type={activeDoc.type === 'PDF' ? 'PDF' : 'IMAGE'}
          allowDownload={false}
        />
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">규정 삭제</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">정말로 이 규정을 삭제하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.</p>
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

      <div className="max-w-6xl mx-auto">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">사내 규정</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">한일후지코리아 사내 규정 및 정책 문서 저장소입니다.</p>
          </div>

          {isAdmin && (
            <div>
              <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    업로드 중...
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    규정 추가 (Admin)
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-medium">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">No</th>
                  <th className="px-6 py-4">문서명</th>
                  <th className="px-6 py-4 w-32">유형</th>
                  <th className="px-6 py-4 w-32">최종 수정일</th>
                  <th className="px-6 py-4 w-24 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {docs.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 text-center">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleViewDocument(doc)}>
                          {doc.title}
                        </span>
                        {index < 2 && <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded border border-red-200 dark:border-red-800">NEW</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${doc.type === 'PDF'
                          ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30'
                          : 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30'
                        }`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                      {doc.lastUpdated}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(doc.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="삭제"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

export default CompanyRegulations;
