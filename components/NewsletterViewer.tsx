import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import FlipbookModal from './FlipbookModal';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import { saveNewsletters, loadNewsletters, migrateFromLocalStorage, deleteNewsletter, updateNewsletter, Newsletter } from '../utils/indexedDBHelper';

// Set worker source
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

interface NewsletterViewerProps {
  user?: UserProfile;
}

const NewsletterViewer: React.FC<NewsletterViewerProps> = ({ user }) => {
  const isAdmin = user?.role === UserRole.ADMIN;

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false); // Upload Modal
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false); // View Modal
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Processing state for PDF conversion
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);

  // Edit States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Mock Pages Generator (Colors and Text to simulate content)
  const generateMockPages = (title: string) => {
    // Generates 6 pages of placeholder content
    return Array.from({ length: 6 }).map((_, i) =>
      `https://via.placeholder.com/600x800/${['4F46E5', '6366F1', '818CF8', 'A5B4FC', 'C7D2FE', 'E0E7FF'][i]}/FFFFFF?text=${encodeURIComponent(title)}+-+Page+${i + 1}`
    );
  };

  // Initial Data
  const initialNewsletters: Newsletter[] = [
    {
      id: 15,
      title: '2024년 사보(15기)',
      date: '2024-12-31',
      cover: '',
      pages: [],
      isNew: true,
      pdfPath: '/images/newsletters/2024년 사보(15기).pdf'
    },
    {
      id: 14,
      title: '2023년 사보(14기)',
      date: '2023-12-31',
      cover: '',
      pages: [],
      isNew: false,
      pdfPath: '/images/newsletters/2023년 사보(14기).pdf'
    },
    {
      id: 13,
      title: '2022년 사보(13기)',
      date: '2022-12-31',
      cover: '',
      pages: [],
      isNew: false,
      pdfPath: '/images/newsletters/2022년 사보(13기).pdf'
    },
  ];

  // PDF to Images Converter (Core Logic)
  const convertPdfDataToImages = async (arrayBuffer: ArrayBuffer): Promise<string[]> => {
    try {
      console.log("Starting PDF conversion...");
      const loadingTask = getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded. Pages: ${pdf.numPages}`);

      const numPages = pdf.numPages;
      const images: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        console.log(`Rendering page ${i}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale for quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          images.push(canvas.toDataURL('image/jpeg'));
        }
      }
      console.log("PDF conversion complete.");
      return images;
    } catch (error) {
      console.error('Error converting PDF:', error);
      throw error;
    }
  };

  // Process PDF Paths (Fetch and Convert)
  const processPdfPaths = async (items: Newsletter[]): Promise<Newsletter[]> => {
    let hasUpdates = false;
    const processed = await Promise.all(items.map(async (item) => {
      if (item.pdfPath && item.pages.length === 0) {
        try {
          console.log(`Processing PDF for ${item.title}...`);
          const response = await fetch(item.pdfPath);
          const arrayBuffer = await response.arrayBuffer();
          const pages = await convertPdfDataToImages(arrayBuffer);

          if (pages.length > 0) {
            hasUpdates = true;
            return {
              ...item,
              cover: pages[0],
              pages: pages
            };
          }
        } catch (error) {
          console.error(`Failed to process PDF for ${item.title}:`, error);
        }
      }
      return item;
    }));

    if (hasUpdates) {
      await saveNewsletters(processed);
    }
    return processed;
  };

  // Load Data
  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to migrate first
        await migrateFromLocalStorage();

        // Load from DB
        let loaded = await loadNewsletters();

        // Remove unwanted default newsletters (Cleanup)
        const deprecatedTitles = ['신년사', '송년의 밤', '가을 야유회', '창립기념일'];
        const filtered = loaded.filter(n => !deprecatedTitles.some(t => n.title.includes(t)));

        if (filtered.length !== loaded.length) {
          console.log("Removed deprecated newsletters");
          loaded = filtered;
          setNewsletters(loaded);
          try {
            await saveNewsletters(loaded);
          } catch (e) {
            console.error("Failed to save cleaned newsletters:", e);
          }
        }

        // Sync initial data: Ensure hardcoded newsletters exist
        const missingInitial = initialNewsletters.filter(init => !loaded.some(l => l.id === init.id));
        if (missingInitial.length > 0) {
          console.log("Found missing initial newsletters, adding them...", missingInitial);
          loaded = [...loaded, ...missingInitial];
          setNewsletters(loaded); // Update UI
          try {
            await saveNewsletters(loaded);
          } catch (e) {
            console.error("Failed to save synced newsletters:", e);
          }
        } else {
          setNewsletters(loaded);
        }

        // Sort by date descending (newest first)
        loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNewsletters([...loaded]); // Force update

        // Check if any need processing (background)
        if (loaded.some(n => n.pdfPath && n.pages.length === 0)) {
          setIsProcessing(true);
          try {
            const processed = await processPdfPaths(loaded);
            // Sort again just in case
            processed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNewsletters(processed);
          } catch (e) {
            console.error("Failed to process PDF paths:", e);
          } finally {
            setIsProcessing(false);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCover, setNewCover] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleDelete = async (id: number) => {
    if (confirm('정말 이 사보를 삭제하시겠습니까?')) {
      try {
        await deleteNewsletter(id); // Delete from DB
        setNewsletters(prev => prev.filter(n => n.id !== id)); // Update UI
      } catch (error) {
        console.error("Failed to delete newsletter:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const startEditing = (newsletter: Newsletter) => {
    setEditingId(newsletter.id);
    setEditTitle(newsletter.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleUpdate = async (id: number) => {
    if (!editTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    const target = newsletters.find(n => n.id === id);
    if (!target) return;

    const updatedNewsletter = { ...target, title: editTitle };

    try {
      await updateNewsletter(updatedNewsletter); // Update DB
      setNewsletters(prev => prev.map(n => n.id === id ? updatedNewsletter : n)); // Update UI
      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error("Failed to update newsletter:", error);
      alert("수정 중 오류가 발생했습니다.");
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

  const handleAddNewsletter = async () => {
    if (!newTitle || !newDate) {
      alert('제목과 발행일을 입력해주세요.');
      return;
    }

    setIsProcessing(true); // Start processing

    try {
      let pages: string[] = [];
      const pdfFile = pdfInputRef.current?.files?.[0];

      if (pdfFile) {
        // Convert PDF to images
        const arrayBuffer = await pdfFile.arrayBuffer();
        pages = await convertPdfDataToImages(arrayBuffer);

        if (pages.length === 0) {
          // Failed to convert or empty
          console.warn("PDF conversion returned 0 pages. Using mock pages.");
          pages = generateMockPages(newTitle);
        }
      } else {
        // Fallback to mock
        pages = generateMockPages(newTitle);
      }

      const newItem: Newsletter = {
        id: Date.now(),
        title: newTitle,
        date: newDate,
        cover: newCover || (pages.length > 0 ? pages[0] : 'https://via.placeholder.com/300x400/CCCCCC/000000?text=No+Image'),
        pages: pages,
        isNew: true
      };

      const updated = [newItem, ...newsletters];
      // Sort
      updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setNewsletters(updated);
      await saveNewsletters(updated);

      setIsModalOpen(false);
      // Reset
      setNewTitle('');
      setNewDate('');
      setNewCover(null);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      alert('새로운 사보가 등록되었습니다.');
    } catch (error) {
      console.error("Error adding newsletter:", error);
      alert("사보 등록 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false); // End processing
    }
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isProcessing && setIsModalOpen(false)}></div>
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
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">발행일</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">표지 이미지</label>
                <div
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={`w-full aspect-[3/4] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors overflow-hidden ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {newCover ? (
                    <img src={newCover} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs">이미지 선택</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleCoverChange} className="hidden" disabled={isProcessing} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PDF 파일 (변환 시뮬레이션)</label>
                <input type="file" accept=".pdf" ref={pdfInputRef} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400" disabled={isProcessing} />
                <p className="text-[10px] text-slate-400 mt-1">* 실제 PDF 업로드 시 서버에서 이미지로 변환되어 등록됩니다.</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700" disabled={isProcessing}>취소</button>
              <button
                onClick={handleAddNewsletter}
                className={`flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    처리중...
                  </>
                ) : '등록'}
              </button>
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

              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-3 left-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors duration-200"
                    title="삭제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEditing(item); }}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition-colors duration-200"
                    title="수정"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
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
                {editingId === item.id ? (
                  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-indigo-500 rounded focus:outline-none text-slate-900 bg-white"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleUpdate(item.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">저장</button>
                      <button onClick={cancelEditing} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300">취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate" title={item.title}>{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
                  </>
                )}
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
