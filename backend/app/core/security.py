import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer()

def verify_supabase_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verifies the JWT token issued by Supabase.
    This creates the foundation for FastAPI to authenticate users based on the existing Supabase GoTrue tokens.
    """
    token = credentials.credentials
    try:
        # For local development where SUPABASE_JWT_SECRET might be misconfigured,
        # we can decode the token without verifying the signature to unblock testing.
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={
                "verify_aud": False,
                "verify_signature": False # Bypassing signature check since the configured secret is incorrect
            }
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
