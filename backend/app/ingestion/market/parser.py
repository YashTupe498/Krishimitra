import csv
from typing import List, Dict, Any
from io import StringIO
import json

def parse_csv(file_contents: str) -> List[Dict[str, Any]]:
    reader = csv.DictReader(StringIO(file_contents))
    rows = []
    for row in reader:
        # Basic type conversions before Pydantic validation
        parsed_row = dict(row)
        for key in ['min_price', 'modal_price', 'max_price', 'arrival_quantity']:
            if parsed_row.get(key) in (None, '', 'NA', 'null'):
                parsed_row[key] = None
            else:
                try:
                    parsed_row[key] = float(parsed_row[key])
                except ValueError:
                    parsed_row[key] = None
        rows.append(parsed_row)
    return rows

def parse_json(file_contents: str) -> List[Dict[str, Any]]:
    return json.loads(file_contents)
