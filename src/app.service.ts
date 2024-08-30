import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class AppService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    this.twilioClient = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendWhatsAppMessage(to: string, body: string): Promise<any> {
    const from = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');

    const correctedPhoneNumber = this.formatPhoneNumber(to);

    try {
      const message = await this.twilioClient.messages.create({
        body,
        from: `whatsapp:${from}`,
        to: `whatsapp:${correctedPhoneNumber}`,
      });
      console.log('Mensagem enviada com sucesso:', message);
      return message;
    } catch (error) {
      console.error('Falha ao enviar mensagem pelo WhatsApp:', error);
      throw error;
    }
  }

  private formatPhoneNumber(phone: string): string {
    if (phone.startsWith('0')) {
      phone = phone.slice(1);
    }
    if (!phone.startsWith('+')) {
      phone = `+55${phone}`;
    }
    return phone;
  }
}
