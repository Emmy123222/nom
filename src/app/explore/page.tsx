'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Users, Shield, ExternalLink, Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/layout/Navigation';
import { fetchLiveCityData, type CityData } from '@/lib/cityData';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ExplorePage() {
  const { connected, publicKey } = useWallet();
  const [cities, setCities] = useState<CityData[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [governanceFilter, setGovernanceFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [applicationData, setApplicationData] = useState({
    motivation: '',
    skills: '',
    experience: '',
    contribution: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCityData();
  }, []);

  const loadCityData = async () => {
    try {
      setLoading(true);
      const cityData = await fetchLiveCityData();
      setCities(cityData);
      setFilteredCities(cityData);
    } catch (error) {
      console.error('Error loading city data:', error);
      toast.error('Failed to load city data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = cities;

    if (searchTerm) {
      filtered = filtered.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (governanceFilter !== 'all') {
      filtered = filtered.filter(city => city.governance === governanceFilter);
    }

    if (membershipFilter !== 'all') {
      filtered = filtered.filter(city => city.membershipType === membershipFilter);
    }

    setFilteredCities(filtered);
  }, [searchTerm, governanceFilter, membershipFilter, cities]);

  const handleApply = async (city: CityData) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet to apply');
      return;
    }

    setSelectedCity(city);
  };

  const submitApplication = async () => {
    if (!selectedCity || !publicKey) return;

    try {
      setSubmitting(true);
      const walletAddress = publicKey.toString();

      // Get or create user profile
      let { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!profile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({ wallet_address: walletAddress })
          .select('id')
          .single();

        if (profileError) throw profileError;
        profile = newProfile;
      }

      // Submit application
      const { error: applicationError } = await supabase
        .from('city_applications')
        .insert({
          user_id: profile.id,
          city_name: selectedCity.name,
          city_id: selectedCity.id,
          application_data: applicationData,
          status: 'pending',
        });

      if (applicationError) throw applicationError;

      toast.success(`Application submitted to ${selectedCity.name}!`);
      setSelectedCity(null);
      setApplicationData({
        motivation: '',
        skills: '',
        experience: '',
        contribution: '',
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getCityImage = (cityName: string) => {
    const cityImages: { [key: string]: string } = {
      'Próspera': 'https://images.pexels.com/photos/2611686/pexels-photo-2611686.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      'CityDAO': 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      'Zuzalu': 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      'Cabin': 'https://images.pexels.com/photos/1438248/pexels-photo-1438248.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      'Kift': 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    };
    return cityImages[cityName] || 'https://images.pexels.com/photos/2611686/pexels-photo-2611686.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
  };

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
              <h2 className="text-2xl font-bold mb-4">Loading Network States</h2>
              <p className="text-gray-300">
                Fetching live data from crypto cities...
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
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold mb-4">
              Explore <span className="text-gradient">Crypto Cities</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Discover network states and crypto cities around the world
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search cities, tags, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass border-white/20 focus:border-cyan-400/50"
                />
              </div>
              <Select value={governanceFilter} onValueChange={setGovernanceFilter}>
                <SelectTrigger className="w-full md:w-48 glass border-white/20">
                  <SelectValue placeholder="Governance Type" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  <SelectItem value="all">All Governance</SelectItem>
                  <SelectItem value="Charter City">Charter City</SelectItem>
                  <SelectItem value="DAO">DAO</SelectItem>
                  <SelectItem value="Community-led">Community-led</SelectItem>
                  <SelectItem value="Network State">Network State</SelectItem>
                </SelectContent>
              </Select>
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="w-full md:w-48 glass border-white/20">
                  <SelectValue placeholder="Membership" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Application">Application</SelectItem>
                  <SelectItem value="Invitation">Invitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card hover:neon-border transition-all duration-300 group overflow-hidden">
                  <div className="relative">
                    <img
                      src={getCityImage(city.name)}
                      alt={city.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={`
                        ${city.membershipType === 'Open' ? 'bg-green-500/20 text-green-400' : 
                          city.membershipType === 'Application' ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-purple-500/20 text-purple-400'}
                      `}>
                        {city.membershipType}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-cyan-400">
                        {city.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {city.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {city.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        {city.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Users className="h-3 w-3" />
                        {city.population.toLocaleString()} residents
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Shield className="h-3 w-3" />
                        {city.governance}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {city.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-400">Annual: </span>
                        <span className="text-green-400 font-semibold">
                          {city.annualCost === 0 ? 'Free' : `$${city.annualCost.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="glass border-white/20"
                          onClick={() => window.open(city.website, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                        <Button 
                          size="sm" 
                          className="btn-cyber"
                          onClick={() => handleApply(city)}
                          disabled={!connected}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredCities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-400 text-lg">
                No cities found matching your criteria. Try adjusting your filters.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Application Dialog */}
      <Dialog open={!!selectedCity} onOpenChange={() => setSelectedCity(null)}>
        <DialogContent className="glass border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cyan-400">
              Apply to {selectedCity?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="motivation" className="text-sm font-medium text-gray-300">
                Why do you want to join this community?
              </Label>
              <Textarea
                id="motivation"
                value={applicationData.motivation}
                onChange={(e) => setApplicationData(prev => ({ ...prev, motivation: e.target.value }))}
                placeholder="Describe your motivation for joining this network state..."
                className="mt-2 glass border-white/20 focus:border-cyan-400/50"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="skills" className="text-sm font-medium text-gray-300">
                What skills do you bring?
              </Label>
              <Textarea
                id="skills"
                value={applicationData.skills}
                onChange={(e) => setApplicationData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="List your relevant skills and expertise..."
                className="mt-2 glass border-white/20 focus:border-cyan-400/50"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="experience" className="text-sm font-medium text-gray-300">
                Previous experience with crypto/DAOs/network states?
              </Label>
              <Textarea
                id="experience"
                value={applicationData.experience}
                onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="Describe your relevant experience..."
                className="mt-2 glass border-white/20 focus:border-cyan-400/50"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="contribution" className="text-sm font-medium text-gray-300">
                How will you contribute to the community?
              </Label>
              <Textarea
                id="contribution"
                value={applicationData.contribution}
                onChange={(e) => setApplicationData(prev => ({ ...prev, contribution: e.target.value }))}
                placeholder="Explain how you plan to contribute..."
                className="mt-2 glass border-white/20 focus:border-cyan-400/50"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCity(null)}
                className="glass border-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={submitApplication}
                disabled={submitting || !applicationData.motivation.trim()}
                className="btn-cyber"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}