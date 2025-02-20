import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as moment from 'moment';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';

@Injectable()
export class WebhookService {
  private requestCache: Map<string, { timestamp: number; count: number }>;

  constructor(private readonly firebaseService: FirebaseService) {
    this.requestCache = new Map();
  }

  private checkRateLimit(phone: string): boolean {
    const currentTime = moment().unix();
    const phoneData = this.requestCache.get(phone);

    if (phoneData) {
      if (currentTime - phoneData.timestamp < 60) {
        if (phoneData.count >= 5) {
          return false;
        }
        this.requestCache.set(phone, {
          timestamp: phoneData.timestamp,
          count: phoneData.count + 1,
        });
      } else {
        this.requestCache.set(phone, { timestamp: currentTime, count: 1 });
      }
    } else {
      this.requestCache.set(phone, { timestamp: currentTime, count: 1 });
    }

    return true;
  }

  async processMessage(payload: CreateWebhookDto): Promise<WebhookResponseDto> {
    const { message, phone } = payload;

    const db = this.firebaseService.getFirestore();

    if (!this.checkRateLimit(phone)) {
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    const docRef = db.collection('messages').doc();

    await docRef.set({
      message,
      phone,
      timestamp: new Date(),
    });

    if (message.toLowerCase().includes('help')) {
      return { reply: 'Support contact: support@company.com' };
    }

    return { reply: 'Your message has been received.' };
  }
}
