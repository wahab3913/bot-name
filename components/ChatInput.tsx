'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="flex items-end gap-2">
        <button
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={disabled}
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={cn(
              'w-full resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-[#101238] focus:border-transparent',
              'min-h-[40px] max-h-24 bg-white text-gray-800',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            rows={1}
            disabled={disabled}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            message.trim() && !disabled
              ? 'bg-[#101238] text-white hover:bg-[#1a1f4a]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
