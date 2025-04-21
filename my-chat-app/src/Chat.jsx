import { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);



  const handleSend = async () => {
    if (!input.trim()) return;
  
    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
  
    try {
      // Просто напрямую передаём вопрос пользователя без вставки "машина"
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "medical-assistant", // 👈 твоя кастомная модель
          prompt: input,
          stream: false,
        }),
      });
  
      const data = await response.json();
  
      // Перевод через Google API
      const translatedText = await translateWithHuggingFace(data.response);
  
      setMessages([...newMessages, { text: translatedText, sender: "bot" }]);
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center p-4">
      <Card className="w-full max-w-md p-4">
        <CardContent>
          <div className="h-96 overflow-y-auto border p-2 rounded-lg">
            {messages.map((msg, index) => (
              <div key={index} className={`p-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <span className={`px-3 py-1 rounded-lg ${msg.sender === "user" ? "bg-blue-200" : "bg-gray-200"}`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="flex gap-2 p-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Введите сообщение..." />
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "..." : "Отправить"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
