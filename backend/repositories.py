
from multiprocessing import get_context
from sqlalchemy import select
from models import User
from sqlalchemy.ext.asyncio import AsyncSession


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
            return user
        return None

    def verify_password(self, plain_password: str, stored_password: str) -> bool:
        # Прямое сравнение пароля с сохраненным значением
        return plain_password == stored_password
