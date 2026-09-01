import os
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row


@contextmanager
def database_session():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured")

    connection = psycopg.connect(database_url, row_factory=dict_row)
    try:
        yield connection
    finally:
        connection.close()
