export type MarketResearchRecord = {
  market: string;
  crop: string;
  metric: "price" | "arrival";
  value: number | null;
  unit: string;
  observationDate: string | null;
  scope: "onion" | "all_commodities";
  source: string | null;
  sourceType: "CURATED" | "CURATED_DEMO";
  status: "available" | "unavailable";
  reliabilityNotes?: string;
};

export const marketResearchDataset: MarketResearchRecord[] = [
  // PIMPALGAON BASWANT PRICES
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 4200, unit: "quintals", observationDate: "2026-08-29", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 4100, unit: "quintals", observationDate: "2026-08-27", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 4300, unit: "quintals", observationDate: "2026-08-26", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 4300, unit: "quintals", observationDate: "2026-08-25", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 4400, unit: "quintals", observationDate: "2026-08-24", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 4100, unit: "quintals", observationDate: "2026-08-22", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 3850, unit: "quintals", observationDate: "2026-08-21", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 3700, unit: "quintals", observationDate: "2026-08-20", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 3800, unit: "quintals", observationDate: "2026-08-19", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 3900, unit: "quintals", observationDate: "2026-08-18", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 3450, unit: "quintals", observationDate: "2026-08-17", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "price", value: 3200, unit: "quintals", observationDate: "2026-08-14", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  // PIMPALGAON BASWANT ARRIVALS (Declining trend)
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "arrival", value: 550, unit: "tonnes", observationDate: "2026-08-12", scope: "onion", source: "AgMart", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "arrival", value: 480, unit: "tonnes", observationDate: "2026-08-15", scope: "onion", source: "AgMart", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "arrival", value: 450, unit: "tonnes", observationDate: "2026-08-18", scope: "onion", source: "AgMart", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "arrival", value: 410, unit: "tonnes", observationDate: "2026-08-21", scope: "onion", source: "AgMart", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "arrival", value: 350, unit: "tonnes", observationDate: "2026-08-25", scope: "onion", source: "AgMart", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Pimpalgaon Baswant APMC", crop: "Onion", metric: "arrival", value: 316, unit: "tonnes", observationDate: "2026-08-29", scope: "onion", source: "AgMart", sourceType: "CURATED_DEMO", status: "available" },

  // LASALGAON PRICES
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 3650, unit: "quintals", observationDate: "2026-08-29", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 3800, unit: "quintals", observationDate: "2026-08-27", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 3950, unit: "quintals", observationDate: "2026-08-26", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 4300, unit: "quintals", observationDate: "2026-08-25", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 3600, unit: "quintals", observationDate: "2026-08-22", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 3450, unit: "quintals", observationDate: "2026-08-21", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 3450, unit: "quintals", observationDate: "2026-08-20", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 3700, unit: "quintals", observationDate: "2026-08-19", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 2900, unit: "quintals", observationDate: "2026-08-14", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 2150, unit: "quintals", observationDate: "2026-08-08", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "price", value: 2100, unit: "quintals", observationDate: "2026-08-04", scope: "onion", source: "RatesWale", sourceType: "CURATED", status: "available" },
  // LASALGAON ARRIVALS (Stable/Increasing trend)
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "arrival", value: 7500, unit: "quintals", observationDate: "2026-08-12", scope: "onion", source: "Economic Times / market officials", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "arrival", value: 7600, unit: "quintals", observationDate: "2026-08-15", scope: "onion", source: "Economic Times / market officials", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "arrival", value: 7500, unit: "quintals", observationDate: "2026-08-18", scope: "onion", source: "Economic Times / market officials", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "arrival", value: 7800, unit: "quintals", observationDate: "2026-08-21", scope: "onion", source: "Economic Times / market officials", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "arrival", value: 7900, unit: "quintals", observationDate: "2026-08-25", scope: "onion", source: "Economic Times / market officials", sourceType: "CURATED_DEMO", status: "available" },
  { market: "Lasalgaon (Vinchur) APMC", crop: "Onion", metric: "arrival", value: 8100, unit: "quintals", observationDate: "2026-08-29", scope: "onion", source: "Economic Times / market officials", sourceType: "CURATED_DEMO", status: "available" },

  // YEOLA PRICES
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 3600, unit: "quintals", observationDate: "2026-08-29", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 3600, unit: "quintals", observationDate: "2026-08-27", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 3900, unit: "quintals", observationDate: "2026-08-26", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 4200, unit: "quintals", observationDate: "2026-08-25", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 4200, unit: "quintals", observationDate: "2026-08-24", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 3725, unit: "quintals", observationDate: "2026-08-22", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 3600, unit: "quintals", observationDate: "2026-08-21", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 3200, unit: "quintals", observationDate: "2026-08-20", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 3650, unit: "quintals", observationDate: "2026-08-19", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 3150, unit: "quintals", observationDate: "2026-08-17", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 2650, unit: "quintals", observationDate: "2026-08-14", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  { market: "Yeola APMC", crop: "Onion", metric: "price", value: 2650, unit: "quintals", observationDate: "2026-08-12", scope: "onion", source: "Mandi Bhav India", sourceType: "CURATED", status: "available" },
  // YEOLA ARRIVAL (ALL COMMODITIES)
  { market: "Yeola APMC", crop: "Onion", metric: "arrival", value: 416, unit: "quintals", observationDate: "2026-08-29", scope: "all_commodities", source: "Acrop", sourceType: "CURATED", status: "available", reliabilityNotes: "Not onion-specific" },

  // MANMAD PRICES
  { market: "Manmad APMC", crop: "Onion", metric: "price", value: 3600, unit: "quintals", observationDate: "2026-08-29", scope: "onion", source: "Mandipulse", sourceType: "CURATED", status: "available" },
  { market: "Manmad APMC", crop: "Onion", metric: "price", value: 3400, unit: "quintals", observationDate: "2026-08-27", scope: "onion", source: "Mandipulse", sourceType: "CURATED", status: "available" },
  { market: "Manmad APMC", crop: "Onion", metric: "price", value: 4050, unit: "quintals", observationDate: "2026-08-25", scope: "onion", source: "Mandipulse", sourceType: "CURATED", status: "available" },
  { market: "Manmad APMC", crop: "Onion", metric: "price", value: 3800, unit: "quintals", observationDate: "2026-08-24", scope: "onion", source: "Mandipulse", sourceType: "CURATED", status: "available" },
  { market: "Manmad APMC", crop: "Onion", metric: "price", value: 3400, unit: "quintals", observationDate: "2026-08-20", scope: "onion", source: "Mandipulse", sourceType: "CURATED", status: "available" },
  // MANMAD ARRIVAL
  { market: "Manmad APMC", crop: "Onion", metric: "arrival", value: null, unit: "quintals", observationDate: null, scope: "onion", source: null, sourceType: "CURATED", status: "unavailable" }
];
