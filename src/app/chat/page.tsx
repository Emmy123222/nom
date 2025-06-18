// File: app/chat/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/layout/Navigation';
import { useChat } from 'ai/react';

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatError,
  } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content:
          "Hello! I'm your AI guide to network states and crypto cities. I can help you discover the perfect digital nomad destination based on your values, lifestyle, and goals. What kind of community are you looking for?",
      },
    ],
    onError: (err) => {
      console.error('Chat error:', err);
      setError('Failed to get AI response. Please check your API or network settings.');
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatError) {
      setError(chatError.message);
    }
  }, [chatError]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    handleSubmit(e);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold mb-4">
              AI <span className="text-gradient">City Matcher</span>
            </h1>
            <p className="text-gray-300">
              Discover your perfect network state with AI-powered recommendations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card h-[70vh] flex flex-col"
          >
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg mb-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`chat-bubble ${message.role === 'user' ? 'user' : 'ai'}`}
                >
                  <div className="flex items-start space-x-3">
                    {message.role === 'assistant' ? (
                      <Bot className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                    ) : (
                      <User className="h-6 w-6 text-cyan-400 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="chat-bubble ai"
                >
                  <div className="flex items-center space-x-3">
                    <Bot className="h-6 w-6 text-green-400" />
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing network states...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 p-6">
              <form onSubmit={onSubmit} className="flex space-x-4">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Describe your ideal crypto city or network state..."
                  className="flex-1 glass border-white/20 focus:border-cyan-400/50"
                  disabled={isLoading}
                />
                <Button type="submit" className="btn-cyber" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
