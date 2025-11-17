import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Refund } from 'src/entity/refund.entity';

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    /*@InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,*/
  ) {}


  // TODO: Inyectar cuando UsuarioRolService esté disponible
  // @Inject(forwardRef(() => UsuarioRolService))
  // private usuarioRolService: UsuarioRolService;


  // Crear un nuevo reembolso
  async create(refundData: Partial<Refund>): Promise<Refund> {
    // Validaciones básicas
    if (!refundData.id_vendedor) {
      throw new BadRequestException('El ID del vendedor es requerido');
    }

    /**if (!refundData.id_pedido) {
      throw new BadRequestException('El ID del pedido es requerido');
    }*/

    if (!refundData.monto || refundData.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    // TODO: Implementar cuando UsuarioRolService esté disponible
    /*
    // Validar que el usuario tiene rol de vendedor
    const tieneRolVendedor = await this.usuarioRolService.validarRolVendedor(refundData.id_vendedor);
    if (!tieneRolVendedor) {
      throw new ForbiddenException('El usuario no tiene permisos de vendedor para crear reembolsos');
    }
    */

    const refund = this.refundRepository.create(refundData);
    return await this.refundRepository.save(refund);
  }

  // Obtener todos los reembolsos
  async findAll(): Promise<Refund[]> {
    return await this.refundRepository.find({
      //relations: ['pedido'],
      order: { fecha_devolucion: 'DESC' }
    });
  }

  // Obtener un reembolso por ID
  async findOne(id: number): Promise<Refund> {
    const refund = await this.refundRepository.findOne({
      where: { id_devolucion: id },
      //relations:['pedido']
      
    });

    if (!refund) {
      throw new NotFoundException(`Reembolso con ID ${id} no encontrado`);
    }

    return refund;
  }

  // Obtener un reembolso por ID de vendedor
  async findByVendedorId(idVendedor: number): Promise<Refund[]> {
    // TODO: Validar rol de vendedor cuando UsuarioRolService esté disponible
    /*
    const tieneRolVendedor = await this.usuarioRolService.validarRolVendedor(idVendedor);
    if (!tieneRolVendedor) {
      throw new ForbiddenException('El usuario no tiene permisos de vendedor');
    }
    */

    return await this.refundRepository.find({
      where: { id_vendedor: idVendedor },
      order: { fecha_devolucion: 'DESC' }
    });
  }

  // Obtener reembolsos por ID de pedido
  /*async findByPedidoId(idPedido: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { id_pedido: idPedido },
      relations: ['pedido'],
      order: { fecha_devolucion: 'DESC' }
    });
  }*/

  async update(id: number, updateData: Partial<Refund>): Promise<Refund> {
    const refund = await this.findOne(id);
    
    // Validar pedido si se está actualizando
    /*if (updateData.id_pedido && updateData.id_pedido !== refund.id_pedido) {
      const pedido = await this.pedidoRepository.findOne({
        where: { id_pedido: updateData.id_pedido }
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${updateData.id_pedido} no encontrado`);
      }
    }*/

    // TODO: Validar rol de vendedor cuando UsuarioRolService esté disponible
    /*
    if (updateData.id_vendedor && updateData.id_vendedor !== refund.id_vendedor) {
      const tieneRolVendedor = await this.usuarioRolService.validarRolVendedor(updateData.id_vendedor);
      if (!tieneRolVendedor) {
        throw new ForbiddenException('El nuevo usuario no tiene permisos de vendedor');
      }
    }
    */

    const updatedRefund = await this.refundRepository.save({
      ...refund,
      ...updateData,
    });

    return updatedRefund;
  }

  // Eliminar un reembolso por ID
  async remove(id: number): Promise<void> {
    const result = await this.refundRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Reembolso con ID ${id} no encontrado`);
    }
  }

  //Devuelve los reembolsos en un rango de fechas
  async getRefundsByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: {
        fecha_devolucion: Between(fechaInicio, fechaFin)
      },
      //relations: ['pedido'],
      order: { fecha_devolucion: 'DESC' }
    });
  }

  // Obtener el total de reembolsos por ID de vendedor
  async getTotalRefundsByVendedor(idVendedor: number): Promise<number> {
    // TODO: Validar rol de vendedor cuando UsuarioRolService esté disponible
    /*
    const tieneRolVendedor = await this.usuarioRolService.validarRolVendedor(idVendedor);
    if (!tieneRolVendedor) {
      throw new ForbiddenException('El usuario no tiene permisos de vendedor');
    }
    */

    const result = await this.refundRepository
      .createQueryBuilder('refund')
      .select('SUM(refund.monto)', 'total')
      .where('refund.id_vendedor = :idVendedor', { idVendedor })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  // Obtener reembolso por ID de pedido e ID de vendedor
  /*async getRefundsByPedidoAndVendedor(idPedido: number, idVendedor: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: {
        id_pedido: idPedido,
        id_vendedor: idVendedor
      },
      relations: ['pedido'],
      order: { fecha_devolucion: 'DESC' }
    });
  }*/
}