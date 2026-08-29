from app.ingestion.market.validator import RawMarketRecord

def normalize_record(record: RawMarketRecord) -> RawMarketRecord:
    """
    Deterministically normalizes data.
    E.g. standardizing crop names, units, capitalization.
    """
    record.crop = record.crop.strip().title()
    record.market_name = record.market_name.strip().title()
    record.district = record.district.strip().title()
    record.state = record.state.strip().title()
    record.price_unit = record.price_unit.strip().lower()
    
    if record.arrival_unit:
        record.arrival_unit = record.arrival_unit.strip().lower()
        
    return record
