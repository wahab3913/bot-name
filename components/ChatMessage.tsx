'use client';

import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatMessage({
  message,
  isUser,
  timestamp,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex mb-4 animate-slide-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'chat-bubble',
          isUser ? 'bg-[#101238] text-white ml-auto' : 'chat-bubble-bot'
        )}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        <p
          className={cn(
            'text-xs mt-1 opacity-70',
            isUser ? 'text-blue-200' : 'text-gray-500'
          )}
        >
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
}
