from fastapi import APIRouter
from app.api.routes import health

api_router = APIRouter()

from app.api.routes import market_intelligence
from app.api.routes import buyer_demands
from app.api.routes import opportunities
from app.api.routes import farmer_lots
from app.api.routes import buyer_offers
from app.api.routes import transactions
from app.api.routes import quality
from app.api.routes import profiles
from app.api.routes import grievances
from app.api.routes import dashboards

# Register core endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(market_intelligence.router, prefix="/market-intelligence", tags=["market-intelligence"])
api_router.include_router(buyer_demands.router, prefix="/buyer/demands", tags=["buyer-demands"])
api_router.include_router(opportunities.router, prefix="/farmer/opportunities", tags=["opportunities"])
api_router.include_router(farmer_lots.router, prefix="/farmer/lots", tags=["farmer-lots"])
api_router.include_router(buyer_offers.router, prefix="/buyer/offers", tags=["buyer-offers"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(quality.router, prefix="/quality", tags=["quality"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(grievances.router, prefix="/grievances", tags=["grievances"])
api_router.include_router(dashboards.router, prefix="/dashboards", tags=["dashboards"])

# Future route registrations (do not implement logic yet, just placeholders)
# api_router.include_router(lots.router, prefix="/lots", tags=["lots"])
# api_router.include_router(markets.router, prefix="/markets", tags=["markets"])
# api_router.include_router(quality.router, prefix="/quality", tags=["quality"])
# api_router.include_router(buyers.router, prefix="/buyers", tags=["buyers"])
# api_router.include_router(decisions.router, prefix="/decisions", tags=["decisions"])
# api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
# api_router.include_router(logistics.router, prefix="/logistics", tags=["logistics"])
# api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
