'use client';

import { motion } from 'framer-motion';
import { Brain, Rocket, Map, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/layout/Navigation';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import AIDemo from '@/components/sections/AIDemo';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <AIDemo />
    </div>
  );
}