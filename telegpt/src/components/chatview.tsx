// components/ChatView.tsx
import "../app/App.css";
import { useParams } from "react-router-dom";
import { chats as mockChats, type Chat, type Message } from "../mock/chats";
import { useEffect, useState } from "react";

export const ChatView = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");


  useEffect(() => {
    const saved = localStorage.getItem("chats");
    if (!saved) {
      localStorage.setItem("chats", JSON.stringify(mockChats));
      setAllChats(mockChats);
    } else {
      try {
        const parsed: Chat[] = JSON.parse(saved);
        setAllChats(parsed);
      } catch (e) {
        console.log("error parsing chats:", e);
        localStorage.setItem("chats", JSON.stringify(mockChats));
        setAllChats(mockChats);
      }
    }
  }, []);

  useEffect(() => {
    setInputText("");
  }, [chatId]);
  useEffect(() => {
    if (!chatId) {
      setCurrentChat(undefined);
      setMessages([]);
      return;
    }

    const chat = allChats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      setMessages(chat.messages);
    } else {
      setCurrentChat(undefined);
      setMessages([]);
    }
  }, [allChats, chatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentChat) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      from: "Вы",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");

    const systemMsg =
      currentChat.personaDescription && currentChat.personaDescription.trim()
        ? {
            role: "system" as const,
            content: currentChat.personaDescription.trim(),
          }
        : null;

    // D) Конвертируем обновленную историю в формат OpenAI
    const chatHistoryMessages = updatedMessages.map((m) => ({
      role: m.from === "Вы" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    const openaiMessages = systemMsg
      ? [systemMsg, ...chatHistoryMessages]
      : [...chatHistoryMessages];

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: openaiMessages,
          temperature: 0.7,
          max_tokens: 512,
        }),
      });

      const updatedChatsOptimistic = allChats.map((c) =>
        c.id === currentChat.id ? { ...c, messages: updatedMessages } : c
      );
      setAllChats(updatedChatsOptimistic);
      localStorage.setItem("chats", JSON.stringify(updatedChatsOptimistic));

      if (!res.ok) {
        console.error("OpenAI error status:", res.status, await res.text());
        return;
      }

      const data = (await res.json()) as {
        choices: Array<{ message: { role: string; content: string } }>;
      };
      const assistantContent = data.choices[0].message.content.trim();

      const assistantMsg: Message = {
        id: Date.now().toString() + "_ai",
        from: currentChat.name,
        text: assistantContent,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };


      const updatedWithAI = [...updatedMessages, assistantMsg];
      setMessages(updatedWithAI);

      const updatedChatsFinal = allChats.map((c) =>
        c.id === currentChat.id ? { ...c, messages: updatedWithAI } : c
      );
      setAllChats(updatedChatsFinal);
      localStorage.setItem("chats", JSON.stringify(updatedChatsFinal));
    } catch (err) {
      console.error("Fetch to OpenAI failed:", err);
    }
    console.log("OpenAI payload:", JSON.stringify(openaiMessages, null, 2));
  };

  if (!currentChat) {
    return <div className="p-4 text-red-500">Чат не найден</div>;
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center border-b border-gray-200 px-4 py-2">
        <img
          src={currentChat.image}
          alt="user pic"
          className="w-10 h-10 rounded-full mr-5"
        />
        <h2 className="text-base font-bold mb color">
          Чат с {currentChat.name}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 rounded">
        {messages.length === 0 ? (
          <p className="text-gray-500">Сообщений пока нет</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 my-1 mb-5 rounded-2xl max-w-[60%] ${
                msg.from === "Вы"
                  ? "ml-auto bg-[var(--primary-blue)] text-white"
                  : "mr-auto bg-gray-100"
              }`}
            >
              <div
                className={`text-sm text-gray-700 ${
                  msg.from === "Вы"
                    ? "ml-auto bg-[var(--primary-blue)] text-white"
                    : "mr-auto bg-gray-100"
                }`}
              >
                {msg.from}
              </div>

              <div>{msg.text}</div>
              <div
                className={`text-xs text-gray-400 text-right ${
                  msg.from === "Вы"
                    ? "ml-auto bg-[var(--primary-blue)] text-white"
                    : "mr-auto bg-gray-100"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-2 border-t flex items-center gap-2 bg-[var(--bg-primary)] p-4">
        <input
          type="text"
          placeholder="Введите сообщение..."
          className="flex-1 border rounded px-4 py-2 outline-none"
          onChange={handleInputChange}
          value={inputText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};
