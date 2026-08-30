import { useCallback, useEffect, useState } from 'react';
import { buyerMarketplaceApi } from '../services/buyerMarketplaceApi';
import type { BuyerRequirement, MarketplaceTransaction, Offer } from '../types/marketplace';

export const useMarketplace = () => {
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]); const [offers, setOffers] = useState<Offer[]>([]); const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
  const refreshBuyer = useCallback(async () => { setRequirements(await buyerMarketplaceApi.getRequirements()); setOffers(await buyerMarketplaceApi.getOffersByBuyer()); setTransactions(await buyerMarketplaceApi.getTransactionsByBuyer()); }, []);
  const refreshFarmer = useCallback(async () => { setOffers(await buyerMarketplaceApi.getOffersByFarmer()); setTransactions(await buyerMarketplaceApi.getTransactionsByFarmer()); }, []);
  useEffect(() => { refreshBuyer(); const update = () => refreshBuyer(); window.addEventListener('krishimitra_marketplace_updated', update); return () => window.removeEventListener('krishimitra_marketplace_updated', update); }, [refreshBuyer]);
  return { requirements, offers, transactions, refreshBuyer, refreshFarmer, service: buyerMarketplaceApi };
};
