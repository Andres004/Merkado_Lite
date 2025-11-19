import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { Repository } from "typeorm";
import { Chat } from "src/entity/chat.entity";
import { Mensaje } from "src/entity/message.entity"; 
import { UpdateChatStateDto, SendMessageDto } from "./chat.controller"; 

@Injectable()
export class ChatService {
    private chatRepository: Repository<Chat>;
    private mensajeRepository: Repository<Mensaje>;

    private getChatRepository(): Repository<Chat> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.chatRepository) this.chatRepository = AppDataSource.getRepository(Chat);
        return this.chatRepository;
    }

    private getMensajeRepository(): Repository<Mensaje> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.mensajeRepository) this.mensajeRepository = AppDataSource.getRepository(Mensaje);
        return this.mensajeRepository;
    }

    async iniciarNuevoChat(id_cliente: number, id_pedido?: number): Promise<Chat> {
        
        const nuevoChatData: Partial<Chat> = {
            id_cliente: id_cliente,
            estado: 'abierto', 
            fecha_inicio: new Date(),
        };

        // Corrección del error TS2769: Solo asignamos si el valor está presente
        if (id_pedido !== undefined && id_pedido !== null) {
             nuevoChatData.id_pedido = id_pedido;
        }

        const nuevoChat = this.getChatRepository().create(nuevoChatData);

        return this.getChatRepository().save(nuevoChat);
    }

    async enviarMensaje(id_chat: number, dto: SendMessageDto): Promise<Mensaje> {
        const chat = await this.getChatRepository().findOneBy({ id_chat });
        if (!chat) {
            throw new NotFoundException(`Chat con ID ${id_chat} no encontrado.`);
        }

        if (chat.estado === 'cerrado') {
            throw new BadRequestException('No se pueden enviar mensajes a un chat cerrado.');
        }

        const nuevoMensaje = this.getMensajeRepository().create({
            id_chat: id_chat,
            id_remitente: dto.id_remitente,
            contenido: dto.contenido,
            leido: false,
            fecha_hora: new Date(),
        });

        return this.getMensajeRepository().save(nuevoMensaje);
    }

    async actualizarEstado(id_chat: number, dto: UpdateChatStateDto): Promise<Chat> {
        const chat = await this.getChatRepository().findOneBy({ id_chat });
        if (!chat) {
            throw new NotFoundException(`Chat con ID ${id_chat} no encontrado.`);
        }
        
        if (dto.estado) chat.estado = dto.estado;
        if (dto.id_agente_soporte) chat.id_agente_soporte = dto.id_agente_soporte;

        return this.getChatRepository().save(chat);
    }

    async getMensajesPorChat(id_chat: number): Promise<Mensaje[]> {
        return this.getMensajeRepository().find({ 
            where: { id_chat },
            order: { fecha_hora: 'ASC' }
        });
    }

    async getChatsPorAgente(id_agente: number): Promise<Chat[]> {
        return this.getChatRepository().find({
            where: { id_agente_soporte: id_agente },
            order: { fecha_inicio: 'DESC' }
        });
    }
}