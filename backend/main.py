from datetime import datetime
from fastapi import APIRouter, FastAPI, Depends, HTTPException,UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from auth_model import AuthService
from database import Base, async_session_maker
from pydantic import BaseModel
from sqlalchemy.future import select
from models import User
from fastapi.middleware.cors import CORSMiddleware
from repositories import UserRepository

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Разрешенные домены
    allow_credentials=True,
    allow_methods=["*"],  # Разрешенные HTTP-методы (например, GET, POST)
    allow_headers=["*"],  # Разрешенные заголовки
)

class UserLogin(BaseModel):
    email: str
    password: str

class TokenGet(BaseModel):
    token: str

#создаем новый роутер
router = APIRouter(
    prefix="/users_api",
    tags=["Users"],
)

class UserDTO(BaseModel):
    login: str







# Функция для получения сессии
async def get_db():
    async with async_session_maker() as session:
        yield session


# class UserSchema(BaseModel):
#     id: int
#     name: str
#     email: str
#     password: str
#     image: bytes
#     address: dict 
#     gender: str | None
#     dob: str | None
#     phone: str |None
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         from_attibutes = True





class DoctorSchema(BaseModel):
    id: int
    name: str
    email: str
    password: str
    speciality: str
    degree: str
    experience: str
    about: str
    available: bool
    fees: int
    address: dict
    date: int
    slots_blocked: dict

    class Config:
        from_attributes = True



async def get_user_repository():
    async with async_session_maker() as session:
        yield UserRepository(session)



@app.get("/doctors")
async def get_doctors(db: AsyncSession = Depends(get_db)):
    try:
        # Используем text() для текстового SQL выражения
        result = await db.execute(text("SELECT * from doctor"))
        # Получаем все строки
        doctors = result.all()
        doctor_schemas = [DoctorSchema.model_validate(doctor._mapping) for doctor in doctors]
        return doctor_schemas
    except SQLAlchemyError as e:
        # Если произошла ошибка, логируем её и возвращаем 500
        raise HTTPException(status_code=500, detail=str(e))
    

def get_auth_service(db: AsyncSession = Depends(get_db)):
    user_repository = UserRepository(db)
    return AuthService(user_repository)


@router.post("/login")
async def login(user: UserLogin, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.login_for_access_token(user.email, user.password)


@router.post("/me")
async def read_me(token: TokenGet, auth_service: AuthService = Depends(get_auth_service)):
    email = auth_service.get_current_user(token.token)
    return {"email": email}

app.include_router(router)