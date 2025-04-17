from datetime import datetime, timedelta, timezone
from typing import Union
from fastapi import Depends, HTTPException, Request, logger, status
import jwt
from sqlalchemy import select

from models import Admin, Doctor, User
import asyncio
from passlib.context import CryptContext
import os
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from models import  async_session_maker




SECRET_KEY = "0e21bed3d8a38669b3c5de86886d278734aefff09b587e60d59efba8637c19f9ead5c9d8cf82038ec8cbc45db6524ac867db084dfd40a2a83de827718c24757bba4852ddd1c88a7ed3b414b8460d564eea5c9a5579ded8892a553c31f080075c4533adb58a9268f71cc5653b015b94863e99f76a22b89167d42b451e9d58c054159eb32d5247b120322eb23f284deb64ca456fafb9676b9f226e45513aa5fd5f090329ef465958f72d0c20480324d5372b038a67abadc3fe0d87e44027dd9ce1b0e17272d7f993345ad0ca6ab2a2e8b913b9efd9ff4218f1fca07688ececc947eed5ff1b3d42992e348eab18838ec222fe90dc6d5027ba5d25c3226bd55889f5"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))





# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    async def login_for_access_token(self, email: str, password: str):
        # Проверка: является ли пользователь админом
        admin = await self.user_repository.select_admin(email, password)
        if admin and admin.password == password:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = self.create_access_token(
                data={"email": admin.email, "role": "admin"},
                expires_delta=access_token_expires
            )
            print("token", access_token, "role", "admin")
            return {"token": access_token, "token_type": "bearer", "role": "admin"}

        # Проверка: является ли пользователь доктором
        doctor = await self.user_repository.select_doctor_by_email(email, password)
        if doctor and doctor.password == password:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = self.create_access_token(
                data={"id": doctor.id,"email": doctor.email, "role": "doctor"},
                expires_delta=access_token_expires
            )
            print("token", access_token, "role", "doctor")
            return {"token": access_token, "token_type": "bearer", "role": "doctor"}

        # Проверка: является ли пользователь обычным пользователем
        user = await self.user_repository.select_user_by_email(email, password)
        if user and user.password == password:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = self.create_access_token(
                data={"email": user.email, "role": "user"},
                expires_delta=access_token_expires
            )
            print("token", access_token, "role", "user")
            return {"token": access_token, "token_type": "bearer", "role": "user"}

        # Если ни один из пользователей не найден
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


        

    def create_access_token(self, data: dict, expires_delta: timedelta) -> str:
        expire = datetime.now(timezone.utc) + expires_delta
        data.update({"exp": expire})
        return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    
    


    async def register_user(self, name: str, email: str, password: str):
        existing_user = await self.user_repository.select_user_by_email(email, password)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        user = await self.user_repository.create_user(name, email, password)

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self.create_access_token(
            data={"email": user.email},
            expires_delta=access_token_expires
        )
        return {"token": access_token, "token_type": "bearer", "role": "user"}
    




    from jwt import decode, ExpiredSignatureError, InvalidTokenError

    def get_current_user(self, token: str):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("email")
            exp = payload.get("exp")

            if not email:
                raise credentials_exception

            # Проверка на истечение срока действия токена
            if exp is not None:
                expire_time = datetime.fromtimestamp(exp, tz=timezone.utc)
                if expire_time < datetime.now(timezone.utc):
                    raise credentials_exception

        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            raise credentials_exception

        return email
    

    

    
    async def update_current_user(self, token: str, update_data: dict) -> User:
        email = self.get_current_user(token)
        user = await self.user_repository.update_user_by_email(email, update_data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user


class UserRepository:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def select_user_by_email(self, email: str, password: str):
        # Выполняем запрос на поиск пользователя по email
        stmt = select(User).where(User.email == email)
        result = await self.db_session.execute(stmt)
        user = result.scalars().first()

        # Если пользователь найден, проверяем пароль
        if user and self.verify_password(password, user.password):
            print(user)
            return user
        return None
    
    async def select_admin(self, email: str, password: str):
        result = await self.db_session.execute(
            select(Admin).where(Admin.email == email)
        )
        return result.scalars().first()
    
    async def select_doctor_by_email(self, email:str, password:str):
        result = await self.db_session.execute(
            select(Doctor).where(Doctor.email == email)
        )
        return result.scalars().first()



    def verify_password(self, plain_password: str, stored_password: str) -> bool:
        # Прямое сравнение пароля с сохраненным значением
        return plain_password == stored_password
    


    async def get_user_by_email(self, email: str):
        stmt = select(User).where(User.email == email)
        result = await self.db_session.execute(stmt)
        return result.scalars().first()
    
    async def create_user(self, name: str, email: str, password: str):
        new_user = User(name=name, email=email, password=password)
        self.db_session.add(new_user)
        await self.db_session.commit()
        await self.db_session.refresh(new_user)
        return new_user
    


    async def update_user_by_email(self, email: str, update_data: dict) -> User:
        result = await self.db_session.execute(select(User).where(User.email == email)) 

        user = result.scalar_one_or_none()
        if not user:
            return None

        for key, value in update_data.items():
            setattr(user, key, value)
        await self.db_session.commit()
        await self.db_session.refresh(user)
        return user

async def get_db():
    async with async_session_maker() as session:
        yield session


def get_auth_service(db: AsyncSession = Depends(get_db)):
    user_repository = UserRepository(db)
    return AuthService(user_repository)


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db), auth_service: AuthService = Depends(get_auth_service)):
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing.")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format.")
    
    token = auth_header.split(" ", 1)[1]
    # logger.debug(f"Authorization header: {token}")  # Для отладки

    user_repo = UserRepository(db)  # Сессия базы данных будет передана в репозиторий
    auth_service = AuthService(user_repo)

    try:
        # Проверка токена на валидность
        email = auth_service.get_current_user(token)
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail="Invalid token or expired token")
    
    user = await user_repo.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


async def get_current_doctor(
    request: Request,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header is missing or invalid.")

    token = auth_header.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        email = payload.get("email")
        doctor_id = payload.get("id")
        exp = payload.get("exp")

        if role != "doctor":
            raise HTTPException(status_code=403, detail="Not authorized as doctor")

        if exp:
            expire_time = datetime.fromtimestamp(exp, tz=timezone.utc)
            if expire_time < datetime.now(timezone.utc):
                raise HTTPException(status_code=401, detail="Token expired")

        if not doctor_id and not email:
            raise HTTPException(status_code=401, detail="Token missing required fields")

    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Token error: {str(e)}")

    # Получаем доктора по id или email
    stmt = select(Doctor).where(Doctor.id == doctor_id if doctor_id else Doctor.email == email)
    result = await db.execute(stmt)
    doctor = result.scalars().first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return doctor

