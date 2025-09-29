
from database import db
from datetime import datetime
import json
from bson import ObjectId

async def create_upload(filename: str, filepath: str, sheets: list, size_bytes: int):
    doc = {
        "filename": filename,
        "filepath": filepath,
        "uploaded_at": datetime.utcnow(),
        "sheets": sheets,
        "size_bytes": size_bytes
    }
    res = await db["uploads"].insert_one(doc)
    # Convert ObjectId -> string before returning
    doc["id"] = str(res.inserted_id)
    doc["_id"] = str(res.inserted_id)
    return doc

async def get_upload(upload_id: str):
    return await db["uploads"].find_one({"_id": ObjectId(upload_id)})



async def list_uploads():
    cursor = db["uploads"].find().sort("uploaded_at", -1)
    uploads = []
    async for doc in cursor:   # ✅ Motor requires async for
        doc["id"] = str(doc["_id"])   # Convert ObjectId to string
        del doc["_id"]                # Remove raw ObjectId (not JSON serializable)
        uploads.append(doc)
    return uploads



async def save_chat(upload_id: str, question: str, response: str):
    doc = {
        "upload_id": upload_id,
        "question": question,
        "response": response,
        "created_at": datetime.utcnow()
    }
    await db["chat_history"].insert_one(doc)
    return doc


