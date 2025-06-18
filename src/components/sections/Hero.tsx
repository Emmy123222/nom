'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">Powered by GPT-4 & Solana</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Your AI Guide to{' '}
            <span className="text-gradient">Network States</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover, join, and thrive in crypto cities and decentralized communities. 
            Let AI match you with your perfect digital nomad destination.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
        >
          <Link href="/chat">
            <Button className="btn-cyber text-lg px-8 py-4">
              Start AI Chat
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" className="glass-card border-cyan-400/30 text-lg px-8 py-4">
              Explore Cities
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="glass-card text-center">
            <Globe className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">50+ Cities</h3>
            <p className="text-gray-400">From Próspera to Zuzalu, discover your perfect match</p>
          </div>
          <div className="glass-card text-center">
            <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real Communities</h3>
            <p className="text-gray-400">Connect with active network state residents</p>
          </div>
          <div className="glass-card text-center">
            <Sparkles className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Powered</h3>
            <p className="text-gray-400">Smart matching based on your values and goals</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}