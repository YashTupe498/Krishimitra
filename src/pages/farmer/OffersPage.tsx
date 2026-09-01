import React, { useEffect, useState } from 'react';
// useNavigate removed
import { Search, Loader2, Leaf, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { supabase } from '../../lib/supabase';

import { offerDemoService, type BuyerOpportunity, type AugmentedOffer } from '../../services/offerDemoService';

import { BuyerOpportunityCard } from '../../components/farmer/offers/BuyerOpportunityCard';
import { OfferCard } from '../../components/farmer/offers/OfferCard';
import { OfferDetails } from '../../components/farmer/offers/OfferDetails';
import { OfferResponseForm } from '../../components/farmer/offers/OfferResponseForm';

export const FarmerOffersPage: React.FC = () => {

  const [loading, setLoading] = useState(true);
  
  // Data State
  const [opportunities, setOpportunities] = useState<BuyerOpportunity[]>([]);
  const [offers, setOffers] = useState<AugmentedOffer[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedOpportunity, setSelectedOpportunity] = useState<BuyerOpportunity | null>(null);
  const [selectedOfferDetails, setSelectedOfferDetails] = useState<AugmentedOffer | null>(null);
  const [isResponding, setIsResponding] = useState(false);



  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || 'dummy-token';
      const uid = session?.user?.id || 'demo-farmer-id';

      
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

  const filteredOpportunities = opportunities.filter(opp => 
    !searchQuery || 
    opp.buyerProfile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    opp.requirement.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterOffers = (list: AugmentedOffer[]) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.buyerProfile.name.toLowerCase().includes(q) ||
      o.requirement?.crop?.toLowerCase().includes(q)
    );
  };
  const receivedOffers = offers.filter(o => o.status === 'SENT' || o.status === 'RECEIVED');
  const sentOffers = offers.filter(o => o.status === ('NEGOTIATING' as any));
  const historyOffers = offers.filter(o => ['ACCEPTED', 'REJECTED', 'EXPIRED'].includes(o.status));

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="h2 mb-2">My Offers</h1>
          <p className="body-base">Review buyer opportunities, respond to offers, and track your deals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Data Current
          </div>
          <Button variant="secondary" onClick={loadData} className="bg-white">Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col justify-between shadow-sm">
          <div className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1 mb-2">
            <Leaf size={14} /> Opportunities
          </div>
          <div className="text-3xl font-black text-gray-900">{opportunities.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col justify-between shadow-sm">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1 mb-2">
            <ArrowRight size={14} /> Received
          </div>
          <div className="text-3xl font-black text-gray-900">{receivedOffers.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col justify-between shadow-sm">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1 mb-2">
            <Clock size={14} /> Pending
          </div>
          <div className="text-3xl font-black text-gray-900">{sentOffers.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col justify-between shadow-sm">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1 mb-2">
            <CheckCircle2 size={14} /> Accepted
          </div>
          <div className="text-3xl font-black text-gray-900">{historyOffers.filter(o => o.status === 'ACCEPTED').length}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <SegmentedControl 
          options={[
            { label: 'All', value: 'ALL' },
            { label: 'Buyer Opportunities', value: 'OPPORTUNITIES' },
            { label: 'Received Offers', value: 'RECEIVED' },
            { label: 'Sent Offers', value: 'SENT' },
            { label: 'History', value: 'HISTORY' }
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        
        <div className="relative max-w-sm w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buyer, crop, ID..." 
            className="pl-10"
          />
        </div>
      </div>

      {/* Payment Received Popup Notification */}
      {offers.filter(o => o.paymentStatus === 'RECEIVED' || o.paymentStatus === 'CONFIRMED').map(offer => {
        // Use sessionStorage to only show the popup once per session for this offer
        const seenKey = `payment_popup_seen_${offer.id}`;
        if (sessionStorage.getItem(seenKey)) return null;
        
        return (
          <div key={`popup-${offer.id}`} className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="bg-white rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-l-4 border-green-500 max-w-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-gray-900">Payment Received!</h4>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>₹{offer.paymentAmount?.toLocaleString('en-IN') || offer.estimatedTotalValue.toLocaleString('en-IN')}</strong> received from <strong>{offer.buyerProfile.name}</strong> for {offer.requirement?.crop}.
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => {
                    sessionStorage.setItem(seenKey, 'true');
                    loadData(); // Force re-render to hide
                  }}>Dismiss</Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
                      onView={() => setSelectedOfferDetails(offer)}
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
                      onView={() => setSelectedOfferDetails(offer)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {(activeTab === 'ALL' || activeTab === 'HISTORY') && (
            <section>
              {activeTab === 'ALL' && <h2 className="text-lg font-black text-gray-900 mb-4 border-b pb-2">History</h2>}
              {filterOffers(historyOffers).length === 0 ? (
                activeTab !== 'ALL' && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <p className="text-sm font-bold text-gray-900 mb-1">No past offers.</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterOffers(historyOffers).map(offer => (
                    <OfferCard 
                      key={offer.id} 
                      offer={offer} 
                      type="history"
                      onView={() => setSelectedOfferDetails(offer)}
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

      {selectedOfferDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <OfferDetails 
            opportunity={{
              requirement: selectedOfferDetails.requirement as any,
              matchedLot: { id: selectedOfferDetails.lotId } as any,
              matchScore: { overallScore: 100 } as any,
              buyerProfile: selectedOfferDetails.buyerProfile,
              isDemo: selectedOfferDetails.isDemo
            }} 
            isOfferView={true}
            onClose={() => setSelectedOfferDetails(null)} 
            onRespond={() => {}}
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
