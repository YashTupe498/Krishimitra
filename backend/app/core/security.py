from functools import lru_cache

import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer()


@lru_cache
def supabase_jwks_client() -> jwt.PyJWKClient:
    """Resolve Supabase's public signing keys once and cache them locally."""
    if not settings.SUPABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server authentication is not configured",
        )
    return jwt.PyJWKClient(f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json")


def verify_supabase_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verifies the JWT token issued by Supabase.
    This creates the foundation for FastAPI to authenticate users based on the existing Supabase GoTrue tokens.
    """
    token = credentials.credentials
    try:
        algorithm = jwt.get_unverified_header(token).get("alg")
        if algorithm == "HS256":
            if not settings.SUPABASE_JWT_SECRET:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Server authentication is not configured",
                )
            signing_key = settings.SUPABASE_JWT_SECRET
        elif algorithm in {"ES256", "RS256"}:
            # Current Supabase projects use asymmetric signing keys.  Resolve
            # the matching public JWK by kid instead of trusting unsigned data.
            signing_key = supabase_jwks_client().get_signing_key_from_jwt(token).key
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unsupported token signing algorithm",
                headers={"WWW-Authenticate": "Bearer"},
            )
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=[algorithm],
            options={
                "verify_aud": False,
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
