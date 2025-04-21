import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { UnifiedContext } from "../../context/UnifiedContext";
import axios from "axios";

const ChatRoom = () => {
  const { id: doctorId } = useParams();
  const { backendUrl, token, user } = useContext(UnifiedContext);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [doctors, setDoctors] = useState([]);
  const ws = useRef(null);

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

  useEffect(() => {
    if (!doctorId) return;

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

    initRoom();
  }, [doctorId, user.id, backendUrl]);

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
            sender: msg.sender_type,
            text: msg.content,
            timestamp: msg.timestamp || new Date().toISOString(), // Добавили timestamp
          },
        ]);
      } catch (error) {
        console.warn("Невалидный JSON, пропускаем:", event.data);
      }
    };

    return () => ws.current?.close();
  }, [roomId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = {
      room_id: roomId,
      sender_id: user.id,
      sender_type: "user",
      content: input,
    };

    try {
      ws.current?.send(JSON.stringify(newMsg));

      await axios.post(`${backendUrl}/chat/chat_message/`, newMsg, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((prev) => [...prev, { ...newMsg, timestamp: new Date().toISOString() }]);
      setInput("");
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

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

  return (
    <div className="flex max-w-6xl mx-auto p-6 gap-6 font-sans text-gray-800">
      <div className="w-1/4 border rounded-2xl p-5 bg-white shadow-sm">
        <h3 className="text-medium font-semibold mb-4 text-blue-900">Список докторов</h3>
        <ul className="space-y-3">
          {doctors.map((doc) => (
            <li key={doc.id}>
              <Link
                to={`/user/chat/${doc.id}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors duration-200 hover:bg-blue-50 ${
                  parseInt(doctorId) === doc.id ? "bg-blue-100 font-semibold text-blue-900" : ""
                }`}
              >
                <img src={doc.image} alt="doc" className="w-9 h-9 rounded-full border" />
                <span>{doc.email}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4">
        {!doctorId ? (
          <div className="h-96 border rounded-2xl flex items-center justify-center text-gray-400 bg-gray-50 text-lg shadow-inner">
            Выберите доктора
          </div>
        ) : (
          <>
            <div className="h-[500px] border rounded-2xl p-5 overflow-y-auto bg-gray-50 mb-4 flex flex-col gap-3 shadow-inner">
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
            <div className="flex gap-3">
              <input
                className="flex-1 border rounded-full px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Введите сообщение..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
              >
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
