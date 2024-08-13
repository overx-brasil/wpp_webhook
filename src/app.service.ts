import { Injectable, OnModuleInit } from '@nestjs/common';
import * as venom from 'venom-bot';

@Injectable()
export class AppModule implements OnModuleInit {
  private client: venom.Whatsapp | null = null;

  async onModuleInit() {
    try {
      this.client = await venom.create(
        'session-name',
        undefined,
        undefined,
        {
          headless: 'new',
        }
      );
      console.log('WhatsApp client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WhatsApp client:', error);
    }
  }

  async sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    if (!this.client) {
      console.error('WhatsApp client is not initialized');
      return false;
    }
    const formattedNumber = `${to}@c.us`;

    try {
      await this.client.sendText(formattedNumber, message);
      console.log(`Message sent to ${to}: ${message}`);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

}
