import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from 'src/entity/refund.entity';
//import { Pedido } from './pedido.entity';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';

@Module({
  //imports: [TypeOrmModule.forFeature([Refund, Pedido])],
  providers: [RefundService],
  controllers: [RefundController],
  exports: [RefundService],
})
export class RefundModule {}