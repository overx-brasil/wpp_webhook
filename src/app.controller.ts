import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly whatsAppService: AppService) { }

  @Post('webhook')
  async handleWebhook(@Body() data: any, @Res() res: Response): Promise<Response> {
    const { id, status, customer } = data;
    const customerName = `${customer.name} ${customer.lastname}`;
    const customerPhone = customer.cellphone;

    const statusMessages = {
      0: 'recebido',
      1: 'em preparação',
      2: 'pronto para entrega',
      3: 'a caminho',
      4: 'entregue',
      5: 'cancelado',
    };

    const statusText = statusMessages[status] || 'atualizado';
    const message = `Olá ${customerName}, seu pedido #${id} está ${statusText}. Obrigado por comprar conosco!`;

    const isMessageSent = await this.whatsAppService.sendWhatsAppMessage(customerPhone, message);

    if (isMessageSent) {
      return res.status(HttpStatus.OK).json({ status: 'success' });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: 'error' });
    }
  }
}
