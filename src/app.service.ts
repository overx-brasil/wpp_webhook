import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AppService {
  private readonly twilioAccountSid: string;
  private readonly twilioAuthToken: string;
  private readonly twilioWhatsappNumber: string;

  constructor(private configService: ConfigService) {
    this.twilioAccountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioWhatsappNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');
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

  public async sendWhatsAppMessage(
    to: string,
    body: string,
  ): Promise<any> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;

    const data = new URLSearchParams();
    data.append('From', `whatsapp:${this.twilioWhatsappNumber}`);
    data.append('To', `whatsapp:${to}`);
    data.append('Body', body);

    try {
      const response = await axios.post(url, data, {
        auth: {
          username: this.twilioAccountSid,
          password: this.twilioAuthToken,
        },
      });
      console.log('Mensagem enviada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Falha ao enviar mensagem pelo WhatsApp:', error);
      throw error;
    }
  }
}
