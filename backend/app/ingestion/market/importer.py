from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from pydantic import ValidationError
from app.ingestion.market.validator import RawMarketRecord
from app.ingestion.market.normalizer import normalize_record
from app.modules.market_intelligence.models import MarketObservation

class DatasetImporter:
    def __init__(self, db: Session):
        self.db = db
        
    def process_and_import(self, raw_rows: List[Dict[str, Any]], source_type: str = "CURATED") -> Dict[str, Any]:
        valid_rows = 0
        invalid_rows = 0
        imported_rows = 0
        errors = []
        
        for idx, row in enumerate(raw_rows):
            try:
                # 1. Validate
                record = RawMarketRecord(**row)
                
                # 2. Normalize
                record = normalize_record(record)
                valid_rows += 1
                
                # 3. Duplicate Check
                exists = self.db.query(MarketObservation).filter(
                    MarketObservation.crop == record.crop,
                    MarketObservation.market_name == record.market_name,
                    MarketObservation.observation_date == record.observation_date,
                    MarketObservation.source_name == record.source_name
                ).first()
                
                if not exists:
                    # 4. Import
                    obs = MarketObservation(
                        crop=record.crop,
                        market_name=record.market_name,
                        district=record.district,
                        state=record.state,
                        observation_date=record.observation_date,
                        min_price=record.min_price,
                        modal_price=record.modal_price,
                        max_price=record.max_price,
                        price_unit=record.price_unit,
                        arrival_quantity=record.arrival_quantity,
                        arrival_unit=record.arrival_unit,
                        source_name=record.source_name,
                        source_type=source_type
                    )
                    self.db.add(obs)
                    imported_rows += 1
                    
            except ValidationError as e:
                invalid_rows += 1
                errors.append({"row_index": idx, "errors": e.errors()})
                
        # Commit all valid, non-duplicate records
        if imported_rows > 0:
            self.db.commit()
            
        return {
            "total_rows": len(raw_rows),
            "valid_rows": valid_rows,
            "invalid_rows": invalid_rows,
            "imported_rows": imported_rows,
            "errors": errors[:50]  # Return up to 50 errors in report
        }
