import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { supabase } from '../../lib/supabase';

import { offerDemoService, type BuyerOpportunity, type AugmentedOffer } from '../../services/offerDemoService';
import { OfferSummary } from '../../components/farmer/offers/OfferSummary';
import { BuyerOpportunityCard } from '../../components/farmer/offers/BuyerOpportunityCard';
import { OfferCard } from '../../components/farmer/offers/OfferCard';
import { OfferDetails } from '../../components/farmer/offers/OfferDetails';
import { OfferResponseForm } from '../../components/farmer/offers/OfferResponseForm';

export const FarmerOffersPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [opportunities, setOpportunities] = useState<BuyerOpportunity[]>([]);
  const [offers, setOffers] = useState<AugmentedOffer[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedOpportunity, setSelectedOpportunity] = useState<BuyerOpportunity | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  const [farmerId, setFarmerId] = useState('demo-farmer-id');

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || 'dummy-token';
      const uid = session?.user?.id || 'demo-farmer-id';
      setFarmerId(uid);
      
      const [opps, offs] = await Promise.all([
        offerDemoService.getBuyerOpportunities(token, uid),
        offerDemoService.getNormalizedOffers(uid)
      ]);
      setOpportunities(opps);
      setOffers(offs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('krishimitra_offers_updated', loadData);
    return () => window.removeEventListener('krishimitra_offers_updated', loadData);
  }, []);

  const handleRespondSubmit = async (offerData: any) => {
    await offerDemoService.submitOffer(offerData);
    setIsResponding(false);
    setSelectedOpportunity(null);
    loadData();
  };

  const handleAcceptOffer = async (offer: AugmentedOffer) => {
    await offerDemoService.acceptReceivedOffer(offer.id);
    loadData();
  };

  const handleRejectOffer = async (offer: AugmentedOffer) => {
    await offerDemoService.rejectReceivedOffer(offer.id);
    loadData();
  };

  const handleSimulateBuyerAcceptance = async () => {
    // Hidden debug tool for demo purposes: forcibly accept the first 'SENT' offer
    const sent = offers.find(o => o.status === 'SENT');
    if (sent) {
      await offerDemoService.simulateBuyerAcceptance(sent.id);
      loadData();
    }
  };

  // Filtering
  const receivedOffers = offers.filter(o => o.status === 'RECEIVED');
  const sentOffers = offers.filter(o => o.status === 'SENT');
  const historyOffers = offers.filter(o => ['ACCEPTED', 'REJECTED', 'EXPIRED'].includes(o.status));

  const filteredOpportunities = opportunities.filter(opp => 
    opp.buyerProfile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    opp.requirement.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterOffers = (list: AugmentedOffer[]) => list.filter(o => 
    o.buyerProfile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.requirement?.crop.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">My Offers</h1>
          <p className="text-gray-600">Review buyer opportunities, respond to offers, and track your deals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Data Current
          </div>
          <Button variant="secondary" onClick={loadData} isLoading={loading}>Refresh</Button>
          <Button variant="ghost" className="opacity-0 w-1" onClick={handleSimulateBuyerAcceptance} title="Simulate Buyer Acceptance">.</Button>
        </div>
      </div>

      <OfferSummary metrics={{
        activeOpportunities: opportunities.length,
        offersReceived: receivedOffers.length,
        pendingResponse: receivedOffers.length + sentOffers.length, // From both ends logically
        accepted: offers.filter(o => o.status === 'ACCEPTED').length,
      }} />

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { label: 'All', value: 'ALL' },
              { label: 'Buyer Opportunities', value: 'OPPORTUNITIES' },
              { label: 'Received Offers', value: 'RECEIVED' },
              { label: 'Sent Offers', value: 'SENT' },
              { label: 'History', value: 'HISTORY' },
            ]}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buyer, crop, ID..." 
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading matching opportunities...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(activeTab === 'ALL' || activeTab === 'OPPORTUNITIES') && (
            <section>
              {activeTab === 'ALL' && <h2 className="text-lg font-black text-gray-900 mb-4 border-b pb-2">Buyer Opportunities</h2>}
              {filteredOpportunities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                  <p className="text-sm font-bold text-gray-900 mb-1">No matching buyer requirements yet.</p>
                  <p className="text-xs text-gray-500">New buyer requirements matching your crop and lot will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpportunities.map(opp => (
                    <BuyerOpportunityCard 
                      key={opp.requirement.id} 
                      opportunity={opp}
                      onViewDetails={setSelectedOpportunity}
                      onRespond={(o) => { setSelectedOpportunity(o); setIsResponding(true); }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {(activeTab === 'ALL' || activeTab === 'RECEIVED') && (
            <section>
              {activeTab === 'ALL' && <h2 className="text-lg font-black text-gray-900 mb-4 border-b pb-2">Received Offers</h2>}
              {filterOffers(receivedOffers).length === 0 ? (
                activeTab !== 'ALL' && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <p className="text-sm font-bold text-gray-900 mb-1">No buyer offers yet.</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterOffers(receivedOffers).map(offer => (
                    <OfferCard 
                      key={offer.id} 
                      offer={offer} 
                      type="received"
                      onView={() => {}}
                      onAccept={handleAcceptOffer}
                      onReject={handleRejectOffer}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {(activeTab === 'ALL' || activeTab === 'SENT') && (
            <section>
              {activeTab === 'ALL' && <h2 className="text-lg font-black text-gray-900 mb-4 border-b pb-2">Sent Offers</h2>}
              {filterOffers(sentOffers).length === 0 ? (
                activeTab !== 'ALL' && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <p className="text-sm font-bold text-gray-900 mb-1">You haven't sent any offers yet.</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterOffers(sentOffers).map(offer => (
                    <OfferCard 
                      key={offer.id} 
                      offer={offer} 
                      type="sent"
                      onView={() => {}}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {(activeTab === 'ALL' || activeTab === 'HISTORY') && (
            <section>
              {activeTab === 'ALL' && <h2 className="text-lg font-black text-gray-900 mb-4 border-b pb-2">Offer History</h2>}
              {filterOffers(historyOffers).length === 0 ? (
                activeTab !== 'ALL' && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <p className="text-sm font-bold text-gray-900 mb-1">No completed or closed offers yet.</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterOffers(historyOffers).map(offer => (
                    <OfferCard 
                      key={offer.id} 
                      offer={offer} 
                      type="history"
                      onView={() => navigate('/farmer/transactions')} // Directs to transactions generically since we don't store transactionId in offer directly in this demo
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedOpportunity && !isResponding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <OfferDetails 
            opportunity={selectedOpportunity} 
            onClose={() => setSelectedOpportunity(null)} 
            onRespond={() => setIsResponding(true)}
          />
        </div>
      )}

      {selectedOpportunity && isResponding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
            <h3 className="text-xl font-black text-gray-900 mb-4">Respond to Buyer</h3>
            <OfferResponseForm 
              opportunity={selectedOpportunity}
              onSubmit={handleRespondSubmit}
              onCancel={() => setIsResponding(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
