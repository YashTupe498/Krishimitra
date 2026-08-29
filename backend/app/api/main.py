from fastapi import APIRouter
from app.api.routes import health

api_router = APIRouter()

from app.api.routes import market_intelligence
from app.api.routes import buyer_demands
from app.api.routes import opportunities

# Register core endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(market_intelligence.router, prefix="/market-intelligence", tags=["market-intelligence"])
api_router.include_router(buyer_demands.router, prefix="/buyer/demands", tags=["buyer-demands"])
api_router.include_router(opportunities.router, prefix="/farmer/opportunities", tags=["opportunities"])

# Future route registrations (do not implement logic yet, just placeholders)
# api_router.include_router(lots.router, prefix="/lots", tags=["lots"])
# api_router.include_router(markets.router, prefix="/markets", tags=["markets"])
# api_router.include_router(quality.router, prefix="/quality", tags=["quality"])
# api_router.include_router(buyers.router, prefix="/buyers", tags=["buyers"])
# api_router.include_router(decisions.router, prefix="/decisions", tags=["decisions"])
# api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
# api_router.include_router(logistics.router, prefix="/logistics", tags=["logistics"])
# api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
