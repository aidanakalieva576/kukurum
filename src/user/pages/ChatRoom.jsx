import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { UnifiedContext } from "../../context/UnifiedContext";
import axios from "axios";
import { assets } from "../assets/assets";
import translations from "../../utils";

const ChatRoom = () => {
  const { id: doctorId } = useParams();
  const { backendUrl, token, user, language } = useContext(UnifiedContext);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [videoRoomUrl, setVideoRoomUrl] = useState(null);
  const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);
  const ws = useRef(null);
  const chatContainerRef = useRef(null);
  const t = translations[language];

  useEffect(() => {
    if (doctorId && !isNaN(doctorId) && user?.id) {
      initRoom();
    }
  }, [doctorId, user]);


  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${backendUrl}/chat/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data);
      } catch (err) {
        console.error("Ошибка загрузки докторов:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Инициализация комнаты
  const initRoom = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/chat/chat_room/`,
        { user_id: user.id, doctor_id: parseInt(doctorId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoomId(res.data.id);
    } catch (err) {
      console.error("Ошибка при создании комнаты:", err);
    }
  };

  // Получение сообщений + WebSocket
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${backendUrl}/chat/chat_messages/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Ошибка при получении сообщений:", err);
      }
    };

    fetchMessages();

    ws.current = new WebSocket(`${backendUrl.replace("http", "ws")}/chat/ws/chat/${roomId}`);

    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            sender_type: msg.sender_type,
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.warn("Невалидный JSON, пропускаем:", event.data);
      }
    };

    return () => ws.current?.close();
  }, [roomId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Отправка сообщения
  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      await axios.post(`${backendUrl}/chat/chat_message/`, {
        room_id: roomId,
        sender_id: user.id,
        sender_type: "user",
        content: input,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInput(""); // ✅ Очищаем после успешной отправки
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };

  // Формат времени и даты
  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Группировка сообщений по дате
  const groupMessages = (msgs) => {
    const grouped = [];
    let lastDate = "";

    msgs.forEach((msg) => {
      const msgDate = formatDate(msg.timestamp);
      if (msgDate !== lastDate) {
        grouped.push({ type: "date", date: msgDate });
        lastDate = msgDate;
      }
      grouped.push({ type: "msg", ...msg });
    });

    return grouped;
  };

  const grouped = groupMessages(messages);

  // Создание URL для видеозвонка
  const createVideoCallRoom = () => {
    const roomName = `biocare-${user?.id}-${doctorId}`;
    const url = `https://meet.jit.si/${roomName}`;
    console.log("Video Call URL:", url);
    setVideoRoomUrl(url);
    setIsVideoCallVisible(true); // Показываем модальное окно
  };

  // Закрытие видеозвонка
  const closeVideoCall = () => {
    setIsVideoCallVisible(false);
  };

  return (
    <div className="flex w-full mx-auto p-6 gap-6 font-sans text-gray-800 text-xs">
      {/* Боковая панель докторов */}
      <div className="w-1/5 border rounded-2xl p-5 bg-white shadow-sm">
        <h3 className="text-medium font-semibold mb-4 text-blue-900">{t.spisok}</h3>
        {/* AI иконка сверху списка */}
        <Link
          to="/user/chat/ai"
          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md transition-all mb-4"
        >
          <img
            src={assets.docai}
            className="w-9 h-9 rounded-full border-2 border-blue-400 text-blue-600 flex items-center justify-center text-base font-bold hover:rotate-6 transition-transform duration-300"
          />
          <span className="font-semibold text-blue-800">Chokolol</span>
        </Link>

        <ul className="space-y-3">
          {doctors.map((doc) => (
            <li key={doc.id}>
              <Link
                to={`/user/chat/${doc.id}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors duration-200 hover:bg-blue-50 border border-blue-100 ${
                  parseInt(doctorId) === doc.id ? "bg-blue-50 font-semibold text-blue-900 text-xs" : ""
                }`}
              >
                <img src={doc.image} alt="doc" className="w-9 h-9 rounded-full border" />
                <div className="flex items-center justify-between w-full">
                  <span>{doc.email}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Основная часть чата */}
      <div className="w-3/4">
        {!doctorId ? (
          <div className="h-96 border rounded-2xl flex items-center justify-center text-gray-400 bg-gray-50 text-lg shadow-inner">
            {t.chooseDoctor}
          </div>
        ) : (
          <>
            <div
              ref={chatContainerRef} // передаём реф
              className="h-[500px] border rounded-2xl p-5 overflow-y-auto bg-gray-50 mb-4 flex flex-col gap-3 shadow-inner"
              style={{ overscrollBehavior: 'contain' }}
            >
              {grouped.map((item, idx) =>
                item.type === "date" ? (
                  <div key={idx} className="text-center text-gray-400 text-sm my-2">
                    {item.date}
                  </div>
                ) : (
                  <div
                    key={idx}
                    className={`max-w-[75%] rounded-xl px-4 py-2 text-sm shadow-sm ${
                      item.sender_type === "user"
                        ? "bg-blue-100 self-end text-right"
                        : "bg-white border self-start text-left"
                    }`}
                  >
                    <div>{item.content}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatTime(item.timestamp)}</div>
                  </div>
                )
              )}
            </div>
            <div className="flex gap-3 items-center">
              <input
                className="flex-1 border rounded-full px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.sendMessage}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
              >
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
              </button>

              {/* Кнопка видеозвонка внутри чата */}
              <button
                onClick={createVideoCallRoom}
                className="bg-blue-400 hover:bg-blue-600 p-2 rounded-full"
                title="Видеозвонок"
              >
                <img
                  src={assets.video}
                  alt="video call"
                  className="w-5 h-5 opacity-70 hover:opacity-100 transition "
                />
              </button>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
};
export default ChatRoom;
