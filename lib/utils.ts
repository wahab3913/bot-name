import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function generateBotResponse(userMessage: string): string {
  const responses = [
    "That's an interesting question! Let me help you with that.",
    "I understand what you're asking. Here's what I can tell you...",
    'Great question! Based on my knowledge, I can provide some insights.',
    "I'd be happy to help you with that. Let me break it down for you.",
    "That's a good point. Here's my perspective on this matter.",
    'I appreciate you asking that. Let me share some information with you.',
    "That's something I can definitely help you with!",
    'Interesting! Let me provide you with some helpful information.',
    "I'm here to help! Let me address your question.",
    "That's a great question. Here's what I know about this topic.",
  ];

  // Simple response selection based on message length
  const index = userMessage.length % responses.length;
  return responses[index];
}
