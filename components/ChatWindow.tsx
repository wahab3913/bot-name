'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateBotResponse } from '@/lib/utils';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CLOSE_CHAT') {
        handleCloseChat();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Function to request iframe resize from parent
  const requestIframeResize = (isOpen: boolean) => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      // We're in an iframe, send message to parent
      window.parent.postMessage(
        {
          type: 'CHAT_TOGGLE',
          isOpen: isOpen,
          width: isOpen ? '400px' : '80px',
          height: isOpen ? '400px' : '80px',
        },
        '*'
      );
    }
  };

  const handleToggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    requestIframeResize(newIsOpen);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    requestIframeResize(false);
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  return (
    <div className="floating-chat">
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          className="bg-[#101238] hover:bg-[#1a1f4a] text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 animate-bounce-in"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chat-window w-80 h-96 flex flex-col animate-bounce-in">
          {/* Header */}
          <div className="bg-[#101238] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button
              onClick={handleCloseChat}
              className="hover:bg-[#1a1f4a] p-1 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 chat-scrollbar">
            <div className="space-y-2">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4 animate-slide-up">
                  <div className="chat-bubble chat-bubble-bot">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      )}
    </div>
  );
}
