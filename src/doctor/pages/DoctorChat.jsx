import { useContext, useEffect, useRef, useState } from "react";
import { UnifiedContext } from "../../context/UnifiedContext";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");
import translations from "../../utils";
import { assets } from "../../user/assets/assets";

const Chat = ({ receiverId, isDoctor }) => {
  const { token, user, backendUrl } = useContext(UnifiedContext);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [videoRoomUrl, setVideoRoomUrl] = useState(null);
  const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);
  const ws = useRef(null);
  const chatContainerRef = useRef(null);
  const { language } = useContext(UnifiedContext);
  const t = translations[language];
  const headers = { Authorization: `Bearer ${token}` };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const dateKey = dayjs(msg.timestamp).format("YYYY-MM-DD");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(msg);
    });
    return grouped;
  };
  
  const groupedMessages = groupMessagesByDate(messages);

  const fetchChatRoom = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/chat/chat_room/`,
        { user_id: receiverId, doctor_id: user.id },
        { headers }
      );
      setRoomId(res.data.id);
    } catch (err) {
      console.error("Ошибка при получении комнаты:", err);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`${backendUrl}/chat/chat_messages/${id}`, { headers });
      setMessages(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке сообщений:", err);
    }
  };

  const sendMessage = async () => {
    if (!content.trim() || !roomId) return;

    const tempId = Date.now();
    const newMessage = {
      id: tempId,
      sender_id: user.id,
      sender_type: "doctor",
      content,
      pending: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setContent("");

    try {
      const res = await axios.post(
        `${backendUrl}/chat/chat_message/`,
        {
          room_id: roomId,
          sender_id: user.id,
          sender_type: "doctor",
          content: newMessage.content,
        },
        { headers }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...res.data, pending: false } : msg
        )
      );
    } catch (err) {
      console.error("Ошибка при отправке:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, pending: false, error: true } : msg
        )
      );
    }
  };

  const connectWebSocket = (roomId) => {
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(`${backendUrl.replace("http", "ws")}/chat/ws/chat/${roomId}`);

    ws.current.onmessage = () => {
      fetchMessages(roomId);
    };

    ws.current.onclose = () => {
      console.log("WebSocket отключён");
    };
  };

  useEffect(() => {
    fetchChatRoom();
  }, [receiverId]);

  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);
      connectWebSocket(roomId);
    }
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [roomId]);

  // Генерация уникальной ссылки для видеозвонка
  const createVideoCallRoom = () => {
    const roomName = `Biocare-${receiverId}-${user.id}`;
    const url = `https://meet.jit.si/${roomName}`;
    console.log("Video Call URL:", url);
    setVideoRoomUrl(url);
    setIsVideoCallVisible(true);
  };

  // Закрытие модального окна видеозвонка
  const closeVideoCall = () => {
    setIsVideoCallVisible(false);
  };

  return (
    <div className="w-full h-[800px] bg-white rounded-2xl border shadow-sm flex flex-col justify-between overflow-hidden">
      <div
        className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50"
        style={{ overscrollBehavior: 'contain' }}
        ref={chatContainerRef}
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center text-gray-400 text-sm my-3">
              {dayjs(date).format("D MMMM YYYY")}
            </div>
            {msgs.map((msg) => {
              const isDoctorMsg = msg.sender_type === "doctor";
              const isMyMessage = isDoctor === isDoctorMsg;
              const time = dayjs(msg.timestamp).format("HH:mm");

              return (
                <div key={msg.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mb-2`}>
                  <div
                    className={`max-w-[70%] px-5 py-3 rounded-3xl shadow-sm text-[15px] leading-snug break-words ${
                      isMyMessage
                        ? "bg-blue-100 text-gray-600"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.content}
                    <div className="mt-1 text-xs text-right text-gray-400">
                      {msg.pending && !msg.error && <span className="animate-pulse">⏳</span>}
                      {msg.error && <span>❌</span>}
                      {!msg.pending && !msg.error && <span>{time}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white flex items-center gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
        />
        
        <button
          onClick={sendMessage}
          className="bg-blue-100 hover:bg-blue-600 text-gray-600 px-5 py-2 rounded-2xl shadow-sm transition"
        >
          {t.send}
        </button>

        {/* Кнопка для видеозвонка */}
        <button
          onClick={createVideoCallRoom}
          className="bg-blue-400 hover:bg-green-600 text-gray-600 px-5 py-2 rounded-2xl shadow-sm transition"
        >
          <img
                  src={assets.video}
                  alt="video call"
                  className="w-5 h-5 opacity-70 hover:opacity-100 transition "
                />
        </button>
      </div>

      {/* Модальное окно для видеозвонка */}
      {isVideoCallVisible && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-xl w-full max-w-4xl p-4 shadow-xl">
            <button
              onClick={closeVideoCall}
              className="absolute top-2 right-2 text-white bg-red-600 rounded-full p-2"
              title="Закрыть видеозвонок"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 10.586L5.707 4.293 4.293 5.707 10.586 12 4.293 18.293l1.414 1.414L12 13.414l5.707 5.707 1.414-1.414L13.414 12l5.707-5.707-1.414-1.414z" />
              </svg>
            </button>
            <iframe
              src={videoRoomUrl}
              allow="camera; microphone; fullscreen; display-capture"
              width="100%"
              height="500"
              style={{ border: "none" }}
              title="Jitsi Video Call"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
