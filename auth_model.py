from cmath import e
from datetime import datetime, timedelta, timezone
from io import BytesIO
import io
import json
import pickle
from typing import List, Optional, Union
import face_recognition
from fastapi import Depends, HTTPException, Request, logger, status
import jwt
import numpy as np
from sqlalchemy import select, text

from models import Admin, Doctor, User
import asyncio
from passlib.context import CryptContext
import os
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from models import  async_session_maker
from gitignire.api import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def extract_face_encoding(image_bytes: bytes):
    image = face_recognition.load_image_file(io.BytesIO(image_bytes))
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        return None
    return encodings[0].tolist()






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
        user = await self.user_repository.select_user_by_email(email)
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

    async def login_with_faceid(self, image_bytes: bytes, db: AsyncSession):
        try:
            image_np = face_recognition.load_image_file(BytesIO(image_bytes))
            encodings = face_recognition.face_encodings(image_np)
            if not encodings:
                raise HTTPException(status_code=400, detail="No face found in the image.")
            input_encoding = encodings[0]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image data")

        # Получаем пользователей с заполненным face_encoding
        result = await db.execute(
            select(User.id, User.email, User.face_encoding).where(User.face_encoding.isnot(None))
        )
        users = result.all()

        for user_id, email, face_encoding_binary in users:
            try:
                db_encoding = pickle.loads(face_encoding_binary)
            except Exception:
                continue  # пропускаем, если не удалось декодировать

            match = face_recognition.compare_faces([db_encoding], input_encoding, tolerance=0.6)[0]
            if match:
                access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = self.create_access_token(
                    data={"email": email, "role": "user"},
                    expires_delta=access_token_expires
                )
                print("token", access_token, "role", "user (face)")
                return {"token": access_token, "token_type": "bearer", "role": "user"}

        raise HTTPException(status_code=401, detail="Face not recognized")




        

    def create_access_token(self, data: dict, expires_delta: timedelta) -> str:
        expire = datetime.now(timezone.utc) + expires_delta
        data.update({"exp": expire})
        return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    
    


    async def register_user(
        self,
        name: str,
        email: str,
        password: str,
        db: AsyncSession,
        face_image_bytes: bytes | None = None
    ):
        print("DEBUG: Начало регистрации пользователя")

        # Проверка по email
        existing_user = await self.user_repository.select_user_by_email(email)
        if existing_user:
            print("DEBUG: Email уже существует")
            raise HTTPException(status_code=400, detail="Аккаунт с такой почтой уже существует")

        print("DEBUG: Email не найден в базе данных")

        face_encoding = None
        if face_image_bytes:
            print("DEBUG: Обработка изображения лица")

            try:
                image = face_recognition.load_image_file(BytesIO(face_image_bytes))
                print("DEBUG: Изображение загружено")

                encodings = face_recognition.face_encodings(image)
                print(f"DEBUG: Найдено лиц: {len(encodings)}")

                if not encodings:
                    print("DEBUG: Лицо не найдено на изображении.")
                    raise HTTPException(status_code=400, detail="Лицо не найдено на изображении.")

                face_encoding_raw = np.asarray(encodings[0], dtype=np.float32)
                print("DEBUG: Лицо успешно распознано")

                # Получение всех закодированных лиц из БД
                result = await db.execute(
                    select(User.id, User.face_encoding).where(User.face_encoding.isnot(None))
                )
                all_users_with_face = result.fetchall()
                print(f"DEBUG: Найдено {len(all_users_with_face)} пользователей с лицами")

                for user_id, encoded_face_binary in all_users_with_face:
                    try:
                        known_encoding = pickle.loads(encoded_face_binary)
                        known_encoding = np.asarray(known_encoding, dtype=np.float32)

                        if known_encoding.shape != (128,) or face_encoding_raw.shape != (128,):
                            print(f"DEBUG: Некорректная форма векторов: known={known_encoding.shape}, face={face_encoding_raw.shape}")
                            continue

                        match = face_recognition.compare_faces([known_encoding], face_encoding_raw, tolerance=0.6)[0]
                        print(f"DEBUG: Сравнение лиц — результат: {match}")

                        if match:
                            print(f"DEBUG: Совпадение найдено с user_id: {user_id}")
                            raise HTTPException(status_code=400, detail="Аккаунт с таким FaceID уже существует")

                    except HTTPException as http_exc:
                        raise http_exc  # Важно! Пробрасываем исключение — не продолжаем цикл
                    except Exception as e:
                        print(f"DEBUG: Ошибка при обработке одного из лиц: {e}")
                        continue

                # Если дошли сюда, значит лицо уникально
                face_encoding = pickle.dumps(face_encoding_raw)
                print("DEBUG: Face encoding сериализован для сохранения")

            except HTTPException:
                raise
            except Exception as e:
                print(f"DEBUG: Ошибка при обработке изображения: {e}")
                raise HTTPException(status_code=400, detail="Ошибка обработки изображения лица.")

        # Создание пользователя
        print("DEBUG: Создание пользователя в базе данных")
        user = await self.user_repository.create_user(name, email, password, face_encoding)

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self.create_access_token(
            data={"email": user.email},
            expires_delta=access_token_expires
        )

        print("DEBUG: Регистрация завершена успешно")
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

    async def select_user_by_email(self, email: str):
        result = await self.db_session.execute(select(User).where(User.email == email))
        return result.scalars().first()
    
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

    async def get_all_user_faces(self):
        result = await self.db_session.execute(
    text('SELECT "userId", face_encoding FROM user_faces')
)
        rows = result.fetchall()
        return [{"user_id": row[0], "face_encoding": row[1]} for row in rows]
    
    async def select_user_by_id(self, user_id: int):
        query = select(User).where(User.id == user_id)
        result = await self.db_session.execute(query)
        return result.scalar_one_or_none()

    def verify_password(self, plain_password: str, stored_password: str) -> bool:
        # Прямое сравнение пароля с сохраненным значением
        return plain_password == stored_password
    

    


    async def get_user_by_email(self, email: str):
        stmt = select(User).where(User.email == email)
        result = await self.db_session.execute(stmt)
        return result.scalars().first()
    
    async def create_user(self, name: str, email: str, password: str, face_encoding: bytes | None = None):
        new_user = User(name=name, email=email, password=password, face_encoding=face_encoding)
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

