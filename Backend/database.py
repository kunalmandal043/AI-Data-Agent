# database.py

import os
import motor.motor_asyncio
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB", "ai_data_agent")

if not MONGO_URI:
    raise ValueError(" MONGO_URI not found in .env")

# Create MongoDB client with SSL certificate
client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

# Select DB
db = client[MONGO_DB]
