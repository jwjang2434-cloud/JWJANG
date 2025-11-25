
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface PDFViewerProps {
   title: string;
   fileUrl?: string; // 실제 파일 URL (없으면 Mock Placeholder 사용)
   onClose: () => void;
   user: UserProfile;
   type?: 'PDF' | 'IMAGE';
   allowDownload?: boolean; // 다운로드 허용 여부
   customImage?: string; // 사용자 업로드 이미지
}

const PDFViewer: React.FC<PDFViewerProps> = ({ title, fileUrl, onClose, user, type = 'PDF', allowDownload = true, customImage }) => {
   const [watermarkText, setWatermarkText] = useState('');

   useEffect(() => {
      // 워터마크 텍스트 생성 (이름 + ID + 날짜)
      const date = new Date().toLocaleDateString();
      setWatermarkText(`${user.name} (${user.id}) - ${date} - 대외비`);
   }, [user]);

   // 워터마크 패턴 생성 (격자 배치)
   const renderWatermarks = () => {
      const marks = [];
      const rows = 5; // 세로 줄 수
      const cols = 3; // 가로 줄 수

      for (let r = 0; r < rows; r++) {
         for (let c = 0; c < cols; c++) {
            // 각 격자의 중심점을 계산하여 배치
            const top = (r / rows) * 100 + (100 / rows / 2);
            const left = (c / cols) * 100 + (100 / cols / 2);

            marks.push(
               <div
                  key={`${r}-${c}`}
                  className="absolute text-slate-400/15 dark:text-slate-500/15 text-lg font-extrabold pointer-events-none select-none whitespace-nowrap"
                  style={{
                     top: `${top}%`,
                     left: `${left}%`,
                     transform: 'translate(-50%, -50%) rotate(-45deg)', // 중앙 정렬 및 회전
                  }}
               >
                  {watermarkText}
               </div>
            );
         }
      }
      return marks;
   };

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
         {/* Backdrop */}
         <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

         {/* Modal Container */}
         <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in-up">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                     {type === 'PDF' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                     ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     )}
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-800 dark:text-white text-lg truncate max-w-md">{title}</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400">보안 문서 열람 중 • IP: 192.168.0.1</p>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  {allowDownload && customImage && (
                     <>
                        <button
                           onClick={() => {
                              const link = document.createElement('a');
                              link.href = customImage;
                              link.download = `menu-${new Date().toISOString().slice(0, 10)}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                           }}
                           className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                           다운로드
                        </button>
                        <button
                           onClick={() => {
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                 printWindow.document.write(`
                                    <html>
                                       <head>
                                          <title>식단표 인쇄</title>
                                          <style>
                                             body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                             img { max-width: 100%; height: auto; }
                                             @media print { body { -webkit-print-color-adjust: exact; } }
                                          </style>
                                       </head>
                                       <body>
                                          <img src="${customImage}" onload="window.print();window.close()" />
                                       </body>
                                    </html>
                                 `);
                                 printWindow.document.close();
                              }
                           }}
                           className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                           인쇄
                        </button>
                     </>
                  )}
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
            </div>

            {/* Content Viewer */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center p-8">
               {/* Watermark Layer */}
               <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none">
                  {renderWatermarks()}
               </div>

               {/* Document Mock Display */}
               <div className={`bg-white shadow-2xl ${fileUrl && type === 'PDF' ? 'w-full h-full p-0' : 'min-h-[800px] w-[600px] md:w-[700px] lg:w-[800px] p-12'} relative z-0 text-slate-800 overflow-y-auto max-h-full`}>
                  {fileUrl && type === 'PDF' ? (
                     <iframe src={`${fileUrl}#toolbar=0`} className="w-full h-full" title={title} />
                  ) : customImage ? (
                     <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-extrabold uppercase tracking-wide text-slate-900 mb-8">{title}</h1>
                        <img src={customImage} alt="Menu" className="w-full h-auto rounded shadow-md" />
                     </div>
                  ) : (
                     <>
                        {/* Mock Content Generation based on title */}
                        <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
                           <div>
                              <h1 className="text-3xl font-extrabold uppercase tracking-wide text-slate-900">{title.replace('.pdf', '')}</h1>
                              <p className="text-slate-500 mt-2">Document No. 2025-SEC-001</p>
                           </div>
                           <div className="text-right">
                              <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-xl rounded-lg">INNO</div>
                           </div>
                        </div>

                        <div className="space-y-6 font-serif leading-relaxed text-justify opacity-90">
                           <p>
                              <strong>제 1 조 (목적)</strong><br />
                              본 문서는 한일후지코리아(주)의 임직원이 준수해야 할 규정 및 가이드를 정의함을 목적으로 한다.
                           </p>
                           <p>
                              <strong>제 2 조 (적용 범위)</strong><br />
                              본 규정은 회사에 소속된 모든 임직원(정규직, 계약직, 파견직 포함)에게 적용된다.
                           </p>
                           <div className="h-40 bg-slate-100 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 my-8">
                              [ 차트 및 도표 영역 ]
                           </div>
                           <p>
                              <strong>제 3 조 (보안 준수)</strong><br />
                              모든 임직원은 회사의 영업 비밀 및 주요 자산을 보호할 의무가 있으며, 이를 위반할 경우 사규에 따라 징계 조치될 수 있다.
                              특히 사내망 접속 시 인가되지 않은 외부 기기의 연결을 금한다.
                           </p>
                           <p>
                              <strong>제 4 조 (정보 보호)</strong><br />
                              개인정보보호법 및 관련 법령에 의거하여, 업무 상 취득한 고객 및 임직원의 개인정보는 승인된 목적 이외의 용도로 사용하거나 외부에 유출하여서는 안 된다.
                              PC 화면 보호기 설정(10분) 및 부재 시 중요 문서 보관에 만전을 기해야 한다.
                           </p>
                           <p>
                              <strong>제 5 조 (근무 기강)</strong><br />
                              정해진 출퇴근 시간을 준수하며, 근무 시간 중 사적인 용무나 오락 행위 등 업무 몰입을 저해하는 행위를 금한다.
                              부득이한 사유로 조퇴, 외출, 지각 등이 발생할 경우 사전에 소속 부서장에게 보고 및 승인을 득해야 한다.
                           </p>
                           <p className="text-sm text-slate-400 mt-12 text-center border-t pt-4">
                              Confidential - Internal Use Only<br />
                              본 문서는 대외비이므로 무단 복제 및 배포를 금합니다.
                           </p>
                        </div>
                     </>
                  )}
               </div>
            </div>

         </div>
      </div>
   );
};

export default PDFViewer;
