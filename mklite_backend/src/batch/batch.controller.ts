import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Batch } from 'src/entity/batch.entity';

@Controller('/batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  async create(@Body() batch: Batch) {
    return await this.batchService.createBatch(batch);
  }

  @Get()
  async getAll() {
    return await this.batchService.getAllBatches();
  }

  @Get('/:id_lote')
  async getById(@Param('id_lote') id: string) {
    return await this.batchService.getById(Number(id));
  }

  @Get('/warning/expiring/:days')
  async getExpiring(@Param('days') days: string) {
    return await this.batchService.getExpiring(Number(days));
  }

  @Get('/warning/expired')
  async getExpired() {
    return await this.batchService.getExpiredBatches();
  }
}
