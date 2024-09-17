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
      1: 'concluído',
      2: 'rejeitado',
      3: 'motorista chegou no estabelecimento',
      4: 'com a preparação concluída',
      5: 'rejeitado pela loja',
      6: 'cancelado pelo motorista',
      7: 'aceito pela empresa',
      8: 'aceito pelo motorista',
      9: 'retirada concluída pelo motorista',
      10: 'falha na retirada pelo motorista',
      11: 'entregue ao cliente',
      12: 'pedido não pode ser entregue ao cliente',
      13: 'pedido antecipado',
      14: 'pedido não pronto',
      15: 'retirada concluída pelo cliente',
      16: 'cancelado pelo cliente',
      17: 'não retirado pelo cliente',
      18: 'o motorista está chegando na empresa',
      19: 'o motorista está chegando ao cliente',
      20: 'cliente está chegando ao negócio',
      21: 'cliente chegou na loja',
      22: 'procurando motorista',
      23: 'em rota de entrega',
      24: 'motorista aguardando na empresa',
      25: 'aceito pela empresa',
    };

    const statusText = statusMessages[status] || 'atualizado';

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
