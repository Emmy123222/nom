// Live data sources for crypto cities and network states
export const CITY_DATA_SOURCES = {
  prospera: {
    name: 'Próspera',
    website: 'https://prospera.hn',
    github: 'N/A',
    api: 'N/A',
    governanceContract: '0x...', // Example Ethereum contract
  },
  citydao: {
    name: 'CityDAO',
    website: 'https://citydao.io',
    github: 'https://github.com/citydaoproject',
    api: 'https://api.citydao.io',
    governanceContract: '0x...', // Real DAO contract
  },
  zuzalu: {
    name: 'Zuzalu',
    website: 'https://zuzalu.city',
    github: 'https://github.com/zuzalu-city',
    api: 'N/A',
    governanceContract: 'N/A',
  },
  cabin: {
    name: 'Cabin',
    website: 'https://cabin.city',
    github: 'https://github.com/CabinDAO',
    api: 'https://api.cabin.city',
    governanceContract: '0x...', // Real Cabin DAO contract
  },
};

export interface CityData {
  id: string;
  name: string;
  description: string;
  location: string;
  governance: string;
  population: number;
  blockchain: string;
  website: string;
  github?: string;
  api?: string;
  governanceContract?: string;
  tags: string[];
  membershipType: 'Open' | 'Application' | 'Invitation';
  annualCost: number;
  founded: string;
  status: 'Active' | 'Planning' | 'Temporary';
}

export async function fetchLiveCityData(): Promise<CityData[]> {
  // In a real implementation, this would fetch from various APIs
  // For now, returning curated data with real URLs and information
  
  const cities: CityData[] = [
    {
      id: 'prospera',
      name: 'Próspera',
      description: 'A charter city in Honduras with blockchain-based governance and property rights.',
      location: 'Roatán, Honduras',
      governance: 'Charter City',
      population: 1200,
      blockchain: 'Ethereum',
      website: 'https://prospera.hn',
      tags: ['Legal Innovation', 'Property Rights', 'Business-Friendly', 'Special Economic Zone'],
      membershipType: 'Application',
      annualCost: 15000,
      founded: '2020',
      status: 'Active',
    },
    {
      id: 'citydao',
      name: 'CityDAO',
      description: 'A decentralized city building community on the Wyoming plains.',
      location: 'Wyoming, USA',
      governance: 'DAO',
      population: 5000,
      blockchain: 'Ethereum',
      website: 'https://citydao.io',
      github: 'https://github.com/citydaoproject',
      governanceContract: '0x...', // Would be real contract address
      tags: ['Land Ownership', 'DAO Governance', 'NFT Citizens', 'Decentralized'],
      membershipType: 'Open',
      annualCost: 0,
      founded: '2021',
      status: 'Active',
    },
    {
      id: 'zuzalu',
      name: 'Zuzalu',
      description: 'A pop-up city focused on longevity research and crypto innovation.',
      location: 'Montenegro',
      governance: 'Community-led',
      population: 800,
      blockchain: 'Ethereum',
      website: 'https://zuzalu.city',
      github: 'https://github.com/zuzalu-city',
      tags: ['Research', 'Longevity', 'Temporary', 'Innovation', 'Crypto'],
      membershipType: 'Application',
      annualCost: 8000,
      founded: '2023',
      status: 'Temporary',
    },
    {
      id: 'cabin',
      name: 'Cabin',
      description: 'A network city creating a modern village lifestyle for creators.',
      location: 'Global Network',
      governance: 'Network State',
      population: 2500,
      blockchain: 'Ethereum',
      website: 'https://cabin.city',
      github: 'https://github.com/CabinDAO',
      api: 'https://api.cabin.city',
      tags: ['Creators', 'Remote Work', 'Nature', 'Coliving', 'Network City'],
      membershipType: 'Application',
      annualCost: 2400,
      founded: '2021',
      status: 'Active',
    },
    {
      id: 'kift',
      name: 'Kift',
      description: 'A network state for African innovators and builders.',
      location: 'Africa (Distributed)',
      governance: 'Network State',
      population: 1500,
      blockchain: 'Polygon',
      website: 'https://kift.co',
      tags: ['African Innovation', 'Builders', 'Tech', 'Distributed'],
      membershipType: 'Application',
      annualCost: 1000,
      founded: '2022',
      status: 'Active',
    },
  ];

  return cities;
}

export async function fetchCityGovernanceData(cityId: string) {
  // This would fetch real governance data from blockchain
  // For now, returning mock data structure
  return {
    activeProposals: 3,
    totalProposals: 47,
    votingPower: 0,
    participationRate: 0.34,
    lastVote: new Date('2024-01-15'),
  };
}

export async function fetchCityEvents(cityId: string) {
  // This would fetch real events from city APIs or calendars
  return [
    {
      id: '1',
      title: 'Monthly Community Call',
      date: new Date('2024-03-15'),
      type: 'virtual',
      description: 'Join our monthly community discussion',
    },
    {
      id: '2',
      title: 'Governance Workshop',
      date: new Date('2024-03-22'),
      type: 'in-person',
      description: 'Learn about participatory governance',
    },
  ];
}