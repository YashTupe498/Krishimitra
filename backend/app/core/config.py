from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiMitra Backend"
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/postgres")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()
