import { Controller, Get } from '@nestjs/common';
import { StockAlertService } from './stockalert.service';

@Controller('/stockalert')
export class StockAlertController {
  constructor(private readonly alertService: StockAlertService) {}

  @Get()
  async getAll() {
    return await this.alertService.getAllAlerts();
  }
}
