import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class AppService {
  private twilioClient: Twilio;
  private readonly twilioAccountSid: string;
  private readonly twilioAuthToken: string;
  private readonly twilioWhatsappNumber: string;

  constructor(private configService: ConfigService) {
    this.twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioWhatsappNumber = this.configService.get<string>(
      'TWILIO_WHATSAPP_NUMBER',
    );
    this.twilioClient = new Twilio(this.twilioAccountSid, this.twilioAuthToken);
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
        from: `whatsapp:${this.twilioWhatsappNumber}`,
        to: `whatsapp:${formattedPhone}`,
        template: {
          name: 'order_update_notification',
          language: {
            code: 'pt_BR',
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: customerName },
                { type: 'text', text: orderId },
                { type: 'text', text: statusText },
              ],
            },
          ],
        },
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
