import unittest
from datetime import date
from pydantic import ValidationError
from app.ingestion.market.validator import RawMarketRecord

class TestValidation(unittest.TestCase):
    
    def test_valid_record(self):
        record = RawMarketRecord(
            crop="Onion",
            market_name="Nashik",
            district="Nashik",
            state="Maharashtra",
            observation_date=date(2023, 10, 1),
            min_price=1000,
            modal_price=1200,
            max_price=1500,
            price_unit="Rs/Quintal",
            arrival_quantity=500,
            arrival_unit="Tonnes",
            source_name="Gov Dataset"
        )
        self.assertEqual(record.crop, "Onion")
        
    def test_invalid_negative_price(self):
        with self.assertRaises(ValidationError):
            RawMarketRecord(
                crop="Onion",
                market_name="Nashik",
                district="Nashik",
                state="Maharashtra",
                observation_date=date(2023, 10, 1),
                min_price=-100,
                modal_price=1200,
                max_price=1500,
                price_unit="Rs/Quintal",
                source_name="Gov Dataset"
            )

    def test_invalid_min_max_relation(self):
        with self.assertRaises(ValidationError):
            RawMarketRecord(
                crop="Onion",
                market_name="Nashik",
                district="Nashik",
                state="Maharashtra",
                observation_date=date(2023, 10, 1),
                min_price=2000,
                modal_price=1200,
                max_price=1500,  # Max < Min
                price_unit="Rs/Quintal",
                source_name="Gov Dataset"
            )

if __name__ == '__main__':
    unittest.main()
