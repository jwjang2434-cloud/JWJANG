
import React from 'react';
import { Message, Sender } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  userName?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, userName }) => {
  const isBot = message.sender === Sender.BOT;

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] lg:max-w-[65%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isBot ? (
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center ring-1 ring-indigo-200 dark:ring-indigo-800">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
               <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isBot ? 'InnoBot (HR Support)' : (userName || '사용자')}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div 
            className={`relative px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-colors duration-300
              ${isBot 
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none' 
                : 'bg-indigo-600 text-white rounded-tr-none dark:bg-indigo-500'
              }`}
          >
            {isBot ? (
               <div className="markdown-body text-slate-800 dark:text-slate-200">
                  <ReactMarkdown
                    components={{
                       ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2" {...props} />,
                       ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2" {...props} />,
                       li: ({node, ...props}) => <li className="my-1" {...props} />,
                       p: ({node, ...props}) => <p className="my-1 last:mb-0" {...props} />,
                       strong: ({node, ...props}) => <strong className="font-bold text-indigo-900 dark:text-indigo-300" {...props} />,
                       h3: ({node, ...props}) => <h3 className="font-bold text-base mt-3 mb-1 text-slate-900 dark:text-white" {...props} />,
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 align-middle bg-indigo-500 animate-pulse rounded-sm"/>
                  )}
               </div>
            ) : (
              <p>{message.text}</p>
            )}
          </div>

          {/* Source Citations (Only for Bot) - Dynamic Rendering */}
          {isBot && !message.isStreaming && message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.sources.map((source, index) => (
                <span key={index} className="px-2 py-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  참조: {source}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
