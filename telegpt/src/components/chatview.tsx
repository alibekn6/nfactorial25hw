// src/components/ChatView.tsx
import "../app/App.css";
import { useParams } from "react-router-dom";
import { chats as mockChats, type Chat, type Message } from "../mock/chats";
import { useEffect, useState } from "react";
import { useChatCompletion } from "../hooks/useChatCompletion";
import type { GPTMessage } from "../api/gptService";

export const ChatView = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");

  // 1. Загрузка чатов из localStorage / заполняем mock при отсутствии
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
        console.error("Error parsing chats from localStorage:", e);
        localStorage.setItem("chats", JSON.stringify(mockChats));
        setAllChats(mockChats);
      }
    }
  }, []);

  // 2. Сброс input при переключении чата
  useEffect(() => {
    setInputText("");
  }, [chatId]);

  // 3. Когда список allChats меняется или chatId меняется — выбираем текущий чат
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

  // 4. Хук для отправки в GPT
  const { mutate: sendToGPT, isLoading: isGPTLoading } = useChatCompletion({
    onSuccess: (assistantContent) => {
      // Когда GPT вернул ответ, формируем сообщение и записываем в локальный стейт + localStorage
      if (!currentChat) return;

      const assistantMsg: Message = {
        id: Date.now().toString() + "_ai",
        from: currentChat.name,
        text: assistantContent,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const newMsgs = [...messages, assistantMsg];
      // Обновляем локальный стейт сообщений
      setMessages(newMsgs);

      // Обновляем allChats и localStorage
      const updatedChatsFinal = allChats.map((c) =>
        c.id === currentChat.id ? { ...c, messages: newMsgs } : c
      );
      setAllChats(updatedChatsFinal);
      localStorage.setItem("chats", JSON.stringify(updatedChatsFinal));
    },
    onError: (error) => {
      // Здесь можно показать пользователю уведомление об ошибке, если нужно
      console.error("GPT Error:", error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSend = () => {
    if (!inputText.trim() || !currentChat) return;

    // 1. Формируем наше пользовательское сообщение
    const newMsg: Message = {
      id: Date.now().toString(),
      from: "Вы",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // 2. Оптимистично обновляем локальный стейт
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");

    // 3. Обновляем локальное хранилище чатов
    const updatedChatsOptimistic = allChats.map((c) =>
      c.id === currentChat.id ? { ...c, messages: updatedMessages } : c
    );
    setAllChats(updatedChatsOptimistic);
    localStorage.setItem("chats", JSON.stringify(updatedChatsOptimistic));

    // 4. Готовим массив сообщений для OpenAI (в формате GPTMessage)
    const systemMsg: GPTMessage | null =
      currentChat.personaDescription && currentChat.personaDescription.trim()
        ? {
            role: "system",
            content: currentChat.personaDescription.trim(),
          }
        : null;

    const chatHistoryMessages: GPTMessage[] = updatedMessages.map((m) => ({
      role: m.from === "Вы" ? "user" : "assistant",
      content: m.text,
    }));

    const openaiMessages: GPTMessage[] = systemMsg
      ? [systemMsg, ...chatHistoryMessages]
      : [...chatHistoryMessages];

    // 5. Посылаем в GPT (через useMutation)
    sendToGPT(openaiMessages);
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
          disabled={isGPTLoading}
        />
        <button
          className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded"
          onClick={handleSend}
          disabled={isGPTLoading}
        >
          {isGPTLoading ? "Пишет..." : "Отправить"}
        </button>
      </div>
    </div>
  );
};
