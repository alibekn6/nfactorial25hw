import "../app/index.css";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { chats } from "../mock/chats";

export const Wrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Автоматически редиректит на /chats если на корне
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/chats");
    }
  }, [location.pathname, navigate]);

  return (
    <div className="w-screen h-screen flex bg-[var(--surface-color)]">
      <aside className="min-w-80 bg-gray-100 border-r p-4 flex flex-col gap-4 overflow-hidden h-screen">
        <div className="flex gap-2">
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `p-2 rounded ${isActive ? "bg-[var(--light-blue)] text-white" : "bg-white"}`
            }
          >
            Чаты
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `p-2 rounded ${isActive ? "bg-[var(--light-blue)] text-white" : "bg-white"}`
            }
          >
            Настройки
          </NavLink>
        </div>

        {/* Список чатов */}
        <div className="flex flex-col gap-2 overflow-auto">
          {chats.map((chat) => {
            const lastMsgText = chat.messages.length
              ? chat.messages[chat.messages.length - 1].text
              : "";

            const truncated =
              lastMsgText.length > 20
                ? `${lastMsgText.slice(0, 20)}...`
                : lastMsgText;

          return (
            <NavLink key={chat.id} to={`/chats/${chat.id}`} className={({ isActive }) => 
            `p-2 rounded-xl flex items-center ${isActive ? "bg-[var(--primary-blue)] text-white" : ""}`
            } >
              
            <img src={chat.image} alt={chat.name} className="w-15 h-15 rounded-full mr-5" />

            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-base truncate">{chat.name}</span>
              <span className="text-sm truncate">{truncated}</span>
            </div>
            </NavLink>
          )
          })}
        </div>
      </aside>

      {/* Основная область */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
    </div>
  );
};
