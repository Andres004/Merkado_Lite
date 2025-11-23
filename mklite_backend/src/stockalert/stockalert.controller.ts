import { Body, Controller, Delete, Get, Param, Post, ParseIntPipe } from "@nestjs/common";
import { StockAlertService } from "./stockalert.service";
import { StockAlert } from "src/entity/stockalert.entity";

@Controller('stockalert')
export class StockAlertController {

    constructor(private readonly stockAlertService: StockAlertService) {}

    @Post()
    async createAlert(@Body() alert: StockAlert) {
        return await this.stockAlertService.createAlert(alert);
    }

    @Get()
    async getAllAlerts() {
        return await this.stockAlertService.getAllAlerts();
    }

    @Get('/product/:id_producto')
    async getAlertsByProduct(@Param('id_producto', ParseIntPipe) id_producto: number) {
        return await this.stockAlertService.getAlertsByProductId(id_producto);
    }

    @Delete('/:id_alerta')
    async deleteAlert(@Param('id_alerta', ParseIntPipe) id_alerta: number) {
        return await this.stockAlertService.deleteAlert(id_alerta);
    }
}