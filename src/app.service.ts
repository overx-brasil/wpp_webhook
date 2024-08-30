import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class AppService {
  private readonly twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    this.twilioClient = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  public formatPhoneNumber(phone: string): string {
    if (phone.startsWith('0')) {
      phone = phone.slice(1);
    }
    if (!phone.startsWith('+')) {
      phone = `+55${phone}`;
    }
    return phone;
  }

  public async sendWhatsAppTemplateMessage(
    to: string,
    customerName: string,
    orderId: string,
    statusText: string,
  ): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(to);

    try {
      const message = await this.twilioClient.messages.create({
        from: `whatsapp:${this.configService.get<string>('TWILIO_WHATSAPP_NUMBER')}`,
        to: `whatsapp:${formattedPhone}`,
        contentSid: 'HXd732b1344f83ffd22a4ab4f73acbb7ae',
        contentVariables: JSON.stringify({
          1: customerName,
          2: orderId,
          3: statusText,
        }),
      });
      console.log('Mensagem de template enviada com sucesso:', message);
      return message;
    } catch (error) {
      console.error(
        'Falha ao enviar mensagem de template pelo WhatsApp:',
        error,
      );
      throw error;
    }
  }
}
