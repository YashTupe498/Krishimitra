(Get-Content src/layouts/BuyerLayout/index.tsx) -replace 'variant="outline"', 'variant="secondary"' | Set-Content src/layouts/BuyerLayout/index.tsx

(Get-Content src/pages/buyer/CreateDemandPage.tsx) -replace 'onChange=\{handleChange\}', 'onChange={(e) => handleChange(e as any)}' | Set-Content src/pages/buyer/CreateDemandPage.tsx

(Get-Content src/pages/buyer/DemandsPage.tsx) -replace 'import \{ BuyerDemand \}', 'import type { BuyerDemand }' | Set-Content src/pages/buyer/DemandsPage.tsx

(Get-Content src/pages/farmer/OpportunitiesPage.tsx) -replace 'import \{ Opportunity \}', 'import type { Opportunity }' -replace 'import \{ Card \}', 'import { Card, Badge }' | Set-Content src/pages/farmer/OpportunitiesPage.tsx

(Get-Content src/pages/farmer/OpportunityDetailsPage.tsx) -replace 'import \{ Opportunity \}', 'import type { Opportunity }' | Set-Content src/pages/farmer/OpportunityDetailsPage.tsx

