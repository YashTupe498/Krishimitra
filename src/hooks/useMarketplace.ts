import { useCallback, useEffect, useState } from 'react';
import { marketplaceService } from '../services/mockMarketplace';
import type { BuyerRequirement, MarketplaceTransaction, Offer } from '../types/marketplace';

export const useMarketplace = () => {
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]); const [offers, setOffers] = useState<Offer[]>([]); const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
  const refreshBuyer = useCallback(async () => { setRequirements(await marketplaceService.getRequirements()); setOffers(await marketplaceService.getOffersByBuyer()); setTransactions(await marketplaceService.getTransactionsByBuyer()); }, []);
  const refreshFarmer = useCallback(async () => { setOffers(await marketplaceService.getOffersByFarmer()); setTransactions(await marketplaceService.getTransactionsByFarmer()); }, []);
  useEffect(() => { refreshBuyer(); const update = () => refreshBuyer(); window.addEventListener('krishimitra_marketplace_updated', update); return () => window.removeEventListener('krishimitra_marketplace_updated', update); }, [refreshBuyer]);
  return { requirements, offers, transactions, refreshBuyer, refreshFarmer, service: marketplaceService };
};
