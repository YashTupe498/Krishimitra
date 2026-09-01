import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import type { BuyerOpportunity } from '../../../services/offerDemoService';

export const OfferResponseForm: React.FC<{
  opportunity: BuyerOpportunity;
  onSubmit: (offerData: any) => Promise<void>;
  onCancel: () => void;
}> = ({ opportunity, onSubmit, onCancel }) => {
  const { requirement, matchedLot } = opportunity;
  
  const [quantity, setQuantity] = useState(requirement.quantityRequired.toString());
  const [price, setPrice] = useState('4400'); // Defaulting to a demo response price
  const [delivery, setDelivery] = useState('FLEXIBLE');
  const [loading, setLoading] = useState(false);

  const lotQty = Number(matchedLot.quantity) * (matchedLot.unit === 'Quintal' || matchedLot.unit === 'QUINTAL' ? 100 : 1);
  const qtyError = Number(quantity) > lotQty ? `Exceeds available lot quantity (${lotQty} kg)` : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qtyError || Number(quantity) <= 0 || Number(price) <= 0) return;
    
    setLoading(true);
    try {
      await onSubmit({
        lotId: matchedLot.id,
        requirementId: requirement.id,
        buyerId: requirement.buyerId,
        farmerId: matchedLot.farmerId,
        quantity: Number(quantity),
        pricePerQuintal: Number(price),
        estimatedTotalValue: Number(quantity) * (Number(price) / 100),
        paymentTimelineDays: requirement.paymentTimelineDays,
        deliveryPreference: delivery,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-2">Buyer Requested</h4>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Quantity</span>
          <span className="font-mono">{requirement.quantityRequired.toLocaleString()} {requirement.quantityUnit.toLowerCase()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Target Price</span>
          <span className="font-mono text-green-700">₹4,350/q</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Your Offered Quantity (kg)</label>
          <Input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)}
            className={qtyError ? 'border-red-500' : ''}
            required
          />
          {qtyError && <div className="text-xs text-red-600 mt-1">{qtyError}</div>}
          <div className="text-xs text-gray-500 mt-1">Available in lot: {lotQty.toLocaleString()} kg</div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Your Price (₹ per quintal)</label>
          <Input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Select 
            label="Delivery Preference"
            value={delivery} 
            onChange={(val) => setDelivery(val)}
            options={[
              { label: 'Flexible', value: 'FLEXIBLE' },
              { label: 'I will deliver', value: 'SELLER_DELIVERY' },
              { label: 'Buyer must pickup', value: 'BUYER_PICKUP' },
            ]}
          />
        </div>
      </div>
      
      <div className="pt-4 flex gap-3 border-t border-gray-100 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" isLoading={loading} className="flex-1" disabled={!!qtyError}>
          Submit Offer
        </Button>
      </div>
    </form>
  );
};
