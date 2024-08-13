import { Injectable, OnModuleInit } from '@nestjs/common';
import * as venom from 'venom-bot';

@Injectable()
export class AppService implements OnModuleInit {
  private client: venom.Whatsapp | null = null;

  async onModuleInit() {
    this.client = await venom.create({
      session: 'session-name',
      headless: 'new',
    });
  }

  async sendWhatsAppMessage(to: string, body: string): Promise<any> {
    if (!this.client) {
      console.error('Venom client not initialized');
      return null;
    }
    const formattedNumber = `${to.replace('+', '')}@c.us`;

    try {
      const result = await this.client.sendText(formattedNumber, body);
      console.log('Message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

}
