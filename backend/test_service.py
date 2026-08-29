import sys
import traceback
from app.db.session import SessionLocal
from app.modules.market_intelligence.services.service import MarketIntelligenceService
from app.modules.market_intelligence.providers import DatasetMarketDataProvider

try:
    db = SessionLocal()
    provider = DatasetMarketDataProvider()
    service = MarketIntelligenceService(provider)
    resp = service.get_intelligence_for_lot(db, 'lot-mock', 'farmer-123', mock_crop='Onion', mock_district='Nashik', mock_state='Maharashtra')
    print('SUCCESS:', resp.snapshot.market_name if resp.snapshot else 'NO SNAPSHOT')
except Exception as e:
    print('ERROR TRACEBACK:')
    traceback.print_exc()
finally:
    db.close()
