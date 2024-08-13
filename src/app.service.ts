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

  async sendWhatsappMessage(to: string, message: string): Promise<boolean> {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_WHATSAPP_NUMBER'),
        to: `whatsapp:${to}`,
      });
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }
}
