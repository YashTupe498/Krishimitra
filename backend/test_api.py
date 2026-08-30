import jwt
import os
from fastapi.testclient import TestClient
from dotenv import load_dotenv
from app.main import app
from app.db.session import SessionLocal
from app.modules.lots.models import Lot

load_dotenv('backend/.env')

client = TestClient(app)

def test_api():
    db = SessionLocal()
    # 1. Create a dummy lot for testing
    farmer_id = "00000000-0000-0000-0000-000000000001"
    lot_id = "test-lot-123"
    
    existing_lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not existing_lot:
        lot = Lot(
            id=lot_id,
            farmer_id=farmer_id,
            crop="Onion",
            quantity="5000",
            unit="kg",
            district="Nashik",
            state="Maharashtra"
        )
        db.add(lot)
        db.commit()

    # 2. Generate Mock JWT
    secret = os.environ.get('SUPABASE_JWT_SECRET')
    token = jwt.encode({"sub": farmer_id, "role": "authenticated"}, secret, algorithm="HS256")
    
    # 3. Call API
    response = client.get(
        f"/api/v1/market-intelligence/{lot_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print("Status Code:", response.status_code)
    import json
    print("Response Body:", json.dumps(response.json(), indent=2))
    
    # 4. Check Potato
    potato_lot_id = "test-lot-potato"
    existing_potato = db.query(Lot).filter(Lot.id == potato_lot_id).first()
    if not existing_potato:
        pot = Lot(
            id=potato_lot_id,
            farmer_id=farmer_id,
            crop="Potato",
            quantity="1000",
            unit="kg",
            district="Nashik",
            state="Maharashtra"
        )
        db.add(pot)
        db.commit()
        
    res_pot = client.get(
        f"/api/v1/market-intelligence/{potato_lot_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    print("\nPotato Request Status:", res_pot.status_code)
    print("Potato Response Body:", json.dumps(res_pot.json(), indent=2))

if __name__ == "__main__":
    test_api()
