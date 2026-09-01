"""Vercel entrypoint for the BuildPilot Python backend.

Application code lives under backend/source using the same layered shape as the
GMS external-services application. Keep deployment adapters thin.
"""

from backend.main import app

__all__ = ["app"]
