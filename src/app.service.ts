import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AppService {
  private readonly twilioAccountSid: string;
  private readonly twilioAuthToken: string;

  constructor(private configService: ConfigService) {
    this.twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
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

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;

    const data = new URLSearchParams();
    data.append('From', `whatsapp:+12292315694`);
    data.append('To', `whatsapp:${formattedPhone}`);
    data.append('TemplateSid', 'HXd732b1344f83ffd22a4ab4f73acbb7ae');
    data.append(
      'Body',
      JSON.stringify({
        1: customerName,
        2: orderId,
        3: statusText,
      }),
    );

    try {
      const response = await axios.post(url, data, {
        auth: {
          username: this.twilioAccountSid,
          password: this.twilioAuthToken,
        },
      });
      console.log('Mensagem de template enviada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Falha ao enviar mensagem de template pelo WhatsApp:',
        error,
      );
      throw error;
    }
  }
}
