(Get-Content src/pages/farmer/OpportunitiesPage.tsx) -replace 'import \{ Card, Badge \} from ''../../components/ui/Card'';', 'import { Card } from ''../../components/ui/Card'';' | Set-Content src/pages/farmer/OpportunitiesPage.tsx
npm run build
