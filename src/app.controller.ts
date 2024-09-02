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
      0: 'Pendente',
      4: 'Motorista chegou ao estabelecimento',
      16: 'Aceito pela Empresa',
      14: 'Aceito pelo motorista',
      5: 'Retirada confirmada pelo Entregador',
      10: 'Cliente chegou ao estabelecimento',
      17: 'Entrega concluída pelo Entregador',
      21: 'Rejeitado por motorista',
      9: 'Cliente quase chegando',
      7: 'Entregador Chegando',
      3: 'Aceito pelo motorista',
      8: 'Entregador quase chegando ao cliente',
      18: 'Retirada concluída pelo cliente',
      19: 'Rejeitado por admin.',
      20: 'Rejeitado por negócios',
      22: 'Falha por motorista',
      23: 'Falha na entrega do motorista',
      24: 'Cancelada pelo cliente',
      25: 'Cliente não retirou o pedido',
      26: 'Concluído por admin.',
      1: 'Pedido agendado',
      11: 'Procurando um Entregador',
      15: 'Motorista chegou ao cliente',
      2: 'Preparação Concluída',
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
