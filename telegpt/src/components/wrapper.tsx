import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { chats } from "../mock/chats"

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
    <div className="w-screen h-screen flex">
      <aside className="min-w-80 bg-gray-100 border-r p-4 flex flex-col gap-4">
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
        <div className="flex flex-col gap-2">
          {chats.map((chat) => (
            <NavLink
              key={chat.id}
              to={`/chats/${chat.id}`}
              className={({ isActive }) =>
                `p-2 rounded border ${
                  isActive ? "bg-[var(--light-blue)] text-white" : "bg-white"
                }`
              }
            >
              {chat.name}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Основная область */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
    </div>
  );
};
