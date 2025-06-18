'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Trophy, MapPin, Users, Star, TrendingUp, Calendar, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/layout/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';

interface UserStats {
  totalXP: number;
  citiesJoined: number;
  badgesEarned: number;
  reputationScore: number;
  level: number;
}

interface Badge {
  id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string;
}

interface CityMembership {
  id: string;
  city_name: string;
  joined_at: string;
  status: 'active' | 'pending' | 'inactive';
  progress_percentage: number;
  role: string;
}

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [memberships, setMemberships] = useState<CityMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserData();
    }
  }, [connected, publicKey]);

  const fetchUserData = async () => {
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

      if (!profile) {
        // Create user profile if it doesn't exist
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({ wallet_address: walletAddress })
          .select('id')
          .single();
        
        if (newProfile) {
          profile.id = newProfile.id;
        }
      }

      if (profile) {
        // Fetch user stats
        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        if (stats) {
          setUserStats({
            totalXP: stats.total_xp,
            citiesJoined: stats.cities_joined,
            badgesEarned: stats.badges_earned,
            reputationScore: stats.reputation_score,
            level: stats.level,
          });
        }

        // Fetch badges
        const { data: badgeData } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', profile.id)
          .order('earned_at', { ascending: false });

        if (badgeData) {
          setBadges(badgeData);
        }

        // Fetch memberships
        const { data: membershipData } = await supabase
          .from('city_memberships')
          .select('*')
          .eq('user_id', profile.id)
          .order('joined_at', { ascending: false });

        if (membershipData) {
          setMemberships(membershipData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'inactive': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCityImage = (cityName: string) => {
    const cityImages: { [key: string]: string } = {
      'Próspera': 'https://images.pexels.com/photos/2611686/pexels-photo-2611686.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'CityDAO': 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Zuzalu': 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Cabin': 'https://images.pexels.com/photos/1438248/pexels-photo-1438248.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Kift': 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    };
    return cityImages[cityName] || 'https://images.pexels.com/photos/2611686/pexels-photo-2611686.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop';
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
              <Wallet className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-6">
                Connect your Solana wallet to view your nomad dashboard and track your journey across network states.
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
              <h2 className="text-2xl font-bold mb-4">Loading Dashboard</h2>
              <p className="text-gray-300">
                Fetching your nomad journey data...
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
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">
              Your <span className="text-gradient">Nomad Dashboard</span>
            </h1>
            <p className="text-gray-300">
              Track your journey across network states and crypto cities
            </p>
          </motion.div>

          {/* Stats Overview */}
          {userStats && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <Card className="glass-card">
                <div className="flex items-center space-x-4">
                  <TrendingUp className="h-10 w-10 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-green-400">{userStats.totalXP}</p>
                    <p className="text-sm text-gray-400">Total XP</p>
                  </div>
                </div>
              </Card>
              <Card className="glass-card">
                <div className="flex items-center space-x-4">
                  <MapPin className="h-10 w-10 text-cyan-400" />
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">{userStats.citiesJoined}</p>
                    <p className="text-sm text-gray-400">Cities Joined</p>
                  </div>
                </div>
              </Card>
              <Card className="glass-card">
                <div className="flex items-center space-x-4">
                  <Trophy className="h-10 w-10 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">{userStats.badgesEarned}</p>
                    <p className="text-sm text-gray-400">Badges Earned</p>
                  </div>
                </div>
              </Card>
              <Card className="glass-card">
                <div className="flex items-center space-x-4">
                  <Star className="h-10 w-10 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{userStats.reputationScore}</p>
                    <p className="text-sm text-gray-400">Reputation</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Level Progress */}
            {userStats && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="glass-card">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Level Progress
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Level {userStats.level}</span>
                      <span className="text-sm text-gray-400">
                        {Math.max(0, (userStats.level * userStats.level * 100) - userStats.totalXP)} XP to next level
                      </span>
                    </div>
                    <Progress 
                      value={(userStats.totalXP % (userStats.level * 100)) / (userStats.level * 100) * 100} 
                      className="h-3"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{userStats.level}</p>
                        <p className="text-xs text-gray-400">Current Level</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{userStats.totalXP}</p>
                        <p className="text-xs text-gray-400">Total XP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">{userStats.citiesJoined}</p>
                        <p className="text-xs text-gray-400">Cities Joined</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">{userStats.badgesEarned}</p>
                        <p className="text-xs text-gray-400">Badges Earned</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-cyan-400" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {badges.slice(0, 3).map((badge, index) => (
                    <div key={badge.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm">Earned "{badge.badge_name}" badge</p>
                        <p className="text-xs text-gray-400">
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {badges.length === 0 && (
                    <p className="text-gray-400 text-sm">No recent activity</p>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* City Memberships */}
          {memberships.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="glass-card">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-cyan-400" />
                  Your Network States
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {memberships.map((membership) => (
                    <Card key={membership.id} className="glass border-white/10">
                      <img
                        src={getCityImage(membership.city_name)}
                        alt={membership.city_name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-cyan-400">{membership.city_name}</h4>
                          <Badge className={getStatusColor(membership.status)}>
                            {membership.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">Role: {membership.role}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{membership.progress_percentage}%</span>
                          </div>
                          <Progress value={membership.progress_percentage} className="h-2" />
                        </div>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(membership.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Badges Collection */}
          {badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card className="glass-card">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                  Badge Collection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => (
                    <Card key={badge.id} className={`glass border-2 ${getRarityColor(badge.rarity)}`}>
                      <div className="text-center space-y-3">
                        <div className="text-4xl">{badge.badge_icon}</div>
                        <h4 className="font-semibold">{badge.badge_name}</h4>
                        <p className="text-sm text-gray-400">{badge.badge_description}</p>
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Earned {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {!userStats && memberships.length === 0 && badges.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <Card className="glass-card">
                <MapPin className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">Start Your Nomad Journey</h2>
                <p className="text-gray-300 mb-6">
                  Begin by exploring network states and applying to communities that match your values.
                </p>
                <Button className="btn-cyber">
                  <a href="/explore">Explore Cities</a>
                </Button>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}