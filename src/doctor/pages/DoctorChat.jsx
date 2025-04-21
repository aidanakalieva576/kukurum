import { useContext, useEffect, useRef, useState } from "react";
import { UnifiedContext } from "../../context/UnifiedContext";
import axios from "axios";

const Chat = ({ receiverId, isDoctor }) => {
  const { token, user, backendUrl } = useContext(UnifiedContext);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [roomId, setRoomId] = useState(null);
  const ws = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

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

  return (
    <div className="w-full h-[800px] bg-white rounded-2xl border shadow-sm flex flex-col justify-between overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
      <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-3 bg-gray-50">
  {messages.map((msg) => (
    <div
      key={msg.id}
      className={`max-w-[70%] px-5 py-3 rounded-3xl shadow-sm text-[15px] leading-snug break-words ${
        msg.sender_id === user.id
          ? "bg-blue-100 text-gray-600 self-end"
          : "bg-white border border-gray-200 text-gray-800 self-start"
      }`}
    >
      {msg.content}
      <div className="mt-1 text-xs text-right">
        {msg.pending && !msg.error && <span className="animate-pulse">⏳</span>}
        {msg.error && <span>❌</span>}
      </div>
    </div>
  ))}
</div>

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
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;
