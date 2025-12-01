import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import PDFViewer from './PDFViewer';
import { generateCoverImage } from './FlipbookViewer';
import { saveBrochures, loadBrochures, deleteBrochure, Brochure } from '../utils/indexedDBHelper';

interface CompanyBrochureProps {
    user?: UserProfile | null;
}

const CompanyBrochure: React.FC<CompanyBrochureProps> = ({ user }) => {
    const isAdmin = user?.role === UserRole.ADMIN;

    // Data State
    const [brochures, setBrochures] = useState<Brochure[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // UI State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedBrochure, setSelectedBrochure] = useState<Brochure | null>(null);
    const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

    // Upload Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Data
    const initialBrochures: Brochure[] = [
        {
            id: 1,
            title: '한일후지코리아 회사소개서 (국문)',
            description: '한일후지코리아의 회사소개서입니다.\n회사의 비전, 연혁, 주요 사업 영역 등을 확인하실 수 있습니다.',
            date: '2024-01-15',
            cover: '', // Will be generated
            pdfPath: '/brochures/HANIL-FUJI_Company Intro. (국문).pdf',
            isNew: false
        },
        {
            id: 2,
            title: 'HFK 제품 브로슈어',
            description: '주요 제품 라인업과 상세 사양을 담은 브로슈어입니다.',
            date: '2023-11-20',
            cover: '', // Will be generated
            pdfPath: '/brochures/HFK BROCHURE.pdf',
            isNew: false
        },
        {
            id: 3,
            title: 'K Group 프로필',
            description: 'K Group의 전체적인 소개 자료입니다.',
            date: '2023-10-01',
            cover: '', // Will be generated
            pdfPath: '/brochures/K GROUP PROFILE_v3.3.2.pdf',
            isNew: false
        }
    ];

    // Load Brochures
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        let loaded = await loadBrochures();

        // Initialize if empty
        if (loaded.length === 0) {
            console.log('Initializing brochures from local files...');
            const processedBrochures = [];

            for (const item of initialBrochures) {
                if (item.pdfPath) {
                    try {
                        // Generate cover from local PDF
                        const cover = await generateCoverImage(item.pdfPath);
                        processedBrochures.push({ ...item, cover });
                    } catch (e) {
                        console.error(`Failed to process ${item.title}:`, e);
                        processedBrochures.push(item);
                    }
                } else {
                    processedBrochures.push(item);
                }
            }

            loaded = processedBrochures;
            await saveBrochures(loaded);
        }

        // Sort by date descending
        loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBrochures(loaded);
        setIsLoading(false);
    };

    // Handlers
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
        } else {
            alert('PDF 파일만 업로드 가능합니다.');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!newTitle || !newDescription || !selectedFile) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        setIsProcessing(true);
        try {
            // Generate cover image
            const cover = await generateCoverImage(selectedFile);

            // Convert PDF to Base64
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = async () => {
                const pdfBase64 = reader.result as string;

                const newBrochure: Brochure = {
                    id: Date.now(),
                    title: newTitle,
                    description: newDescription,
                    date: new Date().toISOString().split('T')[0],
                    cover: cover,
                    fileData: pdfBase64,
                    isNew: true
                };

                const updated = [newBrochure, ...brochures];
                setBrochures(updated);
                await saveBrochures(updated);

                // Reset form
                setNewTitle('');
                setNewDescription('');
                setSelectedFile(null);
                setIsUploadModalOpen(false);
                alert('브로슈어가 등록되었습니다.');
            };
        } catch (error) {
            console.error("Upload failed:", error);
            alert("업로드 중 오류가 발생했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('정말 이 브로슈어를 삭제하시겠습니까?')) {
            try {
                await deleteBrochure(id);
                setBrochures(prev => prev.filter(b => b.id !== id));
            } catch (error) {
                console.error("Delete failed:", error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    // Helper to get file object for PDFViewer
    const getFileForViewer = (brochure: Brochure): string => {
        if (brochure.pdfPath) return brochure.pdfPath;
        if (brochure.fileData) return brochure.fileData;
        return '';
    };

    const handleView = (brochure: Brochure) => {
        // Convert Base64/Path to Blob URL for better iframe compatibility
        const fileSource = getFileForViewer(brochure);

        if (fileSource.startsWith('data:')) {
            // Convert Base64 to Blob
            fetch(fileSource)
                .then(res => res.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    setSelectedBrochure({ ...brochure, pdfPath: blobUrl }); // Temporarily use pdfPath for Blob URL
                    setIsPdfViewerOpen(true);
                });
        } else {
            setSelectedBrochure(brochure);
            setIsPdfViewerOpen(true);
        }
    };

    const handleDownload = (brochure: Brochure) => {
        const fileSource = getFileForViewer(brochure);
        const link = document.createElement('a');
        link.download = `${brochure.title}.pdf`;

        if (fileSource.startsWith('data:')) {
            fetch(fileSource)
                .then(res => res.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    link.href = blobUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                });
        } else {
            link.href = fileSource;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
            {/* PDF Viewer Modal */}
            {isPdfViewerOpen && selectedBrochure && user && (
                <PDFViewer
                    title={selectedBrochure.title}
                    fileUrl={selectedBrochure.pdfPath || getFileForViewer(selectedBrochure)} // Use Blob URL if available
                    onClose={() => {
                        setIsPdfViewerOpen(false);
                        // Revoke Blob URL if it was created
                        if (selectedBrochure.pdfPath?.startsWith('blob:')) {
                            URL.revokeObjectURL(selectedBrochure.pdfPath);
                        }
                        setSelectedBrochure(null);
                    }}
                    user={user}
                    type="PDF"
                    showWatermark={false}
                    showToolbar={true}
                />
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isProcessing && setIsUploadModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative z-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">새 브로슈어 등록</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">제목</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="예: 2025년 회사소개서"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    disabled={isProcessing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">설명</label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="브로슈어에 대한 간단한 설명을 입력하세요."
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                    disabled={isProcessing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PDF 파일</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700" disabled={isProcessing}>취소</button>
                            <button
                                onClick={handleUpload}
                                className={`flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? '처리중...' : '등록'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">회사 브로슈어</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">한일후지코리아의 기업 소개서 및 제품 카탈로그를 다운로드하세요.</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            브로슈어 등록
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : brochures.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-slate-500 dark:text-slate-400">등록된 브로슈어가 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {brochures.map((brochure) => (
                            <div key={brochure.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-center transition-colors relative group">
                                {isAdmin && (
                                    <button
                                        onClick={() => handleDelete(brochure.id)}
                                        className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                                        title="삭제"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}

                                <div className="w-full md:w-1/3 aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl shadow-inner flex items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => handleView(brochure)}>
                                    {brochure.cover ? (
                                        <img src={brochure.cover} alt={brochure.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="text-center text-slate-400">No Cover</div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="px-4 py-2 bg-white text-slate-900 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            미리보기
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-2/3">
                                    <div className="mb-6">
                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full mb-3 inline-block">
                                            {brochure.date}
                                        </span>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{brochure.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {brochure.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => handleView(brochure)}
                                            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            PDF 보기
                                        </button>
                                        <button
                                            onClick={() => handleDownload(brochure)}
                                            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            다운로드
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyBrochure;
