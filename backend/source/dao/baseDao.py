import logging
import time
from functools import wraps

from psycopg import OperationalError

logger = logging.getLogger(__name__)


def with_retry(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        delay = 0.2
        for attempt in range(1, 4):
            try:
                return func(*args, **kwargs)
            except OperationalError:
                if attempt == 3:
                    raise
                logger.warning("Transient DB error in %s; retrying", func.__qualname__, exc_info=True)
                time.sleep(delay)
                delay *= 2
    return wrapper
