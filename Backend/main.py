from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import crud, schemas, utils
import os, json, datetime
from dotenv import load_dotenv
from google import genai
import pandas as pd

load_dotenv()

app = FastAPI(title="AI Data Agent")

# Allow frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init Gemini client
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY")) if os.getenv("GEMINI_API_KEY") else None

# ------------------------
# Upload file endpoint
# ------------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    file_path = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Extract sheet names
    import openpyxl
    try:
        wb = openpyxl.load_workbook(file_path, read_only=True)
        sheets = wb.sheetnames
    except:
        sheets = ["Sheet1"]

    doc = await crud.create_upload(
        filename=file.filename,
        filepath=file_path,
        sheets=sheets,
        size_bytes=len(contents),
    )
    return doc

# ------------------------
# List uploads endpoint
# ------------------------
@app.get("/uploads")
async def get_uploads():
    return await crud.list_uploads()

# ------------------------
# Preview sheet endpoint
# ------------------------
@app.post("/preview/{upload_id}")
async def preview(upload_id: str, sheet: str = None):
    u = await crud.get_upload(upload_id)
    if not u:
        raise HTTPException(404, "upload not found")
    df = utils.load_sheet_to_df(u["filepath"], sheet)
    return {"columns": list(df.columns), "rows": utils.df_to_table_json(df.head(100))}

# ------------------------
# Query endpoint
# ------------------------
@app.post("/query")
async def query(req: schemas.QueryRequest):
    u = await crud.get_upload(req.upload_id)
    if not u:
        raise HTTPException(404, "upload not found")

    df = utils.load_sheet_to_df(u["filepath"], req.sheet)
    q = req.question.lower()

    # Numeric aggregation shortcuts
    if any(x in q for x in ["sum of", "total"]):
        for col in df.columns:
            if col.lower() in q:
                try:
                    total = df[col].dropna().astype(float).sum()
                    ans = f"Total of `{col}` is {total}"
                    await crud.save_chat(req.upload_id, req.question, ans)
                    return {"answer": ans}
                except: pass

    if any(x in q for x in ["average", "mean"]):
        for col in df.columns:
            if col.lower() in q:
                try:
                    mean = df[col].dropna().astype(float).mean()
                    ans = f"Average of `{col}` is {mean}"
                    await crud.save_chat(req.upload_id, req.question, ans)
                    return {"answer": ans}
                except: pass

    if not gemini_client:
        raise HTTPException(500, "GEMINI_API_KEY not configured")

    # Convert Timestamp/datetime objects safely
    sample = df.head(50).to_dict(orient='records')
    def convert_datetime(obj):
        if isinstance(obj, (datetime.datetime, datetime.date, pd.Timestamp)):
            return obj.isoformat()
        return obj
    sample_json_safe = json.dumps(sample, default=convert_datetime)

    system_prompt = "You are a helpful data assistant. Respond in JSON with: {answer, table, chart}"
    user_prompt = f"QUESTION: {req.question}\nSAMPLE_ROWS: {sample_json_safe}\nCOLUMNS: {list(df.columns)}"

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{system_prompt}\n{user_prompt}"
        )
        text = response.text
        parsed_json = json.loads(text) if text.strip().startswith('{') else {"answer": text}

        # Extract only the answer string
        answer_only = parsed_json.get("answer") if isinstance(parsed_json, dict) else str(parsed_json)

    except Exception as e:
        answer_only = f"Gemini error: {str(e)}"

    # Save only the plain answer in chat history
    await crud.save_chat(req.upload_id, req.question, answer_only)

    # Return plain answer
    return {"answer": answer_only}
