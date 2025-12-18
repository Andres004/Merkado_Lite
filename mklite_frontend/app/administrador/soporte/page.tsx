"use client";

import { useEffect, useRef, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { ChatModel, MessageModel } from "../../models/chat.model";
import { fetchAgentChats, fetchMessagesByChat, sendChatMessage } from "../../services/chat.service";
import { Loader2, MessageCircle, Send } from "lucide-react";

const SupportAdminPage = () => {
  const [agentId, setAgentId] = useState<number | null>(null);
  const [chats, setChats] = useState<ChatModel[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatModel | null>(null);
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadChats = async (id: number) => {
    setIsLoadingChats(true);
    try {
      const data = await fetchAgentChats(id);
      setChats(data);
      if (data.length) {
        setSelectedChat(data[0]);
      }
    } catch (error) {
      console.error("No se pudieron obtener los chats", error);
      setStatus("No se pudieron obtener los chats de soporte.");
    } finally {
      setIsLoadingChats(false);
    }
  };

  const loadMessages = async (chatId: number) => {
    setIsLoadingMessages(true);
    try {
      const data = await fetchMessagesByChat(chatId);
      setMessages(data);
    } catch (error) {
      console.error("No se pudieron obtener los mensajes", error);
      setStatus("No se pudieron obtener los mensajes.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.id_usuario) {
      setAgentId(parsed.id_usuario);
      loadChats(parsed.id_usuario);
    } else {
      setStatus("Inicia sesión como administrador para ver los chats de soporte.");
      setIsLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChat?.id_chat) {
      loadMessages(selectedChat.id_chat);
    } else {
      setMessages([]);
    }
  }, [selectedChat?.id_chat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedChat?.id_chat || !agentId) return;

    const text = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [
      ...prev,
      {
        id_mensaje: Date.now(),
        id_chat: selectedChat.id_chat,
        id_remitente: agentId,
        contenido: text,
        fecha_hora: new Date().toISOString(),
        leido: false,
        sender: { id_usuario: agentId },
      },
    ]);

    try {
      await sendChatMessage(selectedChat.id_chat, {
        id_remitente: agentId,
        contenido: text,
      });
      const refreshed = await fetchMessagesByChat(selectedChat.id_chat);
      setMessages(refreshed);
    } catch (error) {
      console.error("No se pudo enviar la respuesta", error);
      setStatus("No se pudo enviar el mensaje, intenta nuevamente.");
    }
  };

  const formatName = (chat: ChatModel) => {
    const cliente = chat.client;
    if (cliente?.nombre || cliente?.apellido) {
      return `${cliente?.nombre ?? ""} ${cliente?.apellido ?? ""}`.trim();
    }
    return `Cliente #${chat.id_cliente}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="text-[#F40009]" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Soporte</h1>
                <p className="text-sm text-gray-600">Responde los mensajes de los clientes que necesitan apoyo.</p>
              </div>
            </div>

            {status && (
              <div className="mb-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{status}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">Chats asignados</div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                  {isLoadingChats ? (
                    <div className="flex items-center justify-center py-6 text-gray-500 text-sm gap-2">
                      <Loader2 className="animate-spin" size={16} /> Cargando chats...
                    </div>
                  ) : chats.length ? (
                    chats.map((chat) => (
                      <button
                        key={chat.id_chat}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full text-left px-3 py-3 hover:bg-red-50 transition border-l-4 ${
                          selectedChat?.id_chat === chat.id_chat ? 'border-[#F40009] bg-red-50' : 'border-transparent'
                        }`}
                      >
                        <p className="font-semibold text-sm text-gray-900">{formatName(chat)}</p>
                        <p className="text-xs text-gray-600">Estado: {chat.estado}</p>
                        <p className="text-[11px] text-gray-500">Inicio: {new Date(chat.fecha_inicio).toLocaleString('es-BO')}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 px-3 py-4">No tienes chats asignados aún.</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 border border-gray-100 rounded-lg flex flex-col">
                <div className="bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100 flex items-center justify-between">
                  <span>{selectedChat ? formatName(selectedChat) : 'Selecciona un chat'}</span>
                  {selectedChat && <span className="text-xs text-gray-500">#{selectedChat.id_chat}</span>}
                </div>
                <div className="flex-1 p-4 space-y-3 max-h-[340px] overflow-y-auto">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center text-gray-500 text-sm gap-2">
                      <Loader2 className="animate-spin" size={16} /> Cargando mensajes...
                    </div>
                  ) : messages.length ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id_mensaje}
                        className={`flex ${msg.id_remitente === agentId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm shadow-sm max-w-[80%] ${
                            msg.id_remitente === agentId
                              ? 'bg-[#F40009] text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.contenido}</p>
                          <span className="block text-[10px] mt-1 opacity-80">
                            {new Date(msg.fecha_hora).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hay mensajes para este chat.</p>
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-gray-100 p-3 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe una respuesta"
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#F40009]"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!selectedChat || !agentId}
                    className="bg-[#F40009] text-white rounded-full p-2 hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAdminPage;