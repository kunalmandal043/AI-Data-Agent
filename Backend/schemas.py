
from pydantic import BaseModel
from typing import Optional, List

class QueryRequest(BaseModel):
    upload_id: str
    sheet: Optional[str] = None
    question: str

class QueryResponse(BaseModel):
    answer: str
    table: Optional[list] = None
    chart: Optional[dict] = None
