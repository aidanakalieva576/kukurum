from datetime import timedelta
import io
import pickle
from sqlalchemy import insert, select, update
from auth_model import AuthService, UserRepository, get_auth_service, get_current_user, get_db
import face_recognition
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session

from gitignire.api import ACCESS_TOKEN_EXPIRE_MINUTES
from models import User
from sqlalchemy.ext.asyncio import AsyncSession

from routes.schemas import FaceIDLoginRequest


face = APIRouter(
    prefix="/face",
    tags=["face"],
)

@face.post("/login")
async def login_faceid_route(image: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    image_bytes = await image.read()
    user_repo = UserRepository(db)  # создаём репозиторий
    auth_service = AuthService(user_repo)  # передаём в сервис
    return await auth_service.login_with_faceid(image_bytes, db)

@face.post("/save_face")
async def save_face(file: UploadFile = File(...), db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Чтение изображения и получение кодировки
    image_bytes = await file.read()
    np_image = face_recognition.load_image_file(io.BytesIO(image_bytes))
    encodings = face_recognition.face_encodings(np_image)

    if not encodings:
        raise HTTPException(status_code=400, detail="No face found in the image.")

    encoding = encodings[0]

    # Проверяем, существует ли запись для текущего пользователя
    existing_face = await db.execute(
        select(User).filter(User.id == current_user.id)
    )
    user_face = existing_face.scalars().first()

    if user_face:
        # Если запись существует, обновляем face_encoding
        await db.execute(
            update(User)
            .where(User.id == current_user.id)
            .values(face_encoding=pickle.dumps(encoding))
        )
        message = "Face encoding updated successfully."
    else:
        # Если записи нет, вставляем новую
        await db.execute(
            insert(User).values(
                userId=current_user.id,
                face_encoding=pickle.dumps(encoding)
            )
        )
        message = "Face encoding saved successfully."

    # Подтверждаем изменения в базе данных
    await db.commit()

    return {"message": message}

    

