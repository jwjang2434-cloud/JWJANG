
import React from 'react';

const CompanyBrochure: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">회사 브로슈어</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">한일후지코리아의 기업 소개서 및 제품 카탈로그를 다운로드하세요.</p>
        </div>

        <div className="space-y-8">
            {/* Corporate Profile Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-center transition-colors">
                <div className="w-full md:w-1/3 aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl shadow-inner flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-60"></div>
                    <div className="text-center z-10 p-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                             <span className="text-white font-bold text-2xl">H</span>
                        </div>
                        <h3 className="text-white font-bold text-xl">Corporate<br/>Profile 2025</h3>
                    </div>
                </div>
                
                <div className="w-full md:w-2/3">
                    <div className="mb-6">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full mb-3 inline-block">LATEST</span>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">2025년도 회사 소개서</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            한일후지코리아의 비전, 미션, 연혁 및 주요 사업 영역을 소개하는 공식 브로슈어입니다. 
                            국문 및 영문 버전이 통합되어 있으며, 외부 파트너사 전달용으로 사용하실 수 있습니다.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            PDF 다운로드 (15MB)
                        </button>
                        <button className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            미리보기
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Catalog Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-center transition-colors">
                <div className="w-full md:w-1/3 aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl shadow-inner flex items-center justify-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent opacity-60"></div>
                     <div className="text-center z-10 p-4">
                        <svg className="w-12 h-12 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <h3 className="text-white font-bold text-xl">Product<br/>Catalog</h3>
                    </div>
                </div>
                
                <div className="w-full md:w-2/3">
                    <div className="mb-6">
                         <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full mb-3 inline-block">Updated: 2024.12</span>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">제품 종합 카탈로그</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            당사에서 취급하는 전 제품군의 사양과 상세 정보가 수록된 카탈로그입니다.
                            영업 및 마케팅 활동 시 활용하시기 바랍니다.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <button className="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-lg shadow-md hover:bg-slate-900 dark:hover:bg-slate-600 transition-all flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            PDF 다운로드 (28MB)
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyBrochure;
