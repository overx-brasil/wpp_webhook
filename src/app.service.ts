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
    businessName: string,
    customerName: string,
    orderId: string,
    statusText: string,
  ): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(to);

    try {
      const message = await this.twilioClient.messages.create({
        from: `whatsapp:${this.configService.get<string>('TWILIO_WHATSAPP_NUMBER')}`,
        to: `whatsapp:${formattedPhone}`,
        contentSid: 'HX4f1f1b2c7533f6211f6e6cf479419f9d',
        contentVariables: JSON.stringify({
          1: `*${businessName}*`,
          2: customerName,
          3: orderId,
          4: statusText,
        }),
      });
      return message;
    } catch (error) {
      throw error;
    }
  }
}
