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

    try {
      const twilioResponse = await this.appService.sendWhatsAppMessage(
        customerPhone,
        message,
      );
      console.log('Resposta do Twilio:', twilioResponse);
      return res.status(HttpStatus.OK).json({ status: 'success' });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  }
}
