import os
import sqlalchemy
from dotenv import load_dotenv

load_dotenv('backend/.env')
db_url = os.getenv('DATABASE_URL')
engine = sqlalchemy.create_engine(db_url)

with open('supabase/migrations/007_buyer_demands_and_opportunities.sql', 'r') as f:
    sql = f.read()

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(sql))
    conn.commit()
    print('Migration 007 Applied successfully.')
