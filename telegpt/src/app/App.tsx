import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ChatView } from "../components/chatview";
import { Wrapper } from "../components/wrapper";
import { Settings } from "../components/settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Wrapper />}>
        <Route path="chats" element={<div className="p-4 text-gray-500">Выберите чат слева</div>} />
        <Route path="chats/:chatId" element={<ChatView />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
