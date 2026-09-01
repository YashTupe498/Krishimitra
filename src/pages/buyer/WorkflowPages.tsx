import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, MapPin, Scale, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button'; import { Card } from '../../components/ui/Card'; import { MatchingLotCard } from '../../components/buyer/MatchingLotCard'; import { useMarketplace } from '../../hooks/useMarketplace';
import { Badge } from '../../components/ui/Badge'; import requirementStyles from './RequirementsPage.module.css';
import offerStyles from './OffersPage.module.css';
import { PaymentModal } from '../../components/buyer/PaymentModal';
export const BuyerRequirementsPage: React.FC = () => { const { requirements, service } = useMarketplace(); const navigate = useNavigate(); const [matchCounts, setMatchCounts] = useState<Record<string, number>>({}); useEffect(() => { const dismissed = new Set(JSON.parse(localStorage.getItem('krishimitra_buyer_dismissed_lots') || '[]')); Promise.all(requirements.map(async (requirement) => { const matches = await service.getMatches(requirement.id); return [requirement.id, matches.filter(m => !dismissed.has(m.lot.id)).length] as const; })).then((counts) => setMatchCounts(Object.fromEntries(counts))); }, [requirements, service]); const emoji = (crop: string) => crop === 'Onion' ? '🧅' : crop === 'Potato' ? '🥔' : '🌾'; return <div className={requirementStyles.page}><div className={requirementStyles.header}><div><h1 className="h2 text-[#14532D]">My Requirements</h1><p className="body-base">Manage your buying needs and review compatible supply.</p></div><Button onClick={() => navigate('/buyer/requirements/new')}>Create Requirement</Button></div>{requirements.length ? <div className={requirementStyles.grid}>{requirements.map((r) => { const active = r.status === 'ACTIVE'; return <article key={r.id} className={requirementStyles.card}><div className={requirementStyles.cardTop}><span className={requirementStyles.avatar}>{emoji(r.crop)}</span><Badge variant={active ? 'success' : 'warning'} className={requirementStyles.status}>{active ? 'Active' : r.status}</Badge></div><span className={requirementStyles.id}>{r.id}</span><h2 className={requirementStyles.title}>{r.crop}</h2><p className={requirementStyles.quantity}>{r.quantityRequired.toLocaleString()} kg</p><div className={requirementStyles.meta}><span><Scale size={15} />Grade {r.acceptedQualityGrades.join('/')}</span><span><MapPin size={15} />{r.district} · {r.maximumSourcingRadiusKm} km</span><span><CalendarDays size={15} />Payment: {r.paymentTimelineDays} days</span></div><div className="mt-2 text-sm font-bold text-gray-800">Offer Price: ₹{r.pricePerQuintal || 2400}/q</div><div className={requirementStyles.divider}/><div className={requirementStyles.matches}><CheckCircle2 size={17} />{matchCounts[r.id] ?? 0} matching lots available</div><div className={requirementStyles.actions}><Button variant="secondary" onClick={() => { if(window.confirm('Delete this requirement?')) service.deleteRequirement(r.id); }} className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300" title="Delete"><Trash2 size={16} /></Button><Button variant="secondary" onClick={() => { const val = window.prompt('Enter new Offer Price per Quintal:', String(r.pricePerQuintal || 2400)); if (val && !isNaN(Number(val))) { service.updateRequirement(r.id, { pricePerQuintal: Number(val) }); } }}>Edit Price</Button><Button onClick={() => navigate(`/buyer/matching-lots?requirementId=${r.id}`)}>View Matches</Button></div></article>; })}</div> : <Card className={requirementStyles.empty}><h2 className="h3">No requirements yet</h2><p className="body-base">Create a buying requirement to discover compatible Farmer and FPO supply.</p></Card>}</div>; };
export const BuyerMatchesPage: React.FC = () => { const { requirements, service } = useMarketplace(); const [params] = useSearchParams(); const navigate = useNavigate(); const requirement = requirements.find((r) => r.id === (params.get('requirementId') || requirements[0]?.id)); const [matches, setMatches] = useState<Awaited<ReturnType<typeof service.getMatches>>>([]); const [dismissed, setDismissed] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem('krishimitra_buyer_dismissed_lots') || '[]'))); useEffect(() => { if (requirement) service.getMatches(requirement.id).then(setMatches); }, [requirement, service]); if (!requirement) return <p>Loading matching supply…</p>; const makeOffer = async (lotId: string, quantity: number, farmerId: string) => { const price = requirement.pricePerQuintal || 2400; await service.createOffer({ id: `OFFER-${Date.now()}`, lotId, requirementId: requirement.id, buyerId: 'BUYER-001', farmerId, quantity: Math.min(quantity, requirement.quantityRequired), pricePerQuintal: price, estimatedTotalValue: Math.min(quantity, requirement.quantityRequired) / 100 * price, paymentTimelineDays: requirement.paymentTimelineDays, deliveryPreference: requirement.deliveryPreference, status: 'SENT', createdAt: new Date().toISOString() }); navigate('/buyer/offers'); }; const handleDismiss = (lotId: string) => { const next = new Set(dismissed); next.add(lotId); setDismissed(next); localStorage.setItem('krishimitra_buyer_dismissed_lots', JSON.stringify(Array.from(next))); }; return <div className="space-y-6"><div><h1 className="h2 text-[#14532D]">Matching Lots</h1><p className="body-base">{requirement.crop} · {requirement.quantityRequired.toLocaleString()} kg · Grade {requirement.acceptedQualityGrades.join('/')}</p></div>{matches.filter(m => !dismissed.has(m.lot.id)).map(({ lot, match }) => <MatchingLotCard key={lot.id} lot={lot} match={match} requirementQuantity={requirement.quantityRequired} onViewDetails={() => navigate(`/buyer/lots/${lot.id}?requirementId=${requirement.id}`)} onMakeOffer={() => makeOffer(lot.id, lot.quantity, lot.farmerId)} onDismiss={() => handleDismiss(lot.id)} />)}</div>; };
export const BuyerLotDetailPage: React.FC<{ lotId: string }> = ({ lotId }) => { const [params] = useSearchParams(); const { requirements, service } = useMarketplace(); const navigate = useNavigate(); const [lot, setLot] = useState<Awaited<ReturnType<typeof service.getLot>>>(null); useEffect(() => { service.getLot(lotId).then(setLot); }, [lotId, service]); const requirement = requirements.find((r) => r.id === (params.get('requirementId') || requirements[0]?.id)); if (!lot || !requirement) return <p>Loading lot…</p>; const makeOffer = async () => { const price = requirement.pricePerQuintal || 2400; await service.createOffer({ id: `OFFER-${Date.now()}`, lotId: lot.id, requirementId: requirement.id, buyerId: 'BUYER-001', farmerId: lot.farmerId, quantity: Math.min(lot.quantity, requirement.quantityRequired), pricePerQuintal: price, estimatedTotalValue: Math.min(lot.quantity, requirement.quantityRequired) / 100 * price, paymentTimelineDays: requirement.paymentTimelineDays, deliveryPreference: requirement.deliveryPreference, status: 'SENT', createdAt: new Date().toISOString() }); navigate('/buyer/offers'); }; return <Card className="p-6"><h1 className="h2 text-[#14532D]">{lot.crop} · {lot.quantity.toLocaleString()} kg</h1><p className="body-base">Grade {lot.qualityGrade} · {lot.district}</p><h2 className="h3 mt-6">Match with your requirement</h2><p className="body-small">Quality compatible ✓ · {lot.quantity < requirement.quantityRequired ? 'Partial fulfillment — potential FPO aggregation may help.' : 'Full fulfillment.'}</p><Button className="mt-6" onClick={makeOffer}>Make Offer</Button></Card>; };
export const BuyerOffersPage: React.FC = () => { const { offers, service } = useMarketplace(); const navigate = useNavigate(); const [filter, setFilter] = useState('ALL'); const visible = filter === 'ALL' ? offers : offers.filter((offer) => offer.status === filter); const tabs = ['ALL','SENT','ACCEPTED','REJECTED','EXPIRED']; const statusVariant = (status: string) => status === 'ACCEPTED' ? 'success' : status === 'SENT' ? 'warning' : status === 'REJECTED' ? 'error' : 'info'; const crop = (id: string) => id.includes('POTATO') ? 'Potato' : 'Onion'; return <div className={offerStyles.page}><div className={offerStyles.header}><div><h1 className="h2 text-[#14532D]">Offers</h1><p className="body-base">Manage offers sent to farmers and FPOs.</p></div><Button variant="secondary" onClick={() => navigate('/buyer/matching-lots')}>View Matching Lots</Button></div><div className={offerStyles.tabs}>{tabs.map((tab) => <button key={tab} className={`${offerStyles.tab} ${filter === tab ? offerStyles.tabActive : ''}`} onClick={() => setFilter(tab)}>{tab === 'ALL' ? 'All' : tab[0] + tab.slice(1).toLowerCase()} ({tab === 'ALL' ? offers.length : offers.filter((offer) => offer.status === tab).length})</button>)}</div>{visible.length ? <div className={offerStyles.list}>{visible.map((offer) => { const name = crop(offer.lotId); const accepted = offer.status === 'ACCEPTED'; const rejected = offer.status === 'REJECTED'; return <article key={offer.id} className={offerStyles.card}><div className={offerStyles.top}><div className={offerStyles.avatar}>{name === 'Onion' ? '🧅' : '🥔'}</div><div className={offerStyles.heading}><h2>{offer.id} · {name}</h2><p>{offer.quantity.toLocaleString()} kg · Grade A/B · Nashik, Maharashtra</p><span className={offerStyles.source}>Farmer Lot · {offer.lotId}</span></div><Badge variant={statusVariant(offer.status)} className={offerStyles.status}>{offer.status}</Badge></div><div className={offerStyles.grid}><div className={offerStyles.field}><span>Offer price</span><strong>₹{offer.pricePerQuintal}/q</strong></div><div className={offerStyles.field}><span>Estimated value</span><strong>₹{offer.estimatedTotalValue.toLocaleString()}</strong></div><div className={offerStyles.field}><span>Payment</span><strong>{offer.paymentTimelineDays} days</strong></div><div className={offerStyles.field}><span>Requirement</span><strong>{offer.requirementId}</strong></div></div><div className={offerStyles.footer}><span className={offerStyles.note}>{accepted ? 'Farmer accepted your offer ✓' : rejected ? 'Farmer declined this offer.' : offer.status === 'EXPIRED' ? 'This offer expired before a response.' : 'Waiting for Farmer response'}</span><div className={offerStyles.actions}>{accepted ? <Button onClick={() => navigate('/buyer/transactions')}>View Transaction</Button> : <><Button variant="secondary" onClick={() => { if (window.confirm('Delete this offer?')) service.deleteOffer(offer.id); }} className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300" title="Delete Offer"><Trash2 size={16} /></Button><Button variant="secondary" onClick={() => navigate(`/buyer/lots/${offer.lotId}?requirementId=${offer.requirementId}`)}>View Offer</Button>{!rejected && <Button variant="primary" onClick={() => navigate(`/buyer/lots/${offer.lotId}?requirementId=${offer.requirementId}`)}>View Lot</Button>}</>}</div></div></article>; })}</div> : <Card className={offerStyles.empty}><h2 className="h3">No offers yet</h2><p className="body-base">Find matching Farmer/FPO lots and send your first offer.</p><Button className="mt-6" onClick={() => navigate('/buyer/matching-lots')}>View Matching Lots</Button></Card>}</div>; };
export const BuyerTransactionsPage: React.FC = () => { 
  const { transactions } = useMarketplace(); 
  const [payingTxn, setPayingTxn] = useState<any>(null);
  const [successTxn, setSuccessTxn] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <h1 className="h2 mb-6 text-[#14532D]">Purchase Transactions</h1>
      {transactions.length ? (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <Card key={txn.id} className="p-0 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Transaction ID</div>
                  <div className="font-mono text-gray-900">{txn.id}</div>
                </div>
                <div className="text-right">
                  <Badge variant={txn.transactionStatus === 'COMPLETED' ? 'success' : 'info'}>
                    {txn.transactionStatus}
                  </Badge>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Produce</span>
                    <span className="font-bold text-gray-900">{txn.quantity.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Value</span>
                    <span className="font-bold text-gray-900 font-mono">₹{txn.totalValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Status</span>
                    <span className={`font-bold ${txn.paymentStatus === 'RECEIVED' || txn.paymentStatus === 'CONFIRMED' ? 'text-green-600' : 'text-amber-600'}`}>
                      {txn.paymentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end justify-center md:border-l md:border-gray-100 md:pl-4">
                  {(txn.paymentStatus === 'PENDING' || txn.transactionStatus === 'PAYMENT_PENDING') && successTxn !== txn.id ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setPayingTxn(txn)}
                    >
                      Pay Now
                    </Button>
                  ) : (
                    <div className="text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-200 text-sm font-bold flex items-center gap-2 w-full justify-center">
                      <CheckCircle2 size={16} /> Payment Received
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-gray-500">
          No transactions found.
        </Card>
      )}

      {payingTxn && (
        <PaymentModal 
          transaction={payingTxn} 
          onClose={() => setPayingTxn(null)} 
          onSuccess={() => {
            setSuccessTxn(payingTxn.id);
            setPayingTxn(null);
          }}
        />
      )}
    </div>
  ); 
};
export const BuyerLotRoute: React.FC = () => { const { lotId = '' } = useParams(); return <BuyerLotDetailPage lotId={lotId} />; };
export const BuyerRequirementCreatePage: React.FC = () => {
  const { service } = useMarketplace(); const navigate = useNavigate(); const [step, setStep] = useState(1); const [published, setPublished] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState({ crop: '', quantityRequired: '', unit: 'KG', requiredBy: '', minimum: '', grades: [] as Array<'A' | 'B' | 'C'>, location: '', radius: '100', deliveryLocation: '', deliveryPreference: 'FLEXIBLE' as const, price: '', payment: '3', notes: '', publish: true });
  const update = (changes: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...changes }));
  const toggleGrade = (grade: 'A' | 'B' | 'C') => update({ grades: draft.grades.includes(grade) ? draft.grades.filter((item) => item !== grade) : [...draft.grades, grade] });
  const publish = async () => { setLoading(true); try { const saved = await service.createRequirement({ id: '', buyerId: 'BUYER-001', crop: draft.crop, quantityRequired: Number(draft.quantityRequired), quantityUnit: draft.unit as 'KG' | 'QUINTAL', minimumAcceptableLotQuantity: Number(draft.minimum), acceptedQualityGrades: draft.grades, district: draft.deliveryLocation || draft.location, state: 'Maharashtra', maximumSourcingRadiusKm: Number(draft.radius), paymentTimelineDays: Number(draft.payment), deliveryPreference: draft.deliveryPreference, pricePerQuintal: Number(draft.price) || 2400, status: draft.publish ? 'ACTIVE' : 'DRAFT', createdAt: new Date().toISOString() }); setPublished(saved.id); } finally { setLoading(false); } };
  if (published) return <Card className="p-8"><h1 className="h2 text-[#14532D]">Requirement Published ✓</h1><p className="body-base mt-4">{published} is now searching available Farmer/FPO lots.</p><div className="flex gap-3 mt-6"><Button onClick={() => navigate(`/buyer/matching-lots?requirementId=${published}`)}>View Matching Lots</Button><Button variant="secondary" onClick={() => navigate('/buyer/dashboard')}>Go to Dashboard</Button></div></Card>;
  const input = 'w-full p-4 rounded-xl border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white';
  return <div className="max-w-3xl mx-auto pb-24"><h1 className="h2 mb-8 text-[#14532D]">Create Buying Requirement</h1><div className="flex items-center justify-between mb-10">{['Produce','Quantity & Quality','Location','Commercial Terms','Review'].map((label, index) => <div key={label} className="flex flex-col items-center gap-2"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= index + 1 ? 'bg-brand-primary text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>{index + 1}</div><span className="text-xs font-bold">{label}</span></div>)}</div><Card className="p-6 md:p-8">
    {step === 1 && <div className="space-y-6"><h2 className="h3">What do you want to buy?</h2><input className={input} placeholder="Crop" value={draft.crop} onChange={(e) => update({ crop: e.target.value })}/><div className="grid grid-cols-2 gap-4"><input className={input} type="number" placeholder="Quantity required" value={draft.quantityRequired} onChange={(e) => update({ quantityRequired: e.target.value })}/><select className={input} value={draft.unit} onChange={(e) => update({ unit: e.target.value })}><option>KG</option><option>QUINTAL</option></select></div><input className={input} type="date" value={draft.requiredBy} onChange={(e) => update({ requiredBy: e.target.value })}/></div>}
    {step === 2 && <div className="space-y-6"><h2 className="h3">Quantity & Quality</h2><input className={input} type="number" placeholder="Minimum acceptable lot quantity" value={draft.minimum} onChange={(e) => update({ minimum: e.target.value })}/><div className="flex gap-4">{(['A','B','C'] as const).map((grade) => <label key={grade} className="flex items-center gap-2"><input type="checkbox" checked={draft.grades.includes(grade)} onChange={() => toggleGrade(grade)}/>Grade {grade}</label>)}</div></div>}
    {step === 3 && <div className="space-y-4"><h2 className="h3">Location</h2><input className={input} placeholder="Preferred location" value={draft.location} onChange={(e) => update({ location: e.target.value })}/><input className={input} type="number" placeholder="Maximum radius (km)" value={draft.radius} onChange={(e) => update({ radius: e.target.value })}/><input className={input} placeholder="Delivery location" value={draft.deliveryLocation} onChange={(e) => update({ deliveryLocation: e.target.value })}/><select className={input} value={draft.deliveryPreference} onChange={(e) => update({ deliveryPreference: e.target.value as typeof draft.deliveryPreference })}><option value="BUYER_PICKUP">Buyer Pickup</option><option value="SELLER_DELIVERY">Seller Delivery</option><option value="FLEXIBLE">Flexible</option></select></div>}
    {step === 4 && <div className="space-y-4"><h2 className="h3">Commercial Terms</h2><input className={input} type="number" placeholder="Offered price per quintal" value={draft.price} onChange={(e) => update({ price: e.target.value })}/><select className={input} value={draft.payment} onChange={(e) => update({ payment: e.target.value })}><option value="0">Same Day</option><option value="3">Within 3 Days</option><option value="7">Within 7 Days</option></select><textarea className={input} placeholder="Notes (optional)" value={draft.notes} onChange={(e) => update({ notes: e.target.value })}/><label className="flex gap-2"><input type="checkbox" checked={draft.publish} onChange={(e) => update({ publish: e.target.checked })}/>Publish immediately</label></div>}
    {step === 5 && <div><h2 className="h3">Review requirement</h2><p className="body-base mt-4">{draft.crop} · {draft.quantityRequired} {draft.unit} · Grade {draft.grades.join('/')} · {draft.location} · {draft.radius} km · Payment within {draft.payment} days</p></div>}
    <div className="mt-10 flex justify-between"><Button variant="secondary" onClick={() => step === 1 ? navigate('/buyer/requirements') : setStep(step - 1)}>Back</Button>{step < 5 ? <Button disabled={(step === 1 && (!draft.crop || !draft.quantityRequired || !draft.requiredBy)) || (step === 2 && (!draft.minimum || !draft.grades.length))} onClick={() => setStep(step + 1)}>Continue</Button> : <Button disabled={loading} onClick={publish}>{loading ? 'Publishing...' : draft.publish ? 'Publish Requirement' : 'Save Draft'}</Button>}</div>
  </Card></div>;
};
