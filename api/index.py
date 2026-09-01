"""Thin Vercel entrypoint for the BuildPilot Python backend."""

from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1] / "src" / "backend-service"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from backend_service.main import app

__all__ = ["app"]
