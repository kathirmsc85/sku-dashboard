from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import os
from passlib.context import CryptContext
from jose import JWTError, jwt
import uuid

app = FastAPI(title="SpreeTail Home-Task SKU Dashboard API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configuration
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Data models
class User(BaseModel):
    id: int
    username: str
    email: str
    role: str  # "brand_user" or "merch_ops"
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str

class SKU(BaseModel):
    id: str
    name: str
    sales: float
    return_percentage: float
    content_score: float
    #user_id: str
    created_at: str
    sales_data: List[Dict[str, Any]]  # For chart data

class Note(BaseModel):
    id: str
    sku_id: str
    #user_id: str
    content: str
    created_at: str
    updated_at: str

class NoteCreate(BaseModel):
    sku_id: str
    content: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

# File paths
DATA_DIR = 'backend\data'
USERS_FILE = os.path.join(DATA_DIR, "users.json")
SKUS_FILE = os.path.join(DATA_DIR, "skus.json")
NOTES_FILE = os.path.join(DATA_DIR, "notes.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# In-memory storage
users_db: Dict[str, User] = {}
skus_db: Dict[str, SKU] = {}
notes_db: Dict[str, Note] = {}

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    print(f"Received credentials: {credentials}")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = next((user for user in users_db.values() if user.username == username), None)
    if user is None:
        raise credentials_exception
    return user

# Initialize sample data
def initialize_sample_data():
    # Create sample users
    with open(USERS_FILE, "r") as f:
        existing_users = json.load(f)
        for user_d in existing_users:
            user = User(
                id=user_d["userid"],
                username=user_d["username"],
                email=user_d["email"],
                role=user_d["role"],
                hashed_password=get_password_hash(user_d["password"])
            )
            users_db[user_d["userid"]] = user

    import random
    base_sales = random.uniform(1000, 50000)
    sales_data = []
    for month in range(12):
        month_sales = base_sales * random.uniform(0.7, 1.3)
        sales_data.append({
            "month": f"Month {month + 1}",
            "sales": round(month_sales, 2),
            "date": (datetime.now() - timedelta(days=30 * (11 - month))).strftime("%Y-%m")
        })
    
    with open(SKUS_FILE, "r") as f:
        existing_skus = json.load(f)
        for sku_d in existing_skus:
            sku = SKU(
                id=sku_d['id'],
                name=sku_d['name'],
                sales=round(sku_d['sales'], 2),
                return_percentage=round(sku_d['returnPercentage'], 1),
                content_score=round(sku_d['contentScore'], 1),
                created_at=datetime.now().isoformat(),
                sales_data=sales_data
            )
            skus_db[sku_d['id']] = sku

# Authentication endpoints
@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user already exists
    if any(u.username == user.username or u.email == user.email for u in users_db.values()):
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )

    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    new_user = User(
        id=user_id,
        username=user.username,
        email=user.email,
        role=user.role,
        hashed_password=hashed_password
    )
    users_db[user_id] = new_user
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = next((u for u in users_db.values() if u.username == user.username), None)
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "role": db_user.role
        }
    }

# SKU endpoints
@app.get("/skus", response_model=List[SKU])
async def get_skus(
    search: Optional[str] = None,
    filter_type: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc",
    current_user: User = Depends(get_current_user)
):
    #user_skus = [sku for sku in skus_db.values() if sku.user_id == current_user.id]
    user_skus = [sku for sku in skus_db.values()]

    # Apply search filter
    if search:
        user_skus = [sku for sku in user_skus if search.lower() in sku.name.lower()]

    # Apply type filter
    if filter_type == "high_return":
        user_skus = [sku for sku in user_skus if sku.return_percentage > 10]
    elif filter_type == "low_content":
        user_skus = [sku for sku in user_skus if sku.content_score < 5]
    
    # Apply sorting
    if sort_by:
        reverse = sort_order == "desc"
        if sort_by == "name":
            user_skus.sort(key=lambda x: x.name, reverse=reverse)
        elif sort_by == "sales":
            user_skus.sort(key=lambda x: x.sales, reverse=reverse)
        elif sort_by == "return_percentage":
            user_skus.sort(key=lambda x: x.return_percentage, reverse=reverse)
        elif sort_by == "content_score":
            user_skus.sort(key=lambda x: x.content_score, reverse=reverse)

    return user_skus

@app.get("/skus/{sku_id}", response_model=SKU)
async def get_sku(sku_id: str, current_user: User = Depends(get_current_user)):
    sku = skus_db.get(sku_id)
    return sku

# Notes endpoints
@app.get("/skus/{sku_id}/notes", response_model=List[Note])
async def get_sku_notes(sku_id: str, current_user: User = Depends(get_current_user)):
    #sku = skus_db.get(sku_id)
    sku_notes = [note for note in notes_db.values() if note.sku_id == sku_id]
    return sku_notes

@app.post("/notes", response_model=Note)
async def create_note(note: NoteCreate, current_user: User = Depends(get_current_user)):
    #sku = skus_db.get(note.sku_id)
    note_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    new_note = Note(
        id=note_id,
        sku_id=note.sku_id,
        content=note.content,
        created_at=now,
        updated_at=now
    )
    notes_db[note_id] = new_note
    return new_note

@app.put("/notes/{note_id}", response_model=Note)
async def update_note(note_id: str, content: str, current_user: User = Depends(get_current_user)):
    note = notes_db.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.user_id != current_user.id and current_user.role != "merch_ops":
        raise HTTPException(status_code=403, detail="Access forbidden")
    note.content = content
    note.updated_at = datetime.now().isoformat()
    return note

@app.delete("/notes/{note_id}")
async def delete_note(note_id: str, current_user: User = Depends(get_current_user)):
    note = notes_db.get(note_id)
    """
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.user_id != current_user.id and current_user.role != "merch_ops":
        raise HTTPException(status_code=403, detail="Access forbidden")
    """
    del notes_db[note_id]
    return {"message": "Note deleted successfully"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Initialize data on startup
@app.on_event("startup")
async def startup_event():
    initialize_sample_data()
    print("Sample data initialized successfully!")
    print("Available users:")
    for user in users_db.values():
        print(f"  - {user.username} ({user.role}) - password: password123")