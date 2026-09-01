const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. GrievanceDetails.tsx
replaceInFile('src/components/farmer/grievances/GrievanceDetails.tsx', [
  { search: /import { ChevronLeft, Calendar, FileText, Bot, AlertTriangle, Clock, CheckCircle2, Navigation } from 'lucide-react';/, replace: "import { ChevronLeft, FileText, Bot, Clock, CheckCircle2, Navigation } from 'lucide-react';" },
  { search: /import { Grievance } from '\.\.\/\.\.\/\.\.\/types\/grievance';/, replace: "import type { Grievance } from '../../../types/grievance';" },
  { search: /import { format } from 'date-fns';\n/, replace: "" },
  { search: /format\(new Date\(grievance.createdAt\), 'dd MMM yyyy'\)/g, replace: "new Date(grievance.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })" },
  { search: /format\(new Date\(event.timestamp\), 'dd MMM yyyy'\)/g, replace: "new Date(event.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })" }
]);

// 2. GrievanceForm.tsx
replaceInFile('src/components/farmer/grievances/GrievanceForm.tsx', [
  { search: /import { GrievanceCategory, GrievancePriority } from '\.\.\/\.\.\/\.\.\/types\/grievance';/, replace: "import type { GrievanceCategory, GrievancePriority } from '../../../types/grievance';" },
  { search: /variant="outline"/g, replace: 'variant="secondary"' },
  { search: /        location: 'Nashik District, Maharashtra', \/\/ Demo hardcode\n        createdAt: new Date\(\)\.toISOString\(\),\n        updatedAt: new Date\(\)\.toISOString\(\),\n        evidence: evidence\.map\(f => f\.name\),\n        classificationSummary,\n        classificationReasons,\n        details,\n        timeline: \[/, 
    replace: "        farmerId: userId,\n        location: 'Nashik District, Maharashtra', // Demo hardcode\n        createdAt: new Date().toISOString(),\n        updatedAt: new Date().toISOString(),\n        evidence: evidence.map(f => f.name),\n        classificationSummary,\n        classificationReasons,\n        details,\n        timeline: [" 
  }
]);

// 3. GrievanceList.tsx
replaceInFile('src/components/farmer/grievances/GrievanceList.tsx', [
  { search: /import { Grievance, GrievancePriority, GrievanceStatus } from '\.\.\/\.\.\/\.\.\/types\/grievance';/, replace: "import type { Grievance, GrievancePriority, GrievanceStatus } from '../../../types/grievance';" },
  { search: /import { format } from 'date-fns';\n/, replace: "" },
  { search: /format\(new Date\(grievance.updatedAt\), 'dd MMM yyyy, HH:mm'\)/g, replace: "new Date(grievance.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })" }
]);

// 4. IssueCategories.tsx
replaceInFile('src/components/farmer/grievances/IssueCategories.tsx', [
  { search: /import { GrievanceCategory } from '\.\.\/\.\.\/\.\.\/types\/grievance';/, replace: "import type { GrievanceCategory } from '../../../types/grievance';" }
]);

// 5. grievanceDemoData.ts
replaceInFile('src/data/grievanceDemoData.ts', [
  { search: /import { Grievance } from '\.\.\/types\/grievance';/, replace: "import type { Grievance } from '../types/grievance';" }
]);

// 6. IssuesGrievancesPage.tsx
replaceInFile('src/pages/farmer/IssuesGrievancesPage.tsx', [
  { search: /import { RefreshCw, FileText, Activity, MessageCircle, Mic, Sprout, TrendingUp, Handshake, Wallet, Landmark, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';/, replace: "import { RefreshCw, Activity, ShieldCheck } from 'lucide-react';" },
  { search: /import { Grievance } from '\.\.\/\.\.\/types\/grievance';/, replace: "import type { Grievance } from '../../types/grievance';" },
  { search: /import { useAuth } from '\.\.\/\.\.\/features\/auth\/hooks\/useAuth';/, replace: "import { useAuth } from '../../app/providers/AuthProvider';" },
  { search: /  const premiumCard = "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow duration-200 relative overflow-hidden";\n  const premiumHeader = "text-\\[10px\\] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2";\n/, replace: "" }
]);

// 7. grievanceDemoService.ts
replaceInFile('src/services/grievanceDemoService.ts', [
  { search: /import { Grievance } from '\.\.\/types\/grievance';/, replace: "import type { Grievance } from '../types/grievance';" }
]);

console.log('Fixes applied successfully!');
