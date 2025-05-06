from fastapi import APIRouter, Depends, File, Form, UploadFile
import httpx
import pyttsx3
import whisper
import tempfile
import os
from gtts import gTTS
from fastapi.responses import FileResponse
import shutil
from sqlalchemy.ext.asyncio import AsyncSession

from gitignire.api import OLLAMA_URL




os.environ["PATH"] += os.pathsep + r"C:/Users/Admin/Downloads/ffmpeg-7.1.1-essentials_build/ffmpeg-7.1.1-essentials_build\bin"




from auth_model import get_current_user, get_db
from routes.ollama import PromptInput, chat_with_ai, translate_to_english, translate_to_russian


audio = APIRouter(
    prefix="/audio",
    tags=["Audio"],
)

wh = whisper.load_model("base")



import pyttsx3
import tempfile
import os
from fastapi import FastAPI, File, UploadFile, Form
import httpx

app = FastAPI()

import pyttsx3
import tempfile
import os
import time
from fastapi import FastAPI, File, UploadFile, Form
import httpx

app = FastAPI()

@audio.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    lang: bool = Form(...)
):
    temp_audio_path = None
    try:
        # --- Читаем файл полностью ---
        contents = await file.read()
        await file.close()  # <<< ВАЖНО: закрываем поток сразу

        # --- Сохраняем файл во временный ---
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            temp_audio.write(contents)
            temp_audio_path = temp_audio.name

        print(f"[DEBUG] Временный путь аудио: {temp_audio_path}")

        # --- Распознаём текст через whisper ---
        result = wh.transcribe(temp_audio_path)
        text = result["text"].strip()
        print(f"[DEBUG] Распознанный текст: {text}")

        if not text:
            return {"error": "Не удалось распознать текст."}

        # --- Переводим если надо ---
        if lang:
            translated_prompt = await translate_to_english(text)
            print(f"[DEBUG] Переведенный текст: {translated_prompt}")
        else:
            translated_prompt = text

        # --- Запрос к Ollama ---
        ollama_payload = {
            "model": "medical-assistant",
            "prompt": translated_prompt,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_URL, json=ollama_payload)
            response.raise_for_status()
            data = response.json()
            raw_response = data.get("response", "").strip()
            print(f"[DEBUG] Ответ от Ollama: {raw_response}")

        # --- Перевод обратно если надо ---
        if lang:
            bot_response = await translate_to_russian(raw_response)
            print(f"[DEBUG] Перевод обратно: {bot_response}")
        else:
            bot_response = raw_response

        # --- Озвучка ---
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        engine.setProperty('volume', 1.0)

        voices = engine.getProperty('voices')
        selected_voice = None

        for voice in voices:
            if "male" in voice.name.lower() or "муж" in voice.name.lower():
                selected_voice = voice
                break

        if not selected_voice and voices:
            selected_voice = voices[0]

        if selected_voice:
            engine.setProperty('voice', selected_voice.id)

        os.makedirs("static", exist_ok=True)
        timestamp = int(time.time())
        audio_filename = f"response_{timestamp}.mp3"
        audio_path = os.path.join("static", audio_filename)

        engine.save_to_file(bot_response, audio_path)
        engine.runAndWait()
        engine.stop()

        return {
            "text": text,
            "bot": bot_response,
            "audio_url": f"/static/{audio_filename}"
        }

    except Exception as e:
        print(f"[ERROR] Ошибка в /transcribe: {e}")
        return {"error": str(e)}

    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
            print(f"[DEBUG] Удален временный файл: {temp_audio_path}")



# @audio.post("/audio/transcribe")
# async def transcribe_audio(
#     audio: UploadFile = File(...),
#     lang: bool = Form(...),
#     db: AsyncSession = Depends(get_db),
#     current_user=Depends(get_current_user),
# ):
#     try:
#         temp_audio_path = save_temp_file(audio)
#         result = wh.transcribe(temp_audio_path)
#         text = result["text"]

#         async with httpx.AsyncClient(timeout=60.0) as client:
#             response = await client.post(
#                 "http://127.0.0.1:8000/ai_message",  # URL своего же API
#                 json={"prompt": text, "lang": lang},
#                 headers={"Authorization": f"Bearer {current_user.token}"}  # если требуется токен
#             )
#             response.raise_for_status()
#             bot = response.text  # тут уже будет готовый текст!

#         return {"user": text, "bot": bot}

#     except Exception as e:
#         print("!!! GLOBAL ERROR IN transcribe_audio !!!")
#         traceback.print_exc()
#         return PlainTextResponse(content=f"Ошибка: {e}", status_code=500)

