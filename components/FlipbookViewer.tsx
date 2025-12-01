import React, { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';

// Vite specific worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FlipbookViewerProps {
    file: File | string; // File object or URL
    onClose: () => void;
    width?: number;
    height?: number;
}

export const generateCoverImage = async (file: File | string): Promise<string> => {
    try {
        let arrayBuffer: ArrayBuffer;
        if (typeof file === 'string') {
            const response = await fetch(file);
            arrayBuffer = await response.arrayBuffer();
        } else {
            arrayBuffer = await file.arrayBuffer();
        }

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            return canvas.toDataURL('image/jpeg');
        }
        return '';
    } catch (error) {
        console.error('Error generating cover image:', error);
        return '';
    }
};

const Page = forwardRef<HTMLDivElement, { pageNumber: number, imageSrc: string }>((props, ref) => {
    return (
        <div className="page bg-white shadow-md h-full w-full" ref={ref}>
            <div className="page-content h-full w-full flex items-center justify-center overflow-hidden relative">
                <img
                    src={props.imageSrc}
                    alt={`Page ${props.pageNumber}`}
                    className="max-w-full max-h-full object-contain"
                    style={{ width: '100%', height: '100%' }}
                />
                <div className="absolute bottom-4 text-xs text-slate-400 font-medium">
                    - {props.pageNumber} -
                </div>
            </div>
        </div>
    );
});

Page.displayName = 'Page';

const FlipbookViewer: React.FC<FlipbookViewerProps> = ({ file, onClose, width = 400, height = 550 }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageImages, setPageImages] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [scale, setScale] = useState<number>(1.0);
    const bookRef = useRef<any>(null);

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 2.0));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleResetZoom = () => {
        setScale(1.0);
    };

    useEffect(() => {
        const loadPdf = async () => {
            try {
                setLoading(true);
                let loadingTask;

                if (typeof file === 'string') {
                    loadingTask = pdfjsLib.getDocument(file);
                } else {
                    const arrayBuffer = await file.arrayBuffer();
                    loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                }

                const pdf = await loadingTask.promise;
                setNumPages(pdf.numPages);

                const images: string[] = [];

                // Render all pages to images
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale for quality

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        await page.render({
                            canvasContext: context,
                            viewport: viewport
                        }).promise;

                        images.push(canvas.toDataURL('image/jpeg'));
                    }
                }

                setPageImages(images);
                setLoading(false);

            } catch (error) {
                console.error('Error loading PDF:', error);
                setLoading(false);
            }
        };

        loadPdf();
    }, [file]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-600 font-medium">브로슈어 변환 중...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-8 rounded-xl min-h-[600px] max-h-[95vh] overflow-auto relative">
            {/* Zoom Controls - Sticky at Top */}
            <div className="sticky top-0 z-10 mb-6 flex gap-2 items-center justify-center bg-slate-100 dark:bg-slate-900 py-3">
                <button
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    className="px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="축소"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                </button>
                <span className="text-slate-700 dark:text-slate-300 font-medium min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={handleResetZoom}
                    className="px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                    title="원래 크기"
                >
                    100%
                </button>
                <button
                    onClick={handleZoomIn}
                    disabled={scale >= 2.0}
                    className="px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="확대"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
                </button>
            </div>

            {/* Flipbook */}
            <div className="relative shadow-2xl" style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}>
                {/* @ts-ignore - react-pageflip types might be missing or strict */}
                <HTMLFlipBook
                    width={width}
                    height={height}
                    size="fixed"
                    minWidth={300}
                    maxWidth={1000}
                    minHeight={400}
                    maxHeight={1200}
                    maxShadowOpacity={0.5}
                    showCover={true}
                    mobileScrollSupport={true}
                    className="flip-book"
                    ref={bookRef}
                >
                    {pageImages.map((imgSrc, index) => (
                        <Page key={index} pageNumber={index + 1} imageSrc={imgSrc} />
                    ))}
                </HTMLFlipBook>
            </div>

            {/* Page Navigation - Bottom */}
            <div className="mt-8 flex gap-4">
                <button
                    onClick={() => bookRef.current?.pageFlip().flipPrev()}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    이전 페이지
                </button>
                <span className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                    페이지를 클릭하거나 드래그하여 넘길 수 있습니다
                </span>
                <button
                    onClick={() => bookRef.current?.pageFlip().flipNext()}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    다음 페이지
                </button>
            </div>

            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

export default FlipbookViewer;
