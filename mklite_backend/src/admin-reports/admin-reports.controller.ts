import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import type { Response } from 'express';

import { DailyReportResponse } from './dto/daily-report.dto';

@Controller('admin/reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminReportsController {
  private pdfKit: any;

  constructor(private readonly reportsService: AdminReportsService) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.pdfKit = require('pdfkit');
    } catch {
      this.pdfKit = null;
    }
  }

  @Get('daily')
  @Roles('ADMIN')
  async getDailyReport(
    @Query('date') date?: string,
    @Query('estado') estado?: string,
  ): Promise<DailyReportResponse> {
    return this.reportsService.buildDailyReport(date, estado);
  }

  @Get('daily.pdf')
  @Roles('ADMIN')
  async getDailyReportPdf(
    @Res() res: Response,
    @Query('date') date?: string,
    @Query('estado') estado?: string,
  ): Promise<void> {
    const report = await this.reportsService.buildDailyReport(date, estado);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte-diario-${report.date}.pdf"`,
    );
    // res.setHeader('Cache-Control', 'no-store');

    if (this.pdfKit) {
      const PDFDocument = this.pdfKit;
      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);

      doc.fontSize(18).text('Reporte Económico Diario', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Fecha: ${report.date}`);
      doc.text(`Estados considerados: ${report.summary.estadosConsiderados.join(', ')}`);
      doc.moveDown();

      doc.fontSize(14).text('Resumen económico', { underline: true });
      doc.fontSize(12).list([
        `Ventas del día: Bs. ${report.summary.totalVentas.toFixed(2)}`,
        `Pedidos: ${report.summary.totalPedidos}`,
        `Subtotal: Bs. ${report.summary.subtotalTotal.toFixed(2)}`,
        `Costo de envíos: Bs. ${report.summary.totalEnvios.toFixed(2)}`,
        `Ticket promedio: Bs. ${report.summary.ticketPromedio.toFixed(2)}`,
      ]);
      doc.moveDown();

      doc.fontSize(14).text('Pedidos del día', { underline: true });
      doc.moveDown(0.5);

      const orderTableHeader = ['ID', 'Hora', 'Cliente', 'Estado', 'Entrega', 'Pago', 'Total'];
      doc.fontSize(11).text(orderTableHeader.join(' | '));
      doc.moveDown(0.25);

      report.orders.slice(0, 20).forEach((order) => {
        const time = order.fecha_creacion
          ? new Date(order.fecha_creacion).toLocaleTimeString('es-BO')
          : '';
        const row = [
          order.id_pedido,
          time,
          order.cliente ?? 'Sin cliente',
          order.estado,
          order.tipo_entrega,
          order.metodo_pago,
          `Bs. ${order.total.toFixed(2)}`,
        ];
        doc.text(row.join(' | '));
      });

      doc.moveDown();

      doc.fontSize(14).text('Top productos', { underline: true });
      doc.moveDown(0.5);

      report.topProducts.forEach((p, index) => {
        doc
          .fontSize(11)
          .text(`${index + 1}. ${p.nombre} — ${p.unidades} unidades — Bs. ${p.revenue.toFixed(2)}`);
      });

      if (!report.topProducts.length) {
        doc.fontSize(11).text('Sin ventas registradas en la fecha.');
      }

      doc.moveDown();

      doc.fontSize(14).text('Alertas stock mínimo', { underline: true });
      doc.moveDown(0.5);

      if (!report.lowStock.length) {
        doc.fontSize(11).text('Todo el inventario está en niveles OK.');
      } else {
        report.lowStock.forEach((item) => {
          doc
            .fontSize(11)
            .text(
              `${item.producto} (ID ${item.id_producto}) — Stock ${item.stock} / mínimo ${item.stock_minimo}`,
            );
        });
      }

      doc.end();
      return;
    }

    const fallbackBuffer = this.buildFallbackPdf(report);
    res.send(fallbackBuffer);
    return;
  }

  @Get('daily-orders.csv')
  @Roles('ADMIN')
  async getDailyOrdersCsv(
    @Res() res: Response,
    @Query('date') date?: string,
    @Query('estado') estado?: string,
  ): Promise<void> {
    const report = await this.reportsService.buildDailyReport(date, estado);

    const headers = [
      'id_pedido',
      'fecha',
      'cliente',
      'estado',
      'tipo_entrega',
      'metodo_pago',
      'total',
    ];

    const rows = report.orders.map((order) => {
      const fecha = order.fecha_creacion ? new Date(order.fecha_creacion).toISOString() : '';
      return [
        order.id_pedido,
        fecha,
        order.cliente ?? 'Sin cliente',
        order.estado,
        order.tipo_entrega,
        order.metodo_pago,
        order.total.toFixed(2),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="pedidos-${report.date}.csv"`);
    // res.setHeader('Cache-Control', 'no-store');
    res.send(csv);
    return;
  }

  @Get('daily-inventory.csv')
  @Roles('ADMIN')
  async getDailyInventoryCsv(
    @Res() res: Response,
    @Query('date') date?: string,
    @Query('estado') estado?: string,
  ): Promise<void> {
    const report = await this.reportsService.buildDailyReport(date, estado);

    const headers = ['id_producto', 'producto', 'stock', 'stock_minimo', 'estado'];
    const rows = report.inventorySnapshot.map((item) => [
      item.id_producto,
      item.producto,
      item.stock,
      item.stock_minimo,
      item.estado,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventario-${report.date}.csv"`);
    // res.setHeader('Cache-Control', 'no-store');
    res.send(csv);
    return;
  }

  private escapePdfText(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  private buildFallbackPdf(report: DailyReportResponse): Buffer {
    const lines: string[] = [];
    lines.push('Reporte Económico Diario');
    lines.push(`Fecha: ${report.date}`);
    lines.push(`Estados considerados: ${report.summary.estadosConsiderados.join(', ')}`);
    lines.push('');
    lines.push(`Ventas del día: Bs. ${report.summary.totalVentas.toFixed(2)}`);
    lines.push(`Pedidos: ${report.summary.totalPedidos}`);
    lines.push(`Subtotal: Bs. ${report.summary.subtotalTotal.toFixed(2)}`);
    lines.push(`Costo de envíos: Bs. ${report.summary.totalEnvios.toFixed(2)}`);
    lines.push(`Ticket promedio: Bs. ${report.summary.ticketPromedio.toFixed(2)}`);
    lines.push('');
    lines.push('Pedidos del día');

    report.orders.slice(0, 20).forEach((order) => {
      const time = order.fecha_creacion
        ? new Date(order.fecha_creacion).toLocaleTimeString('es-BO')
        : '';
      lines.push(
        `#${order.id_pedido} ${time} ${order.cliente ?? 'Sin cliente'} ${order.estado} ${
          order.tipo_entrega
        } ${order.metodo_pago} Bs. ${order.total.toFixed(2)}`,
      );
    });

    lines.push('');
    lines.push('Top productos');

    report.topProducts.forEach((p, index) => {
      lines.push(`${index + 1}. ${p.nombre} - ${p.unidades} unidades - Bs. ${p.revenue.toFixed(2)}`);
    });

    if (!report.topProducts.length) {
      lines.push('Sin ventas registradas en la fecha.');
    }

    lines.push('');
    lines.push('Alertas stock mínimo');

    if (!report.lowStock.length) {
      lines.push('Todo el inventario está en niveles OK.');
    } else {
      report.lowStock.forEach((item) => {
        lines.push(
          `${item.producto} (ID ${item.id_producto}) — Stock ${item.stock} / mínimo ${item.stock_minimo}`,
        );
      });
    }

    return this.buildSimplePdf(lines);
  }

  private buildSimplePdf(lines: string[]): Buffer {
    const header = '%PDF-1.4\n';
    const objects: string[] = [];
    const offsets: number[] = [0];
    let currentOffset = header.length;

    const addObject = (id: number, body: string) => {
      offsets[id] = currentOffset;
      const serialized = `${id} 0 obj\n${body}\nendobj\n`;
      objects.push(serialized);
      currentOffset += serialized.length;
    };

    const contentLines = lines.map((line) => this.escapePdfText(line));
    let contentStream = 'BT\n/F1 12 Tf\n72 750 Td\n';
    contentLines.forEach((line) => {
      contentStream += `(${line}) Tj\n0 -18 Td\n`;
    });
    contentStream += 'ET';

    const contentLength = Buffer.byteLength(contentStream, 'utf-8');

    addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
    addObject(2, '<< /Type /Pages /Count 1 /Kids [3 0 R] >>');
    addObject(
      3,
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    );
    addObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    addObject(5, `<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream`);

    let pdf = header + objects.join('');

    const xrefOffset = pdf.length;
    let xref = `xref\n0 ${objects.length + 1}\n`;
    xref += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i++) {
      xref += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    pdf += xref + trailer;

    return Buffer.from(pdf, 'utf-8');
  }
}
