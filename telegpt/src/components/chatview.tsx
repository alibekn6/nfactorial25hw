// components/ChatView.tsx
import { useParams } from "react-router-dom";
import { chats } from "../mock/chats";

export const ChatView = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const chat = chats.find((c) => c.id === chatId);

  if (!chat) {
    return <div className="p-4 text-red-500">Чат не найден</div>;
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">Чат с {chat.name}</h2>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded border">
        {chat.messages.length === 0 ? (
          <p className="text-gray-500">Сообщений пока нет</p>
        ) : (
          chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 my-1 rounded max-w-[60%] ${
                msg.from === "Вы"
                  ? "ml-auto bg-[var(--primary-blue)] text-white"
                  : "mr-auto bg-white border"
              }`}
            >
              <div className={`text-sm text-gray-700 ${
                msg.from === "Вы"
                  ? "ml-auto bg-[var(--primary-blue)] text-white"
                  : "mr-auto bg-white"
              }`}>{msg.from}</div>

              <div>{msg.text}</div>
              <div className="text-xs text-gray-400 text-right">
                {msg.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
