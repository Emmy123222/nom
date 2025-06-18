'use client';

import { motion } from 'framer-motion';
import { Brain, Shield, Coins, Map, Trophy, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI City Matching',
    description: 'GPT-4 powered recommendations based on your values, lifestyle, and goals',
    color: 'text-cyan-400',
  },
  {
    icon: Shield,
    title: 'Nomad Passport NFTs',
    description: 'Mint your digital identity and collect badges from each city you join',
    color: 'text-purple-400',
  },
  {
    icon: Coins,
    title: 'Real Token Integration',
    description: 'Participate in governance, staking, and community economies',
    color: 'text-green-400',
  },
  {
    icon: Map,
    title: 'Live City Data',
    description: 'Real-time information from active network states and crypto cities',
    color: 'text-blue-400',
  },
  {
    icon: Trophy,
    title: 'Journey Tracking',
    description: 'Earn XP, unlock achievements, and build your nomad reputation',
    color: 'text-yellow-400',
  },
  {
    icon: Zap,
    title: 'Instant Applications',
    description: 'Apply to cities directly through the platform with wallet signatures',
    color: 'text-pink-400',
  },
];

export default function Features() {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for the <span className="text-gradient">Future of Living</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to navigate the emerging world of network states and crypto cities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="glass-card hover:neon-border transition-all duration-300 group"
            >
              <feature.icon className={`h-12 w-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}