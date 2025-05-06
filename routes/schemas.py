from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, Field

class Token(BaseModel):
    access_token: str
    token_type: str


class UserDTO(BaseModel):
    login: str


class UserLogin(BaseModel):
    email: str
    password: str

class TokenGet(BaseModel):
    token: str


class DoctorSchema(BaseModel):
    id: int
    name: str
    email: str
    password: str
    speciality: str
    degree: str
    experience: str
    about: str
    image: str
    available: bool
    fees: int
    address: dict
    date: Optional[int] = None
    slots_blocked: dict

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    address: Optional[dict[str, str]]  # {"line1": "...", "line2": "..."}
    gender: Optional[str]
    dob: Optional[str]



class AppointmentCreate(BaseModel):
    userId: int
    docId: int
    slotDate: str
    slotTime: str
    # userData: Dict
    # docData: Dict
    amount: int
    date: int
    cancelled: bool = False
    payment: bool = False
    isCompleted: bool = False


class AppointmentRequest(BaseModel):
    docId: int
    slotDate: str  # формат "07_04_2025"
    slotTime: str


class CancelAppointmentRequest(BaseModel):
    appointmentId: int

class PaymentSchema(BaseModel):
    appointmentId: int


class ConfirmSchema(BaseModel):
    appointmentId: int


class DoctorAvailability(BaseModel):
    docId: int

class AddDoctorSchema(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=6)
    experience: str
    fees: int
    speciality: str
    degree: str
    address: dict[str, str] # {"line1": "...", "line2": "..."}
    about: str
    image: str  # Сюда приходит уже URL из Cloudinary
    available: bool = True

class DoctorUpdate(BaseModel):
    name: Optional[str]
    speciality: Optional[str]
    degree: Optional[str]
    experience: Optional[str]
    about: Optional[str]
    available: Optional[bool]
    fees: Optional[int]
    address: Optional[dict[str, str]]
    settings: Optional[bool]


class AppointmentRequestDoc(BaseModel):
    docId: int
    slotDate: str  # формат "07_04_2025"
    slotTime: str
    email: Optional[str]


class ChatRoomCreate(BaseModel):
    user_id: int
    doctor_id: int


class MessageSent(BaseModel):
    room_id: int
    sender_id: int
    sender_type: str
    content: str
    # date: datetime = Field(default_factory=datetime.now)
    # is_read: bool = False

class UserInfo(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True


class DoctorChatInfo(BaseModel):
    id: int
    email: str
    image: str

    class Config:
        orm_mode = True


class FaceIDLoginRequest(BaseModel):
    face_id: str