from datetime import datetime


# In MongoDB we don't define SQLAlchemy models, we just use collections.


UPLOADS_COLLECTION = "uploads"
CHATS_COLLECTION = "chat_history"


# Upload schema
# { _id, filename, filepath, uploaded_at, sheets, size_bytes }


# Chat schema
# { _id, upload_id, question, response, created_at }