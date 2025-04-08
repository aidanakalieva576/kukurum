from datetime import datetime, timedelta, timezone
from typing import Union
from fastapi import HTTPException, status
import jwt
from models import User
import asyncio
from passlib.context import CryptContext
import os



SECRET_KEY = "0e21bed3d8a38669b3c5de86886d278734aefff09b587e60d59efba8637c19f9ead5c9d8cf82038ec8cbc45db6524ac867db084dfd40a2a83de827718c24757bba4852ddd1c88a7ed3b414b8460d564eea5c9a5579ded8892a553c31f080075c4533adb58a9268f71cc5653b015b94863e99f76a22b89167d42b451e9d58c054159eb32d5247b120322eb23f284deb64ca456fafb9676b9f226e45513aa5fd5f090329ef465958f72d0c20480324d5372b038a67abadc3fe0d87e44027dd9ce1b0e17272d7f993345ad0ca6ab2a2e8b913b9efd9ff4218f1fca07688ececc947eed5ff1b3d42992e348eab18838ec222fe90dc6d5027ba5d25c3226bd55889f5"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))





pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    async def login_for_access_token(self, email: str, password: str):
        user = await self.validate_user(email, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self.create_access_token(
            data={"email": user.email},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    async def validate_user(self, email: str, password: str) -> Union[User, bool]:
        user = await self.user_repository.select_user_by_email(email, password)
        # Прямое сравнение пароля
        if user and user.password == password:
            return user
        return False

    def create_access_token(self, data: dict, expires_delta: timedelta) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + expires_delta
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def get_current_user(self, token: str):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("email")
            exp: float = payload.get("exp")
            if email is None or datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
                raise credentials_exception
        except jwt.PyJWTError:
            raise credentials_exception

        return email
