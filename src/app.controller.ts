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
      Pendente: 'pendente',
      'Pedido agendado': 'agendado',
      'Em Produção': 'em produção',
      'Aceites pelas empresas': 'aceito pela empresa',
      'preparação Concluído': 'preparação concluída',
      'Aceito pelo motorista': 'aceito pelo motorista',
      'Motorista chegou ao estabelecimento':
        'motorista chegou ao estabelecimento',
      'Retirada confirmada pelo Entregador':
        'retirada confirmada pelo entregador',
      'Pedido atrasado': 'pedido atrasado',
      'Entregador Chegando': 'entregador chegando',
      'Entregador quase chegando ao cliente':
        'entregador quase chegando ao cliente',
      'Cliente quase chegando': 'cliente quase chegando',
      'Cliente chegou': 'cliente chegou',
      'Procurando um Entregador': 'procurando um entregador',
      'Motorista a caminho': 'motorista a caminho',
      'Motorista esperando pedido': 'motorista esperando pedido',
      'Aceito pela empresa motorista': 'aceito pela empresa motorista',
      'Driver arrived to customer': 'entregador chegou ao cliente',
      Concluído: 'concluído',
      'Concluído por admin.': 'concluído pelo administrador',
      'Entrega concluída pelo Entregador': 'entrega concluída pelo entregador',
      'Retirada concluída pelo cliente': 'retirada concluída pelo cliente',
      Cancelado: 'cancelado',
      'Rejeitado por admin.': 'rejeitado pelo administrador',
      'Rejeitado por negócios': 'rejeitado pelo negócio',
      'Rejeitado por motorista': 'rejeitado pelo motorista',
      'Pegar Falha por motorista': 'falha ao pegar pelo motorista',
      'Falha na entrega de motorista': 'falha na entrega pelo motorista',
      'Cancelada pelo cliente': 'cancelado pelo cliente',
      'Cliente não retirou o pedido': 'cliente não retirou o pedido',
    };

    console.log('Status recebido:', status);
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
