import unittest
from datetime import date, timedelta
from app.modules.market_intelligence.services.freshness import calculate_freshness
from app.modules.market_intelligence.services.analytics import analyze_trend, analyze_pressure, analyze_sale_window
from app.modules.market_intelligence.schemas import MarketTrendSchema, MarketPressureSchema
from app.modules.market_intelligence.models import MarketObservation

class TestAnalytics(unittest.TestCase):
    
    def test_freshness(self):
        today = date.today()
        self.assertEqual(calculate_freshness(today, today), 'CURRENT')
        self.assertEqual(calculate_freshness(today - timedelta(days=2), today), 'CURRENT')
        self.assertEqual(calculate_freshness(today - timedelta(days=5), today), 'STALE')
        self.assertEqual(calculate_freshness(today - timedelta(days=10), today), 'OUTDATED')
        self.assertEqual(calculate_freshness(None, today), 'OUTDATED')

    def test_analyze_trend_up(self):
        obs1 = MarketObservation(modal_price=2500)
        obs2 = MarketObservation(modal_price=2400)
        trend = analyze_trend([obs1, obs2])
        self.assertEqual(trend.direction, "UP")
        self.assertEqual(trend.price_change, 100)
        
    def test_analyze_trend_down(self):
        obs1 = MarketObservation(modal_price=2300)
        obs2 = MarketObservation(modal_price=2400)
        trend = analyze_trend([obs1, obs2])
        self.assertEqual(trend.direction, "DOWN")
        self.assertEqual(trend.price_change, -100)
        
    def test_analyze_trend_insufficient(self):
        obs1 = MarketObservation(modal_price=2500)
        trend = analyze_trend([obs1])
        self.assertEqual(trend.direction, "INSUFFICIENT_DATA")

    def test_analyze_pressure_high(self):
        # Current arrival is 150, past 3 are 100
        obs1 = MarketObservation(arrival_quantity=150)
        obs2 = MarketObservation(arrival_quantity=100)
        obs3 = MarketObservation(arrival_quantity=100)
        obs4 = MarketObservation(arrival_quantity=100)
        trend = MarketTrendSchema(direction="STABLE", price_change=0, percentage_change=0)
        pressure = analyze_pressure([obs1, obs2, obs3, obs4], trend)
        self.assertEqual(pressure.pressure, "HIGH")

    def test_analyze_sale_window(self):
        trend = MarketTrendSchema(direction="UP", price_change=100, percentage_change=5)
        pressure = MarketPressureSchema(pressure="LOW", reasons=[])
        window = analyze_sale_window(trend, pressure)
        self.assertEqual(window.window, "FAVORABLE_NOW")

if __name__ == '__main__':
    unittest.main()
