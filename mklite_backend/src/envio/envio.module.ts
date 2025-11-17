import { Module } from "@nestjs/common";
import { EnvioService } from "./envio.service";
import { EnvioController } from "./envio.controller";
import { PedidoModule } from "src/pedido/pedido.module"; 

@Module({
    imports: [PedidoModule], 
    controllers: [EnvioController],
    providers: [EnvioService],
})
export class EnvioModule {}