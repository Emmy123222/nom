'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function AIDemo() {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    // Redirect to chat page with the input as a query parameter
    window.location.href = `/chat?q=${encodeURIComponent(input)}`;
  };

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Try the <span className="text-gradient">AI Assistant</span>
          </h2>
          <p className="text-xl text-gray-300">
            Ask about your ideal living situation and get personalized recommendations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card"
        >
          <div className="h-96 overflow-y-auto mb-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="chat-bubble ai"
            >
              <div className="flex items-start space-x-3">
                <Bot className="h-6 w-6 text-green-400 mt-1" />
                <p className="flex-1">
                  Hello! I'm your AI guide to network states and crypto cities. I can help you discover the perfect digital nomad destination based on your values, lifestyle, and goals. What kind of community are you looking for?
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="chat-bubble user"
            >
              <div className="flex items-start space-x-3">
                <User className="h-6 w-6 text-cyan-400 mt-1" />
                <p className="flex-1">
                  I want to live somewhere with strong governance and blockchain integration
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="chat-bubble ai"
            >
              <div className="flex items-start space-x-3">
                <Bot className="h-6 w-6 text-green-400 mt-1" />
                <p className="flex-1">
                  Based on your preferences, I recommend Próspera in Honduras! It features charter city governance, blockchain-based land registry, and a growing crypto economy. Would you like me to help you explore more options or learn about the application process?
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex space-x-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your ideal crypto city..."
              className="flex-1 glass border-white/20 focus:border-cyan-400/50"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} className="btn-cyber">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/chat">
              <Button variant="outline" className="glass border-cyan-400/30">
                Start Full AI Chat
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}