from datetime import date, datetime, timedelta
import json
import logging
from os import stat
from sqlite3 import IntegrityError
import traceback
from fastapi import APIRouter, Body, FastAPI, Depends, HTTPException, Query, Request,UploadFile, File, UploadFile, logger
from fastapi.responses import JSONResponse
from jwt import PyJWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text, update
import stripe
from auth_model import AuthService, UserRepository, get_auth_service, get_current_doctor, get_current_user, get_db
from pydantic import BaseModel
from sqlalchemy.future import select
from models import Appointment, Appointment_active, Doctor, User, async_session_maker, engine
from fastapi.middleware.cors import CORSMiddleware
import models
from schemas import AddDoctorSchema, AppointmentCreate, AppointmentRequest, AppointmentRequestDoc, CancelAppointmentRequest, ConfirmSchema, DoctorAvailability, DoctorSchema, DoctorUpdate, PaymentSchema, UserLogin, UserRegister, TokenGet, UserUpdate
from fastapi import Form
import cloudinary
import cloudinary.uploader
from sqlalchemy.orm import Session
import io




app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # 👈 откуда разрешены запросы
    allow_credentials=True,
    allow_methods=["*"],             # 👈 разрешаем все методы: GET, POST, PUT, DELETE...
    allow_headers=["*"],             # 👈 разрешаем все заголовки
)

stripe.api_key = "sk_test_51RCCFKCrNkMgRyYRcfD86bIcDdWXce4uNi2s3TJ72dPGV8ECQWWvILOzyNPomySQq6fQ0DqKxiS6FfdHFGYkUV7g002jSYhbGZ"

#создаем новый роутер
router = APIRouter(
    prefix="/users_api",
    tags=["Users"],
)
adminroute =APIRouter(
    prefix="/admin",
    tags=["Admin"],
)
docroute=APIRouter(
    prefix="/doctor",
    tags=["Doctor"],
)



cloudinary.config(
  cloud_name="djmrfjkki",
  api_key="225718319113462",
  api_secret="Z6_qtrSjkX0ntd8M8c8A-0WIQxc",
  secure=True
)






async def get_token_from_header(request: Request, auth_service: AuthService = Depends(get_auth_service)):
    auth_header = request.headers.get("authorization")
    print(f"Authorization header: {auth_header}")  # Для отладки
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header is missing or invalidввв.")
    return auth_header.split(" ", 1)[1]

def allow_roles(*roles: list):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=stat.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges"
            )
        return current_user
    return role_checker

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Установим уровень логирования на DEBUG

# Если нужно выводить логи в консоль
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)


@app.get("/admin-only")
def admin_route(current_user: dict = Depends(allow_roles("admin"))):
    return {"message": f"Hello Admin {current_user['sub']}"}

@app.get("/doctor-panel")
def doctor_panel(current_user: dict = Depends(allow_roles("doctor"))):
    return {"message": f"Welcome Doctor {current_user['sub']}"}









@app.get("/doctors")
async def get_doctors(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT * from doctors"))
        doctors = result.all()
        doctor_schemas = []
        for doctor in doctors:
            try:
                validated = DoctorSchema.model_validate(doctor._mapping)
                doctor_schemas.append(validated)
            except Exception as e:
                print(f"Ошибка валидации врача: {doctor._mapping}, ошибка: {e}")
        return doctor_schemas
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

    




@app.post("/login")
async def login(user: UserLogin, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.login_for_access_token(user.email, user.password)


@router.post("/register")
async def register(user: UserRegister, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.register_user(user.name, user.email, user.password)


@router.get("/me")
async def read_me(request: Request, auth_service: AuthService = Depends(get_auth_service)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    token = auth_header[len("Bearer "):]
    email = auth_service.get_current_user(token)
    user = await auth_service.user_repository.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "image": user.image,
        "address": {
            "line1": user.address.get("line1") if user.address else "",
            "line2": user.address.get("line2") if user.address else ""
        },
        "gender": user.gender,
        "dob": user.dob 
    }


@router.put("/me")
async def update_me(
    request: Request,
    name: str = Form(...),
    phone: str = Form(""),
    gender: str = Form(""),
    dob: str = Form(""),
    address: str = Form("{}"),
    image: UploadFile = File(None),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        print("Начало update_me")

        # --- auth
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid or missing token")
        token = auth_header.split(" ", 1)[1]

        # --- image 
        image_url = None
        if image:
            image_data = await image.read()  # Чтение содержимого изображения
            upload_result = cloudinary.uploader.upload(image_data)
            image_url = upload_result.get("secure_url")

        # --- prepare data
        update_data = {
            "name": name,
            "phone": phone,
            "gender": gender,
            "dob": dob,
            "address": eval(address),
        }
        if image_url:
            update_data["image"] = image_url

        user = await auth_service.update_current_user(token, update_data)

        print("Профиль обновлён")

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "image": user.image,
            "address": user.address,
            "gender": user.gender,
            "dob": user.dob,
        }
    except Exception as e:
        print(f"Ошибка в update_me: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления профиля: {e}")
    






def generate_available_slots(start_time="08:00", end_time="18:00", interval=30):
    slots = []
    current = datetime.strptime(start_time, "%H:%M")
    end = datetime.strptime(end_time, "%H:%M")
    while current < end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=interval)
    return slots


@router.get("/available-slots/")
async def get_available_slots(docId: int, slotDate: str, db: Session = Depends(get_db)):
    try:
        # Получаем все занятые слоты
        stmt = select(Appointment_active.slotTime).where(
            Appointment_active.docId == docId,
            Appointment_active.slotDate == slotDate
        )
        result = await db.execute(stmt)
        booked_slots = result.scalars().all()

        booked_times = [time for time in booked_slots]

        all_slots = generate_available_slots()  # например: ["10:00", "10:30", "11:00", ...]
        free_slots = [time for time in all_slots if time not in booked_times]

        # ===== ✅ Фильтрация слотов, если это сегодня =====
        # slotDate = "10_4_2025"
        today = datetime.now()
        today_str = f"{today.day}_{today.month}_{today.year}"
        if slotDate == today_str:
            now_minutes = today.hour * 60 + today.minute

            def is_future(time_str):
                h, m = map(int, time_str.split(":"))
                return h * 60 + m > now_minutes

            free_slots = [slot for slot in free_slots if is_future(slot)]
        # ==================================================

        return {
            "date": slotDate,
            "availableSlots": free_slots  # <<< ВАЖНО: так же, как ждёт фронт!
        }

    except Exception as e:
        print("Ошибка при получении слотов:", e)
        return JSONResponse(status_code=500, content={"detail": "Ошибка сервера"})


        

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use DD_MM_YYYY.")



@router.post("/book/")
async def book_appointment(
    appointment: AppointmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    try:
        # Проверяем, занят ли слот
        stmt = select(Appointment_active).where(
            Appointment_active.docId == appointment.docId,
            Appointment_active.slotDate == appointment.slotDate,
            Appointment_active.slotTime == appointment.slotTime
        )
        result = await db.execute(stmt)


        existing = result.scalars().first()

        if existing:
            raise HTTPException(status_code=400, detail="Slot is already booked.")

        # Создаём запись
        new_appointment = Appointment_active(
            userId=current_user.id,
            docId=appointment.docId,
            slotDate=appointment.slotDate,
            slotTime=appointment.slotTime,
            date = int(date.today().strftime("%Y%m%d"))
        )
        db.add(new_appointment)
        await db.commit()
        await db.refresh(new_appointment)

        return {"message": "Appointment booked", "appointment_id": new_appointment.id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while booking: {e}")
    

@router.get("/my-appointments/{user_id}")
async def get_my_appointments(user_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Appointment_active, Doctor)
        .join(Doctor, Appointment_active.docId == Doctor.id)
        .where(Appointment_active.userId == user_id)
        .order_by(Appointment_active.slotDate, Appointment_active.slotTime)
    )

    result = await db.execute(stmt)
    records = result.all()
    now = datetime.now()

    data_active = []
    for appointment, doctor in records:
        data_active.append({
            "appointmentId": appointment.id,
            "slotDate": appointment.slotDate,
            "slotTime": appointment.slotTime,
            "payment": appointment.payment,
            "doctor": {
                "id": doctor.id,
                "name": doctor.name,
                "speciality": doctor.speciality,
                "address": doctor.address,
                "image" : doctor.image
            }
        })
    stmt = (
        select(Appointment, Doctor)
        .join(Doctor, Appointment.docId == Doctor.id)
        .where(Appointment.userId == user_id)
        .order_by(Appointment.slotDate, Appointment.slotTime)
    )

    result = await db.execute(stmt)
    records = result.all()
    now = datetime.now()

    data = []
    for appointment, doctor in records:
        data.append({
            "appointmentId": appointment.id,
            "slotDate": appointment.slotDate,
            "slotTime": appointment.slotTime,
            "payment": appointment.payment,
            "cancelled": appointment.cancelled,
            "isCompleted": appointment.isCompleted,
            "doctor": {
                "id": doctor.id,
                "name": doctor.name,
                "speciality": doctor.speciality,
                "address": doctor.address,
                "image" : doctor.image
            }
        })

    return data, data_active



@router.post("/cancel-appointment")
async def cancel_appointment(
    request: CancelAppointmentRequest,  # ожидается: { appointmentId: int }
    db: AsyncSession = Depends(get_db),
):
    appointment_id = request.get("appointmentId")
    if not appointment_id:
        raise HTTPException(status_code=400, detail="Appointment ID is required.")

    # 1. Найдём активную запись
    stmt = select(Appointment_active).where(Appointment_active.id == appointment_id)
    result = await db.execute(stmt)
    active_appointment = result.scalar_one_or_none()

    if not active_appointment:
        raise HTTPException(status_code=404, detail="Active appointment not found.")

    try:
        # 2. Скопируем данные в таблицу Appointment с cancelled=True
        new_record = Appointment(
            userId=active_appointment.userId,
            docId=active_appointment.docId,
            slotDate=active_appointment.slotDate,
            slotTime=active_appointment.slotTime,
            date=active_appointment.date,
            payment=active_appointment.payment,
            cancelled=True,
            isCompleted=False,
        )
        db.add(new_record)

        # 3. Удалим из активной таблицы
        await db.delete(active_appointment)

        await db.commit()

        return {"message": "Appointment cancelled and moved to history."}
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error cancelling appointment: {e}")


@router.post("/create-payment")
async def create_payment(request: PaymentSchema):
    print(">>> ROUTE /create-payment REACHED <<<")

    intent = stripe.PaymentIntent.create(
        amount=1000,
        currency="usd",
        metadata={"appointment_id": request.appointmentId},
    )
    print("clientSecret!!!!!!!!!!!!!", intent.client_secret)
    return {"clientSecret": intent.client_secret}

@router.post("/confirm-payment")
async def fake_payment(
    request: ConfirmSchema,
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = select(Appointment_active).where(Appointment_active.id == request.appointmentId)
        result = await db.execute(stmt)
        appointment = result.scalar_one_or_none()

        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")

        appointment.payment = True

        await db.commit()
        await db.refresh(appointment)

        return {"message": "Оплата прошла успешно", "appointmentId": appointment.id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error nunu: {e}")

from sqlalchemy.future import select
from fastapi import Path

@adminroute.put("/update-doctor-availability/{doctor_id}")
async def update_doctor_availability(
    request: DoctorAvailability,
    db: AsyncSession = Depends(get_db)
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
            update(Doctor)
            .where(Doctor.id == request.docId)
            .values(available=new_value)
        )
        await db.execute(stmt)
        await db.commit()

        return {"docId": request.docId, "available": new_value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@adminroute.get("/getting_appointments")
async def get_all_appointments(db: AsyncSession = Depends(get_db)):
    try:
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
                Doctor.fees,
                Appointment.cancelled,
                Appointment.payment,
                Appointment.isCompleted
            )
            .join(User, Appointment.userId == User.id)
            .join(Doctor, Appointment.docId == Doctor.id)
        )

        result = await db.execute(stmt)
        appointments = result.all()

        # Разделим на две категории
        active_appointments = []
        history_appointments = []

        for appt in appointments:
            id, user_name, user_image, dob, slotTime, slotDate, doctor_name, doctor_image, fees, cancelled, payment, isCompleted = appt

            appt_data = {
                "id": id,
                "user_name": user_name,
                "user_image":user_image,
                "user_dob": dob,
                "date": slotDate,
                "time": slotTime,
                "doctor_name": doctor_name,
                "doctor_image": doctor_image,
                "fees": fees,
                "cancelled": cancelled,
                "payment": payment,
                "isCompleted": isCompleted
            }

            # Проверяем, относится ли запись к истории или активной
            if cancelled or isCompleted:
                history_appointments.append(appt_data)
            else:
                active_appointments.append(appt_data)

        # Возвращаем результат в формате с двумя категориями
        response = {
            "active_appointments": active_appointments,
            "history_appointments": history_appointments
        }

        return response

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    

@app.patch("/cancel_appointment/{appointment_id}")
async def cancel_appointment(appointment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appt = result.scalar_one_or_none()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.cancelled = True
    await db.commit()

    return {"message": "Appointment cancelled"}

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
    db: AsyncSession = Depends(get_db)
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
        raise HTTPException(status_code=500, detail=f"Ошибка при загрузке изображения: {e}")

    
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
            image=image_url
        )

            db.add(doctor)
            await db.commit()
            return {"message": "Doctor added successfully"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Doctor with this email already exists")
    



@docroute.get("/get_doctor_appointments")
async def get_doctor_appointments(
    doctor_id: int,  # Передаём doctor_id как query-параметр
    db: AsyncSession = Depends(get_db)
):
    print("DOCTOR_ID:", doctor_id)
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
                Appointment_active.payment
            )
            .join(User, Appointment_active.userId == User.id)
            .join(Doctor, Appointment_active.docId == Doctor.id)
            .where(Appointment_active.docId == doctor_id)  # ← фильтрация по врачу
        )

        result = await db.execute(stmt)
        appointments = result.all()

        # Разделим на две категории
        active_appointments = []

        for appt in appointments:
            id, user_name, user_image, dob, slotTime, slotDate, doctor_name, doctor_image, fees, payment = appt

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
                "payment": payment
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
                Doctor.fees,
                Appointment.payment
            )
            .join(User, Appointment.userId == User.id)
            .join(Doctor, Appointment.docId == Doctor.id)
            .where(Appointment.docId == doctor_id)  # ← фильтрация по врачу
        )

        result = await db.execute(stmt)
        appointments = result.all()

        # Разделим на две категории
        history_appointments = []

        for appt in appointments:
            id, user_name, user_image, dob, slotTime, slotDate, doctor_name, doctor_image, fees, cancelled, payment, isCompleted = appt

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
                "payment": payment
            }
            history_appointments.append(appt_data)



        return {
            "active_appointments": active_appointments,
            "history_appointments": history_appointments
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    

@docroute.patch("/complete_appointment/{appointment_id}")
async def complete_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Appointment).where(Appointment.id == appointment_id)
    result = await db.execute(stmt)
    appointment = result.scalar_one_or_none()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.isCompleted = True

    await db.commit()
    await db.refresh(appointment)

    return {"message": "Приём завершён", "appointmentId": appointment.id}

@docroute.get("/me")
def get_current_doctor_info(current_doctor: Doctor = Depends(get_current_doctor)):
    return {
        "id": current_doctor.id,
        "name": current_doctor.name,
        "email": current_doctor.email,
        "speciality": current_doctor.speciality,
        "degree": current_doctor.degree,
        "experience": current_doctor.experience,
        "about": current_doctor.about,
        "image": current_doctor.image,
        "fees": current_doctor.fees,
        "address": current_doctor.address,
        "available": current_doctor.available,
        "settings": current_doctor.settings,
    }


@docroute.put("/update/me")
async def update_doctor_profile(
    doctor_data: DoctorUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    

    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid or missing token")
        token = auth_header.split(" ", 1)[1]

        email = auth_service.get_current_user(token)
        result = await db.execute(select(Doctor).where(Doctor.email == email))
        doctor = result.scalars().first()

        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # --- update
        doctor.name = doctor_data.name
        doctor.speciality = doctor_data.speciality
        doctor.degree = doctor_data.degree
        doctor.experience = doctor_data.experience
        doctor.about = doctor_data.about
        doctor.available = doctor_data.available
        doctor.fees = doctor_data.fees
        doctor.address = doctor_data.address

        if doctor_data.settings is not None:
            doctor.settings = doctor_data.settings

        await db.commit()
        await db.refresh(doctor)

        return doctor

    except Exception as e:
        print(f"Ошибка в update_doctor_profile: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления профиля врача: {e}")


@docroute.post("/book")
async def book_by_doctor(
    appointment: AppointmentRequestDoc,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(get_token_from_header),
    current_user: User = Depends(get_current_doctor),
):
    try:
        # Проверка, занят ли слот
        stmt = select(Appointment_active).where(
            Appointment_active.docId == appointment.docId,
            Appointment_active.slotDate == appointment.slotDate,
            Appointment_active.slotTime == appointment.slotTime
        )
        result = await db.execute(stmt)
        existing = result.scalars().first()

        if existing:
            raise HTTPException(status_code=400, detail="Slot is already booked.")

        # Проверка наличия email
        if appointment.email is None:
    # Допускаем отсутствие email, бронируем как "пустую" запись
            new_appointment = Appointment_active(
                userId=None,
                docId=appointment.docId,
                slotDate=appointment.slotDate,
                slotTime=appointment.slotTime,
                date=int(date.today().strftime("%Y%m%d"))
            )
        else:
            # Поиск пользователя по email
            stmt_user = select(User).where(User.email == appointment.email)
            res_user = await db.execute(stmt_user)
            user = res_user.scalar_one_or_none()

            if not user:
                raise HTTPException(status_code=404, detail="User with provided email not found.")

            new_appointment = Appointment_active(
                userId=user.id,
                docId=appointment.docId,
                slotDate=appointment.slotDate,
                slotTime=appointment.slotTime,
                date=int(date.today().strftime("%Y%m%d"))
            )

        db.add(new_appointment)
        await db.commit()
        await db.refresh(new_appointment)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while booking: {e}")

    


@docroute.delete("/book")
async def delete_all_appointments(
    docId: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = select(Appointment_active).where(Appointment_active.docId == docId)
        result = await db.execute(stmt)
        appointments = result.scalars().all()

        for appt in appointments:
            if appt.userId is None:
                await db.delete(appt)

        await db.commit()
        return {"message": "All unassigned appointments deleted"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while deleting: {e}")

    

    
app.include_router(router)
app.include_router(adminroute)
app.include_router(docroute)


