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

          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="p-3 bg-red-50 rounded-full border border-red-100 shadow-sm flex items-center justify-center">
                <MessageCircle className="text-[#F40009] w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Centro de Soporte</h1>
                <p className="text-sm text-gray-700 font-medium">Gestión de mensajes y atención al cliente.</p>
              </div>
            </div>

            {status && (
              <div className="mb-4 text-sm font-medium text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                {status}
              </div>
            )}

            {/* AQUÍ ESTÁ EL ARREGLO: 
               1. h-[600px] fija la altura del contenedor principal.
               2. Los hijos directos (las columnas) tienen h-full para respetar esa altura.
               3. min-h-0 en los hijos flex evita que el contenido empuje el contenedor infinito.
            */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
              
              {/* --- LISTA DE CHATS (Izquierda) --- */}
              <div className="md:col-span-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white h-full">
                <div className="bg-gray-100 px-4 py-3 text-sm font-bold text-black border-b border-gray-200">
                  Chats Activos
                </div>
                {/* min-h-0 es clave para el scroll en flexbox anidado */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-0">
                  {isLoadingChats ? (
                    <div className="flex items-center justify-center py-6 text-gray-700 font-medium text-sm gap-2">
                      <Loader2 className="animate-spin text-[#F40009]" size={16} /> Cargando...
                    </div>
                  ) : chats.length ? (
                    chats.map((chat) => (
                      <button
                        key={chat.id_chat}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full text-left px-4 py-4 transition border-l-4 ${
                          selectedChat?.id_chat === chat.id_chat 
                            ? 'border-[#F40009] bg-red-50' 
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <p className="font-bold text-sm text-black mb-1">{formatName(chat)}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
                            {chat.estado}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-600">
                            {new Date(chat.fecha_inicio).toLocaleDateString('es-BO')}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-700 font-medium px-4 py-6 text-center">No tienes chats asignados.</p>
                  )}
                </div>
              </div>

              {/* --- AREA DE MENSAJES (Derecha) --- */}
              <div className="md:col-span-2 border border-gray-200 rounded-lg flex flex-col bg-white shadow-sm h-full overflow-hidden">
                
                {/* Header del Chat Individual */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-sm font-bold text-black block">
                      {selectedChat ? formatName(selectedChat) : 'Selecciona un chat'}
                    </span>
                    {selectedChat && (
                      <span className="text-xs font-medium text-gray-600">ID Chat: #{selectedChat.id_chat}</span>
                    )}
                  </div>
                </div>

                {/* Lista de Mensajes (Scrollable) */}
                {/* min-h-0 evita el desborde infinito */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white min-h-0">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full text-gray-700 font-medium text-sm gap-2">
                      <Loader2 className="animate-spin text-[#F40009]" size={20} /> Cargando historial...
                    </div>
                  ) : messages.length ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id_mensaje}
                        className={`flex ${msg.id_remitente === agentId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm max-w-[85%] ${
                            msg.id_remitente === agentId
                              ? 'bg-[#F40009] text-white rounded-br-none' // Enviado (Rojo)
                              : 'bg-gray-100 text-gray-900 font-medium rounded-bl-none border border-gray-200' // Recibido (Gris Oscuro)
                          }`}
                        >
                          <p className="leading-relaxed">{msg.contenido}</p>
                          <span className={`block text-[10px] mt-1 text-right ${
                             msg.id_remitente === agentId ? 'text-red-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.fecha_hora).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageCircle size={40} className="mb-2 opacity-20" />
                        <p className="text-sm font-medium text-gray-600">No hay mensajes en este chat.</p>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input Area (Fixed at bottom) */}
                <div className="border-t border-gray-200 p-3 bg-gray-50 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe una respuesta..."
                    className="flex-1 text-sm text-black placeholder:text-gray-500 px-4 py-2.5 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F40009] focus:border-transparent transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!selectedChat || !agentId}
                    className="bg-[#F40009] text-white rounded-full p-2.5 hover:bg-red-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
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