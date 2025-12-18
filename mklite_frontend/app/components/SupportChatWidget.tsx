'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Headset, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { ensureChatSession, fetchMessagesByChat, sendChatMessage } from '../services/chat.service';
import { MessageModel } from '../models/chat.model';

interface UiMessage {
  id?: number;
  content: string;
  sender: 'user' | 'support';
  timestamp?: string;
}

const mockGreetings: UiMessage[] = [
  { sender: 'support', content: 'Hola 👋 ¿En qué podemos ayudarte?' },
  { sender: 'support', content: 'Un agente te responderá pronto.' },
];

const SupportChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>(mockGreetings);
  const [inputValue, setInputValue] = useState('');
  const [chatId, setChatId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [mode, setMode] = useState<'api' | 'mock'>('mock');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const statusLabel = useMemo(() => {
    if (mode === 'mock') return 'Te responderemos pronto';
    return 'En línea';
  }, [mode]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const mapMessages = (items: MessageModel[], currentUserId: number): UiMessage[] =>
    items.map((msg) => ({
      id: msg.id_mensaje,
      content: msg.contenido,
      sender: msg.id_remitente === currentUserId ? 'user' : 'support',
      timestamp: msg.fecha_hora,
    }));

  const bootstrapChat = async () => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;

    if (!storedUser) {
      setMode('mock');
      setClientId(null);
      setChatId(null);
      setMessages(mockGreetings);
      return;
    }

    const parsed = JSON.parse(storedUser || '{}');
    if (!parsed?.id_usuario) {
      setMode('mock');
      setClientId(null);
      setChatId(null);
      setMessages(mockGreetings);
      return;
    }

    setClientId(parsed.id_usuario);
    setIsLoading(true);

    try {
      const session = await ensureChatSession(parsed.id_usuario);
      setMode('api');
      setChatId(session.chat.id_chat);

      const mapped = mapMessages(session.messages, parsed.id_usuario);
      setMessages(mapped.length ? mapped : mockGreetings);
    } catch (error) {
      console.error('No se pudo inicializar el chat real, usando mock.', error);
      setMode('mock');
      setChatId(null);
      setMessages([
        { sender: 'support', content: 'Hola 👋 ¿En qué podemos ayudarte?' },
        { sender: 'support', content: 'Un agente te responderá pronto' },
        { sender: 'support', content: 'No pudimos conectar con soporte, usando chat simulado.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      bootstrapChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const content = inputValue.trim();
    const pendingMessage: UiMessage = {
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, pendingMessage]);
    setInputValue('');

    if (mode === 'api' && chatId && clientId) {
      setIsSending(true);
      try {
        await sendChatMessage(chatId, { id_remitente: clientId, contenido: content });
        const refreshed = await fetchMessagesByChat(chatId);
        setMessages(mapMessages(refreshed, clientId));
      } catch (error) {
        console.error('No se pudo enviar el mensaje al chat real.', error);
        setMode('mock');
        setMessages((prev) => [
          ...prev,
          { sender: 'support', content: 'No pudimos entregar el mensaje, usando chat simulado.' },
        ]);
      } finally {
        setIsSending(false);
      }
      return;
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'support', content: 'Un agente te responderá pronto' },
      ]);
    }, 600);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Abrir chat de soporte"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-40 bg-[#F40009] text-white rounded-full shadow-xl p-4 hover:scale-105 transition-transform flex items-center gap-2"
      >
        <MessageCircle size={22} />
        <span className="hidden sm:inline text-sm font-semibold">Soporte</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Headset className="text-[#F40009]" size={20} />
              <div>
                <p className="text-sm font-bold text-black">Soporte</p>
                <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {statusLabel}
                </p>
              </div>
            </div>
            <button
              aria-label="Cerrar chat"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 bg-white px-3 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: '320px' }}>
            {isLoading ? (
              <div className="flex items-center justify-center text-gray-600 text-sm gap-2 mt-10">
                <Loader2 className="animate-spin text-[#F40009]" size={18} /> Conectando...
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id ?? index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm shadow-sm max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'bg-[#F40009] text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-none font-medium'
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.timestamp && (
                      <span className={`block text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-red-100' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'api' ? 'Escribe tu mensaje...' : 'Modo simulado...'}
                // CAMBIO VISUAL AQUÍ: Fondo gris, texto negro, borde visible
                className="flex-1 text-sm text-black placeholder:text-gray-600 bg-gray-100 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F40009] focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || isLoading}
                className="bg-[#F40009] text-white rounded-full p-2.5 hover:bg-red-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;