import io
import json
from sqlite3 import IntegrityError
import traceback
import cloudinary
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from auth_model import get_db
from models import Appointment, Appointment_active, Doctor, User
from routes.schemas import DoctorAvailability


adminroute = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@adminroute.post("/add_doctor")
async def add_doctor(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    experience: str = Form(...),
    fees: int = Form(...),
    speciality: str = Form(...),
    degree: str = Form(...),
    address: str = Form("{}"),
    about: str = Form(...),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        address_dict = json.loads(address)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for address")

    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Файл должен быть изображением")

    try:
        contents = await image.read()
        uploaded = cloudinary.uploader.upload(io.BytesIO(contents))
        image_url = uploaded.get("secure_url")
    except Exception as e:
        print("Ошибка Cloudinary:", e)
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Ошибка при загрузке изображения: {e}"
        )

    try:
        doctor = Doctor(
            name=name,
            email=email,
            password=password,
            experience=experience,
            fees=fees,
            speciality=speciality,
            degree=degree,
            address=address_dict,
            about=about,
            image=image_url,
        )

        db.add(doctor)
        await db.commit()
        return {"message": "Doctor added successfully"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400, detail="Doctor with this email already exists"
        )
    



@adminroute.get("/getting_appointments")
async def get_all_appointments(db: AsyncSession = Depends(get_db)):
    try:
        stmt = (
            select(
                Appointment_active.id,
                User.name.label("user_name"),
                User.image.label("user_image"),
                User.dob,
                Appointment_active.slotTime,
                Appointment_active.slotDate,
                Doctor.name.label("doctor_name"),
                Doctor.image.label("doctor_image"),
                Doctor.fees,
                Appointment_active.payment,
            )
            .join(User, Appointment_active.userId == User.id)
            .join(Doctor, Appointment_active.docId == Doctor.id)
        )

        result = await db.execute(stmt)
        appointments = result.all()

        # Разделим на две категории
        active_appointments = []

        for appt in appointments:
            (
                id,
                user_name,
                user_image,
                dob,
                slotTime,
                slotDate,
                doctor_name,
                doctor_image,
                fees,
                payment,
            ) = appt

            appt_data = {
                "id": id,
                "user_name": user_name,
                "user_image": user_image,
                "user_dob": dob,
                "date": slotDate,
                "time": slotTime,
                "doctor_name": doctor_name,
                "doctor_image": doctor_image,
                "fees": fees,
                "payment": payment,
            }
            active_appointments.append(appt_data)


        stmt = (
            select(
                Appointment.id,
                User.name.label("user_name"),
                User.image.label("user_image"),
                User.dob,
                Appointment.slotTime,
                Appointment.slotDate,
                Doctor.name.label("doctor_name"),
                Doctor.image.label("doctor_image"),
                Appointment.cancelled,
                Appointment.isCompleted,
                Doctor.fees,
                Appointment.payment,
            )
            .join(User, Appointment.userId == User.id)
            .join(Doctor, Appointment.docId == Doctor.id)
        )
        result = await db.execute(stmt)
        appointments = result.all()

        # Разделим на две категории
        history_appointments = []


        for appt in appointments:
                (
                id,
                user_name,
                user_image,
                dob,
                slotTime,
                slotDate,
                doctor_name,
                doctor_image,
                cancelled,      # теперь правильно
                isCompleted,
                fees,           # ✅ теперь правильно
                payment         # ✅ теперь правильно
                ) = appt
                    
                appt_data = {
                "id": id,
                "user_name": user_name,
                "user_image": user_image,
                "user_dob": dob,
                "date": slotDate,
                "time": slotTime,
                "doctor_name": doctor_name,
                "doctor_image": doctor_image,
                "fees": fees,
                "cancelled": cancelled,
                "isCompleted": isCompleted,
                "payment": payment,
            }
                history_appointments.append(appt_data)
        

        # Возвращаем результат в формате с двумя категориями
        response = {
            "active_appointments": active_appointments,
            "history_appointments": history_appointments,
        }

        return response

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    


@adminroute.put("/update-doctor-availability/{doctor_id}")
async def update_doctor_availability(
    request: DoctorAvailability, db: AsyncSession = Depends(get_db)
):
    try:
        # Получаем текущего доктора
        result = await db.execute(select(Doctor).where(Doctor.id == request.docId))
        doctor = result.scalar_one_or_none()

        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # Инвертируем значение available
        new_value = not doctor.available

        # Обновляем
        stmt = (
            update(Doctor).where(Doctor.id == request.docId).values(available=new_value)
        )
        await db.execute(stmt)
        await db.commit()

        return {"docId": request.docId, "available": new_value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
