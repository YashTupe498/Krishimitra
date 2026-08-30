import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv('backend/.env')
db_url = os.getenv('DATABASE_URL')
engine = create_engine(db_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# We need to simulate the Buyer and Farmer flow.
buyer = db.execute(text("SELECT id FROM profiles WHERE role = 'BUYER' LIMIT 1")).fetchone()
farmer = db.execute(text("SELECT id FROM profiles WHERE role = 'FARMER' LIMIT 1")).fetchone()

if not buyer or not farmer:
    print("Could not find buyer or farmer profiles.")
    sys.exit(1)

buyer_id = str(buyer[0])
farmer_id = str(farmer[0])

# 1. Create a dummy Farmer Lot
lot_id = "test-lot-001"
db.execute(text("DELETE FROM opportunities WHERE lot_id = :id"), {'id': lot_id})
db.execute(text("DELETE FROM buyer_demands WHERE crop = 'Onion' AND required_quantity = 5000"))
db.execute(text("DELETE FROM lots WHERE id = :id"), {'id': lot_id})
db.commit()

db.execute(text("""
    INSERT INTO lots (id, farmer_id, crop, quantity, unit, district, status, quality_grade, constraints)
    VALUES (:id, :fid, 'Onion', '5,000', 'kg', 'Nashik', 'DECISION_READY', 'A', '{"payment_requirement": "7_DAYS"}')
"""), {'id': lot_id, 'fid': farmer_id})
db.commit()
print("Farmer lot created.")

from app.modules.opportunities.services.matching import match_lot_to_demands, match_demand_to_lots
from app.modules.opportunities.models import BuyerDemand

# Create demand
new_demand = BuyerDemand(
    buyer_id=buyer_id,
    crop='Onion',
    required_quantity=5000,
    required_quality_grade='A',
    delivery_location='Nashik',
    status='ACTIVE'
)
db.add(new_demand)
db.commit()
db.refresh(new_demand)

print(f"Demand created: {new_demand.id}")

match_demand_to_lots(db, new_demand.id)

opp = db.execute(text("SELECT * FROM opportunities WHERE demand_id = :did AND lot_id = :lid"), {'did': new_demand.id, 'lid': lot_id}).fetchone()

if opp:
    print(f"SUCCESS: Opportunity created with status {opp.match_status}!")
else:
    print("FAILED: Opportunity not created.")
