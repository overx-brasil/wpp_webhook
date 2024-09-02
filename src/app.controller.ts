import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('webhook')
  async handleWebhook(
    @Body() data: any,
    @Res() res: Response,
  ): Promise<Response> {
    console.log('Webhook recebido:', data);

    const { id, status, customer } = data;

    if (!customer || !customer.name || !customer.cellphone) {
      console.error('Dados de cliente incompletos:', data);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: 'error', message: 'Dados de cliente incompletos' });
    }

    const customerName = customer.lastname
      ? `${customer.name} ${customer.lastname}`
      : customer.name;

    const customerPhone = this.appService.formatPhoneNumber(customer.cellphone);

    const statusMessages = {
      0: 'pendente',
      7: 'aceito pela Empresa',
      4: 'com a preparação concluída',
      23: 'em rota de entrega',
      11: 'entregue ao cliente',
      16: 'cancelado pelo cliente',
    };

    const statusText = statusMessages[status];

    try {
      const twilioResponse = await this.appService.sendWhatsAppTemplateMessage(
        customerPhone,
        customerName,
        id.toString(),
        statusText,
      );
      return res.status(HttpStatus.OK).json({ status: 'success' });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }
}
