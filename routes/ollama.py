import json
import traceback
from deep_translator import GoogleTranslator
from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse, StreamingResponse
import httpx
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from translate import Translator

from gitignire.api import OLLAMA_URL
from auth_model import get_current_user, get_db

ai = APIRouter(prefix="/ai", tags=["AI"])


class PromptInput(BaseModel):
    prompt: str
    lang: bool   # Если True, то переводим с русского на английский и обратно


# RU → EN
async def translate_to_english(text: str) -> str:
    try:
        return GoogleTranslator(source='ru', target='en').translate(text)
    except Exception as e:
        print("Translation to English failed:", e)
        return text


# EN → RU
async def translate_to_russian(text: str) -> str:
    try:
        return GoogleTranslator(source='en', target='ru').translate(text)
    except Exception as e:
        print("Translation to Russian failed:", e)
        return text


@ai.post("/ai_message")
async def chat_with_ai(
    request: PromptInput,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        print("original prompt:", request.prompt)
        print("lang flag:@@@@@@@@@@@@", request.lang)

        if request.lang:
            translated_prompt = await translate_to_english(request.prompt)
            print("translated prompt:", translated_prompt)
            stream_enabled = False
        else:
            translated_prompt = request.prompt
            stream_enabled = True

        ollama_payload = {
            "model": "medical-assistant",
            "prompt": translated_prompt,
            "stream": stream_enabled
        }

        if stream_enabled:
            # ✅ Ключевое изменение здесь — client создается ВНУТРИ stream_ollama_response
            async def stream_ollama_response():
                async with httpx.AsyncClient(timeout=50000.0) as client:
                    async with client.stream("POST", OLLAMA_URL, json=ollama_payload) as response:
                        async for line in response.aiter_lines():
                            print("ollama raw line:", line)
                            if line.strip():
                                try:
                                    data = json.loads(line)
                                    raw_response = data.get("response")
                                    print("ollama response:", raw_response)
                                    if raw_response:
                                        yield raw_response 
                                except Exception as e:
                                    print("Ошибка обработки ollama:", e)

            return StreamingResponse(stream_ollama_response(), media_type="text/plain")

        else:
            # Обычный запрос (без стрима)
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(OLLAMA_URL, json=ollama_payload)
                response.raise_for_status()
                data = response.json()
                raw_response = data.get("response", "")
                print("ollama full response:", raw_response)

                translated = await translate_to_russian(raw_response)
                return PlainTextResponse(content=translated)

    except Exception as e:
        print("!!! GLOBAL ERROR !!!")
        traceback.print_exc()
        return PlainTextResponse(content=f"Ошибка: {e}", status_code=500)
