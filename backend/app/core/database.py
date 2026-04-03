"""
Supabase client singleton
"""

from supabase import create_client, Client
from app.core.config import settings


def get_supabase() -> Client:
    """Get Supabase client using service role key (backend operations)"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# Singleton instance
supabase: Client = get_supabase()
