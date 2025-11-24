
import React, { useState, useEffect, useRef } from 'react';

interface FlipbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pages: string[]; // Array of image URLs representing pages
}

const FlipbookModal: React.FC<FlipbookModalProps> = ({ isOpen, onClose, title, pages }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset on open
  useEffect(() => {
    if (isOpen) {
        setCurrentPage(0);
        setIsFullscreen(false);
    }
  }, [isOpen]);

  const totalPages = pages.length;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  // Sync fullscreen state with browser events (e.g., user pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'Escape') {
          // If simply exiting fullscreen, the browser handles it. 
          // We only close the modal if NOT in fullscreen.
          if (!document.fullscreenElement) {
              onClose();
          }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, onClose, totalPages]);

  // Render logic - Moved to bottom to satisfy Hooks rules (Fixes Error #300)
  if (!isOpen) return null;

  return (
    <div 
        ref={containerRef}
        className={`fixed inset-0 z-[70] flex items-center justify-center transition-all duration-300 ${isFullscreen ? 'bg-black p-0' : 'bg-black/80 backdrop-blur-sm p-4'} animate-fade-in`}
    >
      <div className={`relative flex flex-col transition-all duration-300 ${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[90vh]'}`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center text-white z-50 transition-all ${isFullscreen ? 'absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent' : 'mb-4 px-2'}`}>
          <div>
            <h3 className="text-xl font-bold drop-shadow-md">{title}</h3>
            <p className="text-sm text-white/80 drop-shadow-md">Page {currentPage + 1} / {totalPages}</p>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={toggleFullscreen} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title={isFullscreen ? "전체화면 종료" : "전체화면"}
             >
               {isFullscreen ? (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
               ) : (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
               )}
             </button>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="닫기">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
          </div>
        </div>

        {/* Book Container */}
        <div className="flex-1 flex items-center justify-center perspective-1000 relative overflow-hidden">
            
            {/* Prev Button */}
            <button 
                onClick={prevPage}
                disabled={currentPage === 0}
                className={`absolute left-0 md:left-4 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>

            {/* Next Button */}
            <button 
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
                className={`absolute right-0 md:right-4 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${currentPage >= totalPages - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>

            {/* The Book (Double Page Spread Simulation) */}
            <div className={`relative w-full ${isFullscreen ? 'h-full max-w-none' : 'max-w-4xl aspect-[3/2]'} bg-transparent flex justify-center items-center transition-all duration-300`}>
                
                {/* Mobile View (Single Page) */}
                <div className={`md:hidden ${isFullscreen ? 'h-full w-full' : 'w-full h-full'} bg-white rounded shadow-2xl overflow-hidden relative flex items-center justify-center`}>
                    <img src={pages[currentPage]} alt={`Page ${currentPage + 1}`} className="max-w-full max-h-full object-contain" />
                </div>

                {/* Desktop View (3D Effect) */}
                <div className={`hidden md:flex ${isFullscreen ? 'h-full w-auto aspect-[3/2]' : 'w-full h-full'} relative perspective-2000 transition-all duration-300`}>
                    {/* Left Page (Previous or Current if even) */}
                    <div className="w-1/2 h-full bg-white rounded-l-lg shadow-2xl overflow-hidden border-r border-slate-200 relative origin-right transition-transform duration-500">
                        {currentPage > 0 ? (
                             <img src={pages[currentPage % 2 === 0 ? currentPage - 1 : currentPage]} alt="Left Page" className="w-full h-full object-cover" />
                        ) : (
                             // Inside cover texture
                             <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                 (Inside Cover)
                             </div>
                        )}
                        {/* Shadow overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Right Page (Next or Current if odd) */}
                    <div className="w-1/2 h-full bg-white rounded-r-lg shadow-2xl overflow-hidden relative origin-left transition-transform duration-500">
                        {currentPage < totalPages ? (
                             <img 
                               src={pages[currentPage % 2 === 0 ? currentPage : currentPage + 1] || pages[totalPages-1]} 
                               alt="Right Page" 
                               className="w-full h-full object-cover" 
                             />
                        ) : (
                             <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                 (Back Cover)
                             </div>
                        )}
                        {/* Shadow overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
                    </div>
                    
                    {/* Spine */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-4 -ml-2 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 opacity-50 z-10 pointer-events-none"></div>
                </div>

            </div>
        </div>
        
        {!isFullscreen && (
            <div className="text-center text-white/50 text-xs mt-4">
                Tip: 키보드 방향키(←, →)를 사용하여 페이지를 넘길 수 있습니다.
            </div>
        )}
      </div>
    </div>
  );
};

export default FlipbookModal;