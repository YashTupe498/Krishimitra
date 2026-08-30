import os
import csv
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.ingestion.market.importer import DatasetImporter

def main():
    print("Starting import pipeline...")
    
    # 1. Read files
    prices_path = "backend/market_prices_normalized.csv"
    arrivals_path = "backend/arrivals_trends.csv"
    
    with open(prices_path, 'r', encoding='utf-8') as f:
        price_rows = list(csv.DictReader(f))
        
    with open(arrivals_path, 'r', encoding='utf-8') as f:
        arrival_rows = list(csv.DictReader(f))
        
    print(f"Loaded {len(price_rows)} price rows.")
    print(f"Loaded {len(arrival_rows)} arrival rows.")
    
    # 2. Map arrivals by (date, market, commodity)
    arrival_map = {}
    for r in arrival_rows:
        key = (r['date'].strip(), r['market'].strip().lower(), r['commodity'].strip().lower())
        arrival_map[key] = r
        
    # 3. Join
    joined_rows = []
    unmatched_prices = 0
    successful_joins = 0
    
    for pr in price_rows:
        key = (pr['date'].strip(), pr['market_name'].strip().lower(), pr['standard_commodity'].strip().lower())
        
        row = {
            "crop": pr['standard_commodity'],
            "market_name": pr['market_name'],
            "district": pr['district'],
            "state": pr['state'],
            "observation_date": datetime.strptime(pr['date'], '%Y-%m-%d').date(),
            "min_price": float(pr['min_price']) if pr['min_price'] else None,
            "modal_price": float(pr['modal_price']) if pr['modal_price'] else None,
            "max_price": float(pr['max_price']) if pr['max_price'] else None,
            "price_unit": pr['standard_unit'],
            "source_name": pr['source'],
        }
        
        arr = arrival_map.get(key)
        if arr:
            successful_joins += 1
            row['arrival_quantity'] = float(arr['arrivals_quantity']) if arr.get('arrivals_quantity') else None
            row['arrival_unit'] = arr.get('unit', 'Quintal')
        else:
            unmatched_prices += 1
            row['arrival_quantity'] = None
            row['arrival_unit'] = None
            
        joined_rows.append(row)

    print(f"Successful joins: {successful_joins}")
    print(f"Unmatched price rows: {unmatched_prices}")
    
    # 4. Import
    db = SessionLocal()
    try:
        importer = DatasetImporter(db)
        result = importer.process_and_import(joined_rows, source_type="INGESTED")
        print("\nImport Results:")
        print(f"Total Rows: {result['total_rows']}")
        print(f"Valid Rows: {result['valid_rows']}")
        print(f"Invalid Rows: {result['invalid_rows']}")
        print(f"Imported Rows (non-duplicate): {result['imported_rows']}")
        if result['errors']:
            print("Errors:", result['errors'])
    finally:
        db.close()

if __name__ == '__main__':
    main()
