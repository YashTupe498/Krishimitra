import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useParams, useNavigate } from 'react-router-dom';
import type { Opportunity } from '../../types/opportunity';

export const OpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await fetch(`/api/v1/farmer/opportunities/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOpportunity(data);
        }
      } catch (error) {
        console.error('Error fetching opportunity:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOpportunity();
    }
  }, [id]);

  if (loading) return <div className="p-4 max-w-2xl mx-auto"><p>Loading...</p></div>;
  if (!opportunity) return <div className="p-4 max-w-2xl mx-auto"><p>Opportunity not found.</p></div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/farmer/opportunities')} className="mb-4">
        &larr; Back to Opportunities
      </Button>
      
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{opportunity.cropName}</h1>
            <p className="text-gray-600">Requirement from Verified Buyer</p>
          </div>
          <Badge variant={opportunity.matchLevel === 'Strong Match' ? 'success' : 'info'}>
            {opportunity.matchLevel}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Grade Required</p>
            <p className="font-semibold">{opportunity.grade}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="font-semibold">{opportunity.quantity.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold">{opportunity.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Terms</p>
            <p className="font-semibold">{opportunity.paymentTerms}</p>
          </div>
        </div>

        {opportunity.constraintWarnings && opportunity.constraintWarnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <h3 className="text-red-700 font-semibold flex items-center gap-2 mb-2">
              <span>⚠</span> Constraint Warnings
            </h3>
            <ul className="list-disc pl-5 text-red-600 text-sm">
              {opportunity.constraintWarnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-3">Why This Matches</h2>
          <Card className="p-4 bg-gray-50">
            {opportunity.matchReasons && opportunity.matchReasons.length > 0 ? (
              <ul className="space-y-2">
                {opportunity.matchReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2">
                <p className="flex items-start gap-2"><span className="text-green-600">✓</span> Crop matches your profile</p>
                <p className="flex items-start gap-2"><span className="text-green-600">✓</span> Grade requirements are met</p>
                <p className="flex items-start gap-2"><span className="text-green-600">✓</span> Quantity matches your stock</p>
                <p className="flex items-start gap-2"><span className="text-green-600">✓</span> Location is within range</p>
                <p className="flex items-start gap-2"><span className="text-green-600">✓</span> Payment terms are acceptable</p>
              </div>
            )}
          </Card>
        </div>
        
        <div className="mt-8 flex gap-4">
          <Button variant="primary" className="flex-1 justify-center">
            Express Interest
          </Button>
          <Button variant="secondary" className="flex-1 justify-center">
            Contact Buyer
          </Button>
        </div>
      </Card>
    </div>
  );
};
