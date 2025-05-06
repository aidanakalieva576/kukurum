import React, { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { UnifiedContext } from "../../context/UnifiedContext";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import translations from "../../utils";


const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const { token, backendUrl } = useContext(UnifiedContext);
  const { language } = useContext(UnifiedContext);
  const t = translations[language];
  const lang = language === "ru";
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  


  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);

      if (mediaRecorder && isRecording) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder, isRecording]);

  const sendAudio = async (chunks) => {
    const audioBlob = new Blob(chunks, { type: "audio/webm" });
    if (!audioBlob) {
      console.error("No audio file to send");
      return;
    }
  
    const localAudioUrl = URL.createObjectURL(audioBlob);
  
    const userMessageIndex = messages.length;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: t.processingAudio || "Processing audio...", audioUrl: localAudioUrl, status: "processing" }
    ]);
    setShowIntro(false);
  
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("lang", lang);
  
    setIsWaitingResponse(true); 
  
    try {
      const response = await axios.post(`${backendUrl}/audio/transcribe`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Transcription result:", response.data);
  
      setMessages((prev) => {
        const updated = [...prev];
        updated[userMessageIndex] = {
          role: "user",
          content: response.data.text || "...",
          audioUrl: localAudioUrl,
          status: "completed",
        };
  
        const botResponse = {
          role: "assistant",
          content: response.data.bot || "...",
          audioUrl: response.data.audio_url ? `${backendUrl}${response.data.audio_url}` : null,
          status: "completed",
        };
  
        const newMessages = [...updated, botResponse];
  
        if (botResponse.audioUrl) {
          setTimeout(() => {
            playAudio(botResponse.audioUrl, newMessages.length - 1);
          }, 300);
        }
  
        return newMessages;
      });
  
    } catch (error) {
      console.error("Error sending audio:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[userMessageIndex] = {
          ...updated[userMessageIndex],
          content: t.audioError || "Error processing audio",
          status: "error"
        };
        return updated;
      });
    } finally {
      setIsWaitingResponse(false); 
    }
  };
  

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000 
      });
      
 
      setAudioChunks([]);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (chunks.length > 0) {
          setAudioChunks(chunks);
          await new Promise(resolve => setTimeout(resolve, 50)); 
          sendAudio(chunks);
        }
        setRecordingDuration(0);
      };

      recorder.start(250);
      setMediaRecorder(recorder);
      setIsRecording(true);

      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(t.microphoneError || "Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {

      try {
        mediaRecorder.stop();
        

        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
      
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleVoiceButtonClick = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const userMessage = { role: "user", content: input, audioUrl: null };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowIntro(false);
  
    setIsWaitingResponse(true);
  
    try {
      const res = await fetch(`${backendUrl}/ai/ai_message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input, lang }),
      });
  
      if (!res.ok) {
        throw new Error("Stream error");
      }
  
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botResponse = "";
      let done = false;
  
      setMessages((prev) => [...prev, { role: "assistant", content: "", audioUrl: null }]);
  
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          botResponse += chunk;
  
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: last.content + chunk };
            }
            return updated;
          });
        }
      }
  
      // Проверяем есть ли аудио в ответе
      try {
        const responseData = JSON.parse(botResponse);
        if (responseData.audio_url) {
          const audioUrl = `${backendUrl}${responseData.audio_url}`;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx].role === "assistant") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                audioUrl: audioUrl,
                content: responseData.text || updated[lastIdx].content,
              };
              setTimeout(() => playAudio(audioUrl, lastIdx), 300);
            }
            return updated;
          });
        }
      } catch (e) {
        // если не json — ничего не делаем
      }
  
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: t.sendError, audioUrl: null }]);
    } finally {
      setIsWaitingResponse(false); // В любом случае перестаем ждать ответ
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Update the playAudio function to toggle playback
const playAudio = (url, idx) => {
  // Check if this is the currently playing audio
  if (playingIndex === idx) {
    // If this is already playing, pause it
    const existingAudio = document.getElementById(`audio-${idx}`);
    if (existingAudio) {
      existingAudio.pause();
      setPlayingIndex(null);
    }
    return;
  }
  
  // Stop any currently playing audio
  if (playingIndex !== null) {
    const currentAudio = document.getElementById(`audio-${playingIndex}`);
    if (currentAudio) {
      currentAudio.pause();
    }
  }
  
  // Check if this audio element already exists
  let audio = document.getElementById(`audio-${idx}`);
  
  if (!audio) {
    // Create new audio element if it doesn't exist
    audio = new Audio(url);
    audio.id = `audio-${idx}`;
    document.body.appendChild(audio);
  }
  
  // Play the audio and update state
  setPlayingIndex(idx);
  audio.play().catch(err => {
    console.error("Error playing audio:", err);
    setPlayingIndex(null);
  });
  
  audio.onended = () => setPlayingIndex(null);
  
  return audio;
};
  // Format recording time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };


  return (
    <div className="flex justify-center min-h-screen">
      {showSkeleton && (
  <div className="absolute inset-0 flex justify-end items-start pointer-events-none z-0">
    <img 
      src={assets.scelet1}
      alt="Skeleton waving" 
      className="w-[300px] h-auto object-contain opacity-100 "  // увеличила размер и убрала прозрачность
      style={{ marginTop: "50px", marginRight: "200px" }}
    />
  </div>
)}
      <div
  className="w-full h-[700px] m-1 rounded-xl drop-shadow-lg flex flex-col overflow-hidden relative "  // добавила отступ сверху
  style={{
    marginTop: "100px",
    background: "linear-gradient(to bottom right, #f0f8ff,rgba(176, 204, 234, 0.82))",
    backdropFilter: "blur(10px)",
  }}
>
        <Link
          className="border text-lg border-gray-300 p-4 bg-gradient-to-r from-blue-50 via-white to-blue-100 flex items-center gap-3"
          to="/user/chat"
        >
          <img src={assets.docai} className="w-9 h-9 rounded-full border-2 border-blue-200 text-blue-600 flex items-center justify-center text-base font-bold" />
          <span className="font-semibold text-black">Chokolol</span>
        </Link>

        {showIntro && (
          <>
            <h3 className="text-center text-2xl font-semibold mt-6">{t.introTitle}</h3>
            <div className="flex justify-center items-center flex-1 gap-6 px-6">
              {/* Intro cards */}
              {[t.preventionTitle, t.friendTitle, t.remindersTitle].map((title, i) => (
                <div key={i} className="border-2 border-gray-300 rounded-xl p-6 w-64 h-40 shadow-md text-center bg-white bg-opacity-70">
                  <h2 className="text-xl font-semibold mb-2">{title}</h2>
                  <p className="text-sm text-gray-700">
                    {i === 0 ? t.preventionText : i === 1 ? t.friendText : t.remindersText}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
       {/* Skeleton background */}


        {/* Chat area */}
        <div className="flex-1 p-4 overflow-y-auto border-b border-gray-200 flex flex-col">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 px-3 py-2 rounded-xl max-w-[75%] ${
                msg.role === "user" ? "bg-blue-100 self-end text-right" : "bg-white self-start text-left"
              } ${msg.status === "processing" ? "opacity-80" : ""}`}
            >
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="text-sm text-gray-700" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-blue-800" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-blue-700" {...props} />,
                }}
              >
                {msg.content}
              </ReactMarkdown>

              {/* Audio playback controls */}
              {msg.audioUrl && (
                <div className="mt-2 flex items-center gap-2 justify-end">
                  <button
                    onClick={() => playAudio(msg.audioUrl, idx)}
                    className={`p-2 rounded-full ${playingIndex === idx ? "bg-blue-200" : "bg-gray-100"} hover:bg-blue-100 transition-all`}
                  >
                    {playingIndex === idx ? (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Audio waveform visualization */}
                  <div className="flex items-center">
                    <div className="flex items-end gap-0.5 h-4">
                      {[2, 4, 6, 3, 5, 2, 4].map((h, i) => (
                        <div 
                          key={i} 
                          className={`w-0.5 ${msg.role === "user" ? "bg-blue-400" : "bg-green-400"} rounded-full ${
                            playingIndex === idx ? "animate-pulse" : ""
                          }`} 
                          style={{height: `${h * 3}px`}}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="mb-2 px-3 py-2 rounded-xl max-w-[75%] bg-white self-start text-left">
              <div className="flex items-center gap-1 mt-1 ml-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></span>
              </div>
            </div>
          )}
          {isWaitingResponse && (
  <div className="flex justify-start ml-4">
    <img src={assets.syr} alt="Loading..." className="w-10 h-10 " />
  </div>
)}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 flex items-center bg-gradient-to-r from-blue-50 via-white to-blue-50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none"
            placeholder={isRecording ? t.recording || "Recording..." : t.sendMessage}
            disabled={isRecording}
          />
          
          {/* Recording button with enhanced animation */}
          <button
            onClick={handleVoiceButtonClick}
            className={`ml-3 p-2 rounded-full flex items-center justify-center w-10 h-10 transition-all ${
              isRecording 
                ? "bg-red-100 hover:bg-red-200" 
                : "bg-blue-100 hover:bg-blue-200"
            }`}
          >
            {isRecording ? (
              <div className="relative flex items-center justify-center">
                {/* Pulsing recording indicator */}
                <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></div>
                
                {/* Recording waveform */}
                <div className="flex items-end gap-0.5 h-5">
                  <div className="w-1 bg-red-500 rounded-full animate-bounce h-3 delay-0"></div>
                  <div className="w-1 bg-red-500 rounded-full animate-bounce h-5 delay-150"></div>
                  <div className="w-1 bg-red-500 rounded-full animate-bounce h-4 delay-300"></div>
                  <div className="w-1 bg-red-500 rounded-full animate-bounce h-2 delay-450"></div>
                </div>
                
                {/* Recording timer */}
                <span className="absolute -top-6 text-xs font-medium text-red-500">
                  {formatTime(recordingDuration)}
                </span>
              </div>
            ) : (
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>

          <button
            onClick={sendMessage}
            disabled={isRecording || !input.trim()}
            className={`ml-3 p-2 rounded-full flex items-center justify-center w-10 h-10 ${
              !input.trim() || isRecording
                ? "bg-gray-100 text-gray-400" 
                : "bg-blue-100 hover:bg-blue-200 text-blue-500"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;





