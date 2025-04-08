
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from models import Doctor, create_table, drop_table

DATABASE_URL = 'postgresql+asyncpg://postgres:Aidana2007@localhost:5432/папапап'

# Создаем асинхронный движок
engine = create_async_engine(DATABASE_URL, echo=True)

# Создаем фабрику сессий
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_tables():
    async with AsyncSessionLocal() as session:
        async with session.begin():
            await drop_table()  # Сначала удаляем таблицы
            await create_table() 

async def save_doctor():
    async with AsyncSessionLocal() as session:
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
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
                fees=150,
                address={"line1": "123 Heart Street", "line2": "Heart City"},
                date=2025,
                slots_blocked={}
            )
            

            session.add_all([doctor_1, doctor_2, doctor_3, doctor_4, doctor_5, doctor_6, doctor_7, 
                 doctor_8, doctor_9, doctor_10, doctor_11, doctor_12, doctor_13, 
                 doctor_14, doctor_15])

# Чтобы выполнить асинхронный код, нужен event loop
import asyncio
async def main():
    await create_tables()
    await save_doctor()

asyncio.run(main())


