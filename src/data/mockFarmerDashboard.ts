export interface DashboardActionItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  link?: string;
}

export interface ActiveLotSummary {
  id: string;
  crop: string;
  quantity: string;
  quality: string;
  location: string;
  status: string;
  updatedAt: string;
  emoji: string;
}

export interface ActiveDecision {
  id: string;
  crop: string;
  quantity: string;
  quality: string;
  location: string;
  recommendedDestination: string;
  netRealization: number;
  highestHeadlinePrice: number;
  pros: string[];
  consOfHighest: string[];
  timestamp: string;
}

export interface MarketSnapshotItem {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  explanation: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'info';
}

export interface MarketPressure {
  level: 'LOW' | 'MODERATE' | 'HIGH';
  arrivalsText: string;
  priceTrendText: string;
}

export interface SaleWindow {
  status: 'FAVORABLE' | 'WAIT' | 'URGENT';
  message: string;
  recommendation: string;
}

export interface FarmerDashboardData {
  activeDecision: ActiveDecision | null;
  marketSnapshot: MarketSnapshotItem[];
  marketPressure: MarketPressure;
  saleWindow: SaleWindow;
  actionItems: DashboardActionItem[];
  activeLots: ActiveLotSummary[];
}

export const mockDashboardData: FarmerDashboardData = {
  activeDecision: {
    id: 'dec-101',
    crop: 'Onion',
    quantity: '5,000 kg',
    quality: 'Grade B',
    location: 'Nashik',
    recommendedDestination: 'Pimpalgaon Market',
    netRealization: 108500,
    highestHeadlinePrice: 112000,
    pros: [
      'Better estimated net realization after costs',
      'Lower transport burden',
      'Payment timing fits your requirement'
    ],
    consOfHighest: [
      'Payment in 15 days',
      'Higher transport cost'
    ],
    timestamp: '2 hours ago'
  },
  marketSnapshot: [
    {
      id: 'ms-1',
      label: 'Best Price',
      value: '₹2,600/q',
      explanation: 'Headline market reference',
      status: 'info'
    },
    {
      id: 'ms-2',
      label: 'Best Net Option',
      value: '₹2,480/q',
      explanation: 'Estimated net after applicable costs',
      status: 'success'
    },
    {
      id: 'ms-3',
      label: 'Arrivals',
      value: '↓ 18%',
      explanation: 'Compared to 7-day average',
      trend: 'down',
      status: 'warning'
    }
  ],
  marketPressure: {
    level: 'MODERATE',
    arrivalsText: 'Lower than recent average',
    priceTrendText: 'Slight upward movement'
  },
  saleWindow: {
    status: 'FAVORABLE',
    message: 'Current selling window looks favorable',
    recommendation: 'Consider selling in the near term'
  },
  actionItems: [
    {
      id: 'act-1',
      type: 'success',
      title: '3 selling opportunities found',
      description: 'New matches available for your Onion lot.',
      actionLabel: 'View matches',
      link: '/farmer/decisions'
    },
    {
      id: 'act-2',
      type: 'warning',
      title: 'Your potato lot may benefit from aggregation',
      description: 'Volume is too low for wholesale premium.',
      actionLabel: 'Explore FPO',
      link: '/farmer/lots'
    },
    {
      id: 'act-3',
      type: 'info',
      title: 'New offer received from buyer',
      description: 'FreshMart Ltd. placed a counter-offer on onions.',
      actionLabel: 'Review offer',
      link: '/farmer/offers'
    }
  ],
  activeLots: [
    {
      id: 'lot-1',
      crop: 'Onion',
      quantity: '5,000 kg',
      quality: 'Grade B',
      location: 'Nashik',
      status: 'Decision Ready',
      updatedAt: 'Updated today',
      emoji: '🧅'
    },
    {
      id: 'lot-2',
      crop: 'Potato',
      quantity: '2,000 kg',
      quality: 'Grade A',
      location: 'Pune',
      status: 'Market Analysis',
      updatedAt: 'Updated 2 days ago',
      emoji: '🥔'
    }
  ]
};
