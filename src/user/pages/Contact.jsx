// import { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { UnifiedContext } from "../../context/UnifiedContext";
// import { assets } from "../assets/assets";

// const UserChatPage = () => {
//   const { backendUrl, token } = useContext(UnifiedContext);
//   const [doctors, setDoctors] = useState([]);
//   const [selectedDoctorId, setSelectedDoctorId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");

//   // Загрузка списка докторов
//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         const res = await axios.get(`${backendUrl}/chat/doctors`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
  
//         const aiDoctor = {
//           id: "ai",
//           name: "Чат с ИИ",
//           email: "ai@chat.ru",
//           image: assets.profile_pi, // можешь положить нормальную пикчу в public
//         };
  
//         const doctorsList = res.data || [];
//         setDoctors([aiDoctor, ...doctorsList]);
//       } catch (err) {
//         console.error("Ошибка загрузки докторов:", err);
//       }
//     };
//     fetchDoctors();
//   }, []);

//   // Загрузка сообщений при выборе доктора
//   useEffect(() => {
//     if (!selectedDoctorId) return;
  
//     const fetchMessages = async () => {
//       try {
//         const url =
//           selectedDoctorId === "ai"
//             ? `${backendUrl}/chat/ai-messages`
//             : `${backendUrl}/chat/messages/${selectedDoctorId}`;
  
//         const res = await axios.get(url, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMessages(res.data || []);
//       } catch (err) {
//         console.error("Ошибка загрузки сообщений:", err);
//       }
//     };
  
//     fetchMessages();
//   }, [selectedDoctorId]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     try {
//       const url =
//         selectedDoctorId === "ai"
//           ? `${backendUrl}/chat/ai-send`
//           : `${backendUrl}/chat/send/${selectedDoctorId}`;
  
//       const res = await axios.post(
//         url,
//         { text: input },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
  
//       // Добавим сообщение в UI (если хочешь интерактив без перезагрузки)
//       setMessages((prev) => [...prev, res.data]);
//       setInput("");
//     } catch (err) {
//       console.error("Ошибка отправки:", err);
//     }
//   };

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   const groupMessagesByDate = (messages) => {
//     const grouped = [];
//     let lastDate = null;
//     messages.forEach((msg) => {
//       const msgDate = formatDate(msg.timestamp);
//       if (msgDate !== lastDate) {
//         grouped.push({ type: "date", date: msgDate });
//         lastDate = msgDate;
//       }
//       grouped.push({ type: "message", ...msg });
//     });
//     return grouped;
//   };

//   const groupedMessages = groupMessagesByDate(messages);

//   return (
//     <div className="flex h-screen">
//       {/* ЛЕВАЯ КОЛОНКА — список докторов */}
//       <div className="w-1/3 border-r p-4 overflow-y-auto bg-white">
//         <h2 className="text-xl font-bold mb-4 text-center text-gray-700">
//           Выберите доктора:
//         </h2>
//         <ul className="space-y-3">
//           {doctors.map((doc) => (
//             <li key={doc.id}>
//               <button
//                 onClick={() => setSelectedDoctorId(doc.id)}
//                 className={`w-full flex items-center gap-4 p-3 rounded shadow ${
//                   selectedDoctorId === doc.id
//                     ? "bg-blue-100"
//                     : "bg-gray-100 hover:bg-gray-200"
//                 }`}
//               >
//                 <img
//                   src={doc.image || "https://via.placeholder.com/50"}
//                   alt={doc.email}
//                   className="w-12 h-12 rounded-full object-cover"
//                 />
//                 <div className="text-left">
//                   <p className="text-gray-800 font-semibold">{doc.name || doc.email}</p>
//                   <p className="text-sm text-gray-500">{doc.email}</p>
//                 </div>
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* ПРАВАЯ КОЛОНКА — чат */}
//       <div className="w-2/3 flex flex-col p-4 bg-gray-50">
//         {selectedDoctorId ? (
//           <>
//             <div className="flex-1 overflow-y-auto border rounded p-4 mb-4 bg-white flex flex-col gap-2">
//               {groupedMessages.map((item, idx) =>
//                 item.type === "date" ? (
//                   <div key={idx} className="text-center text-gray-500 text-sm my-2">
//                     {item.date}
//                   </div>
//                 ) : (
//                   <div
//                     key={idx}
//                     className={`max-w-[75%] rounded-lg px-3 py-2 ${
//                       item.sender === "user"
//                         ? "bg-blue-100 self-end text-right"
//                         : "bg-gray-200 self-start text-left"
//                     }`}
//                   >
//                     <div>{item.text}</div>
//                     <div className="text-xs text-gray-400 mt-1">
//                       {formatTime(item.timestamp)}
//                     </div>
//                   </div>
//                 )
//               )}
//             </div>
//             <div className="flex gap-2">
//               <input
//                 className="flex-1 border rounded px-3 py-2"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Введите сообщение..."
//               />
//               <button
//                 className="bg-blue-500 text-white px-4 py-2 rounded"
//                 onClick={sendMessage}
//               >
//                 Отправить
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex items-center justify-center flex-1 text-gray-400">
//             Выберите доктора, чтобы начать чат
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserChatPage;
