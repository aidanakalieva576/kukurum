import { useContext, useEffect, useState } from "react";
import { UnifiedContext } from "../../context/UnifiedContext";
import Chat from "../pages/DoctorChat";
import axios from "axios";
import translations from "../../utils";

const ChatPage = () => {
  const { token, backendUrl } = useContext(UnifiedContext);
  const [clients, setClients] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { language } = useContext(UnifiedContext)
  const t = translations[language]

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${backendUrl}/chat/clients/`, {
          headers,
        });
        setClients(res.data);
      } catch (err) {
        console.error("Ошибка при загрузке списка клиентов:", err);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="flex max-w-6xl mx-auto p-6 gap-6 font-sans text-gray-800">
      {/* Левая колонка — список клиентов */}
      <div className="w-1/4 border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
        <h3 className="text-medium font-semibold mb-4 text-blue-900">{t.list}</h3>
        <ul className="space-y-3">
          {clients.length === 0 ? (
            <li className="text-gray-400 italic">{t.clientswill}</li>
          ) : (
            clients.map((client) => (
              <li key={client.id}>
                <button
                  onClick={() => setSelectedUser(client)}
                  className={`flex items-center gap-3 p-3 w-full rounded-xl transition-colors duration-200 hover:bg-blue-50 text-left ${
                    selectedUser?.id === client.id
                      ? "bg-blue-100 font-semibold text-blue-900 text-medium"
                      : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-200 text-white flex items-center justify-center font-bold uppercase border border-gray-200">
                    {client.name?.[0] || "К"}
                  </div>
                  <span>{client.full_name || client.name || `Клиент ${client.id}`}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Правая колонка — чат */}
      <div className="w-3/4">
        {selectedUser ? (
          <Chat receiverId={selectedUser.id} isDoctor={true} />
        ) : (
          <div className="h-96 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 bg-gray-50 text-lg shadow-inner">
           {t.choosedoc}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
