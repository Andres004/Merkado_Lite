import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';

export class CreateChatDto { 
    id_cliente: number;
    id_pedido?: number; 
}

export class UpdateChatStateDto { 
    estado: string; 
    id_agente_soporte?: number; 
}

export class SendMessageDto { 
    id_remitente: number;
    contenido: string;
}

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    async createChat(@Body() dto: CreateChatDto) {
        return this.chatService.startNewChat(dto.id_cliente, dto.id_pedido);
    }
    
    @Patch('/:id_chat/state')
    async updateState(
        @Param('id_chat', ParseIntPipe) id_chat: number,
        @Body() dto: UpdateChatStateDto
    ) {
        return this.chatService.updateState(id_chat, dto);
    }

    @Post('/:id_chat/message')
    async sendMessage(
        @Param('id_chat', ParseIntPipe) id_chat: number,
        @Body() dto: SendMessageDto
    ) {
        return this.chatService.sendMessage(id_chat, dto);
    }

    @Get('/:id_chat/messages')
    async getMessages(@Param('id_chat', ParseIntPipe) id_chat: number) {
        return this.chatService.getMessagesByChat(id_chat);
    }

    @Get('/agent/:id_agente')
    async getChatsByAgent(@Param('id_agente', ParseIntPipe) id_agente: number) {
        return this.chatService.getChatsByAgent(id_agente);
    }
}