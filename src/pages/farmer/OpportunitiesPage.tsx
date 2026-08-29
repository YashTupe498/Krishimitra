import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import type { Opportunity } from '../../types/opportunity';

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch('/api/v1/farmer/opportunities');
        if (response.ok) {
          const data = await response.json();
          setOpportunities(data);
        }
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOpportunities();
  }, []);

  const getMatchEmoji = (level: string) => {
    if (level === 'Strong Match') return '🟢';
    if (level === 'Good Match') return '🟡';
    return '🟠';
  };

  const getCropEmoji = (crop: string) => {
    if (crop.toLowerCase().includes('onion')) return '🧅';
    if (crop.toLowerCase().includes('tomato')) return '🍅';
    if (crop.toLowerCase().includes('potato')) return '🥔';
    return '🌱';
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Offers &rarr; Opportunities</h1>

      {loading ? (
        <p>Loading...</p>
      ) : opportunities.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>No matching opportunities found right now.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="p-4 flex flex-col h-full">
              <div className="mb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span>{getCropEmoji(opp.cropName)}</span> {opp.cropName}
                </h3>
                <p className="text-gray-700">Grade {opp.grade} • {opp.quantity.toLocaleString()} kg</p>
                <p className="text-sm text-gray-500">Buyer requirement: {opp.quantity.toLocaleString()} kg • Grade {opp.grade}</p>
                <p className="text-gray-700 mt-1 flex items-center gap-1">
                  <span>📍</span> {opp.location}
                </p>
              </div>
              
              <div className="mt-2 mb-3">
                <p className="font-medium flex items-center gap-1">
                  <span>{getMatchEmoji(opp.matchLevel)}</span> {opp.matchLevel}
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4 flex-grow">
                <p>✓ Crop</p>
                <p>✓ Grade</p>
                <p>✓ Quantity</p>
                <p>✓ Location</p>
                <p>✓ Payment</p>
              </div>

              <Button 
                variant="primary" 
                className="w-full justify-center"
                onClick={() => navigate(`/farmer/opportunities/${opp.id}`)}
              >
                View Opportunity
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
