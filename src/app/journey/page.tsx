'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Calendar, Trophy, Users, TrendingUp, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/layout/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';

interface JourneyEvent {
  id: string;
  type: 'city_joined' | 'badge_earned' | 'governance_activity' | 'level_up';
  title: string;
  description: string;
  date: string;
  city?: string;
  badge?: {
    name: string;
    icon: string;
    rarity: string;
  };
  xp_gained?: number;
}

export default function JourneyPage() {
  const { connected, publicKey } = useWallet();
  const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    citiesJoined: 0,
    badgesEarned: 0,
    reputationScore: 0,
  });

  useEffect(() => {
    if (connected && publicKey) {
      fetchJourneyData();
    }
  }, [connected, publicKey]);

  const fetchJourneyData = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const walletAddress = publicKey.toString();

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!profile) return;

      // Fetch user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (userStats) {
        setStats({
          totalXP: userStats.total_xp,
          level: userStats.level,
          citiesJoined: userStats.cities_joined,
          badgesEarned: userStats.badges_earned,
          reputationScore: userStats.reputation_score,
        });
      }

      // Fetch journey events from multiple sources
      const events: JourneyEvent[] = [];

      // City memberships
      const { data: memberships } = await supabase
        .from('city_memberships')
        .select('*')
        .eq('user_id', profile.id)
        .order('joined_at', { ascending: false });

      if (memberships) {
        memberships.forEach(membership => {
          events.push({
            id: `membership-${membership.id}`,
            type: 'city_joined',
            title: `Joined ${membership.city_name}`,
            description: `Became a ${membership.role} in ${membership.city_name}`,
            date: membership.joined_at,
            city: membership.city_name,
          });
        });
      }

      // Badges earned
      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false });

      if (badges) {
        badges.forEach(badge => {
          events.push({
            id: `badge-${badge.id}`,
            type: 'badge_earned',
            title: `Earned ${badge.badge_name} Badge`,
            description: badge.badge_description,
            date: badge.earned_at,
            badge: {
              name: badge.badge_name,
              icon: badge.badge_icon,
              rarity: badge.rarity,
            },
          });
        });
      }

      // Governance activities
      const { data: activities } = await supabase
        .from('governance_activities')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activities) {
        activities.forEach(activity => {
          events.push({
            id: `activity-${activity.id}`,
            type: 'governance_activity',
            title: `${activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)} Activity`,
            description: `Participated in ${activity.activity_type} in ${activity.city_id}`,
            date: activity.created_at,
            city: activity.city_id,
            xp_gained: activity.points_earned,
          });
        });
      }

      // Sort all events by date
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setJourneyEvents(events);

    } catch (error) {
      console.error('Error fetching journey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'city_joined': return Map;
      case 'badge_earned': return Trophy;
      case 'governance_activity': return Users;
      case 'level_up': return TrendingUp;
      default: return Star;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'city_joined': return 'text-cyan-400';
      case 'badge_earned': return 'text-yellow-400';
      case 'governance_activity': return 'text-purple-400';
      case 'level_up': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
            >
              <Map className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-6">
                Connect your Solana wallet to view your nomad journey timeline.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold mb-4">Loading Journey</h2>
              <p className="text-gray-300">
                Fetching your nomad timeline...
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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
              Your <span className="text-gradient">Nomad Journey</span>
            </h1>
            <p className="text-gray-300">
              Track your progress across network states and crypto cities
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <Card className="glass-card text-center">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{stats.totalXP}</p>
              <p className="text-xs text-gray-400">Total XP</p>
            </Card>
            <Card className="glass-card text-center">
              <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-400">{stats.level}</p>
              <p className="text-xs text-gray-400">Level</p>
            </Card>
            <Card className="glass-card text-center">
              <Map className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-cyan-400">{stats.citiesJoined}</p>
              <p className="text-xs text-gray-400">Cities</p>
            </Card>
            <Card className="glass-card text-center">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-400">{stats.badgesEarned}</p>
              <p className="text-xs text-gray-400">Badges</p>
            </Card>
            <Card className="glass-card text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-400">{stats.reputationScore}</p>
              <p className="text-xs text-gray-400">Reputation</p>
            </Card>
          </motion.div>

          {/* Journey Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-cyan-400" />
              Journey Timeline
            </h2>

            {journeyEvents.length > 0 ? (
              <div className="space-y-6">
                {journeyEvents.map((event, index) => {
                  const IconComponent = getEventIcon(event.type);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 glass rounded-lg border border-white/10"
                    >
                      <div className={`p-2 rounded-full glass ${getEventColor(event.type)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{event.title}</h3>
                            <p className="text-sm text-gray-300 mt-1">{event.description}</p>
                            {event.city && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {event.city}
                              </Badge>
                            )}
                            {event.badge && (
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-lg">{event.badge.icon}</span>
                                <Badge className={getRarityColor(event.badge.rarity)}>
                                  {event.badge.rarity}
                                </Badge>
                              </div>
                            )}
                            {event.xp_gained && event.xp_gained > 0 && (
                              <Badge className="bg-green-500/20 text-green-400 mt-2">
                                +{event.xp_gained} XP
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Journey Awaits</h3>
                <p className="text-gray-400 mb-6">
                  Start exploring network states to begin building your nomad timeline.
                </p>
                <a href="/explore" className="btn-cyber inline-flex items-center">
                  Explore Cities
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}