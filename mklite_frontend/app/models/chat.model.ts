export interface ChatUserSummary {
  id_usuario?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
}

export interface MessageModel {
  id_mensaje: number;
  id_chat: number;
  id_remitente: number;
  fecha_hora: string;
  contenido: string;
  leido: boolean;
  sender?: ChatUserSummary;
}

export interface ChatModel {
  id_chat: number;
  id_cliente: number;
  id_agente_soporte?: number | null;
  id_pedido?: number | null;
  fecha_inicio: string;
  estado: string;
  client?: ChatUserSummary;
  supportAgent?: ChatUserSummary;
  messages?: MessageModel[];
}

export interface EnsureChatResponse {
  chat: ChatModel;
  messages: MessageModel[];
}