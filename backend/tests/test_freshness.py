import unittest
from datetime import date, timedelta
from app.modules.market_intelligence.services.freshness import calculate_freshness

class TestFreshness(unittest.TestCase):
    
    def test_calculate_freshness(self):
        ref_date = date(2026, 8, 29)
        
        # 0 days -> CURRENT
        self.assertEqual(calculate_freshness(ref_date, ref_date), 'CURRENT')
        # 1 day -> CURRENT
        self.assertEqual(calculate_freshness(ref_date - timedelta(days=1), ref_date), 'CURRENT')
        # 2 days -> CURRENT
        self.assertEqual(calculate_freshness(ref_date - timedelta(days=2), ref_date), 'CURRENT')
        # 3 days -> STALE
        self.assertEqual(calculate_freshness(ref_date - timedelta(days=3), ref_date), 'STALE')
        # 4 days -> STALE (2026-08-25 vs 2026-08-29)
        self.assertEqual(calculate_freshness(date(2026, 8, 25), ref_date), 'STALE')
        # 7 days -> STALE
        self.assertEqual(calculate_freshness(ref_date - timedelta(days=7), ref_date), 'STALE')
        # 8 days -> OUTDATED
        self.assertEqual(calculate_freshness(ref_date - timedelta(days=8), ref_date), 'OUTDATED')
        # missing date -> OUTDATED
        self.assertEqual(calculate_freshness(None, ref_date), 'OUTDATED')

if __name__ == '__main__':
    unittest.main()
