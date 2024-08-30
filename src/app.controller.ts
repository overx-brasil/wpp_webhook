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
      1: 'Pedido agendado',
      2: 'Em Produção',
      3: 'Aceites pelas empresas',
      4: 'preparação Concluída',
      5: 'Aceito pelo motorista',
      6: 'Motorista chegou ao estabelecimento',
      7: 'Retirada confirmada pelo Entregador',
      8: 'Pedido atrasado',
      9: 'Entregador Chegando',
      10: 'Entregador quase chegando ao cliente',
      11: 'Cliente quase chegando',
      12: 'Cliente chegou',
      13: 'Procurando um Entregador',
      14: 'Motorista a caminho',
      15: 'Motorista esperando pedido',
      16: 'Aceito pela empresa motorista',
      17: 'Driver arrived to customer',
      18: 'concluído',
      19: 'Concluído por admin.',
      20: 'Entrega concluída pelo Entregador',
      21: 'Retirada concluída pelo cliente',
      22: 'Cancelado',
      23: 'Rejeitado por admin.',
      24: 'Rejeitado por negócios',
      25: 'Rejeitado por motorista',
      26: 'Pegar Falha por motorista',
      27: 'Falha na entrega de motorista',
      28: 'Cancelada pelo cliente',
      29: 'Cliente não retirou o pedido',
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
