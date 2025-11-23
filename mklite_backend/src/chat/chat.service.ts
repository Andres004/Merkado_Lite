import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { Repository } from "typeorm";
import { Chat } from "src/entity/chat.entity";
import { Message } from "src/entity/message.entity"; 
import { UpdateChatStateDto, SendMessageDto } from "./chat.controller"; 

@Injectable()
export class ChatService {
    private chatRepository: Repository<Chat>;
    private messageRepository: Repository<Message>;

    constructor() {
        if (AppDataSource.isInitialized) {
            this.chatRepository = AppDataSource.getRepository(Chat);
            this.messageRepository = AppDataSource.getRepository(Message);
        }
    }

    private getChatRepo(): Repository<Chat> {
        if (!this.chatRepository) {
             if (!AppDataSource.isInitialized) throw new Error('DataSource no inicializado');
             this.chatRepository = AppDataSource.getRepository(Chat);
        }
        return this.chatRepository;
    }

    private getMessageRepo(): Repository<Message> {
        if (!this.messageRepository) {
             if (!AppDataSource.isInitialized) throw new Error('DataSource no inicializado');
             this.messageRepository = AppDataSource.getRepository(Message);
        }
        return this.messageRepository;
    }

    async startNewChat(id_cliente: number, id_pedido?: number): Promise<Chat> {
        const nuevoChatData: Partial<Chat> = {
            id_cliente: id_cliente,
            estado: 'abierto', 
            fecha_inicio: new Date(),
        };

        if (id_pedido !== undefined && id_pedido !== null) {
             nuevoChatData.id_pedido = id_pedido;
        }

        const nuevoChat = this.getChatRepo().create(nuevoChatData);
        return this.getChatRepo().save(nuevoChat);
    }

    async sendMessage(id_chat: number, dto: SendMessageDto): Promise<Message> {
        const chat = await this.getChatRepo().findOneBy({ id_chat });
        if (!chat) {
            throw new NotFoundException(`Chat con ID ${id_chat} no encontrado.`);
        }

        if (chat.estado === 'cerrado') {
            throw new BadRequestException('No se pueden enviar mensajes a un chat cerrado.');
        }

        const nuevoMensaje = this.getMessageRepo().create({
            id_chat: id_chat,
            id_remitente: dto.id_remitente,
            contenido: dto.contenido,
            leido: false,
            fecha_hora: new Date(),
        });

        return this.getMessageRepo().save(nuevoMensaje);
    }

    async updateState(id_chat: number, dto: UpdateChatStateDto): Promise<Chat> {
        const chat = await this.getChatRepo().findOneBy({ id_chat });
        if (!chat) {
            throw new NotFoundException(`Chat con ID ${id_chat} no encontrado.`);
        }
        
        if (dto.estado) chat.estado = dto.estado;
        if (dto.id_agente_soporte) chat.id_agente_soporte = dto.id_agente_soporte;

        return this.getChatRepo().save(chat);
    }

    async getMessagesByChat(id_chat: number): Promise<Message[]> {
        return this.getMessageRepo().find({ 
            where: { id_chat },
            order: { fecha_hora: 'ASC' },
            relations: ['sender'] 
        });
    }

    async getChatsByAgent(id_agente: number): Promise<Chat[]> {
        return this.getChatRepo().find({
            where: { id_agente_soporte: id_agente },
            order: { fecha_inicio: 'DESC' },
            relations: ['client'] 
        });
    }
}