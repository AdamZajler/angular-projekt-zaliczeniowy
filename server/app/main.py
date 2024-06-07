from fastapi import FastAPI, Query, HTTPException
from starlette.middleware.cors import CORSMiddleware
import asyncpg
from typing import List
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

# Dodanie CORS-a
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Połączenie z bazą danych
async def connect_to_db():
    return await asyncpg.connect(user='postgres', password='db_password', database='nbp_viewer', host='postgres')

# Pobieranie danych z bazy danych
async def get_data_from_db(currency_type: str = Query('pln')):
    conn = await connect_to_db()
    query = f"SELECT * FROM kursy WHERE nazwa_waluty=UPPER('{currency_type}');"
    rows = await conn.fetch(query)
    await conn.close()
    return rows

# Zapis danych do bazy danych
async def save_data_to_db(data: List[dict]):
    conn = await connect_to_db()
    try:
        for record in data:
            await conn.execute("DELETE FROM kursy WHERE nazwa_waluty = $1", record['nazwa_waluty'])

        query = """
            INSERT INTO kursy (nazwa_waluty, data_synchronizacji, kurs)
            VALUES ($1, $2, $3);
        """
        for record in data:
            await conn.execute(query, record['nazwa_waluty'], record['data_synchronizacji'], record['kurs'])
    except Exception as e:
        await conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    await conn.close()

# Model danych dla waluty
class CurrencyRate(BaseModel):
    id: int = None  # Optional ID field for existing records
    nazwa_waluty: str
    data_synchronizacji: str
    kurs: str

# Definicja endpointu
@app.get("/data/")
async def get_data(currency_type: str = Query('pln')):
    data = await get_data_from_db(currency_type)
    return data

# Endpoint do zapisywania danych
@app.post("/data/")
async def post_data(data: List[CurrencyRate]):
    await save_data_to_db([record.dict() for record in data])
    return {"status": "success"}
