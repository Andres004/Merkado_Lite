import { instance } from "../utils/axios";
import { ChatModel, EnsureChatResponse, MessageModel } from "../models/chat.model";

export interface SendChatMessageDto {
  id_remitente: number;
  contenido: string;
}

export const ensureChatSession = async (
  clientId: number,
  id_pedido?: number
): Promise<EnsureChatResponse> => {
  const response = await instance.post(`/chat/client/${clientId}/ensure`, { id_pedido });
  return response.data;
};

export const fetchMessagesByChat = async (chatId: number): Promise<MessageModel[]> => {
  const response = await instance.get(`/chat/${chatId}/messages`);
  return response.data;
};

export const sendChatMessage = async (
  chatId: number,
  dto: SendChatMessageDto
): Promise<MessageModel> => {
  const response = await instance.post(`/chat/${chatId}/message`, dto);
  return response.data;
};

export const fetchAgentChats = async (agentId: number): Promise<ChatModel[]> => {
  const response = await instance.get(`/chat/agent/${agentId}`);
  return response.data;
};

export const fetchClientChats = async (clientId: number): Promise<ChatModel[]> => {
  const response = await instance.get(`/chat/client/${clientId}`);
  return response.data;
};

export const fetchChatWithMessages = async (chatId: number): Promise<ChatModel> => {
  const response = await instance.get(`/chat/${chatId}`);
  return response.data;
};