from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row
from contextlib import asynccontextmanager

DB_URL = "postgresql://postgres:12345678@localhost:5432/servicar_db"

async_pool = None

@asynccontextmanager
async def lifespan(app):
    global async_pool
    async_pool = AsyncConnectionPool(conninfo=DB_URL, open=False)
    try:
        await async_pool.open()
        print("✅ Pool de conexiones abierto exitosamente")
        yield
    finally:
        await async_pool.close()
        print("🛑 Pool de conexiones cerrado")

async def get_conexion():
    global async_pool
    if async_pool is None:
        raise RuntimeError("El pool no ha sido inicializado")
    async with async_pool.connection() as conn:
        conn.row_factory = dict_row
        yield conn