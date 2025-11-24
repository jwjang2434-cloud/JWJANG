
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface SuggestionsProps {
  user: UserProfile;
}

interface Post {
  id: number;
  title: string;
  content: string;
  writer: string;
  date: string;
  status: '대기중' | '처리중' | '답변완료';
  isSecret: boolean;
  adminReply?: string;
}

const Suggestions: React.FC<SuggestionsProps> = ({ user }) => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const isAdmin = user.role === UserRole.ADMIN;
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // [수정] LocalStorage 연동
  const [posts, setPosts] = useState<Post[]>(() => {
      const saved = localStorage.getItem('suggestionPosts');
      return saved ? JSON.parse(saved) : [
        { id: 15, title: '구내식당 메뉴 건의합니다', content: '최근 메뉴가 너무 중복되는 것 같습니다. 다양화 부탁드립니다.', writer: '익명', date: '2025-02-10', status: '답변완료', isSecret: true, adminReply: '영양사님과 협의하여 메뉴 개선하겠습니다.' },
        { id: 14, title: '3층 남자 화장실 비데 고장 신고', content: '3층 남자화장실 두 번째 칸 비데가 작동하지 않습니다.', writer: '박철수', date: '2025-02-09', status: '처리중', isSecret: false },
        { id: 13, title: '야근 택시비 청구 관련 문의', content: '카카오택시 자동결제 내역도 인정되나요?', writer: '익명', date: '2025-02-08', status: '대기중', isSecret: true },
        { id: 12, title: '사내 동호회 개설 요청', content: '축구 동호회 만들고 싶습니다.', writer: '김영희', date: '2025-02-05', status: '답변완료', isSecret: false, adminReply: '동호회 개설 최소 인원은 10명입니다.' },
      ];
  });
  
  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    localStorage.setItem('suggestionPosts', JSON.stringify(posts));
  }, [posts]);

  const handleSubmit = () => {
      if (!newTitle.trim() || !newContent.trim()) {
          alert("제목과 내용을 입력해주세요.");
          return;
      }

      const newPost: Post = {
          id: Date.now(),
          title: newTitle,
          content: newContent,
          writer: isAnonymous ? '익명' : user.name,
          date: new Date().toISOString().split('T')[0],
          status: '대기중',
          isSecret: isAnonymous, // 익명이면 기본 비밀글
          adminReply: undefined
      };

      setPosts([newPost, ...posts]);
      setNewTitle('');
      setNewContent('');
      alert("건의사항이 등록되었습니다.");
  };

  const toggleExpand = (id: number) => {
      if (expandedPostId === id) {
          setExpandedPostId(null);
          setReplyText('');
      } else {
          setExpandedPostId(id);
      }
  };

  const handleStatusChange = (id: number, status: Post['status']) => {
      setPosts(posts.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleSubmitReply = (id: number) => {
      if (!replyText.trim()) return;
      setPosts(posts.map(p => p.id === id ? { ...p, adminReply: replyText, status: '답변완료' } : p));
      setReplyText('');
      alert('답변이 등록되었습니다.');
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
         <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">건의사항 (소리함)</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">회사 발전을 위한 소중한 의견을 자유롭게 남겨주세요.</p>
         </div>

         {/* Write Form */}
         <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8 transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 transition-colors">의견 보내기</h3>
            <div className="space-y-4">
                <div>
                    <input 
                        type="text" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="제목을 입력하세요" 
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors" 
                    />
                </div>
                <div>
                    <textarea 
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="건의 내용을 상세히 적어주세요. (비방이나 욕설은 삭제될 수 있습니다)" 
                        rows={4} 
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                    ></textarea>
                </div>
                <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${isAnonymous ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} onClick={() => setIsAnonymous(!isAnonymous)}>
                            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 ${isAnonymous ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className={`text-sm font-medium ${isAnonymous ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>익명으로 작성</span>
                    </label>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                        등록하기
                    </button>
                </div>
            </div>
         </div>

         {/* Post List */}
         <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800 transition-colors">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">최근 접수된 건의사항</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                    {isAdmin ? '게시글을 클릭하여 답변을 등록하세요' : '본인 글과 공개글만 확인할 수 있습니다'}
                </span>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {posts.map(post => {
                    // 권한 체크: 관리자, 작성자 본인, 공개글인 경우 열람 가능
                    // (작성자 체크는 실제로는 ID 비교가 필요하나 여기선 이름 매칭으로 간단히 처리)
                    const canRead = isAdmin || !post.isSecret || post.writer === user.name;
                    return (
                        <li key={post.id} className="transition-colors">
                            <div 
                                onClick={() => canRead && toggleExpand(post.id)}
                                className={`px-6 py-4 transition-colors ${canRead ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800' : 'cursor-not-allowed opacity-75'} ${expandedPostId === post.id ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                            post.status === '답변완료' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/50' : 
                                            post.status === '처리중' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' :
                                            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                        }`}>
                                            {post.status}
                                        </span>
                                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                                            {post.isSecret && !canRead ? '🔒 비밀글입니다.' : post.title}
                                            {post.isSecret && canRead && <span className="ml-2 text-xs text-slate-400">🔒</span>}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{post.date}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">작성자: {post.writer}</span>
                                </div>
                            </div>

                            {/* Detail View */}
                            {expandedPostId === post.id && canRead && (
                                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">
                                        {post.content}
                                    </p>
                                    
                                    {/* Admin Reply Area */}
                                    {(post.adminReply || isAdmin) && (
                                        <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">관리자 답변</h4>
                                            {post.adminReply ? (
                                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{post.adminReply}</p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">아직 답변이 등록되지 않았습니다.</p>
                                            )}

                                            {isAdmin && (
                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="flex gap-2 mb-2">
                                                        <button onClick={() => handleStatusChange(post.id, '대기중')} className={`px-2 py-1 text-xs rounded border transition-colors ${post.status === '대기중' ? 'bg-slate-200 border-slate-400 font-bold' : 'border-slate-300 hover:bg-slate-100 text-slate-500'}`}>대기중</button>
                                                        <button onClick={() => handleStatusChange(post.id, '처리중')} className={`px-2 py-1 text-xs rounded border transition-colors ${post.status === '처리중' ? 'bg-blue-100 border-blue-400 text-blue-700 font-bold' : 'border-blue-300 hover:bg-blue-50 text-blue-600'}`}>처리중</button>
                                                        <button onClick={() => handleStatusChange(post.id, '답변완료')} className={`px-2 py-1 text-xs rounded border transition-colors ${post.status === '답변완료' ? 'bg-green-100 border-green-400 text-green-700 font-bold' : 'border-green-300 hover:bg-green-50 text-green-600'}`}>답변완료</button>
                                                    </div>
                                                    <textarea 
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="답변 내용을 입력하세요..."
                                                        className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded mb-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                                                    />
                                                    <button onClick={() => handleSubmitReply(post.id)} className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors">답변 등록</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
                {posts.length === 0 && (
                    <li className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                        등록된 건의사항이 없습니다.
                    </li>
                )}
            </ul>
         </div>
      </div>
    </div>
  );
};

export default Suggestions;
