
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import FlipbookModal from './FlipbookModal';

interface NewsletterViewerProps {
    user?: UserProfile;
}

interface Newsletter {
  id: number;
  title: string;
  date: string;
  cover: string;
  pages: string[]; // Array of images for the flipbook
  isNew: boolean;
}

const NewsletterViewer: React.FC<NewsletterViewerProps> = ({ user }) => {
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Mock Pages Generator (Colors and Text to simulate content)
  const generateMockPages = (title: string) => {
      // Generates 6 pages of placeholder content
      return Array.from({ length: 6 }).map((_, i) => 
        `https://via.placeholder.com/600x800/${['4F46E5','6366F1','818CF8','A5B4FC','C7D2FE','E0E7FF'][i]}/FFFFFF?text=${encodeURIComponent(title)}+-+Page+${i+1}`
      );
  };

  // Initial Data
  const initialNewsletters: Newsletter[] = [
    { id: 1, title: '2025년 1월호 - 신년사', date: '2025.01.02', cover: 'https://via.placeholder.com/300x400/4F46E5/FFFFFF?text=2025+JAN', pages: generateMockPages('2025 JAN'), isNew: true },
    { id: 2, title: '2024년 12월호 - 송년의 밤', date: '2024.12.01', cover: 'https://via.placeholder.com/300x400/6366F1/FFFFFF?text=2024+DEC', pages: generateMockPages('2024 DEC'), isNew: false },
    { id: 3, title: '2024년 11월호 - 가을 야유회', date: '2024.11.01', cover: 'https://via.placeholder.com/300x400/818CF8/FFFFFF?text=2024+NOV', pages: generateMockPages('2024 NOV'), isNew: false },
    { id: 4, title: '2024년 10월호 - 창립기념일', date: '2024.10.01', cover: 'https://via.placeholder.com/300x400/A5B4FC/FFFFFF?text=2024+OCT', pages: generateMockPages('2024 OCT'), isNew: false },
  ];

  // State
  const [newsletters, setNewsletters] = useState<Newsletter[]>(() => {
      const saved = localStorage.getItem('newsletters');
      return saved ? JSON.parse(saved) : initialNewsletters;
  });

  // Persist
  useEffect(() => {
      localStorage.setItem('newsletters', JSON.stringify(newsletters));
  }, [newsletters]);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false); // Upload Modal
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false); // View Modal
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  
  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCover, setNewCover] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleDelete = (id: number) => {
      if (confirm('정말 이 사보를 삭제하시겠습니까?')) {
          setNewsletters(newsletters.filter(n => n.id !== id));
      }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewCover(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddNewsletter = () => {
      if (!newTitle || !newDate) {
          alert('제목과 발행일을 입력해주세요.');
          return;
      }

      const newItem: Newsletter = {
          id: Date.now(),
          title: newTitle,
          date: newDate,
          cover: newCover || 'https://via.placeholder.com/300x400/CCCCCC/000000?text=No+Image',
          pages: generateMockPages(newTitle), // In real app, this would be processed from uploaded PDF
          isNew: true
      };

      setNewsletters([newItem, ...newsletters]);
      setIsModalOpen(false);
      // Reset
      setNewTitle('');
      setNewDate('');
      setNewCover(null);
      alert('새로운 사보가 등록되었습니다.');
  };

  const handleView = (item: Newsletter) => {
      setSelectedNewsletter(item);
      setIsFlipbookOpen(true);
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300 relative">
      
      {/* Flipbook Viewer Modal */}
      {selectedNewsletter && (
          <FlipbookModal 
            isOpen={isFlipbookOpen}
            onClose={() => setIsFlipbookOpen(false)}
            title={selectedNewsletter.title}
            pages={selectedNewsletter.pages}
          />
      )}

      {/* Upload Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative z-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">새 사보 등록</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">제목</label>
                          <input 
                              type="text" 
                              value={newTitle} 
                              onChange={(e) => setNewTitle(e.target.value)} 
                              placeholder="예: 2025년 3월호 - 봄맞이"
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">발행일</label>
                          <input 
                              type="date" 
                              value={newDate} 
                              onChange={(e) => setNewDate(e.target.value)} 
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">표지 이미지</label>
                          <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full aspect-[3/4] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors overflow-hidden"
                          >
                              {newCover ? (
                                  <img src={newCover} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="text-center text-slate-400">
                                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                      <span className="text-xs">이미지 선택</span>
                                  </div>
                              )}
                              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleCoverChange} className="hidden" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PDF 파일 (변환 시뮬레이션)</label>
                          <input type="file" accept=".pdf" ref={pdfInputRef} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"/>
                          <p className="text-[10px] text-slate-400 mt-1">* 실제 PDF 업로드 시 서버에서 이미지로 변환되어 등록됩니다.</p>
                      </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                      <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700">취소</button>
                      <button onClick={handleAddNewsletter} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md">등록</button>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">사보 열람</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">한일후지코리아의 생생한 소식을 전해드립니다.</p>
          </div>
          
          {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-colors"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  사보 등록
              </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newsletters.map((item) => (
            <div key={item.id} className="group relative bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              {/* New Badge */}
              {item.isNew && (
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">NEW</span>
                </div>
              )}

              {/* Delete Button (Admin) */}
              {isAdmin && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="absolute top-3 left-3 z-20 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="삭제"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
              )}
              
              {/* Cover Image & Click Trigger */}
              <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 relative overflow-hidden cursor-pointer" onClick={() => handleView(item)}>
                <img src={item.cover} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                
                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <div className="px-4 py-2 bg-white text-slate-900 rounded-full font-bold text-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                     e-Book 열기
                   </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate" title={item.title}>{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
            <button className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">더 보기 +</button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterViewer;
