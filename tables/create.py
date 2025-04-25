
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from tables.models import Admin, Doctor, create_table, drop_table
from tables.models import DATABASE_URL, engine, async_session_maker
import cloudinary
import cloudinary.uploader
from gitignire.api import cloudinary

res = cloudinary.uploader.upload("assets/doc1.png")
print(res['secure_url']) 






async def create_tables():
    async with async_session_maker() as session:
        async with session.begin():
            await drop_table()  # Сначала удаляем таблицы
            await create_table() 

async def save_doctor():
    async with async_session_maker() as session:
        async with session.begin():  # Автоматический commit при успешном выполнении
            doctor_1 = Doctor(
                name="Быков Андрей",
                email="Bykov@hospital.com",
                password="1111",
                speciality="Главный врач",
                degree="MBBS",
                experience="10 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc1.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_2 = Doctor(
                name="Кисегач Анастасия",
                email="Kisegach@hospital.com",
                password="2222",
                speciality="Главный врач",
                degree="MBBS",
                experience="12 лет",
                about="Один из самых лучших врачей в больнице.",
                available=False,
                image=cloudinary.uploader.upload("assets/doc2.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_3 = Doctor(
                name="Лобанов Семен",
                email="Lobanov@hospital.com",
                password="3333",
                speciality="Невролог",
                degree="MBBS",
                experience="11 лет",
                about="Хороший, дружелюбный врач.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc3.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_4 = Doctor(
                name="Левин Борис",
                email="Levin@hospital.com",
                password="4444",
                speciality="Педиатр",
                degree="MBBS",
                experience="12 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc4.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_5 = Doctor(
                name="Черноус Варвара",
                email="varvara@hospital.com",
                password="5555",
                speciality="Гинеколог",
                degree="MBBS",
                experience="12 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc5.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_6 = Doctor(
                name="Ричардс Фил",
                email="Richards@hospital.com",
                password="6666",
                speciality="Гинеколог",
                degree="MBBS",
                experience="8 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc6.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_7 = Doctor(
                name="Алабаев Тимка",
                email="Alabaev@hospital.com",
                password="7777",
                speciality="Дерматолог",
                degree="MBBS",
                experience="5 лет",
                about="Один из самых лучших врачей в больнице.",
                available=False,
                image=cloudinary.uploader.upload("assets/doc7.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_8 = Doctor(
                name="Романенко Глеб",
                email="Romanenko@hospital.com",
                password="8888",
                speciality="Невролог",
                degree="MBBS",
                experience="11 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc8.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_9 = Doctor(
                name="Скрябина Любовь",
                email="Scryabina@hospital.com",
                password="9999",
                speciality="Гастроэнтеролог",
                degree="MBBS",
                experience="9 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc9.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_10 = Doctor(
                name="Купитман Иван",
                email="Kupitman@hospital.com",
                password="111",
                speciality="Невролог",
                degree="MBBS",
                experience="7 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc10.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_11 = Doctor(
                name="Мальцев Алексей",
                email="Malcev@hospital.com",
                password="1212",
                speciality="Педиатр",
                degree="MBBS",
                experience="6 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc11.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_12 = Doctor(
                name="Калинина Софья",
                email="Kalinina@hospital.com",
                password="1313",
                speciality="Невролог",
                degree="MBBS",
                experience="7 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc12.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_13 = Doctor(
                name="Корнеев Максим",
                email="Korneev@hospital.com",
                password="1414",
                speciality="Дерматолог",
                degree="MBBS",
                experience="5 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc13.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_14 = Doctor(
                name="Королёва Маргарита",
                email="Koroleva@hospital.com",
                password="1515",
                speciality="Невролог",
                degree="MBBS",
                experience="6 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc14.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            doctor_15 = Doctor(
                name="Ульянова Полина",
                email="Ulyanova@hospital.com",
                password="1616",
                speciality="Дерматолог",
                degree="MBBS",
                experience="7 лет",
                about="Один из самых лучших врачей в больнице.",
                available=True,
                image=cloudinary.uploader.upload("assets/doc15.png")['secure_url'],
                fees=5000,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            admin = Admin(
                email = "admin@gmail.com",
                password = "admin"
            )
            

            session.add_all([doctor_1, doctor_2, doctor_3, doctor_4, doctor_5, doctor_6, doctor_7, 
                 doctor_8, doctor_9, doctor_10, doctor_11, doctor_12, doctor_13, 
                 doctor_14, doctor_15, admin])

# Чтобы выполнить асинхронный код, нужен event loop
import asyncio
async def main():
    await create_tables()
    await save_doctor()

asyncio.run(main())


