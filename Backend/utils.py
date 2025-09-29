
import os
import pandas as pd
import json
from dotenv import load_dotenv

load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_excel_file(file, filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        contents = file.file.read()
        f.write(contents)
    try:
        xls = pd.ExcelFile(filepath)
        sheets = xls.sheet_names
    except Exception:
        sheets = ["Sheet1"]
    size_bytes = os.path.getsize(filepath)
    return filepath, sheets, size_bytes

def load_sheet_to_df(filepath: str, sheet_name: str=None):
    try:
        df = pd.read_excel(filepath, sheet_name=sheet_name) if sheet_name else pd.read_excel(filepath)
    except Exception:
        df = pd.read_csv(filepath)
    df.columns = [str(c) if not (str(c).strip()=="" or str(c).lower().startswith("unnamed")) else f"column_{i}" for i,c in enumerate(df.columns)]
    df.dropna(axis=0, how='all', inplace=True)
    df.dropna(axis=1, how='all', inplace=True)
    return df

def df_to_table_json(df):
    return json.loads(df.fillna("").to_json(orient='records'))

# utils.py
def simplify_ai_response(resp):
    """
    Extract only the 'answer' field from Gemini JSON response.
    If resp is a dict with 'answer', return it; otherwise, return string.
    """
    if isinstance(resp, dict) and "answer" in resp:
        return resp["answer"]
    return str(resp)
