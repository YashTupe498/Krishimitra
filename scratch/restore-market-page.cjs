const fs = require('fs');

const file = 'src/pages/farmer/MarketIntelligencePage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import \{\s*Calendar,\s*Package, RefreshCw,\s*Database, CheckCircle2\s*\} from 'lucide-react';/,
  `import { 
  Calendar, 
  Package, RefreshCw, Activity,
  Database, Truck, Box, Lightbulb, MessageSquare, Target, ShoppingBag, Star, Bell, ShieldCheck, CheckCircle2, AlertCircle, TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';`
);

content = content.replace(/val: any/g, 'val: string | number'); // Fix implicit any just in case

fs.writeFileSync(file, content, 'utf8');
console.log('Restored imports');
