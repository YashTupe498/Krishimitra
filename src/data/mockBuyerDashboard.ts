export interface BuyerDashboardData {
  priorityRequirement: { name: string; need: string; lotsFound: string; fpoMatch: string };
  activeRequirement: { produce: string; quantity: string; grade: string };
  supplySnapshot: Array<{ label: string; value: string }>;
  matchingLots: Array<{ id: string; produce: string; quantity: string; grade: string; location: string; emoji: string }>;
  summaries: Array<{ label: string; value: string; tone: 'success' | 'info' }>;
}

export const mockBuyerDashboard: BuyerDashboardData = {
  priorityRequirement: {
    name: 'Onion Requirement',
    need: 'Need: 10,000 kg • Grade A/B',
    lotsFound: '8 suitable lots found',
    fpoMatch: '1 FPO aggregate can fully satisfy demand',
  },
  activeRequirement: { produce: 'Onion', quantity: '10,000 kg', grade: 'Grade A/B' },
  supplySnapshot: [
    { label: 'Matching Lots', value: '8' },
    { label: 'Supply', value: '18,500 kg' },
    { label: 'Nearest', value: '12 km' },
    { label: 'FPO Matches', value: '2' },
  ],
  matchingLots: [
    { id: 'LOT-101', produce: 'Onion', quantity: '5,000 kg', grade: 'Grade B', location: 'Nashik', emoji: '🧅' },
    { id: 'LOT-104', produce: 'Onion', quantity: '3,500 kg', grade: 'Grade A', location: 'Pimpalgaon', emoji: '🧅' },
    { id: 'FPO-02', produce: 'Onion', quantity: '11,500 kg', grade: 'A/B', location: 'Nashik', emoji: '🧅' },
  ],
  summaries: [
    { label: 'Offers Awaiting Response', value: '2', tone: 'success' },
    { label: 'Active Transaction', value: '1', tone: 'info' },
  ],
};
