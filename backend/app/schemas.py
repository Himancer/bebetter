from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'

class FoodEstimate(BaseModel):
    name: str
    grams: float
    calories: float
    protein: float
    carbs: float
    fat: float

class FoodScanResult(BaseModel):
    image_url: str
    detected: List[Any]
    portions: Any
    totals: Any
