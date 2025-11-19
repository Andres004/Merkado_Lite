import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';

// DTOs definidos en el Controller

class CreateChatDto { 
    id_cliente: number;
    id_pedido?: number; 
}

export class UpdateChatStateDto { // Corregido con 'export'
    estado: string; 
    id_agente_soporte?: number; 
}

export class SendMessageDto { // Corregido con 'export'
    id_remitente: number;
    contenido: string;
}

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    async createChat(@Body() dto: CreateChatDto) {
        return this.chatService.iniciarNuevoChat(dto.id_cliente, dto.id_pedido);
    }
    
    @Patch('/:id_chat/estado')
    async updateState(
        @Param('id_chat', ParseIntPipe) id_chat: number,
        @Body() dto: UpdateChatStateDto
    ) {
        return this.chatService.actualizarEstado(id_chat, dto);
    }

    @Post('/:id_chat/mensaje')
    async sendMessage(
        @Param('id_chat', ParseIntPipe) id_chat: number,
        @Body() dto: SendMessageDto
    ) {
        return this.chatService.enviarMensaje(id_chat, dto);
    }

    @Get('/:id_chat/mensajes')
    async getMessages(@Param('id_chat', ParseIntPipe) id_chat: number) {
        return this.chatService.getMensajesPorChat(id_chat);
    }

    @Get('/agente/:id_agente')
    async getChatsByAgent(@Param('id_agente', ParseIntPipe) id_agente: number) {
        return this.chatService.getChatsPorAgente(id_agente);
    }
}