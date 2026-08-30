#!/usr/bin/env python3
"""Fetch daily mandi prices from data.gov.in / AGMARKNET.
Set DATA_GOV_API_KEY in your environment. Output is intentionally kept separate from curated demo data.
"""
import os, requests, csv
from pathlib import Path
API_KEY=os.environ["DATA_GOV_API_KEY"]
URL="https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
params={"api-key":API_KEY,"format":"json","limit":100,"filters[state]":"Maharashtra","filters[commodity]":"Onion"}
r=requests.get(URL,params=params,timeout=30);r.raise_for_status();data=r.json().get("records",[])
out=Path(__file__).resolve().parents[1]/"raw/agmarknet/official_maharashtra_onion_latest.json"
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(__import__("json").dumps(data,indent=2))
print(f"Saved {len(data)} records to {out}")
