import { Module } from "@nestjs/common";
import { PedidoService } from "./pedido.service";
import { PedidoController } from "./pedido.controller";
// ASUMIDO: Tu compañero implementará estos módulos.
import { LoteModule } from "../lote/lote.module"; 
import { InventarioModule } from "../inventario/inventario.module"; 

@Module({
    imports: [LoteModule, InventarioModule], 
    controllers: [PedidoController],
    providers: [PedidoService],
    exports: [PedidoService] 
})

export class PedidoModule {}
