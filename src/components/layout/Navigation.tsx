'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Wallet, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold text-gradient">
              Nomad City AI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Explore Cities
            </Link>
            <Link href="/chat" className="text-gray-300 hover:text-cyan-400 transition-colors">
              AI Chat
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/journey" className="text-gray-300 hover:text-cyan-400 transition-colors">
              My Journey
            </Link>
            <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-600 !rounded-lg" />
          </div>

          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 mt-2 pt-4 pb-4"
          >
            <div className="flex flex-col space-y-4">
              <Link href="/explore" className="text-gray-300 hover:text-cyan-400 transition-colors">
                Explore Cities
              </Link>
              <Link href="/chat" className="text-gray-300 hover:text-cyan-400 transition-colors">
                AI Chat
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/journey" className="text-gray-300 hover:text-cyan-400 transition-colors">
                My Journey
              </Link>
              <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-600 !rounded-lg !w-full" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}