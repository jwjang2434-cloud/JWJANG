import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Message, Sender, LLMConfig } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { findRelevantDocuments } from '../services/ragService';
import { Chat } from '@google/genai';

interface ChatInterfaceProps {
  userCompany: string;
  userName: string;
  llmConfig: LLMConfig;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userCompany, userName, llmConfig }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Chat Session whenever LLM Config changes
  useEffect(() => {
    initializeChat();
  }, [llmConfig, userCompany, userName]);

  const initializeChat = () => {
    try {
      setInitError(null);
      
      if (!llmConfig.apiKey) {
        setChatSession(null);
        setMessages([
           {
            id: 'system-alert',
            text: `⚠️ **시스템 알림**\n\n현재 AI 모델의 API Key가 설정되지 않았습니다.\n우측 상단 **[설정]** 메뉴(톱니바퀴) > **[AI 모델 설정]**에서 API Key를 등록해주세요.\n(관리자 권한 필요)`,
            sender: Sender.SYSTEM,
            timestamp: new Date(),
          }
        ]);
        return;
      }

      const session = createChatSession(llmConfig.apiKey, llmConfig.modelName);
      setChatSession(session);
      
      setMessages([
        {
          id: 'init-1',
          text: `안녕하세요! ${userName}님. 👋\n\n${userCompany} HR 지원 챗봇입니다. \n근무 규정, 복리후생, 전자결재 방법 등 궁금한 점을 물어봐주세요.`,
          sender: Sender.BOT,
          timestamp: new Date(),
        }
      ]);
    } catch (e) {
      console.error("Failed to init chat", e);
      setInitError(e instanceof Error ? e.message : "채팅 초기화 실패");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const handleClearChat = () => {
    if (window.confirm("대화 내용을 모두 지우고 초기화하시겠습니까?")) {
      initializeChat();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!chatSession) {
        alert("AI 모델 설정이 완료되지 않아 메시지를 보낼 수 없습니다.\n관리자에게 문의하세요.");
        return;
    }

    const userText = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 1. Add User Message to UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: Sender.USER,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // 2. RAG: Find Relevant Documents
    let promptToSend = userText;
    let sourceTitles: string[] = [];

    try {
      const relevantDocs = await findRelevantDocuments(userText);
      
      if (relevantDocs.length > 0) {
        sourceTitles = relevantDocs.map(d => d.title);
        // Construct Context-Aware Prompt
        const context = relevantDocs.map(d => d.content).join('\n\n');
        promptToSend = `[지시사항]\n아래 제공된 [참고 문서] 내용을 바탕으로 사용자의 질문에 답변하세요.\n\n[참고 문서]\n${context}\n\n[사용자 질문]\n"${userText}"`;
      } else {
        // No documents found
        promptToSend = userText;
      }
    } catch (err) {
      console.error("RAG Search Error:", err);
    }

    // 3. Prepare Bot Message placeholder
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      text: '',
      sender: Sender.BOT,
      timestamp: new Date(),
      isStreaming: true,
      sources: sourceTitles, 
    };
    setMessages(prev => [...prev, botMsg]);

    try {
      // 4. Stream response from Gemini
      const stream = await sendMessageStream(chatSession, promptToSend);
      
      let accumulatedText = '';

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: accumulatedText } 
              : msg
          )
        );
      }

      // 5. Finish streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, text: "죄송합니다. 시스템 오류가 발생하여 답변을 가져올 수 없습니다. (API Key를 확인해주세요)", isStreaming: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
       {/* Floating Reset Button */}
       <div className="absolute top-4 right-4 z-10 lg:right-8">
          <button 
            onClick={handleClearChat}
            className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm text-xs font-bold"
            title="대화 내용 초기화"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span className="hidden sm:inline">새 대화 시작</span>
          </button>
       </div>

       {/* Chat Area */}
       <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pt-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Disclaimer Banner */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-stretch">
                <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-800 dark:text-blue-300 transition-colors">
                   <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <p>
                     이 챗봇은 <strong>{userCompany}</strong>의 사내 보안 문서(취업규칙, 복지규정 등)를 기반으로 학습되었습니다. 
                     개인적인 인사 정보는 <strong>인사총무팀(내선 317)</strong>으로 직접 문의 바랍니다.
                   </p>
                </div>
            </div>

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} userName={userName} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 transition-colors duration-300">
           <div className="max-w-4xl mx-auto relative">
              <div className="relative flex items-end gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                 <textarea 
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={chatSession ? "사내 규정에 대해 궁금한 점을 물어보세요..." : "API Key 설정이 필요합니다..."}
                    disabled={!chatSession}
                    className="w-full py-3 pl-4 pr-12 bg-transparent border-none outline-none resize-none max-h-32 min-h-[50px] text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={1}
                 />
                 
                 <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim() || !chatSession}
                    className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
                      inputValue.trim() && !isLoading && chatSession
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                 >
                    {isLoading ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                 </button>
              </div>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2 transition-colors">
                 InnoBot은 실수가 있을 수 있습니다. 중요 정보는 담당 부서에 확인하세요.
              </p>
           </div>
        </div>
    </div>
  );
};

export default ChatInterface;